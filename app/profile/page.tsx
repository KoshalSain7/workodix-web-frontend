"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { usersApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Edit,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user, checkAuth } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    prefix: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const profilePictureInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getProfile();
      setProfile(data.user);
      setEmployee(data.employee);
      setProfilePicturePreview(data.user.profilePicture || null);
      setSignaturePreview(data.user.signature || null);
      setProfilePictureFile(null);
      setSignatureFile(null);
      if (profilePictureInputRef.current) {
        profilePictureInputRef.current.value = "";
      }
      if (signatureInputRef.current) {
        signatureInputRef.current.value = "";
      }
      setFormData({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        middleName: data.user.middleName || "",
        phone: data.user.phone || "",
        dateOfBirth: data.user.dateOfBirth
          ? format(new Date(data.user.dateOfBirth), "yyyy-MM-dd")
          : "",
        gender: data.user.gender || "",
        bloodGroup: data.user.bloodGroup || "",
        prefix: data.user.prefix || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value ?? "");
      });

      if (profilePictureFile) {
        payload.append("profilePicture", profilePictureFile);
      }

      if (signatureFile) {
        payload.append("signature", signatureFile);
      }

      await usersApi.updateProfile(payload);
      setEditing(false);
      await loadProfile();
      await checkAuth(); // Refresh auth store
      toast.success("Successfully Saved!", "All changes have synced to the cloud");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile", "Please try again later");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        middleName: profile.middleName || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth
          ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd")
          : "",
        gender: profile.gender || "",
        bloodGroup: profile.bloodGroup || "",
        prefix: profile.prefix || "",
      });
      setProfilePicturePreview(profile.profilePicture || null);
      setSignaturePreview(profile.signature || null);
    }
    setProfilePictureFile(null);
    setSignatureFile(null);
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = "";
    }
    if (signatureInputRef.current) {
      signatureInputRef.current.value = "";
    }
  };

  const handleProfilePictureChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", "Profile picture must be 5MB or less");
      event.target.value = "";
      return;
    }

    if (profilePicturePreview && profilePicturePreview.startsWith("blob:")) {
      URL.revokeObjectURL(profilePicturePreview);
    }

    setProfilePictureFile(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleSignatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", "Signature must be 2MB or less");
      event.target.value = "";
      return;
    }

    if (signaturePreview && signaturePreview.startsWith("blob:")) {
      URL.revokeObjectURL(signaturePreview);
    }

    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleProfilePictureUploadClick = () => {
    if (!editing || saving) {
      return;
    }
    profilePictureInputRef.current?.click();
  };

  const handleSignatureUploadClick = () => {
    if (!editing || saving) {
      return;
    }
    signatureInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (profilePicturePreview && profilePicturePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePicturePreview);
      }
    };
  }, [profilePicturePreview]);

  useEffect(() => {
    return () => {
      if (signaturePreview && signaturePreview.startsWith("blob:")) {
        URL.revokeObjectURL(signaturePreview);
      }
    };
  }, [signaturePreview]);

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Prefix
                </label>
                {editing ? (
                  <Input
                    value={formData.prefix}
                    onChange={(e) =>
                      setFormData({ ...formData, prefix: e.target.value })
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{profile?.prefix || "-"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  First Name
                </label>
                {editing ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="mt-1"
                    required
                  />
                ) : (
                  <p className="text-sm mt-1">{profile?.firstName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Middle Name
                </label>
                {editing ? (
                  <Input
                    value={formData.middleName}
                    onChange={(e) =>
                      setFormData({ ...formData, middleName: e.target.value })
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{profile?.middleName || "-"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Name
                </label>
                {editing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="mt-1"
                    required
                  />
                ) : (
                  <p className="text-sm mt-1">{profile?.lastName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{profile?.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                {editing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1"
                    type="tel"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{profile?.phone || "-"}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </label>
                {editing ? (
                  <Input
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="mt-1"
                    type="date"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {profile?.dateOfBirth
                        ? format(new Date(profile.dateOfBirth), "PPP")
                        : "-"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Gender
                </label>
                {editing ? (
                  <select
                    className="w-full px-3 py-2 border rounded-md mt-1"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm mt-1">{profile?.gender || "-"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Blood Group
                </label>
                {editing ? (
                  <Input
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value })
                    }
                    className="mt-1"
                    placeholder="e.g., O+, A-"
                  />
                ) : (
                  <p className="text-sm mt-1">{profile?.bloodGroup || "-"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Employee Code
                </label>
                <p className="text-sm mt-1 font-medium">
                  {profile?.employeeCode}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Company
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{profile?.company || "-"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{profile?.role || "-"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <p className="text-sm mt-1">{profile?.department || "-"}</p>
              </div>
              {employee && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Designation
                    </label>
                    <p className="text-sm mt-1">
                      {employee.designation || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Manager
                    </label>
                    <p className="text-sm mt-1">
                      {employee.managerName || "-"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Picture & Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center">
                {profilePicturePreview ? (
                    <img
                    src={profilePicturePreview}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-semibold">
                      {profile?.firstName?.charAt(0)}
                      {profile?.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                <input
                  ref={profilePictureInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                  disabled={!editing || saving}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProfilePictureUploadClick}
                  disabled={!editing || saving}
                >
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG up to 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signaturePreview ? (
                  <img
                    src={signaturePreview}
                    alt="Signature"
                    className="h-20 w-full object-contain border rounded"
                  />
                ) : (
                  <div className="h-20 border rounded flex items-center justify-center text-muted-foreground">
                    No signature uploaded
                  </div>
                )}
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSignatureChange}
                  disabled={!editing || saving}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleSignatureUploadClick}
                  disabled={!editing || saving}
                >
                  Upload Signature
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG up to 2MB.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

