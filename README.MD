# TalentConnect

TalentConnect is a comprehensive platform connecting job seekers with opportunities and companies with top talent. It features job postings, applications, hackathons, and organization management.

## 🚀 Features

- **Authentication**: secure signup/login for Users and Companies (JWT-based).
- **User Profiles**: Manage professional identity, resume, and portfolio.
- **Job Board**:
    - Companies can post and manage jobs.
    - Users can search, filter, and apply for jobs.
- **Applications**: Track application status (Pending, Reviewed, Accepted, Rejected).
- **Hackathons**:
    - Participate in coding challenges.
    - Leaderboards and submissions.
- **File Uploads**: Resume and asset management (S3/Supabase integration).
- **Real-time Notifications**: Updates on application status and hackathons.

## 🛠 Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query](https://tanstack.com/query/latest)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Validation**: Zod
- **Authentication**: Passport.js (OAuth) + JWT
- **Logging**: Pino

## 📦 Project Structure

```
TalentConnect/
├── backend/                # Express.js API
│   ├── prisma/            # Database schema and migrations
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth and error handling
│   │   ├── routes/        # API route definitions
│   │   └── services/      # Business logic
│   └── package.json
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client services
│   │   └── store/         # Global state stores
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
Create a `.env` file in `backend/` and configure:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/talentconnect"
JWT_SECRET="your-secret-key"
PORT=8000
FRONTEND_URL="http://localhost:5173"
# Add other required keys (AWS/Supabase if needed)
```

Run database migrations:
```bash
npx prisma migrate dev --name init
```

Start the development server:
```bash
npm run dev
```

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
