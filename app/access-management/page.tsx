"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { accessApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/toast";
import { Settings, Save, CheckCircle2, XCircle } from "lucide-react";

// Role enum matching backend
enum Role {
  ADMIN = "admin",
  HR = "hr",
  DIRECTOR = "director",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  hr: "HR",
  director: "Director",
  manager: "Manager",
  employee: "Employee",
};

export default function AccessManagementPage() {
  const { user } = useAuthStore();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.EMPLOYEE);
  const [roleAccess, setRoleAccess] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await accessApi.getAll();
      setPermissions(Array.isArray(data) ? data : []);

      // Initialize role access map
      const accessMap: Record<string, Set<string>> = {};
      data.forEach((perm: any) => {
        const allowedRoles = perm.allowedRoles || [];
        allowedRoles.forEach((role: string) => {
          if (!accessMap[role]) {
            accessMap[role] = new Set();
          }
          accessMap[role].add(perm.id);
        });
      });
      setRoleAccess(accessMap);
    } catch (error: any) {
      console.error("Failed to load permissions:", error);
      toast.error("Failed to load permissions", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string, role: Role) => {
    setRoleAccess((prev) => {
      const newAccess = { ...prev };
      if (!newAccess[role]) {
        newAccess[role] = new Set();
      }
      const roleSet = new Set(newAccess[role]);
      if (roleSet.has(permissionId)) {
        roleSet.delete(permissionId);
      } else {
        roleSet.add(permissionId);
      }
      newAccess[role] = roleSet;
      return newAccess;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const optionIds = Array.from(roleAccess[selectedRole] || []);
      await accessApi.updateRoleAccess(selectedRole, optionIds);
      toast.success("Access Updated", `Access permissions for ${ROLE_LABELS[selectedRole]} have been updated successfully`);
      await loadPermissions();
    } catch (error: any) {
      console.error("Failed to update access:", error);
      toast.error("Failed to update access", error.message || "Please try again");
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  // Check if user has HR or Admin role
  const hasAccess = user?.roles?.some((r) => r === "hr" || r === "admin");

  if (!hasAccess) {
    return (
      <AuthGuard>
        <MainLayout>
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access this page. Only HR and Admin can manage access permissions.
              </p>
            </CardContent>
          </Card>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Access Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage which options each role can access
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Role Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    onClick={() => setSelectedRole(role as Role)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Loading permissions...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(perms as any[]).map((perm) => {
                        const hasAccess = roleAccess[selectedRole]?.has(perm.id) || false;
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{perm.optionName}</h4>
                                {hasAccess && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {perm.description || perm.optionPath}
                              </p>
                            </div>
                            <Button
                              variant={hasAccess ? "default" : "outline"}
                              size="sm"
                              onClick={() => togglePermission(perm.id, selectedRole)}
                            >
                              {hasAccess ? "Enabled" : "Disabled"}
                            </Button>
                          </div>
                        );
                      })}
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

