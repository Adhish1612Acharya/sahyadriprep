import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ConditionalChatbot } from "@/components/chatbot/conditional-chatbot";
import { Toaster } from "sonner";
import { getCurrentUserForLayout } from "@/lib/services/auth/auth-session.service";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sahyadri Prep",
  description: "Interview preparation platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserForLayout();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider initialUser={user}>
          <QueryProvider>
            <Navbar />
            {children}
            <Toaster position="top-center" expand={true} />
            {/* ✅ Conditional Chatbot - Only shows when user is logged in */}
            <ConditionalChatbot />
            <Footer />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
