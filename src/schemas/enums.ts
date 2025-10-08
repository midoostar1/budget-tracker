import { z } from "zod";

export const AuthProviderEnum = z.enum(["google", "apple", "facebook"]);
export type AuthProvider = z.infer<typeof AuthProviderEnum>;

export const TransactionTypeEnum = z.enum(["expense", "income"]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const TransactionSourceEnum = z.enum(["manual", "ocr", "bank"]);
export type TransactionSource = z.infer<typeof TransactionSourceEnum>;

export const DevicePlatformEnum = z.enum(["ios", "android"]);
export type DevicePlatform = z.infer<typeof DevicePlatformEnum>;

export const ExportJobStatusEnum = z.enum(["queued", "done", "failed"]);
export type ExportJobStatus = z.infer<typeof ExportJobStatusEnum>;

export const SubscriptionPlanEnum = z.enum(["free", "premium"]);
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanEnum>;

export const RecurrenceCadenceEnum = z.enum([
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
]);
export type RecurrenceCadence = z.infer<typeof RecurrenceCadenceEnum>;
