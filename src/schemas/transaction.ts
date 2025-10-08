import { z } from "zod";
import { TransactionSourceEnum, TransactionTypeEnum } from "./enums";
import { cuid, currencyCode, decimalInput, hhmm, jsonUnknown, optionalUrl, timestamp } from "./common";

export const TransactionCreate = z.object({
  userId: cuid,
  type: TransactionTypeEnum,
  amount: decimalInput,
  currency: currencyCode,
  payee: z.string().trim().min(1),
  categoryId: cuid.optional(),
  note: z.string().trim().max(2000).optional(),
  occurredAt: timestamp,
  source: TransactionSourceEnum,
  receiptImageUrl: optionalUrl,
  ocrMeta: jsonUnknown.optional(),
});

export const TransactionUpdate = z.object({
  type: TransactionTypeEnum.optional(),
  amount: decimalInput.optional(),
  currency: currencyCode.optional(),
  payee: z.string().trim().min(1).optional(),
  categoryId: cuid.nullable().optional(),
  note: z.string().trim().max(2000).optional().nullable(),
  occurredAt: timestamp.optional(),
  source: TransactionSourceEnum.optional(),
  receiptImageUrl: optionalUrl.or(z.literal("")).optional().transform((v) => (v === "" ? undefined : v)),
  ocrMeta: jsonUnknown.optional(),
});
