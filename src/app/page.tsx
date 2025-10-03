import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user exists, get additional profile data from students table
  let studentData = null;
  if (user) {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("id", user.id)
      .single();
    studentData = data;
  }

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

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* User Welcome Section */}
        {user && (
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Welcome Back!
            </h2>
            <div className="space-y-3">
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
                  Joined:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              {studentData?.created_at && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-300">
                    Student Since:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(studentData.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
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
