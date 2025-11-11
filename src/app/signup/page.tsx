"use client";

import { SignupForm } from "@/components/auth/signup-form";

export default function Page() {
  return (
    <main className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </main>
  );
}
