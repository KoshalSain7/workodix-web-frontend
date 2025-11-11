import { create } from "zustand";
import { FeedPost, Celebration, LeaveBalance, Task } from "@/types";
import { dashboardApi } from "@/lib/api";

interface DashboardState {
  feedPosts: FeedPost[];
  celebrations: Celebration[];
  leaveBalances: LeaveBalance[];
  tasks: Task[];
  badges: any[];
  inboxPendingCount: number;
  calendarData: any[];
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  addFeedPost: (post: FeedPost) => void;
  addCelebration: (celebration: Celebration) => void;
  updateLeaveBalance: (type: string, used: number) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  feedPosts: [],
  celebrations: [],
  leaveBalances: [],
  tasks: [],
  badges: [],
  inboxPendingCount: 0,
  calendarData: [],
  loading: false,
  error: null,
  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      // API client already extracts data from response, so response IS the data object
      const data = await dashboardApi.getDashboard();

      if (data) {
        set({
          feedPosts: data.feedPosts || [],
          celebrations: data.celebrations || [],
          leaveBalances: data.leaveBalances || [],
          badges: data.badges || [],
          inboxPendingCount: data.inboxTasks?.pendingCount || 0,
          calendarData: data.calendarData || [],
          loading: false,
        });
      } else {
        set({ error: "Failed to load dashboard data", loading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load dashboard data",
        loading: false,
      });
    }
  },
  addFeedPost: (post) =>
    set((state) => ({ feedPosts: [post, ...state.feedPosts] })),
  addCelebration: (celebration) =>
    set((state) => ({
      celebrations: [...state.celebrations, celebration],
    })),
  updateLeaveBalance: (type, used) =>
    set((state) => ({
      leaveBalances: state.leaveBalances.map((lb) =>
        lb.type === type ? { ...lb, used, remaining: lb.total - used } : lb
      ),
    })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
}));
