import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../src/theme';
import { TransactionList } from '../../src/components/TransactionList';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { AddTransactionModal } from '../../src/components/AddTransactionModal';
import { Transaction } from '../../src/types';

export default function TransactionsScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const handleTransactionPress = (transaction: Transaction) => {
    Alert.alert(
      'Transaction Details',
      `${transaction.payee || transaction.category}\n$${transaction.amount}\n${new Date(transaction.transactionDate).toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  const handleAddManual = () => {
    setAddModalVisible(true);
  };

  const handleScanReceipt = () => {
    // Navigate to receipt scanner (to be implemented)
    router.push('/(tabs)/receipts');
  };

  const getFilteredTransactions = () => {
    if (filter === 'all') return {};
    return { type: filter };
  };

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'income' && styles.filterChipActive]}
            onPress={() => setFilter('income')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'income' && styles.filterChipTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'expense' && styles.filterChipActive]}
            onPress={() => setFilter('expense')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'expense' && styles.filterChipTextActive,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      <TransactionList
        filters={getFilteredTransactions()}
        onTransactionPress={handleTransactionPress}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddManual={handleAddManual}
        onScanReceipt={handleScanReceipt}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  filterBar: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterChips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
});

