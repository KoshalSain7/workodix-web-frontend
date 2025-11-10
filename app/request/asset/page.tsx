"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestsApi } from "@/lib/api";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AssetRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    assetName: "",
    description: "",
    quantity: 1,
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestsApi.createAsset(formData);
      router.push("/inbox");
    } catch (error) {
      console.error("Failed to create asset request:", error);
      alert("Failed to create asset request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/request">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Asset Request</h1>
            <p className="text-sm text-muted-foreground">
              Request for company assets
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Asset Name *
                </label>
                <Input
                  value={formData.assetName}
                  onChange={(e) =>
                    setFormData({ ...formData, assetName: e.target.value })
                  }
                  placeholder="e.g., Laptop, Monitor, Keyboard"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quantity *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details about the asset"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reason for Request *
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Explain why you need this asset"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

