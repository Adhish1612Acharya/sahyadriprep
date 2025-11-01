"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Video,
  Users,
  ArrowRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  const adminActions = [
    {
      title: "Manage Companies",
      description: "Add, edit, and view companies that visited the college",
      icon: Building2,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/companies",
      stats: "12 companies",
    },
    {
      title: "Add PDF Experience",
      description: "Upload interview experience PDFs from students",
      icon: FileText,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      href: "/admin/interview-experiences/add",
      stats: "45 experiences",
    },
    {
      title: "Add Video Experience",
      description: "Upload video interviews from placement officers",
      icon: Video,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      href: "/admin/interview-experiences/youtube/add",
      stats: "23 videos",
    },
    {
      title: "View Students",
      description: "See all students registered on the platform",
      icon: Users,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/admin/students",
      stats: "234 students",
    },
  ];

  const quickStats = [
    {
      label: "Total Companies",
      value: "12",
      change: "+3 this month",
      trend: "up",
    },
    {
      label: "Total Experiences",
      value: "68",
      change: "+12 this month",
      trend: "up",
    },
    {
      label: "Active Students",
      value: "234",
      change: "+45 this month",
      trend: "up",
    },
    {
      label: "Placement Rate",
      value: "87%",
      change: "+5% from last year",
      trend: "up",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage companies, experiences, and student data
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => router.push(action.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-lg ${action.bgColor} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-6 w-6 ${action.iconColor}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-xl">{action.title}</CardTitle>
                <CardDescription className="text-base">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {action.stats}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "New company added",
                company: "Google",
                time: "2 hours ago",
                type: "company",
              },
              {
                action: "PDF experience uploaded",
                company: "Microsoft - Round 1",
                time: "5 hours ago",
                type: "pdf",
              },
              {
                action: "Video interview added",
                company: "Amazon - Full Interview",
                time: "1 day ago",
                type: "video",
              },
              {
                action: "New student registered",
                company: "John Doe",
                time: "2 days ago",
                type: "student",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === "company"
                        ? "bg-blue-50"
                        : activity.type === "pdf"
                        ? "bg-green-50"
                        : activity.type === "video"
                        ? "bg-red-50"
                        : "bg-purple-50"
                    }`}
                  >
                    {activity.type === "company" && (
                      <Building2 className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === "pdf" && (
                      <FileText className="h-4 w-4 text-green-600" />
                    )}
                    {activity.type === "video" && (
                      <Video className="h-4 w-4 text-red-600" />
                    )}
                    {activity.type === "student" && (
                      <Users className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.company}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
