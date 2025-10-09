import { z } from 'zod';

/**
 * Export format enum
 */
export const ExportFormatSchema = z.enum(['json', 'csv', 'pdf']);

/**
 * Schema for monthly summary query
 */
export const MonthlySummaryQuerySchema = z.object({
  month: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Month must be MM format (01-12)')
    .transform((val) => parseInt(val, 10)),
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be YYYY format')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(2000).max(2100)),
  format: ExportFormatSchema.default('json'),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('100')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(1000)),
});

// Export types
export type MonthlySummaryQuery = z.infer<typeof MonthlySummaryQuerySchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;


