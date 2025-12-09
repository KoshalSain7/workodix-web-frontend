"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { letterApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { FileText, Plus, Download, Clock, CheckCircle, XCircle } from "lucide-react";

const letterTypes = [
  "Experience Letter",
  "Salary Certificate",
  "Relieving Letter",
  "Bonafide Certificate",
  "No Objection Certificate",
  "Other",
];

export default function LetterPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    customType: "",
    purpose: "",
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await letterApi.getAll();
      const requests = Array.isArray(response) ? response : [];
      setRequests(requests);
    } catch (error: any) {
      console.error("Failed to load letter requests:", error);
      toast.error("Failed to load letter requests", error.message || "Please try again");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await letterApi.create(formData);
      toast.success("Request Submitted", "Letter request has been submitted successfully");
      setShowForm(false);
      setFormData({ type: "", customType: "", purpose: "" });
      await loadRequests();
    } catch (error: any) {
      console.error("Failed to create letter request:", error);
      toast.error("Submission Failed", error.message || "Please try again");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
      case "Generated":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Letter Requests</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Letter
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Request New Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Letter Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    <option value="">Select type</option>
                    {letterTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.type === "Other" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Custom Type
                    </label>
                    <Input
                      value={formData.customType}
                      onChange={(e) =>
                        setFormData({ ...formData, customType: e.target.value })
                      }
                      placeholder="Enter letter type"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Purpose
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    placeholder="Enter purpose for this letter"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Submit Request</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No letter requests</p>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t requested any letters yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {request.customType || request.type}
                      </CardTitle>
                      {request.purpose && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.purpose}
                        </p>
                      )}
                    </div>
                    <span className="text-sm capitalize">{request.status}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Requested on{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    {request.fileUrl && (
                      <a
                        href={request.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

