"use client";

import { useProfile } from "@/hooks/useProfile.hook";
import { StudentProfileForm } from "@/components/forms/StudentProfileForm";
import { CollegeAdminProfileForm } from "@/components/forms/CollegeAdminProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Profile,
  StudentProfile,
  CollegeAdminProfile,
  UserRole,
} from "@/services/profile.service";
import {
  AlertCircle,
  User,
  Mail,
  GraduationCap,
  Briefcase,
} from "lucide-react";

// ============================================
// UTILITY FUNCTIONS (Moved from service)
// ============================================

/**
 * Calculate profile completion percentage
 */
function getProfileCompletionPercentage(profile: Profile): number {
  if (!profile) return 0;

  const role = profile.role;

  if (role === "student") {
    const studentProfile = profile as StudentProfile;
    const fields = [
      studentProfile.full_name,
      studentProfile.email,
      studentProfile.phone,
      studentProfile.avatar_url,
      studentProfile.college_id,
      studentProfile.usn,
      studentProfile.batch,
      studentProfile.branch,
      studentProfile.current_semester,
      studentProfile.current_cgpa,
      studentProfile.technical_skills?.length,
      studentProfile.linkedin_url,
      studentProfile.github_url,
      studentProfile.resume_url,
    ];

    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  if (role === "college_admin") {
    const adminProfile = profile as CollegeAdminProfile;
    const fields = [
      adminProfile.full_name,
      adminProfile.email,
      adminProfile.phone,
      adminProfile.avatar_url,
      adminProfile.college_id,
      adminProfile.designation,
      adminProfile.department,
      adminProfile.employee_id,
    ];

    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  return 100; // Super admin
}

/**
 * Get role display label
 */
function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    student: "Student",
    college_admin: "College Admin",
    super_admin: "Super Admin",
  };
  return labels[role];
}

/**
 * Get user initials for avatar
 */
function getUserInitials(name: string): string {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

// ============================================
// COMPONENT
// ============================================

export default function ProfilePage() {
  const { useProfileQuery, updateStudentProfile, updateCollegeAdminProfile } =
    useProfile();

  const { data, isLoading, error } = useProfileQuery();

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  const { role, profile } = data;
  const completionPercentage = getProfileCompletionPercentage(profile);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your personal information and settings
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {getRoleLabel(role)}
        </Badge>
      </div>

      {/* Profile Completion */}
      {role !== "super_admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Completion</CardTitle>
            <CardDescription>
              Complete your profile to unlock all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {completionPercentage}% Complete
                </span>
                <span className="font-medium">{completionPercentage}/100</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage
                src={
                  role === "student"
                    ? (profile as StudentProfile).avatar_url || undefined
                    : role === "college_admin"
                    ? (profile as CollegeAdminProfile).avatar_url || undefined
                    : undefined
                }
              />
              <AvatarFallback className="text-xl md:text-2xl">
                {role === "student"
                  ? getUserInitials((profile as StudentProfile).full_name)
                  : role === "college_admin"
                  ? getUserInitials((profile as CollegeAdminProfile).full_name)
                  : "A"}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium truncate">
                      {role === "student"
                        ? (profile as StudentProfile).full_name
                        : (profile as CollegeAdminProfile).full_name}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium truncate">
                      {role === "student"
                        ? (profile as StudentProfile).email
                        : (profile as CollegeAdminProfile).email}
                    </p>
                  </div>
                </div>

                {/* Student USN */}
                {role === "student" && (profile as StudentProfile).usn && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">USN</p>
                      <p className="font-medium truncate">
                        {(profile as StudentProfile).usn}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Designation */}
                {role === "college_admin" &&
                  (profile as CollegeAdminProfile).designation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                          Designation
                        </p>
                        <p className="font-medium truncate">
                          {(profile as CollegeAdminProfile).designation}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Forms */}
      {role === "student" && (
        <StudentProfileForm
          profile={profile as StudentProfile}
          onSubmit={(data) => updateStudentProfile.mutate(data)}
          isSubmitting={updateStudentProfile.isPending}
        />
      )}

      {role === "college_admin" && (
        <CollegeAdminProfileForm
          profile={profile as CollegeAdminProfile}
          onSubmit={(data) => updateCollegeAdminProfile.mutate(data)}
          isSubmitting={updateCollegeAdminProfile.isPending}
        />
      )}

      {role === "super_admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Super Admin Profile</CardTitle>
            <CardDescription>
              Super admin accounts have limited profile settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Super admin profiles are managed at the system level.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
