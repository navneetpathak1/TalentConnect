import api from "./api";

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl?: string;
  prizePool?: string;
  rules?: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Round {
  id: string;
  hackathonId: string;
  number: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  roundId: string;
  participantId: string;
  code?: string;
  fileUrl?: string;
  status: string;
  score?: number;
  feedback?: string;
  executionTime?: number;
  memoryUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  hackathonId: string;
  userId: string;
  totalScore: number;
  rank?: number;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export const hackathonService = {
  async getHackathons(filters?: { page?: number; limit?: number; status?: string }): Promise<{
    hackathons: Hackathon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        hackathons: Hackathon[];
        pagination: any;
      };
    }>("/hackathons", { params: filters });
    return response.data.data;
  },

  async getHackathon(id: string): Promise<Hackathon> {
    const response = await api.get<{ success: boolean; data: Hackathon }>(`/hackathons/${id}`);
    return response.data.data;
  },

  async createHackathon(data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    imageUrl?: string;
    prizePool?: string;
    rules?: string;
    organizationId?: string;
  }): Promise<Hackathon> {
    const response = await api.post<{ success: boolean; data: Hackathon }>("/hackathons", data);
    return response.data.data;
  },

  async joinHackathon(id: string): Promise<any> {
    const response = await api.post<{ success: boolean; data: any }>(`/hackathons/${id}/join`);
    return response.data.data;
  },

  async getRounds(hackathonId: string): Promise<Round[]> {
    const response = await api.get<{ success: boolean; data: Round[] }>(
      `/rounds?hackathonId=${hackathonId}`
    );
    return response.data.data;
  },

  async createRound(data: {
    hackathonId: string;
    number: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }): Promise<Round> {
    const response = await api.post<{ success: boolean; data: Round }>("/rounds", data);
    return response.data.data;
  },

  async submit(data: {
    roundId: string;
    code?: string;
    fileUrl?: string;
  }): Promise<Submission> {
    const response = await api.post<{ success: boolean; data: Submission }>(
      "/submissions/submit",
      data
    );
    return response.data.data;
  },

  async getLeaderboard(hackathonId: string): Promise<{
    hackathon: { id: string; title: string };
    leaderboard: LeaderboardEntry[];
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        hackathon: { id: string; title: string };
        leaderboard: LeaderboardEntry[];
      };
    }>(`/leaderboard/${hackathonId}`);
    return response.data.data;
  },
};

