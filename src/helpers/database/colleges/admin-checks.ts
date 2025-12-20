import { createClient } from "@/lib/supabase/server";

/**
 * Check if a college already has an admin
 * @param collegeId - College ID to check
 * @returns Boolean indicating if college has an admin, and the admin details if exists
 */
export async function collegeHasAdmin(collegeId: string): Promise<{
  hasAdmin: boolean;
  admin?: {
    id: string;
    full_name: string;
    email: string;
    designation: string | null;
  };
}> {
  try {
    const supabase = await createClient();

    console.log(`🔍 Checking if college has admin: ${collegeId}`);

    const { data: adminProfile, error } = await supabase
      .from("college_admin_profiles")
      .select("id, full_name, email, designation")
      .eq("college_id", collegeId)
      .single();

    if (error) {
      // If error is "PGRST116" (no rows), it means no admin exists
      if (error.code === "PGRST116") {
        console.log(`✅ No admin found for college: ${collegeId}`);
        return { hasAdmin: false };
      }

      // Other errors
      console.error("❌ Error checking college admin:", error);
      return { hasAdmin: false };
    }

    if (adminProfile) {
      console.log(`✅ College admin found: ${adminProfile.email}`);
      return {
        hasAdmin: true,
        admin: {
          id: adminProfile.id,
          full_name: adminProfile.full_name,
          email: adminProfile.email,
          designation: adminProfile.designation,
        },
      };
    }

    return { hasAdmin: false };
  } catch (e: any) {
    console.error("❌ Unexpected error in collegeHasAdmin:", e);
    return { hasAdmin: false };
  }
}

/**
 * Get the admin for a specific college
 * Returns null if no admin exists
 * @param collegeId - College ID
 * @returns Admin profile or null
 */
export async function getCollegeAdmin(collegeId: string): Promise<{
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  department: string | null;
  employee_id: string | null;
} | null> {
  try {
    const supabase = await createClient();

    console.log(`🔍 Fetching admin for college: ${collegeId}`);

    const { data: adminProfile, error } = await supabase
      .from("college_admin_profiles")
      .select("*")
      .eq("college_id", collegeId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.log(`✅ No admin found for college: ${collegeId}`);
        return null;
      }

      console.error("❌ Error fetching college admin:", error);
      return null;
    }

    console.log(`✅ College admin found: ${adminProfile.email}`);

    return adminProfile;
  } catch (e: any) {
    console.error("❌ Unexpected error in getCollegeAdmin:", e);
    return null;
  }
}
