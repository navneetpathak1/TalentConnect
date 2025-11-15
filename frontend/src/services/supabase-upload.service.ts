import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

// Initialize Supabase client for frontend (use anon key, not service role!)
const supabase = createClient(env.SUPABASE_URL || "", env.SUPABASE_ANON_KEY || "");

export interface UploadResponse {
  url: string;
  key: string;
  expiresIn: number;
}

/**
 * Upload file to Supabase Storage
 * This is an alternative to the S3 upload method
 */
export const supabaseUploadService = {
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      contentType?: string;
      upsert?: boolean;
    }
  ): Promise<{ path: string; fullPath: string }> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: options?.contentType || file.type,
      upsert: options?.upsert || false,
      cacheControl: "3600",
    });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return {
      path: data.path,
      fullPath: `${bucket}/${data.path}`,
    };
  },

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  },
};

