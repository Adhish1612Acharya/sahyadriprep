import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingChatbot from "@/components/floating-chatbot";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context"; // ✅ Import AuthProvider
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

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
          {" "}
          {/* ✅ Wrap with AuthProvider */}
          <QueryProvider>
            <Navbar />
            {children}
            <FloatingChatbot />
            <Footer />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
