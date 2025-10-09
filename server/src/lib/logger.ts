import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Fields to redact (PII and sensitive data)
const REDACTED_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'idToken',
  'fcmToken',
  'fcmTokens',
  'secret',
  'apiKey',
  'privateKey',
  'authorization',
  'cookie',
  'cookies',
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'address',
  'ssn',
  'creditCard',
  'cvv',
  'pin',
];

/**
 * Redact sensitive fields from objects
 */
function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if field should be redacted
    if (REDACTED_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.fcmToken',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.fcmToken',
      '*.secret',
      '*.apiKey',
      '*.privateKey',
    ],
    remove: true,
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      // Don't log full headers
      userAgent: req.headers?.['user-agent'],
      requestId: (req as any).requestId,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

/**
 * Create child logger with safe context (auto-redacts PII)
 */
export function createSafeLogger(context: any) {
  return logger.child(redactSensitiveData(context));
}

export default logger;

