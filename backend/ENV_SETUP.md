# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/talentconnect?schema=public"

# JWT (Generate secure random strings, minimum 32 characters)
ACCESS_TOKEN_SECRET="your_secure_random_string_min_32_chars"
REFRESH_TOKEN_SECRET="your_secure_random_string_min_32_chars"

# OAuth (Optional - for Google/GitHub login)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
OAUTH_REDIRECT_URI="http://localhost:3000/auth/callback"

# File Storage - Choose ONE:
# Option 1: Supabase Storage (Recommended - easier setup)
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_BUCKET="talentconnect"

# Option 2: AWS S3 / Cloudflare R2 (Alternative)
S3_BUCKET=""
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_ENDPOINT=""  # For R2 or custom S3-compatible services

# Redis (Optional - for caching and queues)
REDIS_URL="redis://localhost:6379"

# Email (Optional - for sending notifications)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@talentconnect.com"

# Server
NODE_ENV=development
PORT=8000
ADMIN_EMAILS="admin@company.com"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

## Generating Secure Secrets

For JWT secrets, you can generate secure random strings:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Development Setup

1. Copy this template to `.env`
2. Fill in the required values
3. For local development, you can use Docker Compose which sets up PostgreSQL and Redis automatically
4. Run `npm run dev` to start the development server

## Production Setup

- Never commit `.env` files to version control
- Use your platform's secret management system (AWS Secrets Manager, GitHub Secrets, etc.)
- Rotate secrets regularly
- Use strong, unique secrets for production

