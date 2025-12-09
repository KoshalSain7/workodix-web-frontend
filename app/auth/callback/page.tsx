"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const userStr = searchParams.get("user");

      if (!accessToken || !refreshToken || !userStr) {
        setError("Missing authentication data");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        // Set tokens
        apiClient.setToken(accessToken);
        if (typeof window !== "undefined") {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Parse user data
        const user = JSON.parse(userStr);

        // Update auth store
        useAuthStore.setState({
          user: {
            id: user.id,
            employeeCode: user.employeeCode,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            company: user.company || "",
            roles: Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []),
            prefix: user.prefix || "",
            phone: user.phone || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
            bloodGroup: user.bloodGroup || "",
            profilePicture: user.profilePicture || "",
            signature: user.signature || "",
          },
          isAuthenticated: true,
          isLoading: false,
        });

        // Redirect to home
        router.push("/");
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
