"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Chrome } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "@/actions/auth.actions";
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Use ref to prevent duplicate toasts
  const hasShownToast = useRef(false);

  // ✅ Handle URL error/success parameters on mount
  useEffect(() => {
    // ✅ Prevent duplicate toasts in React Strict Mode
    if (hasShownToast.current) return;

    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const success = searchParams.get("success");

    if (error && message) {
      hasShownToast.current = true; // ✅ Mark as shown

      toast.error(getErrorTitle(error) + ": " + decodeURIComponent(message));

      // Clean up URL
      cleanupUrlParams();
    } else if (success) {
      hasShownToast.current = true; // ✅ Mark as shown

      toast("Success!", {
        description: getSuccessMessage(success),
      });

      // Clean up URL
      cleanupUrlParams();
    }
  }, [searchParams, toast]);

  const cleanupUrlParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    url.searchParams.delete("message");
    url.searchParams.delete("success");
    window.history.replaceState({}, "", url.toString());
  };

  const getSuccessMessage = (success: string): string => {
    const successMessages: Record<string, string> = {
      account_created:
        "Account created successfully! Please check your email to verify your account.",
      email_verified: "Email verified successfully! You can now sign in.",
      password_reset:
        "Password reset successfully! You can now sign in with your new password.",
      signed_out: "You have been signed out successfully.",
    };

    return successMessages[success] || decodeURIComponent(success);
  };

  const getErrorTitle = (error: string): string => {
    const errorTitles: Record<string, string> = {
      invalid_email: "Invalid Email",
      invalid_credentials: "Invalid Credentials",
      unauthorized: "Unauthorized Access",
      email_not_verified: "Email Not Verified",
      account_disabled: "Account Disabled",
      too_many_requests: "Too Many Requests",
      server_error: "Server Error",
      oauth_error: "Authentication Error",
      oauth_not_supported: "OAuth Not Supported",
      auth_callback_failed: "Authentication Failed",
      profile_creation_failed: "Profile Creation Failed",
      verification_failed: "Verification Failed",
      recovery_failed: "Password Recovery Failed",
      invalid_college_email: "Invalid College Email",
    };

    return errorTitles[error] || "Authentication Error";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signInWithEmail({ email, password });

      if (result?.error) {
        toast.error("Sign in failed: " + result.error);
      } else {
        toast("Welcome back!", {
          description: "You have successfully signed in.",
        });
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast("Unexpected error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result?.error) {
        toast.error("Google sign in failed: " + result.error);
        setIsLoading(false);
      }
      // Success case redirects automatically via OAuth flow
    } catch (error: any) {
      console.error("Google login error:", error);
      toast("Unexpected error", {
        description: "Failed to sign in with Google. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to SahyadriPrep
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@sahyadri.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Use your college email (@sahyadri.edu.in)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>
            <p className="text-xs text-muted-foreground text-center px-2">
              Use your college email{" "}
              <span className="font-mono text-foreground/80">
                (@sahyadri.edu.in)
              </span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Dont have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
