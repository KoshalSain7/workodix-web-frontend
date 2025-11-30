"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { GeolocationPunch } from "@/components/attendance/GeolocationPunch";

export default function AttendancePage() {
  const [showMenu, setShowMenu] = useState(false);

  const attendanceData = [
    { date: "2025-11-01", status: "Present" },
    { date: "2025-11-02", status: "Present" },
    { date: "2025-11-03", status: "Absent" },
    { date: "2025-11-04", status: "Present" },
    { date: "2025-11-05", status: "Present" },
    { date: "2025-11-06", status: "Present" },
    { date: "2025-11-07", status: "Leave" },
  ];

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Attendance</h1>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <Link
                      href="/request/on-duty"
                      className="block px-4 py-2 text-sm hover:bg-muted"
                    >
                      On duty
                    </Link>
                    <Link
                      href="/request/attendance-regularization"
                      className="block px-4 py-2 text-sm hover:bg-muted"
                    >
                      Attendance regularization
                    </Link>
                    <Link
                      href="/request/leave"
                      className="block px-4 py-2 text-sm hover:bg-muted"
                    >
                      Apply leave
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Geolocation Punch Card */}
              <GeolocationPunch />

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Calendar</CardTitle>
                    <Link href="/calendar" className="text-sm text-primary hover:underline">
                      Go to calendar
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <Calendar attendanceData={attendanceData} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success-background rounded-lg">
                    <span className="text-sm font-medium">Present Days</span>
                    <span className="text-lg font-bold text-success">5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Absent Days</span>
                    <span className="text-lg font-bold text-red-600">1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Leave Days</span>
                    <span className="text-lg font-bold text-orange-600">1</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/request/attendance-regularization">
                    <Button variant="outline" className="w-full justify-start">
                      Request Attendance Regularization
                    </Button>
                  </Link>
                  <Link href="/request/leave">
                    <Button variant="outline" className="w-full justify-start">
                      Apply for Leave
                    </Button>
                  </Link>
                  <Link href="/request/on-duty">
                    <Button variant="outline" className="w-full justify-start">
                      Request On Duty
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

