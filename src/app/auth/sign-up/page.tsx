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
import { GraduationCap } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-md">
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
          {/* Pass redirectUrl to SignupForm */}
          <SignupForm redirectUrl={redirectUrl || undefined} />
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
      </Card>
    </div>
  );
}
