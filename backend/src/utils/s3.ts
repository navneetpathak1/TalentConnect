import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config";
import crypto from "crypto";

const s3Client = new S3Client({
  region: env.S3_REGION || "us-east-1",
  endpoint: env.S3_ENDPOINT,
  credentials: env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
    ? {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      }
    : undefined,
  forcePathStyle: !!env.S3_ENDPOINT, // Required for R2 and other S3-compatible services
});

export interface PresignedUploadOptions {
  type: "resume" | "logo" | "submission" | "avatar";
  filename: string;
  contentType?: string;
  maxSize?: number; // bytes
}

export async function generatePresignedUploadUrl(
  options: PresignedUploadOptions
): Promise<{ url: string; key: string; expiresIn: number }> {
  if (!env.S3_BUCKET) {
    throw new Error("S3_BUCKET not configured");
  }

  const { type, filename, contentType, maxSize = 10 * 1024 * 1024 } = options; // 10MB default

  // Generate unique key
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString("hex");
  const extension = filename.split(".").pop() || "";
  const key = `${type}/${timestamp}-${randomId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType || "application/octet-stream",
    // Add content length restriction via policy if needed
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });

  return {
    url,
    key,
    expiresIn: 300,
  };
}

export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  if (!env.S3_BUCKET) {
    throw new Error("S3_BUCKET not configured");
  }

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });
}

