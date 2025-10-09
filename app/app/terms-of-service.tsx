import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../src/theme';

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: October 9, 2024</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using Budget Tracker, you accept and agree to be bound by these
          Terms of Service. If you do not agree to these terms, please do not use the service.
        </Text>

        <Text style={styles.sectionTitle}>2. Service Description</Text>
        <Text style={styles.paragraph}>
          Budget Tracker is a personal finance management application that helps you:
        </Text>
        <Text style={styles.bulletPoint}>
          • Track income and expenses
        </Text>
        <Text style={styles.bulletPoint}>
          • Scan and process receipts using OCR technology
        </Text>
        <Text style={styles.bulletPoint}>
          • Manage scheduled transactions and bills
        </Text>
        <Text style={styles.bulletPoint}>
          • Generate financial reports
        </Text>
        <Text style={styles.bulletPoint}>
          • Receive notifications for pending items
        </Text>

        <Text style={styles.sectionTitle}>3. Account Requirements and Registration</Text>
        <Text style={styles.paragraph}>
          To create and maintain an account with Budget Tracker, you must:
        </Text>
        <Text style={styles.bulletPoint}>
          • Be at least 18 years of age
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide accurate, current, and complete information
        </Text>
        <Text style={styles.bulletPoint}>
          • Maintain the security of your account credentials
        </Text>
        <Text style={styles.bulletPoint}>
          • Use a valid social login provider (Google, Apple, or Facebook)
        </Text>
        <Text style={styles.bulletPoint}>
          • Promptly update your information if it changes
        </Text>
        <Text style={styles.bulletPoint}>
          • Not share your account with others
        </Text>
        <Text style={styles.paragraph}>
          You are responsible for all activities that occur under your account. If you suspect
          unauthorized access, contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>4. License and Ownership</Text>
        <Text style={styles.paragraph}>
          Budget Tracker grants you a limited, non-exclusive, non-transferable, revocable license
          to use the service for personal, non-commercial purposes.
        </Text>
        <Text style={styles.paragraph}>
          You retain ownership of:
        </Text>
        <Text style={styles.bulletPoint}>
          • Your transaction data
        </Text>
        <Text style={styles.bulletPoint}>
          • Receipt images you upload
        </Text>
        <Text style={styles.bulletPoint}>
          • Notes and descriptions you create
        </Text>
        <Text style={styles.paragraph}>
          Budget Tracker retains ownership of:
        </Text>
        <Text style={styles.bulletPoint}>
          • The application software and code
        </Text>
        <Text style={styles.bulletPoint}>
          • Design, trademarks, and branding
        </Text>
        <Text style={styles.bulletPoint}>
          • Aggregate, anonymized usage statistics
        </Text>

        <Text style={styles.sectionTitle}>5. Subscription Tiers and Pricing</Text>
        
        <Text style={styles.subSectionTitle}>Free Tier</Text>
        <Text style={styles.bulletPoint}>• 10 receipt scans per month</Text>
        <Text style={styles.bulletPoint}>• Unlimited manual transactions</Text>
        <Text style={styles.bulletPoint}>• Basic reporting features</Text>
        <Text style={styles.bulletPoint}>• Push notifications</Text>
        <Text style={styles.bulletPoint}>• Mobile app access</Text>

        <Text style={styles.subSectionTitle}>Premium Tier ($4.99/month or $49.99/year)</Text>
        <Text style={styles.bulletPoint}>• Unlimited receipt scans</Text>
        <Text style={styles.bulletPoint}>• Advanced analytics and reports</Text>
        <Text style={styles.bulletPoint}>• Priority OCR processing</Text>
        <Text style={styles.bulletPoint}>• Export to CSV and PDF</Text>
        <Text style={styles.bulletPoint}>• Category insights and trends</Text>
        <Text style={styles.bulletPoint}>• Budget goals and tracking</Text>

        <Text style={styles.paragraph}>
          Subscriptions auto-renew unless cancelled 24 hours before the renewal date. You can
          manage or cancel your subscription through your device's app store settings.
        </Text>

        <Text style={styles.sectionTitle}>6. Prohibited Conduct</Text>
        <Text style={styles.paragraph}>
          You agree NOT to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Use the service for any illegal or unauthorized purpose
        </Text>
        <Text style={styles.bulletPoint}>
          • Violate any laws in your jurisdiction
        </Text>
        <Text style={styles.bulletPoint}>
          • Upload malicious code, viruses, or harmful files
        </Text>
        <Text style={styles.bulletPoint}>
          • Attempt to gain unauthorized access to the service or other users' accounts
        </Text>
        <Text style={styles.bulletPoint}>
          • Reverse engineer, decompile, or disassemble the application
        </Text>
        <Text style={styles.bulletPoint}>
          • Scrape, crawl, or use automated tools to access the service
        </Text>
        <Text style={styles.bulletPoint}>
          • Impersonate others or create fake accounts
        </Text>
        <Text style={styles.bulletPoint}>
          • Upload content that infringes on intellectual property rights
        </Text>
        <Text style={styles.bulletPoint}>
          • Interfere with or disrupt the service or servers
        </Text>
        <Text style={styles.bulletPoint}>
          • Resell, redistribute, or commercially exploit the service
        </Text>
        <Text style={styles.paragraph}>
          Violation of these prohibitions may result in immediate account termination.
        </Text>

        <Text style={styles.sectionTitle}>7. OCR Accuracy and Data Verification</Text>
        <Text style={styles.paragraph}>
          While we use industry-leading OCR technology (Veryfi), accuracy is not guaranteed.
          You are responsible for:
        </Text>
        <Text style={styles.bulletPoint}>
          • Reviewing all OCR-extracted data before confirming
        </Text>
        <Text style={styles.bulletPoint}>
          • Verifying amounts, dates, and vendor names
        </Text>
        <Text style={styles.bulletPoint}>
          • Correcting any errors in extracted data
        </Text>
        <Text style={styles.bulletPoint}>
          • Maintaining accurate financial records
        </Text>
        <Text style={styles.paragraph}>
          Budget Tracker is not liable for financial decisions, tax filings, or other consequences
          based on OCR results. Always verify your data.
        </Text>

        <Text style={styles.highlight}>
          🏦 Future Feature: Bank Account Synchronization (Post-MVP)
          {'\n\n'}
          We plan to offer optional bank account synchronization via Plaid, Yodlee, or similar
          secure banking APIs. If implemented, you would grant limited power of attorney to
          Budget Tracker to:
          {'\n'}• Access read-only transaction data from your linked bank accounts
          {'\n'}• Automatically import transactions
          {'\n'}• Categorize transactions
          {'\n\n'}
          This feature would require:
          {'\n'}• Your explicit consent and additional agreement
          {'\n'}• Bank-level security (OAuth, encryption)
          {'\n'}• Ability to revoke access at any time
          {'\n'}• Compliance with banking regulations
          {'\n\n'}
          Your banking credentials would NEVER be stored by Budget Tracker. All bank connections
          would be handled by PCI-DSS compliant third-party providers.
        </Text>

        <Text style={styles.sectionTitle}>8. Service Availability</Text>
        <Text style={styles.paragraph}>
          We aim for 99.9% uptime but do not guarantee uninterrupted service. We may perform
          maintenance or updates that temporarily affect availability.
        </Text>

        <Text style={styles.sectionTitle}>9. Account Termination</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>By You:</Text> You may delete your account at any time through
          the Settings screen. All your data will be permanently deleted within 30 days.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>By Us:</Text> We reserve the right to suspend or terminate
          accounts that:
        </Text>
        <Text style={styles.bulletPoint}>
          • Violate these Terms of Service
        </Text>
        <Text style={styles.bulletPoint}>
          • Engage in fraudulent or abusive behavior
        </Text>
        <Text style={styles.bulletPoint}>
          • Attempt to compromise system security
        </Text>
        <Text style={styles.bulletPoint}>
          • Are inactive for more than 2 years
        </Text>
        <Text style={styles.paragraph}>
          Upon termination, your license to use Budget Tracker immediately ends.
        </Text>

        <Text style={styles.sectionTitle}>10. Disclaimers</Text>
        <Text style={styles.paragraph}>
          Budget Tracker is provided <Text style={styles.bold}>"AS IS" and "AS AVAILABLE"</Text> without
          warranties of any kind, either express or implied, including but not limited to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Merchantability or fitness for a particular purpose
        </Text>
        <Text style={styles.bulletPoint}>
          • Accuracy, reliability, or completeness of data
        </Text>
        <Text style={styles.bulletPoint}>
          • Uninterrupted or error-free operation
        </Text>
        <Text style={styles.bulletPoint}>
          • OCR accuracy or data extraction quality
        </Text>
        <Text style={styles.bulletPoint}>
          • Security against all possible threats
        </Text>
        <Text style={styles.paragraph}>
          We do not warrant that Budget Tracker will meet your specific requirements or that
          defects will be corrected.
        </Text>

        <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, Budget Tracker and its operators shall NOT be
          liable for:
        </Text>
        <Text style={styles.bulletPoint}>
          • <Text style={styles.bold}>Indirect, incidental, or consequential damages</Text> arising from
          your use of the service
        </Text>
        <Text style={styles.bulletPoint}>
          • Loss of profits, revenue, data, or business opportunities
        </Text>
        <Text style={styles.bulletPoint}>
          • Errors in OCR-extracted data or financial calculations
        </Text>
        <Text style={styles.bulletPoint}>
          • Unauthorized access to your account
        </Text>
        <Text style={styles.bulletPoint}>
          • Service interruptions, data loss, or system failures
        </Text>
        <Text style={styles.bulletPoint}>
          • Actions of third-party service providers
        </Text>
        <Text style={styles.paragraph}>
          Our total liability to you for any claims arising from your use of Budget Tracker shall
          not exceed the amount you paid for the service in the 12 months prior to the claim, or
          $100, whichever is less.
        </Text>
        <Text style={styles.paragraph}>
          Some jurisdictions do not allow limitation of liability, so these limitations may not
          apply to you.
        </Text>

        <Text style={styles.sectionTitle}>12. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify and hold harmless Budget Tracker, its officers, directors,
          employees, and agents from any claims, damages, losses, liabilities, and expenses
          (including legal fees) arising from:
        </Text>
        <Text style={styles.bulletPoint}>
          • Your use or misuse of the service
        </Text>
        <Text style={styles.bulletPoint}>
          • Violation of these Terms of Service
        </Text>
        <Text style={styles.bulletPoint}>
          • Violation of any third-party rights
        </Text>
        <Text style={styles.bulletPoint}>
          • Content you upload to the service
        </Text>

        <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms of Service at any time. Changes will be
          effective immediately upon posting. We will notify you of material changes via:
        </Text>
        <Text style={styles.bulletPoint}>
          • Email to your registered address
        </Text>
        <Text style={styles.bulletPoint}>
          • Push notification
        </Text>
        <Text style={styles.bulletPoint}>
          • In-app notice
        </Text>
        <Text style={styles.paragraph}>
          Your continued use of Budget Tracker after changes constitutes acceptance of the new
          terms. If you don't agree with changes, you must stop using the service and delete
          your account.
        </Text>

        <Text style={styles.sectionTitle}>14. Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          Any disputes arising from these Terms or your use of Budget Tracker shall be resolved
          through:
        </Text>
        <Text style={styles.bulletPoint}>
          • Good faith negotiation first
        </Text>
        <Text style={styles.bulletPoint}>
          • Binding arbitration if negotiation fails
        </Text>
        <Text style={styles.bulletPoint}>
          • Governed by the laws of [Your State/Country]
        </Text>

        <Text style={styles.sectionTitle}>15. Severability</Text>
        <Text style={styles.paragraph}>
          If any provision of these Terms is found to be unenforceable or invalid, that provision
          will be limited or eliminated to the minimum extent necessary, and the remaining provisions
          will remain in full force and effect.
        </Text>

        <Text style={styles.sectionTitle}>16. Entire Agreement</Text>
        <Text style={styles.paragraph}>
          These Terms of Service, together with our Privacy Policy, constitute the entire agreement
          between you and Budget Tracker regarding your use of the service.
        </Text>

        <Text style={styles.sectionTitle}>17. Contact</Text>
        <Text style={styles.paragraph}>
          Questions or concerns about these Terms of Service? Contact us:
        </Text>
        <Text style={styles.bulletPoint}>
          • Email: support@budgettracker.com
        </Text>
        <Text style={styles.bulletPoint}>
          • Legal: legal@budgettracker.com
        </Text>
        <Text style={styles.bulletPoint}>
          • In-App: Settings → Support (coming soon)
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Budget Tracker, you agree to these Terms of Service and our Privacy Policy.
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
  subSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
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
    backgroundColor: theme.colors.info + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.info,
    marginVertical: theme.spacing.md,
    lineHeight: 20,
  },
});

