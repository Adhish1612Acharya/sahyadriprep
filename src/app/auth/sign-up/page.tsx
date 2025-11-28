"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Mail, ArrowRight } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  // Pass a callback to SignupForm to set confirmationEmail after successful signup
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-md">
        {!confirmationEmail ? (
          <>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">
                Create an account
              </CardTitle>
              <CardDescription className="text-center">
                Join SahyadriPrep to start your preparation journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pass redirectUrl and setConfirmationEmail to SignupForm */}
              <SignupForm
                redirectUrl={redirectUrl || undefined}
                onConfirmationEmailSent={setConfirmationEmail}
              />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-center w-full text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={`/auth/login${
                    redirectUrl
                      ? `?redirect=${encodeURIComponent(redirectUrl)}`
                      : ""
                  }`}
                  className="text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center text-green-700">
                Confirmation Email Sent
              </CardTitle>
              <CardDescription className="text-center">
                A confirmation email has been sent to <span className="font-semibold">{confirmationEmail}</span>.<br />
                Please check your inbox and confirm your email to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button asChild className="w-full">
                
                <Link
                  href={`/auth/login${
                    redirectUrl
                      ? `?redirect=${encodeURIComponent(redirectUrl)}`
                      : ""
                  }`}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Login
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("https://mail.google.com", "_blank")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Open Email
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
