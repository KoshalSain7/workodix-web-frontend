"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/toast";
import { FileText, Calendar } from "lucide-react";
import { RequestType } from "@/types";

export default function ResignationPage() {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    lastWorkingDate: "",
    reason: "",
    feedback: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lastWorkingDate) {
      toast.error("Validation Error", "Please select your last working date");
      return;
    }

    if (!formData.reason.trim()) {
      toast.error("Validation Error", "Please provide a reason for resignation");
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData = {
        type: RequestType.RESIGNATION,
        requestTo: "HR",
        title: `Resignation Request - ${user?.firstName} ${user?.lastName}`,
        description: `Last Working Date: ${formData.lastWorkingDate}\n\nReason: ${formData.reason}\n\nFeedback: ${formData.feedback || "N/A"}`,
        requestData: {
          lastWorkingDate: formData.lastWorkingDate,
          reason: formData.reason,
          feedback: formData.feedback,
        },
      };

      await requestsApi.create(requestData);

      toast.success("Resignation Request Submitted", "Your resignation request has been submitted successfully");
      
      setFormData({
        lastWorkingDate: "",
        reason: "",
        feedback: "",
      });
    } catch (error: any) {
      console.error("Failed to submit resignation request:", error);
      toast.error("Submission Failed", error.message || "Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Resignation Request</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submit Resignation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Working Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={formData.lastWorkingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, lastWorkingDate: e.target.value })
                      }
                      className="pl-10"
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select your last working day
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for Resignation <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Please provide a reason for your resignation..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Feedback (Optional)
                  </label>
                  <Textarea
                    value={formData.feedback}
                    onChange={(e) =>
                      setFormData({ ...formData, feedback: e.target.value })
                    }
                    placeholder="Any feedback or suggestions for the company..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      "Submit Resignation"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        lastWorkingDate: "",
                        reason: "",
                        feedback: "",
                      });
                    }}
                    disabled={isSubmitting}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Your resignation request will be reviewed by HR and your manager.
              </p>
              <p>
                • You will receive a confirmation email once your request is processed.
              </p>
              <p>
                • Please ensure you complete all pending tasks and handover responsibilities before your last working day.
              </p>
              <p>
                • Exit interview will be scheduled before your last working day.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

