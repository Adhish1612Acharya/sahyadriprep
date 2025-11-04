"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle, User, Shield } from "lucide-react";
import { useAuthService } from "@/hooks/useAuth.hook";
import { signInWithGoogle } from "@/actions/auth.actions";

export function SignupForm() {

  const { signupWithEmail } = useAuthService();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "college_admin",
  });

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    console.log("Signing up with role:", formData.role);

    await signupWithEmail.mutateAsync({
      email: formData.email,
      password: formData.password,
      role: formData.role, // ✅ Include role
      college_id: null, // For now, sahyadri by default
    });
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      // Pass role and college_id directly to the OAuth function
      await signInWithGoogle({
        role: formData.role,
        college_id: null, // For now, sahyadri by default
      });
    } catch (err: any) {
      console.error("Google signup error:", err);
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const passwordError =
    formData.confirmPassword && !passwordsMatch
      ? "Passwords do not match"
      : formData.password && formData.password.length < 6
      ? "Password must be at least 6 characters"
      : null;

  const emailDomainHint =
    formData.role === "student"
      ? "Use your college email (@sahyadri.edu.in)"
      : "Use your institutional email";

  return (
    <form onSubmit={handleEmailSignup} className="space-y-4">
      {/* Role Selection */}
      <div className="space-y-3">
        <Label>I am a</Label>
        <RadioGroup
          value={formData.role}
          onValueChange={(value: "student" | "college_admin") =>
            setFormData({ ...formData, role: value })
          }
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem
              value="student"
              id="student"
              className="peer sr-only"
            />
            <Label
              htmlFor="student"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <User className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Student</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="college_admin"
              id="college_admin"
              className="peer sr-only"
            />
            <Label
              htmlFor="college_admin"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Shield className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">College Admin</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

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
          minLength={6}
          disabled={signupWithEmail.isPending || loading}
        />
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
        {passwordError && (
          <p className="text-xs text-destructive">{passwordError}</p>
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
        disabled={
          signupWithEmail.isPending ||
          loading ||
          !passwordsMatch ||
          formData.password.length < 6
        }
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

      {/* Google Signup (only for students) */}
      {formData.role === "student" && (
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
      )}
    </form>
  );
}
