import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../src/theme';
import { PendingReceiptsList } from '../../src/components/PendingReceiptsList';
import { ConfirmReceiptModal } from '../../src/components/ConfirmReceiptModal';
import { PaywallModal } from '../../src/components/PaywallModal';
import { Transaction } from '../../src/types';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { receiptService, QuotaExceededError } from '../../src/services/receiptService';

export default function ReceiptsScreen() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [quotaUsage, setQuotaUsage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleEditReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleConfirmed = () => {
    setSelectedTransaction(null);
    setModalVisible(false);
  };

  const handleScanReceipt = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to scan receipts',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show options: Camera or Gallery
      Alert.alert(
        'Add Receipt',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: () => openCamera(),
          },
          {
            text: 'Choose from Gallery',
            onPress: () => openGallery(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadReceipt(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const openGallery = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to choose receipts',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadReceipt(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadReceipt = async (imageUri: string) => {
    try {
      setUploading(true);

      // Upload receipt
      const response = await receiptService.uploadReceipt(imageUri);

      // Show success message
      Alert.alert(
        'Success',
        'Receipt uploaded successfully! It will be processed shortly.',
        [{ text: 'OK' }]
      );

      // Refresh the pending receipts list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        // Show paywall for quota exceeded
        handleShowPaywall(error.usage);
      } else {
        console.error('Upload error:', error);
        Alert.alert(
          'Upload Failed',
          error instanceof Error ? error.message : 'Failed to upload receipt'
        );
      }
    } finally {
      setUploading(false);
    }
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
      <TouchableOpacity 
        style={[styles.scanButton, uploading && styles.scanButtonDisabled]} 
        onPress={handleScanReceipt}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.scanButtonText}>📷 Scan Receipt</Text>
        )}
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
  scanButtonDisabled: {
    opacity: 0.6,
  },
});

