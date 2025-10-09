import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types';
import { theme } from '../theme';

interface TransactionListProps {
  filters?: {
    status?: 'cleared' | 'pending_receipt';
    type?: 'income' | 'expense';
    category?: string;
  };
  onTransactionPress?: (transaction: Transaction) => void;
}

export function TransactionList({ filters, onTransactionPress }: TransactionListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useTransactions({
    page,
    limit: 20,
    ...filters,
    sortBy: 'transactionDate',
    sortOrder: 'desc',
  });

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (data?.pagination.hasNext && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [data?.pagination.hasNext, isLoading]);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => onTransactionPress?.(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptyText}>
        Start tracking your finances by adding a transaction or scanning a receipt
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load transactions</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={data?.data || []}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isLoading && page === 1}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={!isLoading ? renderEmpty : null}
      ListFooterComponent={renderFooter}
    />
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const amount = parseFloat(transaction.amount || '0');
  const date = new Date(transaction.transactionDate);

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        {/* Category Icon Placeholder */}
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: isIncome ? theme.colors.income : theme.colors.expense },
          ]}
        >
          <Text style={styles.categoryIconText}>
            {transaction.category[0]?.toUpperCase()}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.transactionDetails}>
          <Text style={styles.payee} numberOfLines={1}>
            {transaction.payee || transaction.category}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{transaction.category}</Text>
            <Text style={styles.date}> • {formattedDate}</Text>
          </View>
          {transaction.status === 'pending_receipt' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Pending Receipt</Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? theme.colors.income : theme.colors.expense },
          ]}
        >
          {isIncome ? '+' : '-'}${Math.abs(amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  categoryIconText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  transactionDetails: {
    flex: 1,
  },
  payee: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  statusBadge: {
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
    fontWeight: theme.fontWeight.semibold,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl * 2,
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
  footerLoader: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
});

