"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RequestType } from "@/types";

export default function OnDutyPage() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
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

    if (!reason.trim()) {
      toast.error("Validation Error", "Please provide a reason");
      return;
    }

    try {
      setIsSubmitting(true);
      const description = `${location ? `Location: ${location}\n\n` : ""}Reason: ${reason}`;
      
      await requestsApi.create({
        type: RequestType.ON_DUTY,
        requestTo: "HR",
        title: `On Duty Request - ${user?.firstName} ${user?.lastName}`,
        description: description,
        requestData: {
          startDate: format(selectedDate, "yyyy-MM-dd"),
          endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
          location: location || undefined,
          reason: reason,
        },
      });

      toast.success("On Duty Request Submitted", "Your on duty request has been submitted successfully");
      setSelectedDate(null);
      setEndDate(null);
      setLocation("");
      setReason("");
    } catch (error: any) {
      console.error("Failed to submit on duty request:", error);
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit On Duty Request"}
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

