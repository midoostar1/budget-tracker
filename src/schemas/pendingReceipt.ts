import { z } from "zod";
import { cuid } from "./common";

export const PendingReceiptCreate = z.object({
  userId: cuid,
  s3Key: z.string().min(1),
});

export const PendingReceiptUpdate = z.object({
  s3Key: z.string().min(1).optional(),
});
