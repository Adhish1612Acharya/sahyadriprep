"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { resetPasswordWithToken } from "@/actions/auth.actions";
import { validatePassword } from "@/lib/validators/password.validator";

// Reuse PasswordRequirement from signup-form
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
      ) : (
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span
        className={
          met
            ? "text-green-600 dark:text-green-500 font-medium"
            : "text-muted-foreground"
        }
      >
        {text}
      </span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordValidation = useMemo(
    () => validatePassword(newPassword),
    [newPassword]
  );
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  const isFormValid = passwordValidation.isValid && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError("Password does not meet requirements or does not match.");
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
              {/* Password Requirements Checklist */}
              {newPassword && (
                <div className="space-y-1 pt-2">
                  <PasswordRequirement
                    met={passwordValidation.requirements.minLength}
                    text="At least 8 characters"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasLowercase}
                    text="Lowercase letter (a-z)"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasUppercase}
                    text="Uppercase letter (A-Z)"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasDigit}
                    text="Digit (0-9)"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasSymbol}
                    text="Symbol (!@#$%^&*)"
                  />
                </div>
              )}
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
              {/* Password Match Indicator */}
              {confirmPassword && (
                <PasswordRequirement
                  met={passwordsMatch}
                  text={
                    passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"
                  }
                />
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isFormValid}
            >
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
