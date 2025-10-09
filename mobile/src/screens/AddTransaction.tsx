import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  IconButton,
  Chip,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { transactionsApi, categoriesApi, Category } from '../services/api';
import { Decimal } from 'decimal.js';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;
  route: RouteProp<RootStackParamList, 'AddTransaction'>;
};

// Quick amount buttons for one-hand entry
const QUICK_AMOUNTS = ['5', '10', '20', '50', '100'];

export default function AddTransaction({ navigation, route }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNegative, setIsNegative] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleNumberPress = (num: string) => {
    if (num === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => (prev || '0') + '.');
      }
      return;
    }
    
    if (num === '←') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    
    setAmount(prev => {
      const newAmount = prev + num;
      try {
        new Decimal(newAmount);
        return newAmount;
      } catch {
        return prev;
      }
    });
  };

  const handleQuickAmount = (quickAmount: string) => {
    setAmount(quickAmount);
  };

  const handleSubmit = async () => {
    if (!amount || !description || !selectedCategory) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const finalAmount = isNegative ? `-${amount}` : amount;
      
      await transactionsApi.create({
        amount: finalAmount,
        description,
        categoryId: selectedCategory.id,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error creating transaction');
    } finally {
      setLoading(false);
    }
  };

  const displayAmount = amount || '0';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Amount Display */}
        <Surface style={styles.amountDisplay}>
          <View style={styles.amountHeader}>
            <Text variant="bodyLarge" style={styles.amountLabel}>
              Amount
            </Text>
            <Chip
              selected={isNegative}
              onPress={() => setIsNegative(!isNegative)}
              style={styles.typeChip}
            >
              {isNegative ? 'Expense' : 'Income'}
            </Chip>
          </View>
          <Text
            variant="displayLarge"
            style={[
              styles.amountText,
              isNegative ? styles.negativeAmount : styles.positiveAmount,
            ]}
          >
            {isNegative ? '-' : '+'}${displayAmount}
          </Text>
        </Surface>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map(qa => (
            <Chip
              key={qa}
              mode="outlined"
              onPress={() => handleQuickAmount(qa)}
              style={styles.quickAmountChip}
            >
              ${qa}
            </Chip>
          ))}
        </View>

        {/* Number Pad - Optimized for one-hand entry (bottom-aligned) */}
        <View style={styles.numberPad}>
          {[['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['.', '0', '←']].map(
            (row, rowIndex) => (
              <View key={rowIndex} style={styles.numberRow}>
                {row.map(num => (
                  <TouchableOpacity
                    key={num}
                    style={styles.numberButton}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text variant="headlineMedium" style={styles.numberText}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}
        </View>

        {/* Description Input */}
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          placeholder="What's this for?"
          maxLength={500}
        />

        {/* Category Selection */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: cat.color,
                  opacity: selectedCategory?.id === cat.id ? 1 : 0.6,
                  borderWidth: selectedCategory?.id === cat.id ? 3 : 0,
                  borderColor: '#fff',
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={styles.categoryIcon}>{cat.icon || '📦'}</Text>
              <Text style={styles.categoryLabel} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || !amount || !description || !selectedCategory}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Add Transaction
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  amountDisplay: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    color: '#666',
  },
  typeChip: {
    height: 32,
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 48,
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountChip: {
    marginRight: 8,
  },
  numberPad: {
    marginBottom: 16,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  numberText: {
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingVertical: 8,
  },
  categoryCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});