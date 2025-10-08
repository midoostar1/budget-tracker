import { z } from "zod";
import { SubscriptionPlanEnum } from "./enums";
import { cuid, timestamp } from "./common";

export const SubscriptionCreate = z.object({
  userId: cuid,
  plan: SubscriptionPlanEnum.default("free"),
  renewsAt: timestamp.optional(),
});

export const SubscriptionUpdate = z.object({
  plan: SubscriptionPlanEnum.optional(),
  renewsAt: timestamp.optional().nullable(),
});
