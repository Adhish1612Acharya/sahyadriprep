"use client";

import { useAuth } from "@/contexts/auth-context";
import FloatingChatbot from "./floating-chatbot";

/**
 * Conditional Chatbot Wrapper
 * Only renders FloatingChatbot when user is authenticated
 * Optionally restrict by role
 */
export function ConditionalChatbot() {
  const { user, role, isLoading } = useAuth();

  // ✅ Don't render while checking auth status
  if (isLoading) {
    return null;
  }

  // ✅ Only render chatbot if user is logged in
  if (!user) {
    return null;
  }

  // ✅ Optional: Hide for super_admin
  if (role === "super_admin") {
    return null;
  }

  return <FloatingChatbot />;
}
