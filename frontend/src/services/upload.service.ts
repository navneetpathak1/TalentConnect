import api from "./api";

export interface PresignedUrlResponse {
  url: string;
  key: string;
  expiresIn: number;
  bucket?: string;
  path?: string;
  storageType?: "s3" | "supabase";
}

export const uploadService = {
  async getPresignedUrl(
    type: "resume" | "logo" | "submission" | "avatar",
    filename: string,
    contentType?: string
  ): Promise<PresignedUrlResponse> {
    const response = await api.get<{ success: boolean; data: PresignedUrlResponse }>(
      "/upload/presign",
      {
        params: { type, filename, contentType },
      }
    );
    return response.data.data;
  },

  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
  },

  async uploadProxy(
    type: "resume" | "logo" | "submission" | "avatar",
    file: File,
    base64Content: string
  ): Promise<{ url: string; key: string }> {
    const response = await api.post<{ success: boolean; data: { url: string; key: string } }>(
      "/upload/proxy",
      {
        type,
        filename: file.name,
        contentType: file.type,
        content: base64Content,
      }
    );
    return response.data.data;
  },
};

