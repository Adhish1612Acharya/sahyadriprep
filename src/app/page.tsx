// src/app/page.tsx
"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  // ✅ Add state for user data
  const [user, setUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ✅ Chat test state
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatResult, setChatResult] = useState<any>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState("What is machine learning?");

  // ✅ Move user fetching to useEffect
  useEffect(() => {
    const initializeUser = async () => {
      const supabase = createClient();

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      // If user exists, get additional profile data from students table
      if (user) {
        const { data } = await supabase
          .from("students")
          .select("*")
          .eq("id", user.id)
          .single();
        setStudentData(data);
      }
    };

    initializeUser();
  }, []);

  // ✅ Test RAG processing API
  const testRagApi = async () => {
    setIsLoading(true);
    setApiError(null);
    setApiResult(null);

    try {
      console.log("🚀 Testing RAG API...");

      const response = await fetch("/api/rag/process", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApiResult(data);
      console.log("✅ RAG API Response:", data);
    } catch (error: any) {
      console.error("❌ RAG API Error:", error);
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Test Chat API
  const testChatApi = async () => {
    setIsChatLoading(true);
    setChatError(null);
    setChatResult(null);

    try {
      console.log("💬 Testing Chat API with message:", testMessage);

      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setChatResult(data);
      console.log("✅ Chat API Response:", data);
    } catch (error: any) {
      console.error("❌ Chat API Error:", error);
      setChatError(error.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Header with user info or auth links */}
      <header className="row-start-1 w-full flex justify-between items-center">
        <div className="text-xl font-bold">SahyadriPrep</div>
        <div className="flex gap-2">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {studentData?.full_name ||
                    user.user_metadata?.full_name ||
                    "User"}
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-4"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        {/* User Welcome Section */}
        {user && (
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Welcome Back!
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Name:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {studentData?.full_name ||
                    user.user_metadata?.full_name ||
                    "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Email:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {user.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  User ID:
                </span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">
                  {user.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  Email Verified:
                </span>
                <span
                  className={`${
                    user.email_confirmed_at ? "text-green-600" : "text-red-600"
                  } font-medium`}
                >
                  {user.email_confirmed_at ? "✓ Verified" : "✗ Not Verified"}
                </span>
              </div>
            </div>

            {/* ✅ API Test Buttons */}
            <div className="space-y-4">
              {/* RAG Processing Test */}
              <div>
                <button
                  onClick={testRagApi}
                  disabled={isLoading}
                  className={`w-full font-medium py-3 px-6 rounded-lg transition-colors ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {isLoading
                    ? "🔄 Testing RAG Processing..."
                    : "🧠 Test RAG Processing"}
                </button>

                {/* RAG API Result Display */}
                {apiResult && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800 mb-2">
                      ✅ RAG Processing Success!
                    </h3>
                    <div className="text-sm text-green-700">
                      <p>
                        <strong>Message:</strong> {apiResult.message}
                      </p>
                      {apiResult.data && (
                        <div className="mt-2">
                          <p>
                            <strong>Chunks:</strong>{" "}
                            {apiResult.data.processing?.chunks_created || 0}
                          </p>
                          <p>
                            <strong>Embeddings:</strong>{" "}
                            {apiResult.data.processing?.embeddings_generated ||
                              0}
                          </p>
                          <p>
                            <strong>Stored:</strong>{" "}
                            {apiResult.data.processing?.chunks_stored || 0}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {apiError && (
                  <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">
                      ❌ RAG Processing Error
                    </h3>
                    <p className="text-sm text-red-700">{apiError}</p>
                  </div>
                )}
              </div>

              {/* Chat Test */}
              <div>
                {/* Test Message Input */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Chat Message:
                  </label>
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your test message..."
                  />
                </div>

                <button
                  onClick={testChatApi}
                  disabled={isChatLoading || !testMessage.trim()}
                  className={`w-full font-medium py-3 px-6 rounded-lg transition-colors ${
                    isChatLoading || !testMessage.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isChatLoading ? "💬 Testing Chat..." : "💬 Test RAG Chat"}
                </button>

                {/* Chat API Result Display */}
                {chatResult && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">
                      ✅ Chat Response!
                    </h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <div>
                        <strong>Response:</strong>
                        <p className="mt-1 text-gray-700 bg-white p-3 rounded border">
                          {chatResult.message}
                        </p>
                      </div>

                      {chatResult.metadata && (
                        <div>
                          <strong>Metadata:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>
                              📄 Relevant chunks:{" "}
                              {chatResult.metadata.relevant_chunks_count}
                            </li>
                            <li>
                              🎯 Context used:{" "}
                              {chatResult.metadata.context_used ? "Yes" : "No"}
                            </li>
                            {chatResult.metadata.sources &&
                              chatResult.metadata.sources.length > 0 && (
                                <li>
                                  📚 Sources:
                                  <ul className="ml-4 mt-1">
                                    {chatResult.metadata.sources.map(
                                      (source: any, index: number) => (
                                        <li key={index} className="text-xs">
                                          • {source.document_title} (similarity:{" "}
                                          {source.similarity})
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </li>
                              )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-2">
                      ❌ Chat Error
                    </h3>
                    <p className="text-sm text-red-700">{chatError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
