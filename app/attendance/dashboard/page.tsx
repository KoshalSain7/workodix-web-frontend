"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { attendanceApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { MapPin, Calendar, Clock, User, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/authStore";

interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  punchInTime: string | null;
  punchOutTime: string | null;
  punchInLat: number | null;
  punchInLong: number | null;
  punchOutLat: number | null;
  punchOutLong: number | null;
  hoursWorked: number;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
  };
}

export default function AttendanceDashboardPage() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().setDate(1)), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  useEffect(() => {
    loadAttendance();
  }, [startDate, endDate, selectedUserId]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getWithLocation(
        selectedUserId,
        startDate,
        endDate
      );
      setRecords(data);
    } catch (error: any) {
      console.error("Failed to load attendance:", error);
      toast.error("Failed to load attendance", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const userName = `${record.user?.firstName || ""} ${record.user?.lastName || ""}`.toLowerCase();
    const email = record.user?.email?.toLowerCase() || "";
    const employeeCode = record.user?.employeeCode?.toLowerCase() || "";
    return userName.includes(query) || email.includes(query) || employeeCode.includes(query);
  });

  const getLocationUrl = (lat: number | null, lng: number | null) => {
    if (!lat || !lng) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
            <Button variant="outline" onClick={loadAttendance} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">User ID (Optional)</label>
                  <Input
                    placeholder="Filter by user ID"
                    value={selectedUserId || ""}
                    onChange={(e) => setSelectedUserId(e.target.value || undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records ({filteredRecords.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading attendance records...
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {record.user?.firstName} {record.user?.lastName}
                            </span>
                            {record.user?.employeeCode && (
                              <span className="text-sm text-muted-foreground">
                                ({record.user.employeeCode})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(record.date), "MMM d, yyyy")}
                          </div>

                          {record.punchInTime && (
                            <div className="space-y-1 pl-6">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-green-600" />
                                <strong>Punch In:</strong>{" "}
                                {format(new Date(record.punchInTime), "h:mm a")}
                                {record.punchInLat && record.punchInLong && (
                                  <a
                                    href={getLocationUrl(record.punchInLat, record.punchInLong)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-primary hover:underline flex items-center gap-1"
                                  >
                                    <MapPin className="h-3 w-3" />
                                    View Location
                                  </a>
                                )}
                              </div>
                              {record.punchOutTime && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-red-600" />
                                  <strong>Punch Out:</strong>{" "}
                                  {format(new Date(record.punchOutTime), "h:mm a")}
                                  {record.punchOutLat && record.punchOutLong && (
                                    <a
                                      href={getLocationUrl(record.punchOutLat, record.punchOutLong)!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-primary hover:underline flex items-center gap-1"
                                    >
                                      <MapPin className="h-3 w-3" />
                                      View Location
                                    </a>
                                  )}
                                </div>
                              )}
                              {record.hoursWorked > 0 && (
                                <div className="text-sm">
                                  <strong>Hours Worked:</strong> {record.hoursWorked.toFixed(2)}h
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          {record.punchInTime && !record.punchOutTime ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              At Work
                            </span>
                          ) : record.punchOutTime ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Not Punched
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

