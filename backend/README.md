# TalentConnect Backend

Production-ready backend for TalentConnect built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## Features

- 🔐 Authentication (JWT + OAuth support)
- 👥 User management with roles (USER, COMPANY, ADMIN)
- 🏢 Organization management
- 💼 Job postings and applications
- 🏆 Hackathons with multi-rounds and submissions
- 📊 Real-time leaderboards (Socket.io)
- 📁 File uploads via pre-signed S3/R2 URLs
- 📧 Background workers (BullMQ) for async tasks
- 🔍 Search and filtering
- 📱 Notifications system
- 🛡️ Security best practices

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **Real-time**: Socket.io
- **Storage**: AWS S3 / Cloudflare R2
- **Logging**: Pino

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. **Clone and install dependencies**

```bash
cd backend
npm ci
```

2. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

4. **Start development server**

```bash
npm run dev
```

The server will start on `http://localhost:8000`

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 8000
- Background workers

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `ACCESS_TOKEN_SECRET`: JWT access token secret (min 32 chars)
- `REFRESH_TOKEN_SECRET`: JWT refresh token secret (min 32 chars)
- `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: S3/R2 configuration
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth (optional)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: GitHub OAuth (optional)

## API Documentation

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

### Users

- `GET /users/me` - Get current user
- `PATCH /users/me` - Update current user

### Organizations

- `POST /org` - Create organization (COMPANY/ADMIN)
- `GET /org/me` - Get user's organizations

### Jobs

- `POST /jobs` - Create job (COMPANY/ADMIN)
- `GET /jobs` - List jobs (with filters)

### Applications

- `POST /applications/apply` - Apply to job

### Hackathons

- `POST /hackathons` - Create hackathon (COMPANY/ADMIN)
- `GET /hackathons` - List hackathons
- `POST /hackathons/:id/join` - Join hackathon

### Submissions

- `POST /submissions/submit` - Submit code/file

### Leaderboard

- `GET /leaderboard/:hackathonId` - Get leaderboard

### Notifications

- `GET /notifications` - Get user notifications
- `PATCH /notifications/:id/read` - Mark as read

### Upload

- `GET /upload/presign` - Get pre-signed upload URL

### Admin

- `GET /admin/stats` - Get admin statistics (ADMIN only)

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Express middleware
│   ├── routes/                # Route definitions
│   ├── services/              # Business logic (optional)
│   ├── utils/                 # Utilities (JWT, hash, S3, logger)
│   ├── workers/               # Background workers
│   ├── sockets/                # Socket.io setup
│   ├── types/                 # TypeScript types
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:studio` - Open Prisma Studio

## Security

- ✅ JWT with short-lived access tokens and refresh token rotation
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Rate limiting on auth endpoints
- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ Secure cookies (httpOnly, sameSite, secure in production)

## Testing

```bash
npm test
```

## Deployment

### Production Checklist

1. Set all environment variables in production secrets manager
2. Use managed PostgreSQL (RDS, Supabase, etc.)
3. Use managed Redis (ElastiCache, Upstash, etc.)
4. Configure S3/R2 bucket with proper CORS
5. Set up CI/CD pipeline
6. Configure monitoring (Sentry, Datadog, etc.)
7. Set up backups
8. Enable HTTPS
9. Configure rate limiting for production
10. Set up log aggregation

### Docker Deployment

```bash
docker build -t talentconnect-backend .
docker run -p 8000:8000 --env-file .env talentconnect-backend
```

## License

ISC

