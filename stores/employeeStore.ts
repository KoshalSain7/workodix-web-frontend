import { create } from "zustand";
import { Employee, Education, Hobby } from "@/types";

interface EmployeeState {
  currentEmployee: Employee | null;
  education: Education[];
  hobbies: Hobby[];
  setCurrentEmployee: (employee: Employee) => void;
  addEducation: (education: Education) => void;
  addHobby: (hobby: Hobby) => void;
  removeHobby: (id: string) => void;
  updateEmployee: (updates: Partial<Employee>) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  currentEmployee: null,
  education: [
    {
      id: "1",
      institution: "Sobhasaria College",
      degree: "Graduation",
      type: "Full Time",
      yearOfPassing: 2023,
    },
  ],
  hobbies: [
    { id: "1", name: "e-sport and travelling" },
    { id: "2", name: "Music" },
  ],
  setCurrentEmployee: (employee) => set({ currentEmployee: employee }),
  addEducation: (education) =>
    set((state) => ({ education: [...state.education, education] })),
  addHobby: (hobby) => set((state) => ({ hobbies: [...state.hobbies, hobby] })),
  removeHobby: (id) =>
    set((state) => ({
      hobbies: state.hobbies.filter((h) => h.id !== id),
    })),
  updateEmployee: (updates) =>
    set((state) => ({
      currentEmployee: state.currentEmployee
        ? { ...state.currentEmployee, ...updates }
        : null,
    })),
}));
