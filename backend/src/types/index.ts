import { UserRole, ApplicationStatus, HackathonStatus, SubmissionStatus } from "../generated/prisma";

export type { UserRole, ApplicationStatus, HackathonStatus, SubmissionStatus };

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    message: string;
    code: string;
    stack?: string;
  } | null;
}

