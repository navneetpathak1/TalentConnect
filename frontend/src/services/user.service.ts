import api from "./api";
import { User, authStore } from "@/store/auth.store";

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>("/users/me");
    const user = response.data.data;
    authStore.getState().setUser(user);
    return user;
  },

  async updateMe(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const response = await api.patch<{ success: boolean; data: User }>("/users/me", data);
    const user = response.data.data;
    authStore.getState().setUser(user);
    return user;
  },
};

