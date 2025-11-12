"use client";

import { Suspense, useEffect, useState } from "react";
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

// ✅ Disable static generation
export const dynamic = "force-dynamic";

function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
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

        if (
          type !== "signup" &&
          type !== "email_change" &&
          type !== "email" &&
          type !== "recovery"
        ) {
          console.log("❌ Invalid confirmation link type:", type);
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
        setTimeout(() => {
          window.location.href = next;
        }, 2000);
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
  }, []);

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
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              <div className="flex flex-col items-center space-y-2 py-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
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

// ✅ Wrap in Suspense boundary
export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading confirmation page...
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ConfirmPageContent />
    </Suspense>
  );
}
