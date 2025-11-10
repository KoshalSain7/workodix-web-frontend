"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OnDutyPage() {
  const { selectedDate, setSelectedDate, addLeaveRequest } = useAttendanceStore();
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (selectedDate) {
      addLeaveRequest({
        id: Date.now().toString(),
        employeeId: "1",
        type: "On Duty",
        startDate: format(selectedDate, "yyyy-MM-dd"),
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        reason: `${location ? `Location: ${location}. ` : ""}${reason}`,
        status: "Pending",
        requestedAt: new Date().toISOString(),
      });
      setSelectedDate(null);
      setEndDate(null);
      setLocation("");
      setReason("");
      alert("On Duty request submitted successfully!");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">On Duty Request</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              {selectedDate && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    End Date (Optional)
                  </label>
                  <Calendar
                    selectedDate={endDate}
                    onDateSelect={setEndDate}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>On Duty Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Location
                    </label>
                    <Input
                      placeholder="Enter duty location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reason
                    </label>
                    <Input
                      placeholder="Enter reason for on duty"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected Date: {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                    </p>
                    {endDate && (
                      <p className="text-sm text-muted-foreground">
                        End Date: {format(endDate, "EEEE, MMMM dd, yyyy")}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-primary"
                  >
                    Submit On Duty Request
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Please select a date from the calendar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

