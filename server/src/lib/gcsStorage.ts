import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from './logger';

// Initialize Google Cloud Storage
let storage: Storage | null = null;

function getStorage(): Storage {
  if (!storage) {
    if (config.GCS_KEY_FILE) {
      // Use service account key file
      storage = new Storage({
        projectId: config.GCS_PROJECT_ID,
        keyFilename: config.GCS_KEY_FILE,
      });
    } else if (config.GCS_PROJECT_ID) {
      // Use default credentials (e.g., in GCP environment)
      storage = new Storage({
        projectId: config.GCS_PROJECT_ID,
      });
    } else {
      throw new Error('Google Cloud Storage is not configured');
    }
  }
  return storage;
}

export interface UploadResult {
  fileName: string;
  publicUrl: string;
  gsPath: string;
}

/**
 * Upload a file buffer to Google Cloud Storage
 */
export async function uploadToGCS(
  buffer: Buffer,
  userId: string,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    if (!config.GCS_BUCKET_NAME) {
      throw new Error('GCS_BUCKET_NAME is not configured');
    }

    const gcs = getStorage();
    const bucket = gcs.bucket(config.GCS_BUCKET_NAME);

    // Generate unique filename
    const fileId = uuidv4();
    const extension = getExtensionFromMimeType(contentType);
    const fileName = `receipts/${userId}/${fileId}${extension}`;

    const file = bucket.file(fileName);

    // Upload file
    await file.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
      // Make file private by default
      public: false,
    });

    logger.info({ fileName, userId }, 'File uploaded to GCS');

    // Generate gs:// path (canonical storage path)
    const gsPath = `gs://${config.GCS_BUCKET_NAME}/${fileName}`;

    // Generate public URL (even though file is private, this is the URL structure)
    const publicUrl = `https://storage.googleapis.com/${config.GCS_BUCKET_NAME}/${fileName}`;

    return {
      fileName,
      publicUrl,
      gsPath,
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to upload file to GCS');
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a signed URL for temporary access to a private file
 * @param gsPath - The gs:// path of the file
 * @param expirationMinutes - How long the URL should be valid (default: 60 minutes)
 */
export async function generateSignedUrl(
  gsPath: string,
  expirationMinutes: number = 60
): Promise<string> {
  try {
    if (!gsPath.startsWith('gs://')) {
      throw new Error('Invalid gs:// path');
    }

    // Parse gs://bucket/path to get bucket and file path
    const pathWithoutProtocol = gsPath.substring(5); // Remove 'gs://'
    const [bucketName, ...fileParts] = pathWithoutProtocol.split('/');
    const filePath = fileParts.join('/');

    const gcs = getStorage();
    const bucket = gcs.bucket(bucketName);
    const file = bucket.file(filePath);

    // Generate signed URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expirationMinutes * 60 * 1000,
    });

    logger.debug({ gsPath, expirationMinutes }, 'Generated signed URL');

    return url;
  } catch (error) {
    logger.error({ error, gsPath }, 'Failed to generate signed URL');
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate signed URLs for multiple files
 */
export async function generateSignedUrls(
  gsPaths: string[],
  expirationMinutes: number = 60
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  await Promise.all(
    gsPaths.map(async (gsPath) => {
      try {
        const url = await generateSignedUrl(gsPath, expirationMinutes);
        urlMap.set(gsPath, url);
      } catch (error) {
        logger.warn({ error, gsPath }, 'Failed to generate signed URL for file');
        // Continue with other files
      }
    })
  );

  return urlMap;
}

/**
 * Delete a file from GCS
 */
export async function deleteFromGCS(gsPath: string): Promise<void> {
  try {
    if (!gsPath.startsWith('gs://')) {
      throw new Error('Invalid gs:// path');
    }

    const pathWithoutProtocol = gsPath.substring(5);
    const [bucketName, ...fileParts] = pathWithoutProtocol.split('/');
    const filePath = fileParts.join('/');

    const gcs = getStorage();
    const bucket = gcs.bucket(bucketName);
    const file = bucket.file(filePath);

    await file.delete();

    logger.info({ gsPath }, 'File deleted from GCS');
  } catch (error) {
    logger.error({ error, gsPath }, 'Failed to delete file from GCS');
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a file exists in GCS
 */
export async function fileExists(gsPath: string): Promise<boolean> {
  try {
    if (!gsPath.startsWith('gs://')) {
      return false;
    }

    const pathWithoutProtocol = gsPath.substring(5);
    const [bucketName, ...fileParts] = pathWithoutProtocol.split('/');
    const filePath = fileParts.join('/');

    const gcs = getStorage();
    const bucket = gcs.bucket(bucketName);
    const file = bucket.file(filePath);

    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    logger.error({ error, gsPath }, 'Failed to check file existence');
    return false;
  }
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  };

  return mimeToExt[mimeType.toLowerCase()] || '.jpg';
}

/**
 * Validate image file
 */
export function validateImageFile(
  mimetype: string,
  size: number
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(mimetype.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
    };
  }

  if (size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}


