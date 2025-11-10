import { create } from "zustand";
import { Employee } from "@/types";
import { authApi, apiClient, usersApi } from "@/lib/api";

interface AuthState {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      // Response is now unwrapped by API client, so we get the data directly
      apiClient.setToken(response.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("refresh_token", response.refresh_token);
      }
      set({
        user: {
          id: response.user.id,
          employeeCode: response.user.employeeCode,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          company: response.user.company || "",
          role: response.user.role || "",
          prefix: response.user.prefix || "",
          phone: response.user.phone || "",
          dateOfBirth: response.user.dateOfBirth || "",
          gender: response.user.gender || "",
          bloodGroup: response.user.bloodGroup || "",
          profilePicture: response.user.profilePicture || "",
          signature: response.user.signature || "",
        },
        isAuthenticated: true,
        isLoading: false,
      });
      // Fetch full profile
      await get().checkAuth();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => {
    apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("refresh_token");
    }
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      apiClient.setToken(token);
      const profile = await usersApi.getProfile();
      set({
        user: {
          id: profile.user.id,
          employeeCode: profile.user.employeeCode,
          firstName: profile.user.firstName,
          lastName: profile.user.lastName,
          email: profile.user.email,
          company: profile.user.company || "XYX Private Limited",
          role: profile.user.role || "",
          prefix: profile.user.prefix || "",
          phone: profile.user.phone || "",
          dateOfBirth: profile.user.dateOfBirth || "",
          gender: profile.user.gender || "",
          bloodGroup: profile.user.bloodGroup || "",
          profilePicture: profile.user.profilePicture || "",
          signature: profile.user.signature || "",
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
  },
}));
