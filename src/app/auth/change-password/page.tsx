"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Loader2, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { updatePassword } from "@/actions/auth.actions";
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

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
      const res = await updatePassword(newPassword);

      if (res.error) {
        setError(res.error || "Failed to update password");
      } else {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => router.push("/settings"), 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password updated successfully. Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || success}
                required
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
                disabled={loading || success}
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

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || success || !isFormValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update password
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/settings")}
                disabled={loading}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
