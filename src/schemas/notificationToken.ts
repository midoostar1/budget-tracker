import { z } from "zod";
import { DevicePlatformEnum } from "./enums";
import { cuid } from "./common";

export const NotificationTokenCreate = z.object({
  userId: cuid,
  platform: DevicePlatformEnum,
  token: z.string().min(1),
});

export const NotificationTokenUpdate = z.object({
  token: z.string().min(1).optional(),
});
