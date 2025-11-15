import api from "./api";

export interface Job {
  id: string;
  title: string;
  description: string;
  location?: string;
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  tags?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  remote?: boolean;
  organizationId?: string;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const jobsService = {
  async getJobs(filters?: JobFilters): Promise<JobsResponse> {
    const response = await api.get<{ success: boolean; data: JobsResponse }>("/jobs", {
      params: filters,
    });
    return response.data.data;
  },

  async getJob(id: string): Promise<Job> {
    const response = await api.get<{ success: boolean; data: Job }>(`/jobs/${id}`);
    return response.data.data;
  },

  async createJob(data: {
    title: string;
    description: string;
    location?: string;
    remote?: boolean;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    organizationId?: string;
    tags?: string[];
  }): Promise<Job> {
    const response = await api.post<{ success: boolean; data: Job }>("/jobs", data);
    return response.data.data;
  },
};

