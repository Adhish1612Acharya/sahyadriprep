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

  // ✅ Optimized: Fetch profile data based on role
  const fetchProfileData = async (
    userId: string,
    userRole: string,
    userMetadata?: any
  ) => {
    const supabase = createClient();

    try {
      console.log(`📋 Fetching ${userRole} profile for: ${userId}`);

      if (userRole === "student") {
        const { data: studentData, error } = await supabase
          .from("student_profiles")
          .select("full_name, avatar_url, college_id, batch, branch")
          .eq("id", userId)
          .single();

        if (!error && studentData) {
          console.log("✅ Student profile loaded:", studentData.full_name);
          setProfileData(studentData);
        } else {
          console.error("❌ Error fetching student profile:", error);
          setProfileData({
            full_name: userMetadata?.full_name || "Student",
            avatar_url: userMetadata?.avatar_url,
          });
        }
      } else if (userRole === "college_admin") {
        const { data: adminData, error } = await supabase
          .from("college_admin_profiles")
          .select("full_name, avatar_url, college_id, designation")
          .eq("id", userId)
          .single();

        if (!error && adminData) {
          console.log("✅ Admin profile loaded:", adminData.full_name);
          setProfileData(adminData);
        } else {
          console.error("❌ Error fetching admin profile:", error);
          setProfileData({
            full_name: userMetadata?.full_name || "Admin",
            avatar_url: userMetadata?.avatar_url,
          });
        }
      } else if (userRole === "super_admin") {
        console.log("✅ Super admin profile set");
        setProfileData({
          full_name: userMetadata?.full_name || "Super Admin",
          avatar_url: userMetadata?.avatar_url,
        });
      }
    } catch (error) {
      console.error("❌ Error in fetchProfileData:", error);
      setProfileData({
        full_name: userMetadata?.full_name || "User",
        avatar_url: userMetadata?.avatar_url,
      });
    }
  };

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // ✅ Get initial user
    const getUser = async () => {
      try {
        console.log("🔍 Auth Context: Fetching user...");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ Auth Context: Error fetching user:", userError);
          if (mounted) {
            setUser(null);
            setRole(null);
            setProfileData(null);
            setIsLoading(false); // ✅ CRITICAL: Set to false on error
          }
          return;
        }

        if (!mounted) return;

        setUser(user);

        if (user) {
          console.log("✅ Auth Context: User found:", user.id);

          const roleFromMetadata = user.user_metadata?.role;

          console.log("📦 Cached metadata:", {
            role: roleFromMetadata,
          });

          if (roleFromMetadata) {
            const userRole = roleFromMetadata as
              | "student"
              | "college_admin"
              | "super_admin";
            setRole(userRole);
            setIsLoading(false); // ✅ Set to false IMMEDIATELY

            // Fetch profile data in background (non-blocking)
            fetchProfileData(user.id, userRole, user.user_metadata);
          } else {
            // ⚠️ Fallback: Fetch from DB if metadata missing
            console.warn("⚠️ Metadata missing, fetching from DB");
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            if (profileError) {
              console.error("❌ Error fetching profile:", profileError);
              setRole(null);
              setProfileData(null);
              setIsLoading(false); // ✅ CRITICAL: Set to false on error
            } else if (profile && mounted) {
              const userRole = profile.role as
                | "student"
                | "college_admin"
                | "super_admin";
              setRole(userRole);
              setIsLoading(false); // ✅ Set to false after setting role

              // Fetch profile data in background
              fetchProfileData(user.id, userRole, user.user_metadata);
            } else {
              // ✅ CRITICAL: Handle case where profile doesn't exist
              setRole(null);
              setProfileData(null);
              setIsLoading(false);
            }
          }
        } else {
          console.log("ℹ️ Auth Context: No user found");
          setRole(null);
          setProfileData(null);
          setIsLoading(false); // ✅ CRITICAL: Set to false when no user
        }
      } catch (error) {
        console.error("❌ Auth Context: Unexpected error:", error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setProfileData(null);
          setIsLoading(false); // ✅ CRITICAL: Set to false on exception
        }
      }
    };

    getUser();

    // ✅ Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event);

      if (!mounted) return;

      // ✅ IMPORTANT: Set loading to true during state change
      setIsLoading(true);
      setUser(session?.user ?? null);

      if (session?.user) {
        const roleFromMetadata = session.user.user_metadata?.role;

        if (roleFromMetadata) {
          const userRole = roleFromMetadata as
            | "student"
            | "college_admin"
            | "super_admin";
          setRole(userRole);
          setIsLoading(false); // ✅ Set to false IMMEDIATELY

          // Fetch profile data in background
          fetchProfileData(
            session.user.id,
            userRole,
            session.user.user_metadata
          );
        } else {
          // Fallback to DB
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("❌ Error fetching role:", error);
            setRole(null);
            setProfileData(null);
            setIsLoading(false); // ✅ Set to false on error
          } else if (profile && mounted) {
            const userRole = profile.role as
              | "student"
              | "college_admin"
              | "super_admin";
            setRole(userRole);
            setIsLoading(false); // ✅ Set to false after setting role

            // Fetch profile data in background
            fetchProfileData(
              session.user.id,
              userRole,
              session.user.user_metadata
            );
          } else {
            setRole(null);
            setProfileData(null);
            setIsLoading(false); // ✅ Set to false when no profile
          }
        }
      } else {
        // ✅ Signed out
        console.log("✅ User signed out");
        setRole(null);
        setProfileData(null);
        setIsLoading(false); // ✅ CRITICAL: Set to false on sign out
      }
    });

    // ✅ Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
