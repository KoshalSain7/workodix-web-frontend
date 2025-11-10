"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { usersApi, socialApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  GraduationCap,
  Gamepad2,
  Music,
  Edit,
  Linkedin,
  Plus,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";

export default function SocialProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [savedHobbies, setSavedHobbies] = useState<string[]>([]);
  const [newHobby, setNewHobby] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getProfile();
      setProfile(data.user);
      setEmployee(data.employee);
      if (data.employee?.hobbies) {
        const hobbiesArray = Array.isArray(data.employee.hobbies) ? data.employee.hobbies : [];
        setHobbies(hobbiesArray);
        setSavedHobbies([...hobbiesArray]); // Track saved state
      } else {
        setHobbies([]);
        setSavedHobbies([]);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby("");
    }
  };

  const handleRemoveHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby));
  };

  const handleSaveHobbies = async () => {
    try {
      await usersApi.updateEmployeeProfile({ hobbies });
      setSavedHobbies([...hobbies]); // Update saved state after successful save
      toast.success("Hobbies updated successfully!", "All changes have synced to the cloud");
    } catch (error) {
      console.error("Failed to update hobbies:", error);
      toast.error("Failed to update hobbies", "Please try again later");
    }
  };

  // Check if hobbies have been modified
  const hasUnsavedChanges = JSON.stringify(hobbies.sort()) !== JSON.stringify(savedHobbies.sort());

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <p className="text-center py-12">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Employee Profile Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Education Card */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee?.education && employee.education.length > 0 ? (
                  employee.education.map((edu: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.degree} - {edu.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Year of passing : {edu.yearOfPassing}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No education details added yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Hobbies Card */}
            <Card>
              <CardHeader>
                <CardTitle>Hobbies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hobbies.length > 0 ? (
                  hobbies.map((hobby, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-2 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        {hobby.toLowerCase().includes("sport") ||
                        hobby.toLowerCase().includes("travelling") ||
                        hobby.toLowerCase().includes("travel") ? (
                          <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Music className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm">{hobby}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHobby(hobby)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hobbies added yet
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Input
                    placeholder="Add a hobby"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddHobby();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleAddHobby} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {hobbies.length > 0 && hasUnsavedChanges && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="default"
                      className="bg-primary"
                      onClick={handleSaveHobbies}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Hobbies
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Signature</label>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input placeholder="Upload signature" className="h-20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Prefix
                    </label>
                    <p className="text-sm mt-1">{profile?.prefix || "Mr."}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      First name
                    </label>
                    <p className="text-sm mt-1">{profile?.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Middle name
                    </label>
                    <p className="text-sm mt-1">{profile?.middleName || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last name
                    </label>
                    <p className="text-sm mt-1">{profile?.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employee Code
                    </label>
                    <p className="text-sm mt-1">{profile?.employeeCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of birth
                    </label>
                    <p className="text-sm mt-1">
                      {profile?.dateOfBirth
                        ? format(new Date(profile.dateOfBirth), "PPP")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Gender
                    </label>
                    <p className="text-sm mt-1">{profile?.gender || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Blood group
                    </label>
                    <p className="text-sm mt-1">{profile?.bloodGroup || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Profile Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                    {profile?.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold">
                        {profile?.firstName?.charAt(0)}
                        {profile?.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profile?.company || employee?.company || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.role || employee?.designation || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {profile?.employeeCode}
                  </p>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{profile?.email}</p>
                  </div>
                  {employee?.linkedinUrl && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Linkedin className="h-5 w-5 text-primary" />
                      <a
                        href={employee.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

