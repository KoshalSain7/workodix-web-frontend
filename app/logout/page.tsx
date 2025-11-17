"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function LogoutPage() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // Perform logout and redirect
    const performLogout = async () => {
      await logout();
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    };

    performLogout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Logging out...</p>
      </div>
    </div>
  );
}

