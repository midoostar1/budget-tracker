import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const ProviderSchema = z.enum(['google', 'apple', 'facebook']);
export const CategoryTypeSchema = z.enum(['expense', 'income']);
export const TransactionTypeSchema = z.enum(['expense', 'income']);
export const TransactionSourceSchema = z.enum(['manual', 'ocr', 'bank']);
export const RecurringKindSchema = z.enum(['expense', 'income']);
export const CadenceSchema = z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']);
export const PlatformSchema = z.enum(['ios', 'android']);
export const ExportJobStatusSchema = z.enum(['queued', 'done', 'failed']);
export const SubscriptionPlanSchema = z.enum(['free', 'premium']);

// ============================================================================
// User
// ============================================================================

export const CreateUserSchema = z.object({
  email: z.string().email(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
});

// ============================================================================
// AccountProvider
// ============================================================================

export const CreateAccountProviderSchema = z.object({
  userId: z.string(),
  provider: ProviderSchema,
  providerUid: z.string(),
});

export const UpdateAccountProviderSchema = z.object({
  provider: ProviderSchema.optional(),
  providerUid: z.string().optional(),
});

// ============================================================================
// Category
// ============================================================================

export const CreateCategorySchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  type: CategoryTypeSchema,
  archived: z.boolean().default(false).optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: CategoryTypeSchema.optional(),
  archived: z.boolean().optional(),
});

// ============================================================================
// Transaction
// ============================================================================

export const CreateTransactionSchema = z.object({
  userId: z.string(),
  type: TransactionTypeSchema,
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d{1,2})?$/)),
  currency: z.string().length(3).default('USD').optional(),
  payee: z.string().min(1).max(200),
  categoryId: z.string().optional(),
  note: z.string().max(500).optional(),
  occurredAt: z.string().datetime().or(z.date()).default(() => new Date().toISOString()).optional(),
  source: TransactionSourceSchema.default('manual').optional(),
  receiptImageUrl: z.string().url().optional(),
  ocrMeta: z.record(z.unknown()).optional(),
});

export const UpdateTransactionSchema = z.object({
  type: TransactionTypeSchema.optional(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d{1,2})?$/)).optional(),
  currency: z.string().length(3).optional(),
  payee: z.string().min(1).max(200).optional(),
  categoryId: z.string().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  occurredAt: z.string().datetime().or(z.date()).optional(),
  source: TransactionSourceSchema.optional(),
  receiptImageUrl: z.string().url().nullable().optional(),
  ocrMeta: z.record(z.unknown()).nullable().optional(),
});

// ============================================================================
// PendingReceipt
// ============================================================================

export const CreatePendingReceiptSchema = z.object({
  userId: z.string(),
  s3Key: z.string().min(1),
});

export const UpdatePendingReceiptSchema = z.object({
  s3Key: z.string().min(1).optional(),
});

// ============================================================================
// RecurringRule
// ============================================================================

export const CreateRecurringRuleSchema = z.object({
  userId: z.string(),
  kind: RecurringKindSchema,
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d{1,2})?$/)),
  currency: z.string().length(3).default('USD').optional(),
  payee: z.string().min(1).max(200),
  categoryId: z.string().optional(),
  cadence: CadenceSchema,
  nextRunAt: z.string().datetime().or(z.date()),
  lastRunAt: z.string().datetime().or(z.date()).optional(),
});

export const UpdateRecurringRuleSchema = z.object({
  kind: RecurringKindSchema.optional(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d{1,2})?$/)).optional(),
  currency: z.string().length(3).optional(),
  payee: z.string().min(1).max(200).optional(),
  categoryId: z.string().nullable().optional(),
  cadence: CadenceSchema.optional(),
  nextRunAt: z.string().datetime().or(z.date()).optional(),
  lastRunAt: z.string().datetime().or(z.date()).nullable().optional(),
});

// ============================================================================
// UserSettings
// ============================================================================

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

export const CreateUserSettingsSchema = z.object({
  userId: z.string(),
  nightlyReminderLocalTime: z.string().regex(timeRegex, 'Time must be in HH:mm format'),
  timezone: z.string().default('UTC').optional(),
  monthlyExportEnabled: z.boolean().default(false).optional(),
});

export const UpdateUserSettingsSchema = z.object({
  nightlyReminderLocalTime: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  timezone: z.string().optional(),
  monthlyExportEnabled: z.boolean().optional(),
});

// ============================================================================
// NotificationToken
// ============================================================================

export const CreateNotificationTokenSchema = z.object({
  userId: z.string(),
  platform: PlatformSchema,
  token: z.string().min(1),
});

export const UpdateNotificationTokenSchema = z.object({
  platform: PlatformSchema.optional(),
  token: z.string().min(1).optional(),
});

// ============================================================================
// ExportJob
// ============================================================================

const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const CreateExportJobSchema = z.object({
  userId: z.string(),
  month: z.string().regex(monthRegex, 'Month must be in YYYY-MM format'),
  status: ExportJobStatusSchema.default('queued').optional(),
  url: z.string().url().optional(),
});

export const UpdateExportJobSchema = z.object({
  month: z.string().regex(monthRegex, 'Month must be in YYYY-MM format').optional(),
  status: ExportJobStatusSchema.optional(),
  url: z.string().url().nullable().optional(),
});

// ============================================================================
// Subscription
// ============================================================================

export const CreateSubscriptionSchema = z.object({
  userId: z.string(),
  plan: SubscriptionPlanSchema.default('free').optional(),
  renewsAt: z.string().datetime().or(z.date()).optional(),
});

export const UpdateSubscriptionSchema = z.object({
  plan: SubscriptionPlanSchema.optional(),
  renewsAt: z.string().datetime().or(z.date()).nullable().optional(),
});

// ============================================================================
// Type exports
// ============================================================================

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type CreateAccountProvider = z.infer<typeof CreateAccountProviderSchema>;
export type UpdateAccountProvider = z.infer<typeof UpdateAccountProviderSchema>;

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;

export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

export type CreatePendingReceipt = z.infer<typeof CreatePendingReceiptSchema>;
export type UpdatePendingReceipt = z.infer<typeof UpdatePendingReceiptSchema>;

export type CreateRecurringRule = z.infer<typeof CreateRecurringRuleSchema>;
export type UpdateRecurringRule = z.infer<typeof UpdateRecurringRuleSchema>;

export type CreateUserSettings = z.infer<typeof CreateUserSettingsSchema>;
export type UpdateUserSettings = z.infer<typeof UpdateUserSettingsSchema>;

export type CreateNotificationToken = z.infer<typeof CreateNotificationTokenSchema>;
export type UpdateNotificationToken = z.infer<typeof UpdateNotificationTokenSchema>;

export type CreateExportJob = z.infer<typeof CreateExportJobSchema>;
export type UpdateExportJob = z.infer<typeof UpdateExportJobSchema>;

export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscription = z.infer<typeof UpdateSubscriptionSchema>;
