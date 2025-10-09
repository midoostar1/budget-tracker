import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../src/theme';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: October 9, 2024</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          Budget Tracker collects the following information to provide you with our services:
        </Text>
        <Text style={styles.bulletPoint}>
          • Account information from your chosen social login provider (Google, Apple, or Facebook)
        </Text>
        <Text style={styles.bulletPoint}>
          • Email address and name (if provided by your social login provider)
        </Text>
        <Text style={styles.bulletPoint}>
          • Transaction data you create (amounts, categories, payees, dates, notes)
        </Text>
        <Text style={styles.bulletPoint}>
          • Receipt images you upload for OCR processing
        </Text>
        <Text style={styles.bulletPoint}>
          • Device information for push notifications (FCM tokens, platform)
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide and maintain the Budget Tracker service
        </Text>
        <Text style={styles.bulletPoint}>
          • Process receipts using OCR technology (Veryfi)
        </Text>
        <Text style={styles.bulletPoint}>
          • Send you push notifications about pending receipts and upcoming bills
        </Text>
        <Text style={styles.bulletPoint}>
          • Generate monthly reports and statistics
        </Text>
        <Text style={styles.bulletPoint}>
          • Improve and optimize our services
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data security is our priority:
        </Text>
        <Text style={styles.bulletPoint}>
          • All data is encrypted in transit (HTTPS/TLS)
        </Text>
        <Text style={styles.bulletPoint}>
          • Passwords are never stored (OAuth authentication only)
        </Text>
        <Text style={styles.bulletPoint}>
          • Tokens are encrypted and stored securely
        </Text>
        <Text style={styles.bulletPoint}>
          • Receipt images are stored in private Google Cloud Storage
        </Text>
        <Text style={styles.bulletPoint}>
          • Database hosted on secure cloud infrastructure
        </Text>

        <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use the following third-party services to provide our functionality:
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Google, Apple, Facebook</Text> - Authentication services
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Google Cloud Storage</Text> - Secure receipt image storage
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Veryfi</Text> - OCR processing of receipt images
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Firebase Cloud Messaging</Text> - Push notifications
        </Text>
        <Text style={styles.paragraph}>
          Each service has its own privacy policy. We recommend reviewing their policies on their
          respective websites.
        </Text>
        <Text style={styles.highlight}>
          ⚠️ Future Feature: Bank account synchronization may be offered post-MVP. If implemented,
          you would grant limited power of attorney to access read-only transaction data through
          secure banking APIs (Plaid, Yodlee, or similar). This feature would require explicit
          consent and additional terms.
        </Text>

        <Text style={styles.sectionTitle}>5. We Do Not Sell Your Data</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Budget Tracker does NOT sell, rent, or trade your personal information
          to third parties.</Text> Your financial data is private and belongs to you.
        </Text>
        <Text style={styles.paragraph}>
          We do not:
        </Text>
        <Text style={styles.bulletPoint}>
          • Sell your personal information to advertisers
        </Text>
        <Text style={styles.bulletPoint}>
          • Share your transaction data with marketing companies
        </Text>
        <Text style={styles.bulletPoint}>
          • Use your data for purposes other than providing our service
        </Text>
        <Text style={styles.bulletPoint}>
          • Access your data without your explicit permission
        </Text>
        <Text style={styles.paragraph}>
          Your trust is our priority. We only use your data to provide and improve Budget Tracker.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Security and Encryption</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures to protect your data:
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Encryption in Transit:</Text> All data transmission uses TLS/HTTPS encryption
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Encryption at Rest:</Text> Database and file storage are encrypted
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Token Security:</Text> JWT tokens with expiration, HTTP-only cookies
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Password Security:</Text> We never store passwords (OAuth only)
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Access Control:</Text> Role-based permissions, multi-factor authentication ready
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Secure Storage:</Text> Receipt images in private, access-controlled buckets
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Regular Updates:</Text> Security patches applied promptly
        </Text>
        <Text style={styles.paragraph}>
          Despite our security measures, no system is 100% secure. We recommend using strong
          passwords for your social login accounts and enabling two-factor authentication.
        </Text>

        <Text style={styles.sectionTitle}>7. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your data for as long as your account is active. You can delete your account
          at any time, which will permanently remove all your data within 30 days.
        </Text>
        <Text style={styles.paragraph}>
          After account deletion:
        </Text>
        <Text style={styles.bulletPoint}>
          • Transaction data is permanently deleted
        </Text>
        <Text style={styles.bulletPoint}>
          • Receipt images are removed from storage
        </Text>
        <Text style={styles.bulletPoint}>
          • User profile and authentication data is erased
        </Text>
        <Text style={styles.bulletPoint}>
          • Push notification tokens are revoked
        </Text>

        <Text style={styles.sectionTitle}>8. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Access your data at any time
        </Text>
        <Text style={styles.bulletPoint}>
          • Export your data (transactions, receipts, reports)
        </Text>
        <Text style={styles.bulletPoint}>
          • Delete your account and all associated data
        </Text>
        <Text style={styles.bulletPoint}>
          • Opt out of push notifications
        </Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Budget Tracker is not intended for users under 18 years of age. We do not knowingly
          collect personal information from children. If you believe a child has provided us
          with personal information, please contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>10. International Users</Text>
        <Text style={styles.paragraph}>
          Budget Tracker is hosted in the United States. If you are accessing the service from
          outside the U.S., your data may be transferred to and processed in the United States.
          By using Budget Tracker, you consent to this transfer.
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of significant
          changes via email or push notification. Your continued use of Budget Tracker after
          changes indicates acceptance of the updated policy.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy or our data practices, please contact us:
        </Text>
        <Text style={styles.bulletPoint}>
          • Email: privacy@budgettracker.com
        </Text>
        <Text style={styles.bulletPoint}>
          • In-App: Settings → Support (coming soon)
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Budget Tracker, you agree to this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
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
    paddingTop: theme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  lastUpdated: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  paragraph: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  bulletPoint: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bold: {
    fontWeight: theme.fontWeight.bold,
  },
  highlight: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.warning + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
    marginVertical: theme.spacing.md,
    lineHeight: 20,
  },
});

