import { z } from "zod";
import { RecurrenceCadenceEnum, TransactionTypeEnum } from "./enums";
import { cuid, currencyCode, decimalInput, timestamp } from "./common";

export const RecurringRuleCreate = z.object({
  userId: cuid,
  kind: TransactionTypeEnum,
  amount: decimalInput,
  currency: currencyCode,
  payee: z.string().trim().min(1),
  categoryId: cuid.optional(),
  cadence: RecurrenceCadenceEnum,
  nextRunAt: timestamp,
  lastRunAt: timestamp.optional(),
});

export const RecurringRuleUpdate = z.object({
  kind: TransactionTypeEnum.optional(),
  amount: decimalInput.optional(),
  currency: currencyCode.optional(),
  payee: z.string().trim().min(1).optional(),
  categoryId: cuid.nullable().optional(),
  cadence: RecurrenceCadenceEnum.optional(),
  nextRunAt: timestamp.optional(),
  lastRunAt: timestamp.optional().nullable(),
});
