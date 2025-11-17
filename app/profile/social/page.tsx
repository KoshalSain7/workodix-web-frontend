"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
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
  Briefcase,
  Trash2,
  Code,
} from "lucide-react";
import { format } from "date-fns";

export default function SocialProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [savedHobbies, setSavedHobbies] = useState<string[]>([]);
  const [newHobby, setNewHobby] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [savedSkills, setSavedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [savedLinkedInUrl, setSavedLinkedInUrl] = useState("");
  const [education, setEducation] = useState<any[]>([]);
  const [savedEducation, setSavedEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [savedExperience, setSavedExperience] = useState<any[]>([]);
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [educationForm, setEducationForm] = useState({
    institution: "",
    degree: "",
    type: "Full Time",
    yearOfPassing: new Date().getFullYear().toString(),
  });
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });
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
      if (data.employee?.education) {
        const educationArray = Array.isArray(data.employee.education) ? data.employee.education : [];
        setEducation(educationArray);
        setSavedEducation([...educationArray]);
      } else {
        setEducation([]);
        setSavedEducation([]);
      }
      if (data.employee?.experience) {
        const experienceArray = Array.isArray(data.employee.experience) ? data.employee.experience : [];
        setExperience(experienceArray);
        setSavedExperience([...experienceArray]);
      } else {
        setExperience([]);
        setSavedExperience([]);
      }
      if (data.employee?.skills) {
        const skillsArray = Array.isArray(data.employee.skills) ? data.employee.skills : [];
        setSkills(skillsArray);
        setSavedSkills([...skillsArray]);
      } else {
        setSkills([]);
        setSavedSkills([]);
      }
      if (data.employee?.linkedIn) {
        setLinkedInUrl(data.employee.linkedIn);
        setSavedLinkedInUrl(data.employee.linkedIn);
      } else {
        setLinkedInUrl("");
        setSavedLinkedInUrl("");
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
      await loadProfile();
    } catch (error) {
      console.error("Failed to update hobbies:", error);
      toast.error("Failed to update hobbies", "Please try again later");
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSaveSkills = async () => {
    try {
      await usersApi.updateEmployeeProfile({ skills });
      setSavedSkills([...skills]);
      toast.success("Skills updated successfully!", "All changes have synced to the cloud");
      await loadProfile();
    } catch (error) {
      console.error("Failed to update skills:", error);
      toast.error("Failed to update skills", "Please try again later");
    }
  };

  // Education handlers
  const handleOpenEducationDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingEducationIndex(index);
      setEducationForm({ ...education[index] });
    } else {
      setEditingEducationIndex(null);
      setEducationForm({
        institution: "",
        degree: "",
        type: "Full Time",
        yearOfPassing: new Date().getFullYear().toString(),
      });
    }
    setShowEducationDialog(true);
  };

  const handleSaveEducation = () => {
    if (!educationForm.institution || !educationForm.degree || !educationForm.yearOfPassing) {
      toast.error("Please fill all required fields", "Institution, Degree, and Year are required");
      return;
    }

    const newEducation = {
      institution: educationForm.institution,
      degree: educationForm.degree,
      type: educationForm.type,
      yearOfPassing: parseInt(educationForm.yearOfPassing),
    };

    if (editingEducationIndex !== null) {
      const updated = [...education];
      updated[editingEducationIndex] = newEducation;
      setEducation(updated);
    } else {
      setEducation([...education, newEducation]);
    }
    setShowEducationDialog(false);
    setEditingEducationIndex(null);
  };

  const handleDeleteEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleSaveEducationToBackend = async () => {
    try {
      await usersApi.updateEmployeeProfile({ education });
      setSavedEducation([...education]);
      toast.success("Education updated successfully!", "All changes have synced to the cloud");
      // Reload profile to get updated data
      await loadProfile();
    } catch (error) {
      console.error("Failed to update education:", error);
      toast.error("Failed to update education", "Please try again later");
    }
  };

  // Experience handlers
  const handleOpenExperienceDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingExperienceIndex(index);
      const exp = experience[index];
      setExperienceForm({
        company: exp.company || "",
        position: exp.position || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        isCurrent: exp.isCurrent || false,
        description: exp.description || "",
      });
    } else {
      setEditingExperienceIndex(null);
      setExperienceForm({
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      });
    }
    setShowExperienceDialog(true);
  };

  const handleSaveExperience = () => {
    if (!experienceForm.company || !experienceForm.position || !experienceForm.startDate) {
      toast.error("Please fill all required fields", "Company, Position, and Start Date are required");
      return;
    }

    const newExperience = {
      company: experienceForm.company,
      position: experienceForm.position,
      startDate: experienceForm.startDate,
      endDate: experienceForm.isCurrent ? null : experienceForm.endDate,
      isCurrent: experienceForm.isCurrent,
      description: experienceForm.description,
    };

    if (editingExperienceIndex !== null) {
      const updated = [...experience];
      updated[editingExperienceIndex] = newExperience;
      setExperience(updated);
    } else {
      setExperience([...experience, newExperience]);
    }
    setShowExperienceDialog(false);
    setEditingExperienceIndex(null);
  };

  const handleDeleteExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleSaveExperienceToBackend = async () => {
    try {
      await usersApi.updateEmployeeProfile({ experience });
      setSavedExperience([...experience]);
      toast.success("Experience updated successfully!", "All changes have synced to the cloud");
      // Reload profile to get updated data
      await loadProfile();
    } catch (error) {
      console.error("Failed to update experience:", error);
      toast.error("Failed to update experience", "Please try again later");
    }
  };

  // Check if hobbies have been modified
  const hasUnsavedChanges = JSON.stringify(hobbies.sort()) !== JSON.stringify(savedHobbies.sort());
  const hasUnsavedEducation = JSON.stringify(education) !== JSON.stringify(savedEducation);
  const hasUnsavedExperience = JSON.stringify(experience) !== JSON.stringify(savedExperience);
  const hasUnsavedSkills = JSON.stringify(skills.sort()) !== JSON.stringify(savedSkills.sort());
  const hasUnsavedLinkedIn = linkedInUrl !== savedLinkedInUrl;

  const handleSaveLinkedIn = async () => {
    try {
      await usersApi.updateEmployeeProfile({ linkedIn: linkedInUrl });
      setSavedLinkedInUrl(linkedInUrl);
      toast.success("LinkedIn URL updated successfully!", "All changes have synced to the cloud");
      await loadProfile();
    } catch (error) {
      console.error("Failed to update LinkedIn URL:", error);
      toast.error("Failed to update LinkedIn URL", "Please try again later");
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEducationDialog()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEducationDialog(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEducation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No education details added yet
                  </p>
                )}
                {education.length > 0 && hasUnsavedEducation && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="default"
                      className="bg-primary"
                      onClick={handleSaveEducationToBackend}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Education
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Experience</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenExperienceDialog()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenExperienceDialog(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExperience(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No experience details added yet
                  </p>
                )}
                {experience.length > 0 && hasUnsavedExperience && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="default"
                      className="bg-primary"
                      onClick={handleSaveExperienceToBackend}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Experience
                    </Button>
                  </div>
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

            {/* Skills Card */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-2 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <Code className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{skill}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No skills added yet
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Input
                    placeholder="Add a skill (e.g., JavaScript, React, Node.js)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddSkill();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleAddSkill} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {skills.length > 0 && hasUnsavedSkills && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="default"
                      className="bg-primary"
                      onClick={handleSaveSkills}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Skills
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
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">LinkedIn / Social Media URL</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="https://linkedin.com/in/yourprofile or any social media URL"
                        value={linkedInUrl}
                        onChange={(e) => setLinkedInUrl(e.target.value)}
                        className="flex-1"
                      />
                      {linkedInUrl && (
                        <a
                          href={linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <Button variant="outline" size="icon" title="Open link">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                    {hasUnsavedLinkedIn && (
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="default"
                          className="bg-primary"
                          onClick={handleSaveLinkedIn}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save LinkedIn URL
                        </Button>
                      </div>
                    )}
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

      {/* Education Dialog */}
      <Dialog
        open={showEducationDialog}
        onOpenChange={setShowEducationDialog}
        title={editingEducationIndex !== null ? "Edit Education" : "Add Education"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Institution <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Harvard University"
              value={educationForm.institution}
              onChange={(e) =>
                setEducationForm({ ...educationForm, institution: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Degree <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Bachelor of Science"
              value={educationForm.degree}
              onChange={(e) =>
                setEducationForm({ ...educationForm, degree: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md bg-background"
              value={educationForm.type}
              onChange={(e) =>
                setEducationForm({ ...educationForm, type: e.target.value })
              }
              required
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Distance">Distance</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Year of Passing <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="e.g., 2023"
              value={educationForm.yearOfPassing}
              onChange={(e) =>
                setEducationForm({ ...educationForm, yearOfPassing: e.target.value })
              }
              min="1900"
              max={new Date().getFullYear() + 10}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEducationDialog(false);
                setEditingEducationIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEducation}>Save</Button>
          </div>
        </div>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog
        open={showExperienceDialog}
        onOpenChange={setShowExperienceDialog}
        title={editingExperienceIndex !== null ? "Edit Experience" : "Add Experience"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Company <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Google Inc."
              value={experienceForm.company}
              onChange={(e) =>
                setExperienceForm({ ...experienceForm, company: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Position <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Software Engineer"
              value={experienceForm.position}
              onChange={(e) =>
                setExperienceForm({ ...experienceForm, position: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={experienceForm.startDate}
                onChange={(e) =>
                  setExperienceForm({ ...experienceForm, startDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={experienceForm.endDate}
                onChange={(e) =>
                  setExperienceForm({ ...experienceForm, endDate: e.target.value })
                }
                disabled={experienceForm.isCurrent}
                min={experienceForm.startDate}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={experienceForm.isCurrent}
              onChange={(e) =>
                setExperienceForm({ ...experienceForm, isCurrent: e.target.checked })
              }
              className="h-4 w-4"
            />
            <label htmlFor="isCurrent" className="text-sm font-medium">
              I currently work here
            </label>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              placeholder="Describe your role and responsibilities..."
              value={experienceForm.description}
              onChange={(e) =>
                setExperienceForm({ ...experienceForm, description: e.target.value })
              }
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowExperienceDialog(false);
                setEditingExperienceIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveExperience}>Save</Button>
          </div>
        </div>
      </Dialog>
    </MainLayout>
  );
}

