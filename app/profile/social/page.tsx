"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { usersApi, socialApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  GraduationCap,
  Gamepad2,
  Music,
  Linkedin,
  Briefcase,
  Code,
} from "lucide-react";
import { format } from "date-fns";

export default function SocialProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
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
      } else {
        setHobbies([]);
      }
      if (data.employee?.education) {
        const educationArray = Array.isArray(data.employee.education) ? data.employee.education : [];
        setEducation(educationArray);
      } else {
        setEducation([]);
      }
      if (data.employee?.experience) {
        const experienceArray = Array.isArray(data.employee.experience) ? data.employee.experience : [];
        setExperience(experienceArray);
      } else {
        setExperience([]);
      }
      if (data.employee?.skills) {
        const skillsArray = Array.isArray(data.employee.skills) ? data.employee.skills : [];
        setSkills(skillsArray);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };


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
                {education.length > 0 ? (
                  education.map((edu: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded border">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.degree} - {edu.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Year of passing: {edu.yearOfPassing}
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

            {/* Experience Card */}
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {experience.length > 0 ? (
                  experience.map((exp: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded border">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{exp.position}</p>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate || "N/A"}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No experience details added yet
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
                  <div className="flex flex-wrap gap-2">
                    {hobbies.map((hobby, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded border"
                      >
                        {hobby.toLowerCase().includes("sport") ||
                        hobby.toLowerCase().includes("travelling") ||
                        hobby.toLowerCase().includes("travel") ? (
                          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Music className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{hobby}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hobbies added yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded border"
                      >
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No skills added yet
                  </p>
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
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Signature
                  </label>
                  {profile?.signature ? (
                    <div className="h-20 border rounded-md p-2 bg-muted/50 flex items-center justify-center">
                      <img
                        src={profile.signature}
                        alt="Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No signature uploaded</p>
                  )}
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
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        LinkedIn / Social Media URL
                      </label>
                      {employee?.linkedIn ? (
                        <div className="mt-2">
                          <a
                            href={employee.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline text-sm"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn Profile
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          No LinkedIn profile added
                        </p>
                      )}
                    </div>
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
                  {employee?.linkedIn && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Linkedin className="h-5 w-5 text-primary" />
                      <a
                        href={employee.linkedIn}
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

