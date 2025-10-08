import crypto from 'node:crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost as createS3PresignedPost } from '@aws-sdk/s3-presigned-post';

export type PresignParams = {
  contentType: string;
  extension: string;
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export async function createPresignedPost(params: PresignParams) {
  const key = `receipts/${crypto.randomUUID()}.${params.extension}`;
  const bucket = process.env.S3_BUCKET!;

  const { url, fields } = await createS3PresignedPost(s3Client, {
    Bucket: bucket,
    Key: key,
    Conditions: [
      ['content-length-range', 0, 10_000_000], // up to ~10MB
      { acl: 'private' },
      { 'x-amz-server-side-encryption': 'AES256' },
      ['starts-with', '$Content-Type', params.contentType.split('/')[0]],
    ],
    Fields: {
      key,
      acl: 'private',
      'Content-Type': params.contentType,
      'x-amz-server-side-encryption': 'AES256',
    },
    Expires: 60,
  });

  return {
    url,
    fields,
    key,
    cdnUrl: process.env.CDN_BASE_URL ? `${process.env.CDN_BASE_URL}/${key}` : undefined,
  };
}
