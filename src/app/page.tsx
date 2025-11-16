"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  CheckCircle,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Your Gateway to Career Success
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
               Ace your interviews with {" "}
              <span className="text-primary">real experiences</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Learn from interview experiences shared by Your Seniors. Prepare
              smarter, not harder with AI-powered insights and personalized
              guidance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/interview-experiences">
                  Explore Experiences
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  asChild
                >
                  <Link href="/auth/sign-up">Get Started Free</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Smarter preparation through real experiences, AI-powered insights,
              and curated learning from your own college ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interview Experiences</CardTitle>
                <CardDescription>
                  Access verified interview experiences shared by seniors
                  through our placement cell — all in one place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Round-by-round interview insights
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      AI-generated video previews for quick understanding
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Search by company, branch, or role
                    </span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/interview-experiences")}
                >
                  View
                </Button>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sahyadri Coach (AI Assistant)</CardTitle>
                <CardDescription>
                  Your RAG-based AI placement assistant — ask anything about
                  interview preparation and get answers backed by sources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Ask any company-specific questions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Answers linked to verified PDF or YouTube sources
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Personalized and transparent guidance
                    </span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (user) {
                      window.dispatchEvent(new CustomEvent("open-chatbot"));
                    } else {
                      router.push("/auth/login");
                    }
                  }}
                >
                  View
                </Button>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>YouTube Interview Sessions</CardTitle>
                <CardDescription>
                  Explore placement officer’s official YouTube sessions with
                  AI-based features for quick learning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      AI-generated video summaries and key takeaways
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Segment division based on transcript
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Auto-generated flashcards and tips
                    </span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/interview-experiences/youtube")}
                >
                  View
                </Button>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-primary/50 transition-colors flex flex-col justify-between">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Explore Companies</CardTitle>
                <CardDescription>
                  View companies for which verified placement experiences and
                  content are available. Discover insights and resources
                  tailored for Sahyadri students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Company-wise interview experiences
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Search and filter by company
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">
                      Insights tailored for Sahyadri students
                    </span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/companies")}
                >
                  View
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How SahyadriPrep Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to kickstart your interview preparation journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up Free</h3>
              <p className="text-muted-foreground">
                Create your account in seconds and get instant access to all
                resources
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Explore & Learn</h3>
              <p className="text-muted-foreground">
                Browse through experiences, watch tutorials, and chat with our
                AI coach
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ace Your Interview</h3>
              <p className="text-muted-foreground">
                Apply your learnings and land your dream job with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="py-12 px-6 md:px-12">
              <div className="flex flex-col items-center text-center space-y-6">
                <Target className="h-16 w-16 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Join students who are preparing smarter with SahyadriPrep. Get
                  access to exclusive content and personalized guidance today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {!user && (
                    <Button size="lg" className="text-lg px-8" asChild>
                      <Link href="/auth/sign-up">
                        Create Free Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8"
                    asChild
                  >
                    <Link href="/interview-experiences">
                      Browse Experiences
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
