"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

interface SignUpFormProps {
  onSignUp: (formData: {
    email: string;
    password: string;
    full_name: string;
  }) => Promise<{ error?: string }>;
}

export function SignupForm({ onSignUp }: SignUpFormProps) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = React.useState(false);

  function validate() {
    const nextErrors: typeof errors = {};
    if (fullName.trim().length < 2)
      nextErrors.fullName = "Full name must be at least 2 characters.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      nextErrors.email = "Enter a valid email address.";
    if (password.length < 8)
      nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      alert("Check your inputs. Please fix the highlighted fields.");
      return;
    }
    try {
      setSubmitting(true);
      console.log("Submitting signup form");
      // Simulate sign up request
      await onSignUp({
        email,
        password,
        full_name:fullName,
      }).then(() => {
        console.log("Signup successful");
      });
      alert("Account created. You can now sign in.");
      // Redirect to login or auto-signin can be placed here
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-balance">Create your account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Join by filling your name, email, and a secure password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-fullname"
              className="text-sm font-medium text-foreground"
            >
              Full name
            </label>
            <Input
              id="signup-fullname"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!errors.fullName}
              aria-describedby={
                errors.fullName ? "signup-fullname-error" : undefined
              }
              required
            />
            {errors.fullName ? (
              <p
                id="signup-fullname-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.fullName}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <Input
              id="signup-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
              required
            />
            {errors.email ? (
              <p
                id="signup-email-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {errors.email}
              </p>
            ) : null}
          </div>

          <PasswordInput
            inputId="signup-password"
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
            required
          />
          {errors.password ? (
            <p
              id="signup-password-error"
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {errors.password}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
