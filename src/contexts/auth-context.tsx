"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface ProfileData {
  full_name: string;
  avatar_url?: string;
  college_id?: string;
  batch?: string;
  branch?: string;
  designation?: string;
}

interface AuthContextType {
  user: User | null;
  role: "student" | "college_admin" | "super_admin" | null;
  profileData: ProfileData | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<
    "student" | "college_admin" | "super_admin" | null
  >(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch profile data based on role
  const fetchProfileData = async (
    userId: string,
    userRole: string,
    userMetadata?: any
  ) => {
    const supabase = createClient();

    if (userRole === "student") {
      const { data: studentData, error } = await supabase
        .from("student_profiles")
        .select("full_name, avatar_url, college_id, batch, branch")
        .eq("id", userId)
        .single();

      if (!error && studentData) {
        setProfileData(studentData);
      } else {
        console.error("Error fetching student profile:", error);
      }
    } else if (userRole === "college_admin") {
      const { data: adminData, error } = await supabase
        .from("college_admin_profiles")
        .select("full_name, avatar_url, college_id, designation")
        .eq("id", userId)
        .single();

      if (!error && adminData) {
        setProfileData(adminData);
      } else {
        console.error("Error fetching admin profile:", error);
      }
    } else if (userRole === "super_admin") {
      setProfileData({
        full_name: userMetadata?.full_name || "Super Admin",
        avatar_url: userMetadata?.avatar_url,
      });
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (user) {
          // Fetch user role from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile) {
            const userRole = profile.role as
              | "student"
              | "college_admin"
              | "super_admin";
            setRole(userRole);
            await fetchProfileData(user.id, userRole, user.user_metadata);
          } else {
            console.error("No profile found for user");
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          const userRole = profile.role as
            | "student"
            | "college_admin"
            | "super_admin";
          setRole(userRole);
          await fetchProfileData(
            session.user.id,
            userRole,
            session.user.user_metadata
          );
        } else {
          setRole(null);
          setProfileData(null);
        }
      } else {
        setRole(null);
        setProfileData(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    role,
    profileData,
    isLoading,
    isAdmin: role === "college_admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
    isStudent: role === "student",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
