export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  prefix: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  company: string;
  role: string;
  department?: string;
  profilePicture?: string;
  signature?: string;
  lastCheckIn?: string;
  status?: "Present" | "On Leave" | "On Weekoff" | "Absent";
  linkedIn?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  type: "Full Time" | "Part Time" | "Distance";
  yearOfPassing: number;
}

export interface Hobby {
  id: string;
  name: string;
  icon?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "Leave" | "Attendance Regularization" | "On Duty" | "Short Leave";
  startDate: string;
  endDate?: string;
  isHalfDay?: boolean;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedAt: string;
}

export interface Attendance {
  date: string;
  status: "Present" | "Absent" | "Leave" | "Holiday" | "On Duty";
  checkIn?: string;
  checkOut?: string;
}

export interface FeedPost {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  company: string;
  profilePicture?: string;
  type: "Welcome post" | "Announcement" | "Achievement" | "General";
  content: string;
  hobbies?: string[];
  skills?: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Celebration {
  id: string;
  employeeId: string;
  employeeName: string;
  profilePicture?: string;
  type: "Birthday" | "Work Anniversary";
  date: string;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  valid: boolean;
  timestamp: string;
  path?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  valid: boolean;
  details?: any;
  timestamp: string;
  path?: string;
}
