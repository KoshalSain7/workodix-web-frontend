"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/stores/dashboardStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LeaveBalancePage() {
  const { leaveBalances } = useDashboardStore();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Leave Balance</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaveBalances.map((balance) => (
            <Card key={balance.type}>
              <CardHeader>
                <CardTitle className="text-lg">{balance.type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-semibold">{balance.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Used</span>
                    <span className="font-semibold text-orange-600">
                      {balance.used}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Remaining
                    </span>
                    <span className="font-semibold text-success">
                      {balance.remaining}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(balance.used / balance.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <Link href="/request/leave">
                  <Button variant="outline" className="w-full">
                    Apply for Leave
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

