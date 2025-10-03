"use client";

import { SignupForm } from "@/components/auth/signup-form";
import { signup } from "@/app/signup/actions";

export default function Page() {
  return (
    <main className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <SignupForm onSignUp={signup} />
      </div>
    </main>
  );
}
