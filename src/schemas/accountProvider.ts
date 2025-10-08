import { z } from "zod";
import { AuthProviderEnum } from "./enums";
import { cuid } from "./common";

export const AccountProviderCreate = z.object({
  userId: cuid,
  provider: AuthProviderEnum,
  providerUid: z.string().min(1),
});

export const AccountProviderUpdate = z.object({
  providerUid: z.string().min(1).optional(),
});
