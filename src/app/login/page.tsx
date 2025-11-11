"use client";

import { LoginForm } from "@/components/auth/login-from";
import { login } from "@/app/login/actions";

export default function Page() {
  return (
    <main className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <LoginForm onLogin={login} />
      </div>
    </main>
  );
}

