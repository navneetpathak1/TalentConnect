import { lazy } from "react";
import { Navigate } from "react-router-dom";

// Lazy load pages for code splitting with error handling
const Login = lazy(() => import("@/pages/auth/Login").catch(() => ({ default: () => <div>Error loading Login</div> })));
const Register = lazy(() => import("@/pages/auth/Register").catch(() => ({ default: () => <div>Error loading Register</div> })));
const UserDashboard = lazy(() => import("@/pages/dashboard/UserDashboard").catch(() => ({ default: () => <div>Error loading Dashboard</div> })));
const CompanyDashboard = lazy(() => import("@/pages/dashboard/CompanyDashboard").catch(() => ({ default: () => <div>Error loading Company Dashboard</div> })));
const AdminDashboard = lazy(() => import("@/pages/dashboard/AdminDashboard").catch(() => ({ default: () => <div>Error loading Admin Dashboard</div> })));
const JobsList = lazy(() => import("@/pages/jobs/JobsList").catch(() => ({ default: () => <div>Error loading Jobs</div> })));
const CreateJob = lazy(() => import("@/pages/jobs/CreateJob").catch(() => ({ default: () => <div>Error loading Create Job</div> })));
const JobDetails = lazy(() => import("@/pages/jobs/JobDetails").catch(() => ({ default: () => <div>Error loading Job Details</div> })));
const HackathonList = lazy(() => import("@/pages/hackathons/HackathonList").catch(() => ({ default: () => <div>Error loading Hackathons</div> })));
const HackathonDetails = lazy(() => import("@/pages/hackathons/HackathonDetails").catch(() => ({ default: () => <div>Error loading Hackathon Details</div> })));
const HackathonRound = lazy(() => import("@/pages/hackathons/HackathonRound").catch(() => ({ default: () => <div>Error loading Round</div> })));
const Leaderboard = lazy(() => import("@/pages/hackathons/Leaderboard").catch(() => ({ default: () => <div>Error loading Leaderboard</div> })));
const MyApplications = lazy(() => import("@/pages/applications/MyApplications").catch(() => ({ default: () => <div>Error loading Applications</div> })));
const Profile = lazy(() => import("@/pages/profile/Profile").catch(() => ({ default: () => <div>Error loading Profile</div> })));

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  protected?: boolean;
  requiredRole?: "USER" | "COMPANY" | "ADMIN";
}

export const routes: RouteConfig[] = [
  // Public routes
  { path: "/", element: <Navigate to="/jobs" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/jobs", element: <JobsList /> },
  { path: "/jobs/new", element: <CreateJob />, protected: true, requiredRole: "COMPANY" },
  { path: "/jobs/:id", element: <JobDetails /> },
  { path: "/hackathons", element: <HackathonList /> },
  { path: "/hackathons/:id", element: <HackathonDetails /> },
  { path: "/hackathons/:id/rounds/:roundId", element: <HackathonRound /> },
  { path: "/hackathons/:id/leaderboard", element: <Leaderboard /> },

  // Protected routes
  { path: "/dashboard", element: <UserDashboard />, protected: true, requiredRole: "USER" },
  { path: "/company/dashboard", element: <CompanyDashboard />, protected: true, requiredRole: "COMPANY" },
  { path: "/admin/dashboard", element: <AdminDashboard />, protected: true, requiredRole: "ADMIN" },
  { path: "/applications", element: <MyApplications />, protected: true, requiredRole: "USER" },
  { path: "/profile", element: <Profile />, protected: true },

  // Catch all
  { path: "*", element: <Navigate to="/jobs" replace /> },
];

