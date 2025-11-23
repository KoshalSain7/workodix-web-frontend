"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { leaveApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LeaveRequestPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [leaveType, setLeaveType] = useState("Planned Leave");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error("Validation Error", "Please select a start date");
      return;
    }

    if (endDate && endDate < selectedDate) {
      toast.error("Validation Error", "End date must be after start date");
      return;
    }

    try {
      setIsSubmitting(true);
      await leaveApi.createRequest({
        type: leaveType,
        startDate: format(selectedDate, "yyyy-MM-dd"),
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
        isHalfDay: false,
        reason: reason || undefined,
      });

      toast.success("Leave Request Submitted", "Your leave request has been submitted successfully");
      setSelectedDate(null);
      setEndDate(null);
      setReason("");
      setLeaveType("Planned Leave");
    } catch (error: any) {
      console.error("Failed to submit leave request:", error);
      toast.error("Submission Failed", error.message || "Please try again");
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold">Apply Leave</h1>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Leave Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              {selectedDate && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    End Date (Optional - for multiple days)
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
              <CardTitle>Leave Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Leave Type
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option>Planned Leave</option>
                      <option>Casual/Sick Leave</option>
                      <option>Emergency Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reason
                    </label>
                    <Input
                      placeholder="Enter reason for leave"
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Leave Request"}
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
    </AuthGuard>
  );
}

