"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { jobOpeningsApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Briefcase, MapPin, DollarSign, Calendar, FileText, Plus } from "lucide-react";
import { format } from "date-fns";

export default function JobOpeningPage() {
  const [jobOpenings, setJobOpenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    employmentType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    requirements: "",
    responsibilities: "",
    closingDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadJobOpenings();
  }, []);

  const loadJobOpenings = async () => {
    try {
      setLoading(true);
      const openings = await jobOpeningsApi.getAll(true);
      setJobOpenings(Array.isArray(openings) ? openings : []);
    } catch (error: any) {
      console.error("Failed to load job openings:", error);
      toast.error("Failed to load job openings", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const requirements = formData.requirements
        .split("\n")
        .filter((r) => r.trim());
      const responsibilities = formData.responsibilities
        .split("\n")
        .filter((r) => r.trim());

      await jobOpeningsApi.create({
        title: formData.title,
        description: formData.description,
        department: formData.department,
        location: formData.location,
        employmentType: formData.employmentType,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
        requirements: requirements.length > 0 ? requirements : undefined,
        responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
        closingDate: formData.closingDate || undefined,
        isActive: true,
      });

      toast.success("Job Opening Created", "Job opening has been created successfully");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        department: "",
        location: "",
        employmentType: "Full-time",
        salaryMin: "",
        salaryMax: "",
        requirements: "",
        responsibilities: "",
        closingDate: "",
      });
      await loadJobOpenings();
    } catch (error: any) {
      console.error("Failed to create job opening:", error);
      toast.error("Failed to create job opening", error.message || "Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Job Openings</h1>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Opening
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Job Opening</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., Software Engineer"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Department
                      </label>
                      <Input
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({ ...formData, department: e.target.value })
                        }
                        placeholder="e.g., Engineering"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Location
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="e.g., Remote, New York"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Employment Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.employmentType}
                        onChange={(e) =>
                          setFormData({ ...formData, employmentType: e.target.value })
                        }
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Min Salary
                      </label>
                      <Input
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) =>
                          setFormData({ ...formData, salaryMin: e.target.value })
                        }
                        placeholder="e.g., 50000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Max Salary
                      </label>
                      <Input
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) =>
                          setFormData({ ...formData, salaryMax: e.target.value })
                        }
                        placeholder="e.g., 100000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Job description..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Requirements (one per line)
                    </label>
                    <Textarea
                      value={formData.requirements}
                      onChange={(e) =>
                        setFormData({ ...formData, requirements: e.target.value })
                      }
                      placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Responsibilities (one per line)
                    </label>
                    <Textarea
                      value={formData.responsibilities}
                      onChange={(e) =>
                        setFormData({ ...formData, responsibilities: e.target.value })
                      }
                      placeholder="Develop and maintain web applications&#10;Collaborate with team members&#10;..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Closing Date
                    </label>
                    <Input
                      type="date"
                      value={formData.closingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, closingDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Job Opening"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={isSubmitting}
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
                <p className="text-muted-foreground">Loading job openings...</p>
              </CardContent>
            </Card>
          ) : jobOpenings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No job openings</p>
                <p className="text-sm text-muted-foreground">
                  Create a job opening to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobOpenings.map((opening) => (
                <Card key={opening.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span>{opening.title}</span>
                      {opening.isActive && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {opening.department && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {opening.department}
                        </div>
                      )}
                      {opening.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {opening.location}
                        </div>
                      )}
                    </div>

                    {opening.employmentType && (
                      <div className="text-sm text-muted-foreground">
                        Type: {opening.employmentType}
                      </div>
                    )}

                    {(opening.salaryMin || opening.salaryMax) && (
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {opening.salaryMin && opening.salaryMax
                          ? `₹${opening.salaryMin.toLocaleString()} - ₹${opening.salaryMax.toLocaleString()}`
                          : opening.salaryMin
                          ? `₹${opening.salaryMin.toLocaleString()}+`
                          : `Up to ₹${opening.salaryMax.toLocaleString()}`}
                      </div>
                    )}

                    {opening.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {opening.description}
                      </p>
                    )}

                    {opening.closingDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Closes: {format(new Date(opening.closingDate), "MMM d, yyyy")}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Posted: {format(new Date(opening.createdAt), "MMM d, yyyy")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

