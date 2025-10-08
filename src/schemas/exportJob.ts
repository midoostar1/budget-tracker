import { z } from "zod";
import { ExportJobStatusEnum } from "./enums";
import { cuid, isoMonth, optionalUrl } from "./common";

export const ExportJobCreate = z.object({
  userId: cuid,
  month: isoMonth,
  status: ExportJobStatusEnum.default("queued"),
  url: optionalUrl,
});

export const ExportJobUpdate = z.object({
  status: ExportJobStatusEnum.optional(),
  url: optionalUrl.or(z.literal("")).optional().transform((v) => (v === "" ? undefined : v)),
});
