import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { theme } from '../theme';
import { useUpdateTransaction } from '../hooks/useTransactions';
import { Transaction } from '../types';

interface ConfirmReceiptModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirmed: () => void;
}

const CATEGORIES = ['Groceries', 'Dining', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

export function ConfirmReceiptModal({
  visible,
  transaction,
  onClose,
  onConfirmed,
}: ConfirmReceiptModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [payee, setPayee] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const updateMutation = useUpdateTransaction();

  // Extract OCR data
  const ocrData = transaction?.receipt?.ocrData as any;
  const hasOcrData = transaction?.receipt?.ocrStatus === 'processed' && ocrData;

  useEffect(() => {
    if (transaction) {
      // Pre-fill with OCR data if available, otherwise use current values
      setAmount(
        hasOcrData && ocrData.total
          ? String(ocrData.total)
          : transaction.amount || ''
      );
      setPayee(
        hasOcrData && ocrData.vendor?.name
          ? ocrData.vendor.name
          : transaction.payee || ''
      );
      setCategory(
        hasOcrData && ocrData.category
          ? ocrData.category
          : transaction.category || ''
      );
      setDate(
        hasOcrData && ocrData.date
          ? new Date(ocrData.date).toISOString().split('T')[0]
          : new Date(transaction.transactionDate).toISOString().split('T')[0]
      );
      setNotes(transaction.notes || '');
    }
  }, [transaction, hasOcrData, ocrData]);

  const handleConfirm = async () => {
    if (!transaction) return;

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }

    if (!category) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        data: {
          amount: parseFloat(amount),
          category,
          payee: payee.trim() || undefined,
          notes: notes.trim() || undefined,
          transactionDate: new Date(date).toISOString(),
          status: 'cleared', // Set to cleared when confirmed
        },
      });

      Alert.alert('Success', 'Receipt confirmed successfully');
      onConfirmed();
      handleClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to confirm receipt'
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!transaction) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Confirm Receipt</Text>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={updateMutation.isPending}
          >
            <Text
              style={[
                styles.confirmButton,
                updateMutation.isPending && styles.confirmButtonDisabled,
              ]}
            >
              {updateMutation.isPending ? 'Confirming...' : 'Confirm'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Receipt Image Preview */}
          {transaction.receipt?.signedUrl && (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: transaction.receipt.signedUrl }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
          )}

          {/* OCR Info Banner */}
          {hasOcrData && (
            <View style={styles.ocrBanner}>
              <Text style={styles.ocrBannerText}>
                ✨ Fields pre-filled from receipt. Review and adjust if needed.
              </Text>
            </View>
          )}

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
            {hasOcrData && ocrData.total && (
              <Text style={styles.hint}>
                OCR detected: ${ocrData.total}
              </Text>
            )}
          </View>

          {/* Payee */}
          <View style={styles.section}>
            <Text style={styles.label}>Payee / Vendor</Text>
            <TextInput
              style={styles.input}
              value={payee}
              onChangeText={setPayee}
              placeholder="Who did you pay?"
              placeholderTextColor={theme.colors.textTertiary}
            />
            {hasOcrData && ocrData.vendor?.name && (
              <Text style={styles.hint}>
                OCR detected: {ocrData.vendor.name}
              </Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {hasOcrData && ocrData.category && (
              <Text style={styles.hint}>
                OCR suggested: {ocrData.category}
              </Text>
            )}
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textTertiary}
            />
            {hasOcrData && ocrData.date && (
              <Text style={styles.hint}>
                OCR detected: {new Date(ocrData.date).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  cancelButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  confirmButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.bold,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  ocrBanner: {
    backgroundColor: theme.colors.success + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  ocrBannerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  hint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  currencySymbol: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold,
  },
});

