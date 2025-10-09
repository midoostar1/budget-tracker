import { z } from 'zod';

/**
 * Device platform enum
 */
export const DevicePlatformSchema = z.enum(['ios', 'android']);

/**
 * Schema for device registration
 */
export const RegisterDeviceSchema = z.object({
  fcmToken: z
    .string()
    .min(1, 'FCM token is required')
    .max(500, 'FCM token is too long'),
  platform: DevicePlatformSchema,
});

// Export types
export type RegisterDeviceInput = z.infer<typeof RegisterDeviceSchema>;
export type DevicePlatform = z.infer<typeof DevicePlatformSchema>;


