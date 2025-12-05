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
import { Loader2, Mail } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "@/actions/auth.actions";
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const success = searchParams.get("success");

    if (error && message) {
      hasShownToast.current = true;
      toast.error(getErrorTitle(error) + ": " + decodeURIComponent(message));
      cleanupUrlParams();
    } else if (success) {
      hasShownToast.current = true;
      toast("Success!", {
        description: getSuccessMessage(success),
      });
      cleanupUrlParams();
    }
  }, []);

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

  // ✅ Get redirect param from URL
  const redirectUrl = searchParams.get("redirect");

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
        // ✅ Redirect to previous page if present
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/");
        }
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
      const result = await signInWithGoogle({
        redirectUrl: redirectUrl || "/",
      });

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
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
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
              href={`/auth/sign-up${
                redirectUrl
                  ? `?redirect=${encodeURIComponent(redirectUrl)}`
                  : ""
              }`}
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
