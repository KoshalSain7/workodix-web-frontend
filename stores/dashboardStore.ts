import { create } from "zustand";
import { FeedPost, Celebration, LeaveBalance, Task } from "@/types";

interface DashboardState {
  feedPosts: FeedPost[];
  celebrations: Celebration[];
  leaveBalances: LeaveBalance[];
  tasks: Task[];
  addFeedPost: (post: FeedPost) => void;
  addCelebration: (celebration: Celebration) => void;
  updateLeaveBalance: (type: string, used: number) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  feedPosts: [
    {
      id: "1",
      employeeId: "2",
      employeeName: "Ishan Sharma",
      employeeRole: "Senior Executive",
      company: "XYX Private Limited",
      type: "Welcome post",
      content:
        "Hey all, I'm Ishan, thrilled to be joining as a Senior Executive. I'm really looking forward to meeting you all and becoming part of the amazing energy here. I'm excited to learn, share ideas, and have some engaging conversations, whether it's about insurance, new opportunities, or just life in general. I can't wait to connect and be part of the journey ahead with all of you.",
      hobbies: [
        "Reading fictional stories",
        "swimming",
        "Dance",
        "Social Work",
        "e-sport and travelling",
      ],
      skills: [
        "sales and marketing and collection",
        "Business research",
        "Data analysis & Interpretations",
        "negotiations",
      ],
      likes: 8,
      comments: 0,
      createdAt: "3 days ago",
    },
    {
      id: "2",
      employeeId: "3",
      employeeName: "Krupa Rao",
      employeeRole: "Executive",
      company: "XYX Private Limited",
      type: "Welcome post",
      content: "Excited to join the team!",
      likes: 5,
      comments: 2,
      createdAt: "1 week ago",
    },
  ],
  celebrations: [
    {
      id: "1",
      employeeId: "4",
      employeeName: "Divya Sharma",
      type: "Birthday",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      employeeId: "5",
      employeeName: "Koshal Sain",
      type: "Birthday",
      date: new Date().toISOString(),
    },
  ],
  leaveBalances: [
    { type: "Planned Leave", total: 12, used: 1, remaining: 5 },
    { type: "Casual/Sick Leave", total: 6, used: 3, remaining: 3 },
  ],
  tasks: [],
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
