"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-muted/20 py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center space-y-10">
        {/* Header Section */}
        <section>
          <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have feedback, suggestions, or collaboration ideas? We’d love to
            hear from you! Reach out to us using the official SahyadriPrep email
            below.
          </p>
        </section>

        {/* Contact Info Card */}
        <Card className="shadow-lg border-2 border-primary/10 max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Official Contact Email</CardTitle>
            <CardDescription>
              Reach out to the developer directly via email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <Mail className="h-8 w-8 text-primary" />
              <a
                href="mailto:sahyadriprep@gmail.com"
                className="text-primary text-xl font-semibold hover:underline"
              >
                sahyadriprep@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="shadow-md border-2 border-primary/10">
          <CardHeader>
            <CardTitle>Developed & Maintained By</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              <strong>Adhish</strong> — 3rd Year B.E. Computer Science &
              Engineering student at Sahyadri College of Engineering &
              Management.
            </p>
            <p>
              I’m passionate about building full-stack and AI-driven systems
              that simplify complex workflows. SahyadriPrep is a student-built
              initiative designed to make placement preparation smarter and more
              efficient.
            </p>
          </CardContent>
        </Card>

        {/* Coming Soon Section */}
        <Card className="shadow-md border-2 border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              A contact form will be added soon for students and collaborators
              to share feedback directly on the platform. Until then, feel free
              to reach out via the official email above.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-sm text-muted-foreground pt-6">
          Built using Next.js, ShadCN UI, and Supabase.
        </p>
      </div>
    </div>
  );
}
