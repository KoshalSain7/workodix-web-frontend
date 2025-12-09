import { create } from "zustand";
import { Employee } from "@/types";
import { authApi, apiClient, usersApi, accessApi } from "@/lib/api";

interface AuthState {
  user: Employee | null;
  accessibleOptions: any[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoadingOptions: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loadAccessibleOptions: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessibleOptions: null,
  isAuthenticated: false,
  isLoading: true,
  isLoadingOptions: false,
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
          roles: response.user.roles || [],
          prefix: response.user.prefix || "",
          phone: response.user.phone || "",
          dateOfBirth: response.user.dateOfBirth || "",
          gender: response.user.gender || "",
          bloodGroup: response.user.bloodGroup || "",
          profilePicture: response.user.profilePicture || "",
          signature: response.user.signature || "",
        },
        accessibleOptions: (response as any).accessibleOptions || [],
        isAuthenticated: true,
        isLoading: false,
      });
      // Fetch full profile
      await get().checkAuth();
      // Load accessible options if not already loaded
      if (
        !(response as any).accessibleOptions ||
        (response as any).accessibleOptions.length === 0
      ) {
        await get().loadAccessibleOptions();
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    // Get token before clearing for the logout API call
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    // Call backend logout in the background (don't wait for it)
    // This is best effort - we'll clear local state regardless
    if (token) {
      authApi.logout().catch((error: any) => {
        // Silently fail - local cleanup will happen anyway
        // Only log unexpected errors
        if (
          error?.message &&
          !error.message.includes("404") &&
          !error.message.includes("401") &&
          !error.message.includes("Network")
        ) {
          console.error("Backend logout error (non-critical):", error);
        }
      });
    }

    // Immediately clear local state (don't wait for backend)
    apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // Clear any other stored data
      localStorage.clear();
    }

    // Clear auth state
    set({
      user: null,
      accessibleOptions: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  loadAccessibleOptions: async () => {
    // Prevent multiple simultaneous calls
    if (get().isLoadingOptions) {
      return;
    }
    
    // If already loaded, don't reload
    const currentOptions = get().accessibleOptions;
    if (currentOptions && currentOptions.length > 0) {
      return;
    }

    try {
      set({ isLoadingOptions: true });
      
      // Get roles from current user state (already loaded in checkAuth or login)
      const currentUser = get().user;
      const userRoles = currentUser?.roles || [];
      
      // If no roles in state, fetch profile once
      if (userRoles.length === 0) {
        const profile = await usersApi.getProfile();
        const roles = profile.user?.roles || [];
        // Update user state with roles
        set({ user: { ...currentUser!, roles } as Employee });
        
        // Use roles from profile
        if (roles.length > 0) {
          const rolesQuery = roles.join(',');
          const options = await accessApi.getMyOptions(rolesQuery);
          const optionsArray = Array.isArray(options) ? options : [];
          set({ accessibleOptions: optionsArray, isLoadingOptions: false });
          return;
        }
      } else {
        // Use roles from state
        const rolesQuery = userRoles.join(',');
        const options = await accessApi.getMyOptions(rolesQuery);
        const optionsArray = Array.isArray(options) ? options : [];
        set({ accessibleOptions: optionsArray, isLoadingOptions: false });
        return;
      }
      
      // Fallback: try without roles (will use JWT roles from backend)
      const options = await accessApi.getMyOptions();
      const optionsArray = Array.isArray(options) ? options : [];
      set({ accessibleOptions: optionsArray, isLoadingOptions: false });
    } catch (error) {
      console.error("Failed to load accessible options:", error);
      set({ accessibleOptions: [], isLoadingOptions: false });
    }
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
          roles: profile.user.roles || [],
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
      // Load accessible options only if not already loaded
      const currentOptions = get().accessibleOptions;
      if (!currentOptions || currentOptions.length === 0) {
        await get().loadAccessibleOptions();
      }
    } catch (error) {
      set({
        isLoading: false,
        isAuthenticated: false,
        accessibleOptions: null,
      });
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
  },
}));
