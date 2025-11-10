import { create } from "zustand";
import { Attendance, LeaveRequest } from "@/types";

interface AttendanceState {
  attendance: Attendance[];
  leaveRequests: LeaveRequest[];
  selectedDate: Date | null;
  selectedRequestType: "Attendance Regularization" | "Leave" | "On Duty" | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedRequestType: (
    type: "Attendance Regularization" | "Leave" | "On Duty" | null
  ) => void;
  addLeaveRequest: (request: LeaveRequest) => void;
  getAttendanceByDate: (date: Date) => Attendance | undefined;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendance: [],
  leaveRequests: [],
  selectedDate: null,
  selectedRequestType: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedRequestType: (type) => set({ selectedRequestType: type }),
  addLeaveRequest: (request) =>
    set((state) => ({
      leaveRequests: [...state.leaveRequests, request],
    })),
  getAttendanceByDate: (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return get().attendance.find((a) => a.date === dateStr);
  },
}));
