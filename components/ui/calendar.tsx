"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface CalendarProps {
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  attendanceData?: Array<{ date: string; status: string }>;
  className?: string;
}

const statusColors: Record<string, string> = {
  Present: "bg-calendar-present",
  Absent: "bg-calendar-absent",
  Leave: "bg-calendar-leave",
  Holiday: "bg-calendar-holiday",
  "On Duty": "bg-calendar-on-duty",
  Today: "bg-calendar-today",
};

export function Calendar({
  selectedDate,
  onDateSelect,
  attendanceData = [],
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");
    
    if (dateStr === today) return "Today";
    
    const attendance = attendanceData.find((a) => a.date === dateStr);
    return attendance?.status || null;
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={previousMonth} className="p-1 hover:bg-muted rounded transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-semibold text-sm">{format(currentMonth, "MMMM yyyy")}</h3>
        <button onClick={nextMonth} className="p-1 hover:bg-muted rounded transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {daysInMonth.map((date) => {
          const status = getDateStatus(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          
          // Determine if we should show status color background
          const showStatusColor = status && status !== "Today" && !isSelected && !isToday;
          
          // Get appropriate text color for status backgrounds
          const getStatusTextColor = () => {
            if (!showStatusColor || !status) return "";
            // Dark backgrounds need white text, light backgrounds need dark text
            switch (status) {
              case "Present": // Black background
              case "Absent": // Red background
              case "Holiday": // Purple background
              case "On Duty": // Blue background
                return "text-white";
              case "Leave": // Orange background - can use either, but white is safer
                return "text-white";
              default:
                return "text-foreground";
            }
          };

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect?.(date)}
              className={cn(
                "aspect-square rounded-md text-xs transition-colors relative flex flex-col items-center justify-center font-medium",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                // Selected date - blue background with white text
                isSelected && "bg-blue-600 text-white font-semibold",
                // Today - blue background with white text
                isToday && !isSelected && "bg-blue-600 text-white font-semibold",
                // Default hover state
                !isSelected && !isToday && isCurrentMonth && "hover:bg-muted"
              )}
            >
              <span>{format(date, "d")}</span>
              {/* Status indicator bar below date */}
              {status && status !== "Today" && !isSelected && !isToday && (
                <div className={cn(
                  "absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 rounded-full",
                  status === "Present" ? "bg-white" : statusColors[status] || "bg-muted"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {attendanceData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-calendar-today"></span>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-white"></span>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-calendar-leave"></span>
              <span>Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-calendar-absent"></span>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-calendar-holiday"></span>
              <span>Holiday</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

