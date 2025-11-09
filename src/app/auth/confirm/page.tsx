"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { confirmEmail } from "@/actions/auth.actions";
import Link from "next/link";

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Get access token from URL
        // ✅ Get token_hash and type from URL (PKCE flow)
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const next = searchParams.get("next") || "/";

        if (!tokenHash) {
          setStatus("error");
          setMessage(
            "Missing confirmation token. Please use the link from your email."
          );
          setIsVerifying(false);
          return;
        }

        if (type !== "signup" && type !== "email_change" && type !== "email") {
          setStatus("error");
          setMessage("Invalid confirmation link type.");
          setIsVerifying(false);
          return;
        }

        console.log("🔄 Confirming email with token...");

        // Confirm email using server action
        const result = await confirmEmail(tokenHash, type);

        if (result.error) {
          setStatus("error");
          setMessage(result.error);
          setIsVerifying(false);
          return;
        }

        console.log("✅ Email confirmed successfully");
        setStatus("success");
        setMessage("Email confirmed successfully! Redirecting...");
        setIsVerifying(false);

        // Redirect after 2 seconds
        // setTimeout(() => {
        //   router.push(next);
        // }, 2000);
      } catch (error: any) {
        console.error("❌ Confirmation error:", error);
        setStatus("error");
        setMessage(
          error.message || "Failed to confirm email. Please try again."
        );
        setIsVerifying(false);
      }
    };

    handleConfirmation();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Email Confirmation</CardTitle>
          <CardDescription>
            {isVerifying
              ? "Verifying your email address..."
              : "Confirmation Status"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Confirming your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <Alert className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              <div className="flex flex-col items-center space-y-2 py-4">
                <CheckCircle className="h-16 w-16 text-primary" />
                <p className="text-sm text-center text-muted-foreground">
                  Your email has been verified successfully
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              <div className="flex flex-col items-center space-y-4 py-4">
                <AlertCircle className="h-16 w-16 text-destructive" />
                <p className="text-sm text-center text-muted-foreground">
                  Please try again or request a new confirmation email
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/register">Request New Link</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
