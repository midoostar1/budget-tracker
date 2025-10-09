import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../src/theme';
import { PendingReceiptsList } from '../../src/components/PendingReceiptsList';
import { ConfirmReceiptModal } from '../../src/components/ConfirmReceiptModal';
import { PaywallModal } from '../../src/components/PaywallModal';
import { Transaction } from '../../src/types';
import { useQueryClient } from '@tanstack/react-query';

export default function ReceiptsScreen() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [quotaUsage, setQuotaUsage] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleEditReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleConfirmed = () => {
    setSelectedTransaction(null);
    setModalVisible(false);
  };

  const handleScanReceipt = () => {
    // This will be implemented with camera integration
    // For now, show placeholder
    Alert.alert(
      'Scan Receipt',
      'Camera/gallery integration will be implemented next',
      [{ text: 'OK' }]
    );
  };

  const handleShowPaywall = (usage?: any) => {
    setQuotaUsage(usage);
    setPaywallVisible(true);
  };

  const handleUpgradeComplete = () => {
    // Refresh subscription status
    queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
    
    Alert.alert(
      'Success',
      'Your account has been upgraded to Premium! Enjoy unlimited receipt scans.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Receipts</Text>
        <Text style={styles.headerSubtitle}>
          Review and confirm your scanned receipts
        </Text>
      </View>

      {/* Pending Receipts List */}
      <PendingReceiptsList onEditReceipt={handleEditReceipt} />

      {/* Scan Receipt Button */}
      <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt}>
        <Text style={styles.scanButtonText}>📷 Scan Receipt</Text>
      </TouchableOpacity>

      {/* Confirm Receipt Modal */}
      <ConfirmReceiptModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={() => setModalVisible(false)}
        onConfirmed={handleConfirmed}
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onUpgrade={handleUpgradeComplete}
        currentUsage={quotaUsage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});

