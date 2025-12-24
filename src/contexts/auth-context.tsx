"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  AuthContextType,
  ProfileData,
  Role,
} from "@/types/contexts/auth-context";
import { fetchCompleteUserProfile } from "@/lib/services/profiles";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [role, setRole] = useState<Role>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const setUserAndProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setRole(null);
      setProfileData(null);
      setIsLoading(false);
      return;
    }

    setUser(currentUser);

    try {
      // ✅ Use client-side helper
      const result = await fetchCompleteUserProfile(supabase, currentUser.id);

      if (result.type === "error") {
        console.log("Error fetching profile:", result.error);

        const roleFromMetadata = currentUser.user_metadata?.role as Role;
        setRole(roleFromMetadata || null);
        setProfileData({
          full_name: currentUser.user_metadata?.full_name || "User",
          avatar_url: currentUser.user_metadata?.avatar_url,
        });
        setIsLoading(false);
        return;
      }

      const userRole = result.role as Role;
      setRole(userRole);

      if (userRole === "student" || userRole === "college_admin") {
        setProfileData(result.profile as ProfileData);
      } else if (userRole === "super_admin") {
        setProfileData({
          full_name: currentUser.user_metadata?.full_name || "Super Admin",
          avatar_url: currentUser.user_metadata?.avatar_url,
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);

      const roleFromMetadata = currentUser.user_metadata?.role as Role;
      setRole(roleFromMetadata || null);
      setProfileData({
        full_name: currentUser.user_metadata?.full_name || "User",
        avatar_url: currentUser.user_metadata?.avatar_url,
      });
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setIsLoading(true);
      await setUserAndProfile(user);
    }
  };

  useEffect(() => {
    setUserAndProfile(initialUser);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoading(true);
      setUserAndProfile(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  const value = {
    user,
    role,
    profileData,
    isLoading,
    isAdmin: role === "college_admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
    isStudent: role === "student",
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
