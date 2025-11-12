"use client";

import {  useState } from "react";
import { useRouter} from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Lock,
  CheckCircle,
} from "lucide-react";
import {
  resetPasswordWithToken,
} from "@/actions/auth.actions";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordWithToken(newPassword, confirmPassword);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state - Verifying token
  // if (verifying) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center p-4">
  //       <Card className="w-full max-w-md">
  //         <CardHeader className="text-center">
  //           <CardTitle>Verifying Reset Link</CardTitle>
  //           <CardDescription>
  //             Please wait while we verify your reset session...
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent className="py-8">
  //           <div className="flex flex-col items-center space-y-4">
  //             <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //             <p className="text-sm text-muted-foreground">Verifying...</p>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  // ✅ Invalid token state
  // if (!isValid) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center p-4">
  //       <Card className="w-full max-w-md">
  //         <CardHeader className="text-center">
  //           <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
  //             <AlertCircle className="h-6 w-6 text-destructive" />
  //           </div>
  //           <CardTitle>Invalid Reset Link</CardTitle>
  //           <CardDescription>
  //             This password reset link is invalid or has expired
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           <Alert variant="destructive">
  //             <AlertCircle className="h-4 w-4" />
  //             <AlertDescription>{error}</AlertDescription>
  //           </Alert>

  //           <div className="flex flex-col gap-2">
  //             <Button asChild className="w-full">
  //               <Link href="/auth/forgot-password">Request New Link</Link>
  //             </Button>
  //             <Button variant="outline" asChild className="w-full">
  //               <Link href="/auth/login">
  //                 <ArrowLeft className="mr-2 h-4 w-4" />
  //                 Back to Login
  //               </Link>
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  // ✅ Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>Your password has been updated</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-primary/10 text-primary border-primary/20">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your password has been reset successfully. Redirecting to
                login...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Valid token - Show password reset form
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
