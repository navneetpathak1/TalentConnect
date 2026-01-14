import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REDIS_URL: z.string().optional(),
  // S3 Configuration (legacy - can be used alongside Supabase)
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  // Supabase Configuration (recommended)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_BUCKET: z.string().optional().default("talentconnect"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  OAUTH_REDIRECT_URI: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  FRONTEND_URL: z.string().optional().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;

