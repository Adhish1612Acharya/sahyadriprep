import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingChatbot from "@/components/floating-chatbot";
import { QueryProvider } from "@/providers/query-provider";

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
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <FloatingChatbot />
        </QueryProvider>
      </body>
    </html>
  );
}
