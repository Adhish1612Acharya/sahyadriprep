"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { useAuthService } from "@/hooks/useAuth.hook";
import { signInWithGoogle } from "@/actions/auth.actions";
import { validatePassword } from "@/lib/validators/password.validator";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const { signupWithEmail } = useAuthService();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "college_admin",
  });

  // ✅ Password validation using helper
  const passwordValidation = useMemo(() => {
    return validatePassword(formData.password);
  }, [formData.password]);

  // ✅ Check if passwords match
  const passwordsMatch = useMemo(() => {
    return (
      formData.password === formData.confirmPassword &&
      formData.confirmPassword !== ""
    );
  }, [formData.password, formData.confirmPassword]);

  // ✅ Overall form validity
  const isFormValid = useMemo(() => {
    return passwordValidation.isValid && passwordsMatch && formData.email;
  }, [passwordValidation.isValid, passwordsMatch, formData.email]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    console.log("Signing up with role:", formData.role);

    await signupWithEmail.mutateAsync({
      email: formData.email,
      password: formData.password,
      role: "student",
      college_id: null,
    });
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      await signInWithGoogle({
        role: "student",
        college_id: null,
      });
    } catch (err: any) {
      console.error("Google signup error:", err);
      setLoading(false);
    }
  };

  const emailDomainHint =
    formData.role === "student"
      ? "Use your college email (@sahyadri.edu.in)"
      : "Use your institutional email";

  return (
    <form onSubmit={handleEmailSignup} className="space-y-4">
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder={
            formData.role === "student"
              ? "yourname@sahyadri.edu.in"
              : "admin@sahyadri.edu.in"
          }
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={signupWithEmail.isPending || loading}
        />
        <p className="text-xs text-muted-foreground">{emailDomainHint}</p>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          disabled={signupWithEmail.isPending || loading}
        />

        {/* ✅ Password Requirements Checklist */}
        {formData.password && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground">
              Password must contain:
            </p>
            <div className="space-y-1">
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
          </div>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
          disabled={signupWithEmail.isPending || loading}
        />

        {/* ✅ Password Match Indicator */}
        {formData.confirmPassword && (
          <PasswordRequirement
            met={passwordsMatch}
            text={passwordsMatch ? "Passwords match" : "Passwords do not match"}
          />
        )}
      </div>

      {/* Error Alert */}
      {signupWithEmail.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {signupWithEmail.error?.message || "Sign up failed"}
          </AlertDescription>
        </Alert>
      )}

      {/* Email Signup Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={signupWithEmail.isPending || loading || !isFormValid}
      >
        {signupWithEmail.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Google Signup */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={signupWithEmail.isPending || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
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
    </form>
  );
}

// ✅ Password Requirement Component
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
      ) : (
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span
        className={cn(
          "transition-colors",
          met
            ? "text-green-600 dark:text-green-500 font-medium"
            : "text-muted-foreground"
        )}
      >
        {text}
      </span>
    </div>
  );
}
