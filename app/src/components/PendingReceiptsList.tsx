import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types';
import { theme } from '../theme';

interface PendingReceiptsListProps {
  onEditReceipt: (transaction: Transaction) => void;
}

export function PendingReceiptsList({ onEditReceipt }: PendingReceiptsListProps) {
  const { data, isLoading, error, refetch } = useTransactions({
    status: 'pending_receipt',
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const renderItem = ({ item }: { item: Transaction }) => (
    <PendingReceiptItem transaction={item} onEdit={() => onEditReceipt(item)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✅</Text>
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptyText}>
        No pending receipts to review. Scan a receipt to get started.
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load pending receipts</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={data?.data || []}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={!isLoading ? renderEmpty : null}
    />
  );
}

interface PendingReceiptItemProps {
  transaction: Transaction;
  onEdit: () => void;
}

function PendingReceiptItem({ transaction, onEdit }: PendingReceiptItemProps) {
  const [imageError, setImageError] = useState(false);
  const receipt = transaction.receipt;
  
  // Extract OCR data if available
  const ocrData = receipt?.ocrData as any;
  const ocrTotal = ocrData?.total;
  const ocrVendor = ocrData?.vendor?.name;
  const ocrDate = ocrData?.date;
  const ocrCategory = ocrData?.category;

  const hasOcrData = receipt?.ocrStatus === 'processed' && ocrData;

  return (
    <View style={styles.receiptCard}>
      {/* Receipt Image */}
      <View style={styles.imageContainer}>
        {receipt?.signedUrl && !imageError ? (
          <Image
            source={{ uri: receipt.signedUrl }}
            style={styles.receiptImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>📄</Text>
            <Text style={styles.placeholderText}>Receipt</Text>
          </View>
        )}
        
        {/* OCR Status Badge */}
        {receipt && (
          <View
            style={[
              styles.ocrBadge,
              receipt.ocrStatus === 'processed' && styles.ocrBadgeSuccess,
              receipt.ocrStatus === 'failed' && styles.ocrBadgeError,
              receipt.ocrStatus === 'pending' && styles.ocrBadgePending,
            ]}
          >
            <Text style={styles.ocrBadgeText}>
              {receipt.ocrStatus === 'processed' && '✓ Processed'}
              {receipt.ocrStatus === 'pending' && '⏳ Processing'}
              {receipt.ocrStatus === 'failed' && '✗ Failed'}
            </Text>
          </View>
        )}
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        {/* Current Values */}
        <View style={styles.currentSection}>
          <Text style={styles.sectionLabel}>Current Values</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              ${transaction.amount || '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payee:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {transaction.payee || '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{transaction.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(transaction.transactionDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* OCR Extracted Data */}
        {hasOcrData && (
          <View style={styles.ocrSection}>
            <Text style={styles.sectionLabel}>📝 Extracted from Receipt</Text>
            {ocrTotal && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total:</Text>
                <Text style={[styles.detailValue, styles.ocrValue]}>
                  ${ocrTotal}
                </Text>
              </View>
            )}
            {ocrVendor && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vendor:</Text>
                <Text style={[styles.detailValue, styles.ocrValue]} numberOfLines={1}>
                  {ocrVendor}
                </Text>
              </View>
            )}
            {ocrCategory && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={[styles.detailValue, styles.ocrValue]}>
                  {ocrCategory}
                </Text>
              </View>
            )}
            {ocrDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={[styles.detailValue, styles.ocrValue]}>
                  {new Date(ocrDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>
            {hasOcrData ? 'Review & Confirm' : 'Edit & Confirm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  receiptCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  ocrBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  ocrBadgeSuccess: {
    backgroundColor: theme.colors.success,
  },
  ocrBadgePending: {
    backgroundColor: theme.colors.warning,
  },
  ocrBadgeError: {
    backgroundColor: theme.colors.error,
  },
  ocrBadgeText: {
    color: '#fff',
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  detailsContainer: {
    padding: theme.spacing.md,
  },
  currentSection: {
    marginBottom: theme.spacing.md,
  },
  ocrSection: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 2,
    textAlign: 'right',
  },
  ocrValue: {
    color: theme.colors.primary,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});

