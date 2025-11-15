# TalentConnect Frontend

Modern, production-ready React frontend for TalentConnect built with TypeScript, Vite, Tailwind CSS, and ShadCN UI.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # ShadCN UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   └── hackathons/
│   ├── services/         # API service functions
│   ├── store/           # Zustand stores
│   ├── routes/          # Route configuration
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration
│   └── styles/          # Global styles
├── public/              # Static assets
└── package.json
```

## 🛠️ Tech Stack

- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **ShadCN UI** - UI components
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client
- **React Router v6** - Routing
- **Socket.io-client** - Real-time features
- **Framer Motion** - Animations

## 🎨 Features

- ✅ Modern, responsive UI
- ✅ Authentication (Email/Password + OAuth)
- ✅ Job browsing and applications
- ✅ Hackathon participation
- ✅ Real-time notifications
- ✅ Live leaderboards (Socket.io)
- ✅ Role-based dashboards
- ✅ File uploads
- ✅ Dark mode support (ready)
- ✅ Animations and transitions

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔗 API Integration

The frontend integrates with the backend API at `/api/v1`. All API calls are handled through service functions in `src/services/`.

### Authentication

- Login/Register with email and password
- OAuth (Google, GitHub)
- JWT token management with auto-refresh
- Protected routes

### Services

- `auth.service.ts` - Authentication
- `jobs.service.ts` - Job management
- `hackathon.service.ts` - Hackathons
- `application.service.ts` - Job applications
- `upload.service.ts` - File uploads
- `notification.service.ts` - Notifications
- `user.service.ts` - User profile
- `org.service.ts` - Organizations

## 🎯 Key Components

### Pages

- **Auth**: Login, Register
- **Jobs**: Job list, Job details, Apply
- **Hackathons**: List, Details, Rounds, Leaderboard
- **Dashboards**: User, Company, Admin
- **Profile**: User profile management
- **Applications**: Application history

### Reusable Components

- `Navbar` - Navigation with user menu
- `Footer` - Site footer
- `ProtectedLayout` - Layout wrapper with auth
- `JobCard` - Job listing card
- `NotificationBell` - Notification dropdown
- `ApplyJobDialog` - Job application modal

## 🔐 Authentication Flow

1. User logs in/registers
2. Access token stored in Zustand store (sessionStorage)
3. Token automatically added to API requests
4. Token refresh handled automatically on 401 errors
5. Protected routes check authentication

## 🎨 Styling

- Tailwind CSS for utility-first styling
- ShadCN UI components for consistent design
- Custom theme with CSS variables
- Responsive design (mobile-first)
- Dark mode ready

## 📦 Dependencies

See `package.json` for complete list. Key dependencies:

- React ecosystem (React, React DOM, React Router)
- UI libraries (ShadCN, Radix UI)
- Data fetching (React Query, Axios)
- State management (Zustand)
- Forms (React Hook Form, Zod)
- Real-time (Socket.io-client)
- Animations (Framer Motion)

## 🚧 Development Notes

- All API calls use React Query for caching
- Forms use React Hook Form with Zod validation
- State management with Zustand (lightweight)
- Code splitting with lazy loading
- Error handling with toast notifications
- Loading states with skeleton loaders

## 📄 License

Part of the TalentConnect project.

