"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { attendanceApi } from "@/lib/api";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AttendanceRegularizationPage() {
  const { selectedDate, setSelectedDate, addLeaveRequest } = useAttendanceStore();
  const [isToday, setIsToday] = useState(false);
  const [isAbsent, setIsAbsent] = useState(false);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (selectedDate) {
      try {
        await attendanceApi.createRegularization({
          date: format(selectedDate, "yyyy-MM-dd"),
          isHalfDay,
          reason,
        });
        // Reset form
        setSelectedDate(null);
        setIsToday(false);
        setIsAbsent(false);
        setIsHalfDay(false);
        setReason("");
        alert("Attendance regularization request submitted successfully!");
      } catch (error: any) {
        alert(error.message || "Failed to submit request");
      }
    }
  };

  return (
    <AuthGuard>
      <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Attendance Regularization</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Calendar and Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Select day(s) for which you wish to apply for &apos;attendance
                  regularization&apos; request.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />

                <div className="space-y-2 pt-4 border-t">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isToday}
                      onChange={(e) => setIsToday(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Today</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAbsent}
                      onChange={(e) => setIsAbsent(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Absent</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isHalfDay}
                      onChange={(e) => setIsHalfDay(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Half day absent</span>
                  </label>
                </div>

                <Link
                  href="/request/pending"
                  className="text-sm text-primary hover:underline block"
                >
                  View pending request
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Request Form */}
          <div>
            {selectedDate ? (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Regularization Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Selected Date
                    </label>
                    <p className="text-sm bg-muted p-2 rounded">
                      {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reason (Optional)
                    </label>
                    <Input
                      placeholder="Enter reason for attendance regularization"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Request Type</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          checked={isAbsent && !isHalfDay}
                          onChange={() => {
                            setIsAbsent(true);
                            setIsHalfDay(false);
                          }}
                        />
                        <span className="text-sm">Full Day Absent</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          checked={isHalfDay}
                          onChange={() => {
                            setIsHalfDay(true);
                            setIsAbsent(true);
                          }}
                        />
                        <span className="text-sm">Half Day Absent</span>
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-primary"
                    disabled={!selectedDate}
                  >
                    Submit Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    Please select AR date from calendar.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </MainLayout>
    </AuthGuard>
  );
}

