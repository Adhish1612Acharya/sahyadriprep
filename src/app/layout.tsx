import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ConditionalChatbot } from "@/components/chatbot/conditional-chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sahyadri Prep",
  description: "Interview preparation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            <Navbar />
            {children}
            {/* ✅ Conditional Chatbot - Only shows when user is logged in */}
            <ConditionalChatbot />
            <Footer />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
