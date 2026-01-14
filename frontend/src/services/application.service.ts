import api from "./api";

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export const applicationService = {
  async apply(data: {
    jobId: string;
    resumeUrl?: string;
    coverLetter?: string;
  }): Promise<Application> {
    const response = await api.post<{ success: boolean; data: Application }>(
      "/applications/apply",
      data
    );
    return response.data.data;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await api.get<{ success: boolean; data: Application[] }>(
      "/applications/me"
    );
    return response.data.data;
  },

  async getJobApplications(jobId: string): Promise<Application[]> {
    const response = await api.get<{ success: boolean; data: Application[] }>(
      `/applications/job/${jobId}`
    );
    return response.data.data;
  },

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const response = await api.patch<{ success: boolean; data: Application }>(
      `/applications/${id}/status`,
      { status }
    );
    return response.data.data;
  },
};

