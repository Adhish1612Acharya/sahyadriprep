"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Linkedin, Sparkles } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/20 py-20 px-4">
      <div className="container mx-auto max-w-5xl space-y-20">
        {/* Developer Section */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="flex flex-col md:flex-row items-center gap-6">
            <Image
              src="https://res.cloudinary.com/dfujdlp8e/image/upload/v1762969110/My_image_goskaq.jpg"
              alt="Adhish Profile"
              width={160}
              height={160}
              className="rounded-full object-cover border-4 border-primary/20"
            />
            <div>
              <CardTitle className="text-2xl">
                Meet the Developer — Adhish P Acharya
              </CardTitle>
              <CardDescription>
               Full Stack Developer | RAG & AI Enthusiast
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              I&apos;m <strong>Adhish P Acharya</strong>, a 3rd Year B.E. Computer Science &
              Engineering student at Sahyadri College of Engineering and
              Management. I&apos;m passionate about building full-stack systems and
              integrating AI into practical applications that solve real student
              and industry challenges.
            </p>
            {/* <p>
              I currently serve as the{" "}
              <strong>Tech Lead at Team Challengers</strong> and was previously
              the <strong>Tech Lead for Team Aerofilia</strong>. My focus areas
              include
              <strong> RAG-based architectures</strong>, developing{" "}
              <strong>agentic AI systems</strong>, and experimenting with{" "}
              <strong>MCB server frameworks</strong>,{" "}
              <strong>MCFS tools</strong>, and <strong>HATK systems</strong> for
              adaptive AI environments.
            </p> */}
            <p>
              <strong>Technical Skills:</strong> Next.js, TypeScript, Node.js,
              Express.js, Supabase, Tailwind CSS, RAG-based systems, and agentic
              AI development.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="https://www.linkedin.com/in/adhishpacharya"
                target="_blank"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Linkedin className="h-5 w-5" /> linkedin.com/in/adhishpacharya
              </a>
              <a
                href="mailto:adhisha0505@gmail.com"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-5 w-5" /> adhisha0505@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>
        {/* Intro Section */}
        <section className="text-center space-y-6">
          <Sparkles className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About <span className="text-primary">SahyadriPrep</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            SahyadriPrep is an AI-powered placement preparation platform created
            exclusively for Sahyadri College of Engineering and Management
            students. It brings together verified interview experiences, YouTube
            sessions, and AI-driven insights — helping students prepare smarter
            and more effectively.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Why I Built It */}
        <Card className="shadow-md border-2 border-primary/10">
          <CardHeader>
            <CardTitle>Why I Built It</CardTitle>
            <CardDescription>
              A real problem from our placement journey turned into an
              AI-powered student solution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              During my 3rd year, I noticed that placement-related content —
              from PDFs shared over email to YouTube videos by our Placement
              Officer — was scattered and unorganized. Students struggled to
              keep track of experiences and company insights.
            </p>
            <p>
              I built <strong>SahyadriPrep</strong> to unify all this
              information in one place, powered by AI. The platform uses a
              RAG-based assistant to answer placement queries with source
              transparency and real student data.
            </p>
          </CardContent>
        </Card>

        {/* Tech Stack Section */}
        <Card className="shadow-md border-2 border-primary/10">
          <CardHeader>
            <CardTitle>How I Built It</CardTitle>
            <CardDescription>
              A next-generation AI-powered architecture using Next.js, Supabase,
              and RAG systems.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              The current version of <strong>SahyadriPrep (Cy3)</strong> is
              powered by a modern and scalable stack:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Next.js (TypeScript)</strong> – React-based fullstack
                framework for fast and scalable web apps.
              </li>
              <li>
                <strong>Tailwind CSS</strong> – For responsive, clean, and
                consistent UI design.
              </li>
              <li>
                <strong>Supabase</strong> – Authentication, database, and hybrid
                storage.
              </li>
              <li>
                <strong>ChatGPT + Gemini</strong> – AI for summarization,
                transcript analysis, and conversational responses.
              </li>
              <li>
                <strong>RAG-based System</strong> – Custom-built “Sahyadri
                Coach” chatbot offering context-aware and source-linked answers.
              </li>
              <li>
                <strong>Cloud + Supabase Storage</strong> – Combined handling
                for PDFs and media content.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Ownership Section */}
        {/* <Card className="shadow-md border-2 border-primary/10">
          <CardHeader>
            <CardTitle>Authorship & Ownership</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              This platform — <strong>SahyadriPrep (Cy3)</strong> — is
              conceptualized, designed, and fully developed by{" "}
              <strong>Adhish</strong>. Every part of the project — from the AI
              integrations and RAG pipelines to Supabase backend and file
              management — was built from scratch.
            </p>
            <p>
              No external developer or organization claims authorship of this
              project. It is a 100% original build created with a clear mission
              — to make placement preparation more structured, interactive, and
              AI-assisted for Sahyadri students.
            </p>
          </CardContent>
        </Card> */}

        {/* Vision Section */}
        <Card className="shadow-md border-2 border-primary/10">
          <CardHeader>
            <CardTitle>Future Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              SahyadriPrep will continue evolving into a complete AI-driven
              placement ecosystem, featuring dashboards, analytics and more ...
            </p>
            <p>
              The vision is simple — a platform built{" "}
              <strong>by a student</strong>, <strong>for students</strong>,
              empowering every Sahyadri student to learn directly from real
              experiences and intelligent systems.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
