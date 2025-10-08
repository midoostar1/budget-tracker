import { z } from "zod";
import { TransactionTypeEnum } from "./enums";
import { cuid } from "./common";

export const CategoryCreate = z.object({
  userId: cuid,
  name: z.string().trim().min(1),
  type: TransactionTypeEnum,
  archived: z.boolean().optional(),
});

export const CategoryUpdate = z.object({
  name: z.string().trim().min(1).optional(),
  type: TransactionTypeEnum.optional(),
  archived: z.boolean().optional(),
});
