"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { officeApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { MapPin, Plus, Edit, Trash2, Settings, Building2, Users } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface Office {
  id: string;
  officeName: string;
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
  assignedUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

type SettingsTab = "office-management" | "future-tab-1" | "future-tab-2";

const SETTINGS_TABS = [
  {
    id: "office-management" as SettingsTab,
    name: "Office Management",
    icon: Building2,
    description: "Manage office locations and addresses",
  },
  // Future tabs can be added here
  // {
  //   id: "future-tab-1" as SettingsTab,
  //   name: "Future Management 1",
  //   icon: Settings,
  //   description: "Future management type",
  // },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("office-management");
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    officeName: "",
    latitude: "",
    longitude: "",
    radius: "100",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    isActive: true,
    assignedUserIds: [] as string[],
  });

  // Load offices when office management tab is active
  const loadOffices = async () => {
    try {
      setLoading(true);
      const data = await officeApi.getAll();
      setOffices(data);
    } catch (error: any) {
      console.error("Failed to load offices:", error);
      toast.error("Failed to load offices", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "office-management") {
      loadOffices();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius),
      };

      if (editingOffice) {
        await officeApi.update(editingOffice.id, payload);
        toast.success("Office Updated", "Office location updated successfully");
      } else {
        await officeApi.create(payload);
        toast.success("Office Created", "Office location created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadOffices();
    } catch (error: any) {
      console.error("Failed to save office:", error);
      toast.error("Save Failed", error.message || "Please try again");
    }
  };

  const handleEdit = (office: Office) => {
    setEditingOffice(office);
    setFormData({
      officeName: office.officeName,
      latitude: office.latitude.toString(),
      longitude: office.longitude.toString(),
      radius: office.radius.toString(),
      address: office.address || "",
      city: office.city || "",
      state: office.state || "",
      country: office.country || "",
      postalCode: office.postalCode || "",
      isActive: office.isActive,
      assignedUserIds: office.assignedUsers?.map((u) => u.id) || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this office?")) return;

    try {
      await officeApi.delete(id);
      toast.success("Office Deleted", "Office location deleted successfully");
      loadOffices();
    } catch (error: any) {
      console.error("Failed to delete office:", error);
      toast.error("Delete Failed", error.message || "Please try again");
    }
  };

  const resetForm = () => {
    setFormData({
      officeName: "",
      latitude: "",
      longitude: "",
      radius: "100",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      isActive: true,
      assignedUserIds: [],
    });
    setEditingOffice(null);
  };

  const filteredOffices = offices.filter((office) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      office.officeName.toLowerCase().includes(query) ||
      office.address?.toLowerCase().includes(query) ||
      office.city?.toLowerCase().includes(query)
    );
  });

  const getLocationUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const activeTabConfig = SETTINGS_TABS.find((tab) => tab.id === activeTab);
  const ActiveTabIcon = activeTabConfig?.icon || Settings;

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
          </div>

          {/* Tabs */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 border-b">
                {SETTINGS_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === "office-management") {
                          loadOffices();
                        }
                      }}
                      className={`
                        flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                        ${
                          activeTab === tab.id
                            ? "border-primary text-primary font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      <TabIcon className="h-4 w-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Office Management Tab Content */}
          {activeTab === "office-management" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Office Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage office locations, addresses, and GPS coordinates
                  </p>
                </div>
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Office
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOffice ? "Edit Office" : "Create New Office"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Office Name *
                        </label>
                        <Input
                          value={formData.officeName}
                          onChange={(e) =>
                            setFormData({ ...formData, officeName: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Latitude *
                          </label>
                          <Input
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={(e) =>
                              setFormData({ ...formData, latitude: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Longitude *
                          </label>
                          <Input
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={(e) =>
                              setFormData({ ...formData, longitude: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Radius (meters) *
                        </label>
                        <Input
                          type="number"
                          value={formData.radius}
                          onChange={(e) =>
                            setFormData({ ...formData, radius: e.target.value })
                          }
                          required
                          min="10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Address
                        </label>
                        <Textarea
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">City</label>
                          <Input
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">State</label>
                          <Input
                            value={formData.state}
                            onChange={(e) =>
                              setFormData({ ...formData, state: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Country</label>
                          <Input
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({ ...formData, country: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Postal Code
                          </label>
                          <Input
                            value={formData.postalCode}
                            onChange={(e) =>
                              setFormData({ ...formData, postalCode: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                          className="rounded"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">
                          Active
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingOffice ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search */}
              <Card>
                <CardContent className="pt-6">
                  <Input
                    placeholder="Search offices by name, address, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Offices List */}
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading offices...
                </div>
              ) : filteredOffices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No offices found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredOffices.map((office) => (
                    <Card key={office.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <MapPin className="h-5 w-5" />
                              {office.officeName}
                            </CardTitle>
                            {!office.isActive && (
                              <span className="text-xs text-red-600 mt-1">Inactive</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(office)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(office.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Location:</strong>{" "}
                            {office.latitude != null && office.longitude != null ? (
                              <>
                                {Number(office.latitude).toFixed(6)},{" "}
                                {Number(office.longitude).toFixed(6)}
                                <a
                                  href={getLocationUrl(Number(office.latitude), Number(office.longitude))}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-primary hover:underline"
                                >
                                  View on Map
                                </a>
                              </>
                            ) : (
                              "Not set"
                            )}
                          </div>
                          <div>
                            <strong>Radius:</strong> {office.radius}m
                          </div>
                          {office.address && (
                            <div>
                              <strong>Address:</strong> {office.address}
                            </div>
                          )}
                          {(office.city || office.state || office.country) && (
                            <div>
                              <strong>Location:</strong>{" "}
                              {[office.city, office.state, office.country]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                          {office.assignedUsers && office.assignedUsers.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                <strong>{office.assignedUsers.length}</strong> assigned user(s)
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Future tabs content can be added here */}
          {activeTab !== "office-management" && (
            <Card>
              <CardContent className="py-12 text-center">
                <ActiveTabIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  This management section is coming soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

