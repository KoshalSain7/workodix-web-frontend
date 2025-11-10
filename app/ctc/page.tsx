"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ctcApi } from "@/lib/api";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function CtcPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await ctcApi.getSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to load CTC summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <p className="text-center py-12">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Cost to Company (CTC)</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Annual CTC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{summary?.annualCtc?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Gross
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{summary?.monthlyGross?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Net
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ₹{summary?.monthlyNet?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Basic Salary</span>
                <span className="font-medium">
                  ₹{summary?.components?.earnings?.basic?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">HRA</span>
                <span className="font-medium">
                  ₹{summary?.components?.earnings?.hra?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transport</span>
                <span className="font-medium">
                  ₹
                  {summary?.components?.earnings?.transport?.toLocaleString() ||
                    "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Medical</span>
                <span className="font-medium">
                  ₹
                  {summary?.components?.earnings?.medical?.toLocaleString() ||
                    "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Other Allowances</span>
                <span className="font-medium">
                  ₹{summary?.components?.earnings?.other?.toLocaleString() || "0"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Deductions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Provident Fund</span>
                <span className="font-medium">
                  ₹{summary?.components?.deductions?.pf?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Income Tax</span>
                <span className="font-medium">
                  ₹{summary?.components?.deductions?.tax?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Professional Tax</span>
                <span className="font-medium">
                  ₹
                  {summary?.components?.deductions?.professionalTax?.toLocaleString() ||
                    "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Other Deductions</span>
                <span className="font-medium">
                  ₹
                  {summary?.components?.deductions?.other?.toLocaleString() ||
                    "0"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

