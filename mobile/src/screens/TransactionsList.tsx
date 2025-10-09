import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  FAB,
  Searchbar,
  Chip,
  IconButton,
  Portal,
  Dialog,
  Button,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { transactionsApi, categoriesApi, Transaction, Category, formatAmount } from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TransactionsList'>;
};

export default function TransactionsList({ navigation }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Map<string, Category>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [transactionsResponse, categoriesData] = await Promise.all([
        transactionsApi.list({ pageSize: 100 }),
        categoriesApi.list(),
      ]);
      
      setTransactions(transactionsResponse.data);
      
      const categoriesMap = new Map<string, Category>();
      categoriesData.forEach(cat => categoriesMap.set(cat.id, cat));
      setCategories(categoriesMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadData]);

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      await transactionsApi.delete(transactionToDelete);
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete));
      setDeleteDialogVisible(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const category = categories.get(item.categoryId);
    const amount = parseFloat(item.amount);
    const isPositive = amount >= 0;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.categoryInfo}>
              {category && (
                <>
                  <Text style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    {category.icon || '📦'}
                  </Text>
                  <View>
                    <Text variant="bodyLarge" style={styles.description}>
                      {item.description}
                    </Text>
                    <Text variant="bodySmall" style={styles.categoryName}>
                      {category.name}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.amountContainer}>
              <Text
                variant="titleLarge"
                style={[styles.amount, isPositive ? styles.positive : styles.negative]}
              >
                {isPositive ? '+' : ''}{formatAmount(item.amount)}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => {
              setTransactionToDelete(item.id);
              setDeleteDialogVisible(true);
            }}
          />
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search transactions"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No transactions yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the + button to add your first transaction
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction', {})}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Transaction</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this transaction?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    textAlign: 'center',
    lineHeight: 48,
    marginRight: 12,
    overflow: 'hidden',
  },
  description: {
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryName: {
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  date: {
    color: '#999',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingTop: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#ccc',
  },
});