import { z } from "zod";
import { cuid, hhmm } from "./common";

export const UserSettingsCreate = z.object({
  userId: cuid,
  nightlyReminderLocalTime: hhmm,
  timezone: z.string().min(1),
  monthlyExportEnabled: z.boolean().default(false),
});

export const UserSettingsUpdate = z.object({
  nightlyReminderLocalTime: hhmm.optional(),
  timezone: z.string().min(1).optional(),
  monthlyExportEnabled: z.boolean().optional(),
});
