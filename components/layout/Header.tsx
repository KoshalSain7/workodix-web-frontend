"use client";

import { useEffect, useState } from "react";
import { Search, Grid3x3, FileText, Bell, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { attendanceApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { format } from "date-fns";

export function Header() {
  const { user } = useAuthStore();
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    loadAttendanceStatus();
  }, []);

  const loadAttendanceStatus = async () => {
    try {
      setLoadingStatus(true);
      const status = await attendanceApi.getTodayStatus();
      setIsPunchedIn(status.isPunchedIn);
      if (status.punchInTime) {
        setPunchInTime(
          format(new Date(status.punchInTime), "HH:mm")
        );
      } else {
        setPunchInTime(null);
      }
    } catch (error) {
      console.error("Failed to load attendance status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handlePunchIn = async () => {
    try {
      setLoading(true);
      await attendanceApi.punchIn();
      setIsPunchedIn(true);
      setPunchInTime(format(new Date(), "HH:mm"));
      toast.success(
        "Successfully Punched In!",
        `Punch in time: ${format(new Date(), "HH:mm")}`
      );
    } catch (error: any) {
      toast.error(
        error.message || "Failed to punch in",
        "Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setLoading(true);
      const result = await attendanceApi.punchOut();
      setIsPunchedIn(false);
      setPunchInTime(null);
      const hoursWorked = result?.hoursWorked || 0;
      toast.success(
        "Successfully Punched Out!",
        `Total hours worked: ${hoursWorked.toFixed(2)} hours`
      );
    } catch (error: any) {
      toast.error(
        error.message || "Failed to punch out",
        "Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8 flex-1">
        <h1 className="text-lg font-semibold">
          {user?.company || "WorkFolio"}
        </h1>
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-foreground/70" />
            <Input
              type="search"
              placeholder="Search for actions, pages, requests, reports, people..."
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/50"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!loadingStatus && (
          <div className="flex items-center gap-2">
            {isPunchedIn && punchInTime && (
              <span className="text-sm text-primary-foreground/80">
                In: {punchInTime}
              </span>
            )}
            <Button
              onClick={isPunchedIn ? handlePunchOut : handlePunchIn}
              disabled={loading}
              variant={isPunchedIn ? "destructive" : "default"}
              className={`${
                isPunchedIn
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-primary/90"
              } text-white border-0`}
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              {isPunchedIn ? "Punch Out" : "Punch In"}
            </Button>
          </div>
        )}
        <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
          <Grid3x3 className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
          <FileText className="h-5 w-5" />
        </button>
        <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}

