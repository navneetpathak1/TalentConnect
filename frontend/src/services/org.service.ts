import api from "./api";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export const orgService = {
  async createOrg(data: {
    name: string;
    description?: string;
    website?: string;
    logoUrl?: string;
  }): Promise<Organization> {
    const response = await api.post<{ success: boolean; data: Organization }>("/org", data);
    return response.data.data;
  },

  async getMyOrgs(): Promise<Organization[]> {
    const response = await api.get<{ success: boolean; data: Organization[] }>("/org/me");
    return response.data.data;
  },
};

