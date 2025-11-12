import { ApiResponse, ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      try {
        this.token = localStorage.getItem("access_token");
      } catch (e) {
        // localStorage not available (SSR)
        this.token = null;
      }
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      try {
        if (token) {
          localStorage.setItem("access_token", token);
        } else {
          localStorage.removeItem("access_token");
        }
      } catch (e) {
        // localStorage not available
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(options.headers || {}),
    };

    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const responseData: ApiResponse<T> | ApiError = await response
      .json()
      .catch(() => ({
        statusCode: 500,
        message: "Failed to parse response",
        valid: false,
        timestamp: new Date().toISOString(),
      }));

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        let refreshToken: string | null = null;
        if (typeof window !== "undefined") {
          try {
            refreshToken = localStorage.getItem("refresh_token");
          } catch (e) {
            // localStorage not available
          }
        }
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(
              `${this.baseURL}/auth/refresh`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
              }
            );
            if (refreshResponse.ok) {
              const refreshData: ApiResponse<{ access_token: string }> =
                await refreshResponse.json();
              if (refreshData.valid && refreshData.data?.access_token) {
                this.setToken(refreshData.data.access_token);
                // Retry original request
                return this.request<T>(endpoint, options);
              }
            }
          } catch (error) {
            // Refresh failed, redirect to login
            this.setToken(null);
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        } else {
          // No refresh token, redirect to login
          this.setToken(null);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      }

      const error: ApiError = responseData as ApiError;
      throw new Error(error.message || "Request failed");
    }

    // Extract data from response if it's wrapped in ApiResponse format
    const apiResponse = responseData as ApiResponse<T>;
    if (apiResponse.valid && apiResponse.data !== undefined) {
      return apiResponse.data;
    }

    // Fallback: return the entire response if it doesn't match expected format
    return responseData as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;
    const options: RequestInit = {
      method: "POST",
    };

    if (data !== undefined) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    if (!isFormData) {
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    return this.request<T>(endpoint, options);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;
    const options: RequestInit = {
      method: "PUT",
    };

    if (data !== undefined) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    if (!isFormData) {
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    return this.request<T>(endpoint, options);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{
      access_token: string;
      refresh_token: string;
      user: any;
    }>("/auth/login", {
      email,
      password,
    }),
  register: (data: any) =>
    apiClient.post<{ id: string; email: string; [key: string]: any }>(
      "/auth/register",
      data
    ),
  refresh: (refreshToken: string) =>
    apiClient.post<{ access_token: string }>("/auth/refresh", {
      refreshToken,
    }),
};

// Users API
export const usersApi = {
  getProfile: (userId?: string) => {
    const url = userId ? `/users/profile?userId=${userId}` : "/users/profile";
    return apiClient.get<{ user: any; employee: any }>(url);
  },
  updateProfile: (data: any) => apiClient.put<any>("/users/profile", data),
  updateEmployeeProfile: (data: any) =>
    apiClient.put<any>("/users/employee-profile", data),
};

// Attendance API
export const attendanceApi = {
  markAttendance: (date: string, checkIn?: string) =>
    apiClient.post<any>("/attendance/mark", { date, checkIn }),
  getByDate: (date: string) =>
    apiClient.get<any>(`/attendance/date?date=${date}`),
  getByMonth: (year: number, month: number) =>
    apiClient.get<any[]>(`/attendance/month?year=${year}&month=${month}`),
  createRegularization: (data: {
    date: string;
    isHalfDay: boolean;
    reason?: string;
  }) => apiClient.post<any>("/attendance/regularization", data),
  getRegularizationRequests: () =>
    apiClient.get<any[]>("/attendance/regularization"),
  punchIn: () => apiClient.post<any>("/attendance/punch-in"),
  punchOut: () => apiClient.post<any>("/attendance/punch-out"),
  getTodayStatus: () => apiClient.get<any>("/attendance/today-status"),
};

// Leave API
export const leaveApi = {
  createRequest: (data: any) => apiClient.post<any>("/leave", data),
  getRequests: () => apiClient.get<any[]>("/leave"),
  getBalances: () => apiClient.get<any[]>("/leave/balance"),
};

// Payroll API
export const payrollApi = {
  getPayslips: () => apiClient.get<any[]>("/payroll/payslips"),
  getPayslip: (id: string) => apiClient.get<any>(`/payroll/payslips/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getDashboard: () => apiClient.get<any>("/dashboard"),
  // Legacy method name for backward compatibility
  getData: () => apiClient.get<any>("/dashboard"),
};

// Inbox API
export const inboxApi = {
  getNotifications: (status?: string) =>
    apiClient.get<any[]>(`/inbox${status ? `?status=${status}` : ""}`),
  getUnreadCount: () => apiClient.get<{ count: number }>("/inbox/unread-count"),
  markAsRead: (id: string) => apiClient.put(`/inbox/${id}/read`),
  markAllAsRead: () => apiClient.put("/inbox/read-all"),
  archive: (id: string) => apiClient.put(`/inbox/${id}/archive`),
};

// CTC API
export const ctcApi = {
  getDetails: (year?: number) =>
    apiClient.get<any[]>(`/ctc${year ? `?year=${year}` : ""}`),
  getSummary: () => apiClient.get<any>("/ctc/summary"),
};

// Goals API
export const goalsApi = {
  create: (data: any) => apiClient.post<any>("/goals", data),
  getAll: (status?: string) =>
    apiClient.get<any[]>(`/goals${status ? `?status=${status}` : ""}`),
  getOne: (id: string) => apiClient.get<any>(`/goals/${id}`),
  update: (id: string, data: any) => apiClient.put<any>(`/goals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/goals/${id}`),
};

// Handbook API
export const handbookApi = {
  getDocuments: (category?: string) =>
    apiClient.get<any[]>(`/handbook${category ? `?category=${category}` : ""}`),
  getCategories: () => apiClient.get<string[]>("/handbook/categories"),
  getDocument: (id: string) => apiClient.get<any>(`/handbook/${id}`),
};

// Letter API
export const letterApi = {
  create: (data: any) => apiClient.post<any>("/letter", data),
  getAll: () => apiClient.get<any[]>("/letter"),
  getOne: (id: string) => apiClient.get<any>(`/letter/${id}`),
};

// Social API
export const socialApi = {
  createPost: (data: any) => apiClient.post<any>("/social/post", data),
  getPosts: (userId?: string) =>
    apiClient.get<any[]>(`/social/posts${userId ? `?userId=${userId}` : ""}`),
  getPost: (id: string) => apiClient.get<any>(`/social/post/${id}`),
  likePost: (id: string) => apiClient.post<any>(`/social/post/${id}/like`),
  createComment: (postId: string, content: string) =>
    apiClient.post<any>(`/social/post/${postId}/comment`, { content }),
  getComments: (postId: string) =>
    apiClient.get<any[]>(`/social/post/${postId}/comments`),
  deleteComment: (postId: string, commentId: string) =>
    apiClient.post<any>(`/social/post/${postId}/comment/${commentId}/delete`),
};

// Requests API
export const requestsApi = {
  create: (data: any) => apiClient.post<any>("/requests", data),
  getAll: (type?: string, status?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (status) params.append("status", status);
    return apiClient.get<any[]>(
      `/requests${params.toString() ? `?${params}` : ""}`
    );
  },
  getOne: (id: string) => apiClient.get<any>(`/requests/${id}`),
  update: (id: string, data: any) =>
    apiClient.put<any>(`/requests/${id}`, data),
  delete: (id: string) => apiClient.delete(`/requests/${id}`),
  // Specific request types
  createAsset: (data: any) => apiClient.post<any>("/requests/asset", data),
  createExpense: (data: any) => apiClient.post<any>("/requests/expense", data),
  createTravel: (data: any) => apiClient.post<any>("/requests/travel", data),
  createLoan: (data: any) => apiClient.post<any>("/requests/loan", data),
  createHelpdesk: (data: any) =>
    apiClient.post<any>("/requests/helpdesk", data),
};

// Quiz API
export const quizApi = {
  getQuestions: (topic?: string, category?: string) => {
    const params = new URLSearchParams();
    if (topic) params.append("topic", topic);
    if (category) params.append("category", category);
    return apiClient.get<any[]>(
      `/quiz/questions${params.toString() ? `?${params}` : ""}`
    );
  },
  getQuestion: (id: string) => apiClient.get<any>(`/quiz/questions/${id}`),
  submitQuiz: (data: {
    answers: Array<{ questionId: string; selectedAnswerIndex: number }>;
    topic?: string;
  }) => apiClient.post<any>("/quiz/submit", data),
  getResults: () => apiClient.get<any[]>("/quiz/results"),
  getResult: (id: string) => apiClient.get<any>(`/quiz/results/${id}`),
  seedQuestions: () => apiClient.post<any>("/quiz/seed"),
};

// Search API
export const searchApi = {
  search: (query: string, limit?: number) => {
    const params = new URLSearchParams();
    params.append("q", query);
    if (limit) params.append("limit", limit.toString());
    return apiClient.get<{
      users: Array<{
        id: string;
        name: string;
        email: string;
        employeeCode: string;
        company: string;
        role: string;
        department: string;
        profilePicture: string;
        type: "user";
      }>;
      posts: Array<{
        id: string;
        content: string;
        postType: string;
        author: string;
        authorId: string;
        authorPicture: string;
        createdAt: string;
        type: "post";
      }>;
      navigation: any[];
    }>(`/search?${params.toString()}`);
  },
  searchUsers: (query: string, limit?: number) => {
    const params = new URLSearchParams();
    params.append("q", query);
    if (limit) params.append("limit", limit.toString());
    return apiClient.get<
      Array<{
        id: string;
        name: string;
        email: string;
        employeeCode: string;
        company: string;
        role: string;
        department: string;
        profilePicture: string;
      }>
    >(`/search/users?${params.toString()}`);
  },
};
