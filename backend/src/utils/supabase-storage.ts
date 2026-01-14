import { createClient } from "@supabase/supabase-js";
import { env } from "../config";
import crypto from "crypto";

// Initialize Supabase client with service role key (for server-side operations)
const supabase = createClient(
  env.SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface PresignedUploadOptions {
  type: "resume" | "logo" | "submission" | "avatar";
  filename: string;
  contentType?: string;
  maxSize?: number; // bytes
}

/**
 * Generate a signed URL for uploading to Supabase Storage
 * Note: Supabase doesn't support pre-signed PUT URLs like S3.
 * Instead, we return the file path and the frontend uses Supabase client to upload.
 * Alternatively, we can upload server-side and return the public URL.
 */
export async function generatePresignedUploadUrl(
  options: PresignedUploadOptions
): Promise<{ url: string; key: string; expiresIn: number; token?: string }> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase not configured");
  }

  const { type, filename, contentType, maxSize = 10 * 1024 * 1024 } = options; // 10MB default

  // Generate unique key
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString("hex");
  const extension = filename.split(".").pop() || "";
  const key = `${type}/${timestamp}-${randomId}.${extension}`;

  // Get bucket name from env or use default
  const bucket = env.SUPABASE_BUCKET || "talentconnect";

  // Supabase Storage upload endpoint
  // The frontend will need to use Supabase client with anon key to upload
  // OR we can use the service role key to generate a signed URL for the REST API
  const expiresIn = 3600; // 1 hour (Supabase signed URLs last longer)

  // Generate signed URL using Supabase REST API
  // We'll use the storage API endpoint with the service role key
  const uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/${bucket}/${key}`;

  // Return the upload URL and path
  // Frontend will use this with Supabase client or we can provide a token
  return {
    url: "", // Not used for Supabase - frontend uses client directly
    key: `${bucket}/${key}`, // Return full path including bucket
    expiresIn: expiresIn,
    bucket: bucket, // Include bucket for frontend
    path: key, // Include path for frontend
    storageType: "supabase", // Flag to identify Supabase
  };
}

export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase not configured");
  }

  // Extract bucket and path from key
  const [bucket, ...pathParts] = key.split("/");
  const path = pathParts.join("/");

  // Create signed URL for download (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (error) {
    throw new Error(`Failed to create download URL: ${error.message}`);
  }

  return data.signedUrl;
}

// Helper to get public URL (if bucket is public)
export function getPublicUrl(key: string): string {
  if (!env.SUPABASE_URL) {
    throw new Error("Supabase not configured");
  }

  const [bucket, ...pathParts] = key.split("/");
  const path = pathParts.join("/");

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Helper to upload file buffer
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<{ path: string; fullPath: string }> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return {
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
  };
}
