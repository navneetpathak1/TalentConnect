# Setup Checklist - After Implementation

## ✅ Required Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `nodemailer` - For email sending
- `@types/nodemailer` - TypeScript types

### 2. Environment Variables

Make sure your `.env` file has these variables (see `ENV_SETUP.md` for details):

#### Required:
- `DATABASE_URL` - PostgreSQL connection string
- `ACCESS_TOKEN_SECRET` - JWT secret (min 32 chars)
- `REFRESH_TOKEN_SECRET` - JWT secret (min 32 chars)

#### Optional (for new features):

**OAuth (Google/GitHub):**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `OAUTH_REDIRECT_URI` - Backend URL (e.g., `http://localhost:8000`)

**Email (SMTP):**
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP port (usually 587 or 465)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From email address

**Redis (for queues and real-time):**
- `REDIS_URL` - Redis connection URL (optional, workers will log warnings if not available)

**Code Execution:**
- `USE_DOCKER_EXECUTION` - Set to `"true"` to enable Docker-based code execution (optional)

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if not already done)
npx prisma migrate dev --name init
```

### 4. Start the Server

```bash
npm run dev
```

## ⚠️ Important Notes

### OAuth Setup

If you want to use OAuth:

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:8000/api/v1/auth/google/callback` (or your production URL)
   - Copy Client ID and Secret to `.env`

2. **GitHub OAuth:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL: `http://localhost:8000/api/v1/auth/github/callback` (or your production URL)
   - Copy Client ID and Secret to `.env`

**Note:** OAuth routes will return 503 if not configured - this is expected behavior.

### Email Setup

If SMTP is not configured:
- Emails will be **logged** instead of sent (development mode)
- This is safe for development
- Configure SMTP for production

### Redis Setup

If Redis is not available:
- Background workers will not start (warnings will be logged)
- Socket.io will work without Redis adapter (single instance only)
- API endpoints will work normally
- This is OK for development

### Code Execution

- By default, code execution runs locally (safe for development)
- Set `USE_DOCKER_EXECUTION=true` for production Docker-based execution
- Local execution supports: JavaScript, Python, TypeScript

## 🧪 Testing

### Test OAuth (if configured):
```
GET http://localhost:8000/api/v1/auth/google
GET http://localhost:8000/api/v1/auth/github
```

### Test Email:
```typescript
import { emailQueue } from "./workers";

await emailQueue.add("send", {
  to: "test@example.com",
  subject: "Test",
  html: "<h1>Test</h1>"
});
```

### Test Socket.io:
```javascript
const socket = io("http://localhost:8000", {
  auth: { token: "your-access-token" }
});
```

## ✅ Verification

After setup, verify:
- [ ] Server starts without errors
- [ ] Database connection works
- [ ] Health check: `GET http://localhost:8000/health`
- [ ] OAuth routes respond (503 if not configured is OK)
- [ ] No missing package errors

## 🐛 Troubleshooting

### "Cannot find package 'nodemailer'"
- Run: `npm install`

### "Redis connection error"
- This is OK if Redis is not running
- Workers will not start, but API will work

### "OAuth not configured"
- This is expected if OAuth credentials are not set
- Routes will return 503

### "SMTP not configured"
- This is OK for development
- Emails will be logged instead of sent

---

**All features are optional** - the backend will work with just the required database and JWT secrets!

