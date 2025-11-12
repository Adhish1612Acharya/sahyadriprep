"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: {
  email: string;
  password: string;
  full_name: string;
}) {

  const supabase = await createClient();

  // Extract form data
  const data = {
    email: formData.email,
    password: formData.password,
    full_name: formData.full_name,
  };

 
  // Validate required fields
  if (!data.email || !data.password) {
    return { error: "Email and password are required" };
  }

  // if (!data.options.data.full_name) {
  //   return { error: "Full name is required" };
  // }

  // Validate password strength
  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { error: "Please enter a valid email address" };
  }

  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp(
      data
    );

    if (authError) {
      console.error("Signup error:", authError);

      // Handle specific Supabase errors
      if (authError.message.includes("User already registered")) {
        return { error: "An account with this email already exists" };
      }

      if (authError.message.includes("Password should be at least")) {
        return { error: "Password should be at least 6 characters long" };
      }

      if (authError.message.includes("Invalid email")) {
        return { error: "Please enter a valid email address" };
      }

      return { error: authError.message };
    }

  

    if (!authData || !authData.user) {
      return { error: "Signup failed. Please try again." };
    }

    // Check if user was created successfully
    if (authData.user) {
      // Create student record with the user's ID
      const { error: studentError } = await supabase.from("students").insert([
        {
          id: authData.user.id, // Use the auth user ID as the student ID
          full_name: formData.full_name as string,
          email: data.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add any other default student fields here
          // enrollment_status: 'active',
          // profile_completed: false,
        },
      ]);

      if (studentError) {
        console.error("Error creating student record:", studentError);

        // If student creation fails, we might want to clean up the auth user
        // However, this is complex and might be better handled with database triggers
        // For now, we'll just log the error and continue
        console.error(
          "Student record creation failed, but user was created successfully"
        );

        // You might want to return an error here depending on your requirements
        // return { error: "Account created but profile setup failed. Please contact support." };
      }
    }

    // Revalidate the cache and redirect
    revalidatePath("/signup", "layout");
  } catch (error) {
    console.error("Unexpected signup error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }

  // Redirect to confirmation page or login page
  redirect("/login?message=Check your email to confirm your account");
}
