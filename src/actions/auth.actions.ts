"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUpWithEmail(formData: {
  email: string;
  password: string;
  role: "student" | "college_admin";
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        role: formData.role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create profile entry
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      role: formData.role,
      profile_completed: false,
    });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  revalidatePath("/", "layout");
  return { success: true, data };
}

export async function signInWithEmail(formData: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, data };
}

export async function signInWithGoogle(options?: {
  role?: "student" | "college_admin";
  college_id?: string | null;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      // Pass role and college_id as query params (will be in user_metadata after auth)
      queryParams: {
        role: options?.role || "student",
        college_id: options?.college_id || "",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function completeStudentProfile(formData: {
  full_name: string;
  phone?: string;
  college_id: string;
  usn: string;
  batch: string;
  branch: string;
  current_semester?: number;
  current_cgpa?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Insert into student_profiles - id is same as user.id
  const { error: profileError } = await supabase
    .from("student_profiles")
    .insert({
      id: user.id, // ✅ Use user.id directly
      full_name: formData.full_name,
      email: user.email!,
      phone: formData.phone,
      college_id: formData.college_id,
      usn: formData.usn,
      batch: formData.batch,
      branch: formData.branch,
      current_semester: formData.current_semester,
      current_cgpa: formData.current_cgpa,
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Mark profile as completed
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ profile_completed: true })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function completeAdminProfile(formData: {
  full_name: string;
  phone?: string;
  college_id: string;
  designation: string;
  department?: string;
  employee_id?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Insert into college_admin_profiles - id is same as user.id
  const { error: profileError } = await supabase
    .from("college_admin_profiles")
    .insert({
      id: user.id, // ✅ Use user.id directly
      full_name: formData.full_name,
      email: user.email!,
      phone: formData.phone,
      college_id: formData.college_id,
      designation: formData.designation,
      department: formData.department,
      employee_id: formData.employee_id,
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Mark profile as completed
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ profile_completed: true })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function checkProfileCompletion() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isComplete: false, redirectTo: "/auth/login" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, profile_completed")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { isComplete: false, redirectTo: "/auth/complete-profile" };
  }

  if (!profile.profile_completed) {
    return { isComplete: false, redirectTo: "/auth/complete-profile" };
  }

  const redirectMap = {
    student: "/",
    college_admin: "/",
    super_admin: "/",
  };

  return {
    isComplete: true,
    redirectTo:
      redirectMap[profile.role as keyof typeof redirectMap] || "/dashboard",
  };
}
