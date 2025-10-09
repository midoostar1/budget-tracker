import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  currentUsage?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

const BENEFITS = [
  {
    icon: '🔓',
    title: 'Unlimited Receipt Scans',
    description: 'Scan as many receipts as you need, no monthly limits',
  },
  {
    icon: '🏦',
    title: 'Bank Account Sync (Coming Soon)',
    description: 'Automatically import transactions from your bank accounts',
  },
  {
    icon: '📊',
    title: 'Advanced Reporting',
    description: 'Detailed insights, trends, and spending analytics',
  },
  {
    icon: '📈',
    title: 'Category Insights',
    description: 'AI-powered categorization and spending patterns',
  },
  {
    icon: '💾',
    title: 'Export to CSV & PDF',
    description: 'Download your financial data anytime',
  },
  {
    icon: '🎯',
    title: 'Budget Goals & Tracking',
    description: 'Set goals and track your progress automatically',
  },
  {
    icon: '⚡',
    title: 'Priority OCR Processing',
    description: 'Faster receipt processing and premium support',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    description: 'Custom alerts and spending limit warnings',
  },
];

export function PaywallModal({ visible, onClose, onUpgrade, currentUsage }: PaywallModalProps) {
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    try {
      setUpgrading(true);
      setSelectedPlan(plan);

      // Stub: In production, this would call Stripe/StoreKit/Play Billing
      // For now, just show a message
      Alert.alert(
        'Upgrade to Premium',
        `This will upgrade your account to Premium (${plan === 'monthly' ? '$7.99/month' : '$69.99/year'}).\n\nNote: Payment processing not yet implemented. For demo purposes, contact support to manually upgrade your account.`,
        [
          {
            text: 'Contact Support',
            onPress: () => {
              Alert.alert('Support', 'Email: support@budgettracker.com');
              onUpgrade?.();
              onClose();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );

      // TODO: Implement actual payment flow
      // - Stripe: Create checkout session
      // - Apple: StoreKit in-app purchase
      // - Google: Play Billing
      // await purchaseSubscription(plan);
      // onUpgrade?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to process upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.emoji}>⭐</Text>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              You've reached your free limit{currentUsage && ` (${currentUsage.used}/${currentUsage.limit} scans)`}
            </Text>
          </View>

          {/* Pricing Cards */}
          <View style={styles.pricingSection}>
            {/* Yearly Plan (Recommended) */}
            <TouchableOpacity
              style={[styles.pricingCard, styles.pricingCardRecommended]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>BEST VALUE</Text>
              </View>
              <View style={styles.radioContainer}>
                <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioSelected]}>
                  {selectedPlan === 'yearly' && <View style={styles.radioDot} />}
                </View>
                <View style={styles.pricingInfo}>
                  <Text style={styles.planName}>Yearly</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>$69.99</Text>
                    <Text style={styles.period}>/year</Text>
                  </View>
                  <Text style={styles.savings}>Save 26% • Just $5.83/month</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              style={[styles.pricingCard, selectedPlan === 'monthly' && styles.pricingCardSelected]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={styles.radioContainer}>
                <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioSelected]}>
                  {selectedPlan === 'monthly' && <View style={styles.radioDot} />}
                </View>
                <View style={styles.pricingInfo}>
                  <Text style={styles.planName}>Monthly</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>$7.99</Text>
                    <Text style={styles.period}>/month</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Premium Benefits</Text>
            {BENEFITS.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              • Cancel anytime, no commitment{'\n'}
              • Instant access to all premium features{'\n'}
              • Priority email support{'\n'}
              • 30-day money-back guarantee
            </Text>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => handleUpgrade(selectedPlan)}
            disabled={upgrading}
          >
            {upgrading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.upgradeButtonText}>
                  Start Premium - {selectedPlan === 'yearly' ? '$69.99/year' : '$7.99/month'}
                </Text>
                <Text style={styles.upgradeButtonSubtext}>
                  {selectedPlan === 'yearly' && 'Save $26.89 per year'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.maybeLaterButton}>
            <Text style={styles.maybeLaterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  pricingSection: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  pricingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: theme.colors.primary,
  },
  pricingCardRecommended: {
    borderColor: '#FFD700',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -50,
    backgroundColor: '#FFD700',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  recommendedText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: '#000',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  pricingInfo: {
    flex: 1,
  },
  planName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  period: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  savings: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
    marginTop: 2,
  },
  benefitsSection: {
    marginBottom: theme.spacing.xl,
  },
  benefitsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
    width: 32,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  upgradeButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
  maybeLaterButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  maybeLaterText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});

