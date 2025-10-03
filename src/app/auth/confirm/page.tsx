"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const confirmAuth = async () => {
      try {
        // Extract parameters from URL
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const next = searchParams.get("next") || "/";

        if (!tokenHash || !type) {
          setStatus("error");
          setMessage("Missing required parameters for confirmation.");
          return;
        }

        // Make API call to the confirmation route
        await axios.get("/api/auth/confirm", {
          params: {
            token_hash: tokenHash,
            type: type,
            next: next,
          },
        });

        // If successful, the API route will redirect
        // But in case we reach here, it means confirmation was successful
        setStatus("success");
        setMessage("Email confirmed successfully! Redirecting...");

        // Redirect after a short delay
        setTimeout(() => {
          router.push(next);
        }, 2000);
      } catch (error: unknown) {
        console.error("Confirmation error:", error);
        setStatus("error");

        // Handle specific error cases
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 400) {
            setMessage("Invalid or expired confirmation link.");
          } else if (error.response?.status === 404) {
            setMessage("Confirmation endpoint not found.");
          } else {
            setMessage(
              "An error occurred during confirmation. Please try again."
            );
          }
        } else {
          setMessage("An unexpected error occurred. Please try again.");
        }
      }
    };

    confirmAuth();
  }, [searchParams, router]);

  const handleRetry = () => {
    setStatus("loading");
    setMessage("");
    // Re-trigger the confirmation process
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Confirmation
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          {status === "loading" && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">
                Confirming your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Success!
              </h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Confirmation Failed
              </h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>

              <div className="mt-6 flex flex-col space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={handleGoHome}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
