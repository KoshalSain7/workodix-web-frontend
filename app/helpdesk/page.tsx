"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/toast";
import { Upload, X, FileText, Image as ImageIcon, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { RequestType, RequestStatus } from "@/types";
import { format } from "date-fns";

interface Attachment {
  name: string;
  file: File;
  url: string;
  type: string;
}

interface Request {
  id: string;
  userId: string;
  type: string;
  requestTo?: string;
  title: string;
  description?: string;
  status: RequestStatus;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

const REQUEST_TYPES = [
  { value: "Asset", label: "Asset" },
  { value: "Reimbursement", label: "Reimbursement" },
  { value: "Expense", label: "Expense" },
  { value: "Expense advance", label: "Expense advance" },
  { value: "Helpdesk ticket", label: "Helpdesk ticket" },
  { value: "Loan", label: "Loan" },
];

const REQUEST_TO_OPTIONS = [
  { value: "HR", label: "HR" },
  { value: "Director", label: "Director" },
  { value: "Admin", label: "Admin" },
];

const getStatusBadge = (status: RequestStatus, isResolved: boolean) => {
  if (isResolved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Resolved
      </span>
    );
  }

  switch (status) {
    case RequestStatus.PENDING:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case RequestStatus.IN_PROGRESS:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <AlertCircle className="h-3 w-3" />
          In Progress
        </span>
      );
    case RequestStatus.APPROVED:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </span>
      );
    case RequestStatus.REJECTED:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    case RequestStatus.COMPLETED:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>
      );
    default:
      return null;
  }
};

export default function HelpdeskPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requestType, setRequestType] = useState<string>("");
  const [requestTo, setRequestTo] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Check if user is admin, HR, Director, or Manager
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.some((r: string) => r.toLowerCase() === "admin");
  const isHR = userRoles.some((r: string) => r.toLowerCase() === "hr");
  const isDirector = userRoles.some((r: string) => r.toLowerCase() === "director");
  const isManager = userRoles.some((r: string) => r.toLowerCase() === "manager");
  const canViewReceivedRequests = isAdmin || isHR || isDirector || isManager;

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id]);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await requestsApi.getAll();
      
      // API client extracts data from response, so response should be the array
      // Handle both array response and wrapped response
      let requests: Request[] = [];
      if (Array.isArray(response)) {
        requests = response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        requests = (response as any).data;
      }
      
      if (!user?.id) {
        console.warn("User ID not available, cannot filter requests");
        setMyRequests([]);
        setReceivedRequests([]);
        return;
      }
      
      // Separate my requests and received requests
      // My requests: requests where I am the creator
      const myReqs = requests.filter((req: Request) => {
        return String(req.userId) === String(user.id);
      });
      
      // Received requests: requests assigned to my role (for admins/HRs/Directors/Managers)
      const receivedReqs = requests.filter((req: Request) => {
        // Don't show my own requests in received section
        if (String(req.userId) === String(user.id)) return false;
        
        // Must have a requestTo value
        if (!req.requestTo) return false;
        
        // Match requestTo with user roles (case-insensitive)
        const requestToLower = req.requestTo.toLowerCase().trim();
        const matchesRole = (
          (requestToLower === "admin" && isAdmin) ||
          (requestToLower === "hr" && isHR) ||
          (requestToLower === "director" && isDirector) ||
          (requestToLower === "manager" && isManager)
        );
        
        return matchesRole;
      });
      
      console.log('All requests:', requests.length);
      console.log('My requests:', myReqs.length);
      console.log('Received requests:', receivedReqs.length);
      console.log('User roles:', userRoles);
      console.log('Is HR:', isHR);
      console.log('Is Admin:', isAdmin);
      
      setMyRequests(myReqs);
      setReceivedRequests(receivedReqs);
    } catch (error: any) {
      console.error("Failed to load requests:", error);
      toast.error("Failed to load requests", error.message || "Please try again");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", `${file.name} exceeds 10MB limit`);
        return;
      }

      const url = URL.createObjectURL(file);
      const attachment: Attachment = {
        name: file.name,
        url,
        type: file.type,
        file,
      };
      setAttachments((prev) => [...prev, attachment]);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    URL.revokeObjectURL(attachment.url);
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestType) {
      toast.error("Validation Error", "Please select a request type");
      return;
    }

    if (!requestTo) {
      toast.error("Validation Error", "Please select who to send the request to");
      return;
    }

    if (!subject.trim()) {
      toast.error("Validation Error", "Please enter a subject");
      return;
    }

    if (!details.trim()) {
      toast.error("Validation Error", "Please provide details");
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          return {
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
          };
        })
      );

      const requestData = {
        type: requestType as RequestType,
        requestTo: requestTo,
        title: subject,
        description: details,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      };

      await requestsApi.create(requestData);

      toast.success("Request Submitted", "Your request has been submitted successfully");
      
      setRequestType("");
      setRequestTo("");
      setSubject("");
      setDetails("");
      attachments.forEach((att) => URL.revokeObjectURL(att.url));
      setAttachments([]);

      await loadRequests();
    } catch (error: any) {
      console.error("Failed to submit request:", error);
      toast.error("Submission Failed", error.message || "Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Title */}
          <h1 className="text-3xl font-bold">Submit a New Request</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Form Card */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Request Type and Request To - Same Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Request Type
                        </label>
                        <select
                          value={requestType}
                          onChange={(e) => setRequestType(e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        >
                          <option value="">Select a request type</option>
                          {REQUEST_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Request To
                        </label>
                        <select
                          value={requestTo}
                          onChange={(e) => setRequestTo(e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        >
                          <option value="">Select recipient</option>
                          {REQUEST_TO_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter a concise title for your request"
                        required
                      />
                    </div>

                    {/* Details */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Details
                      </label>
                      <Textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Please provide as much detail as possible..."
                        rows={6}
                        required
                      />
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Attachments
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          border-2 border-dashed rounded-lg p-8 text-center transition-colors
                          ${
                            isDragging
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileInputChange}
                          className="hidden"
                          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                        />
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary hover:underline"
                          >
                            Click to upload
                          </button>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, PDF, etc. (max. 10MB)
                        </p>
                      </div>

                      {/* Attached Files List */}
                      {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                            >
                              {getFileIcon(attachment.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(attachment.file.size)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="p-1 hover:bg-background rounded transition-colors"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          "Submit Request"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Requests List */}
            <div className="space-y-6">
              {/* My Requests */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>My Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRequests ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading requests...
                    </div>
                  ) : myRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No requests submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent' }}>
                      {myRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{request.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {request.type}
                                {request.requestTo && ` • To: ${request.requestTo}`}
                              </p>
                            </div>
                            {getStatusBadge(request.status, request.isResolved)}
                          </div>
                          {request.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {request.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Received Requests (for Admins/HRs/Directors/Managers) */}
              {canViewReceivedRequests && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Received Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingRequests ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading requests...
                      </div>
                    ) : receivedRequests.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No requests received yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent' }}>
                        {receivedRequests.map((request) => (
                          <div
                            key={request.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{request.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {request.type}
                                  {request.user && (
                                    <> • From: {request.user.firstName} {request.user.lastName}</>
                                  )}
                                </p>
                              </div>
                              {getStatusBadge(request.status, request.isResolved)}
                            </div>
                            {request.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {request.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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
