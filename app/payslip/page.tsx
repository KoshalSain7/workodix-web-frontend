"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { payrollApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";

export default function PayslipPage() {
  const { user } = useAuthStore();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const response = await payrollApi.getPayslips();
      const payslips = Array.isArray(response) ? response : [];
      setPayslips(payslips);
    } catch (error: any) {
      console.error("Failed to load payslips:", error);
      toast.error("Failed to load payslips", error.message || "Please try again");
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Payslips</h1>

        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Employee Name</p>
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee Code</p>
                <p className="font-medium">{user?.employeeCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{user?.department || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="font-medium">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Payslips</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : payslips.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No payslips available</p>
                <p className="text-sm text-muted-foreground">
                  Payslips will appear here once they are generated.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payslips.map((payslip) => {
                  const monthName = new Date(
                    payslip.year,
                    payslip.month - 1,
                  ).toLocaleString("default", { month: "long", year: "numeric" });
                  return (
                    <div
                      key={payslip.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{monthName}</p>
                          <p className="text-sm text-muted-foreground">
                            Net Salary: ₹{payslip.netSalary?.toLocaleString() || "0"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Gross: ₹{payslip.grossSalary?.toLocaleString() || "0"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/payslip/${payslip.id}`}>
                          <Download className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

