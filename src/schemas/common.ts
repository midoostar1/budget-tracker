import { z } from "zod";

// Accept decimal as number or string, normalize to string with up to 4 decimals
export const decimalInput = z
  .union([
    z.number().finite(),
    z
      .string()
      .regex(/^[-+]?\d+(?:\.\d{1,4})?$/, "Invalid decimal format (max 4 dp)"),
  ])
  .transform((val) => {
    if (typeof val === "number") return val.toFixed(4);
    return val;
  });

export const currencyCode = z
  .string()
  .length(3, "Currency code must be 3 letters")
  .transform((s) => s.toUpperCase());

export const isoMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Must be YYYY-MM");

export const hhmm = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Must be HH:mm");

export const nullableString = z.string().trim().min(1).optional().nullable();

export const optionalUrl = z.string().url().optional();

export const jsonUnknown = z.unknown();

export const cuid = z.string().min(1);

export const timestamp = z.coerce.date();
