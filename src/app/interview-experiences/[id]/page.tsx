"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  School,
  Calendar,
  FileText,
  Video as VideoIcon,
  Trash2,
  AlertCircle,
  User,
  Download,
} from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import dynamic from "next/dynamic";
import { useInterviewExperiences } from "@/hooks/useInterviewExperiences.hook";
import Image from "next/image";
import axios from "axios";

const DynamicPDFViewer = dynamic(
  () => import("@/components/pdf-viewer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  },
);

export default function InterviewExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  const { isAdmin } = useAuth();

  const { useExperienceQuery, deleteExperience } = useInterviewExperiences();
  const {
    data: experience,
    isLoading,
    isError,
    error,
  } = useExperienceQuery(experienceId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ✅ Ref for video section
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // ✅ Scroll to video section
  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ✅ Download PDF from Cloudinary
  const handleDownloadPDF = async () => {
    if (!experience?.documentMedia?.url) return;

    setIsDownloading(true);
    try {
      const response = await axios.get(experience.documentMedia.url, {
        responseType: "blob",
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        experience.companyDetails?.name || "Interview"
      }_Experience_${experience.seniorStudent?.name || experience.seniorStudent?.batch}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      window.open(experience.documentMedia.url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    deleteExperience.mutate(experienceId, {
      onSuccess: () => {
        router.push("/interview-experiences");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !experience) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Failed to load interview experience"}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/interview-experiences")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/interview-experiences")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>

        {isAdmin && (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteExperience.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && isAdmin && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Are you sure you want to delete this experience?</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteExperience.isPending}
              >
                Confirm Delete
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* PDF Viewer */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  Interview Experience Document
                </CardTitle>

                {/* ✅ Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Download PDF Button */}
                  {experience.documentMedia?.url && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="font-semibold flex items-center gap-2 shadow"
                    >
                      {isDownloading ? (
                        <>
                          <Download className="h-4 w-4 mr-2 animate-pulse" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  )}

                  {/* ✅ View Video Button (only if video exists) */}
                  {experience.videoMedia?.url && (
                    <Button
                      variant="default"
                      onClick={scrollToVideo}
                      size="lg"
                      className="font-semibold flex items-center gap-2 shadow"
                    >
                      <VideoIcon className="h-4 w-4 mr-2" />
                      View Video Overview
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {experience.documentMedia?.url && (
                <DynamicPDFViewer url={experience.documentMedia.url} />
              )}
            </CardContent>
          </Card>

          {/* ✅ Video Preview with ref */}
          {experience.videoMedia?.url && (
            <Card ref={videoSectionRef} className="scroll-mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <VideoIcon className="h-5 w-5" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <video
                  controls
                  className="w-full rounded-lg"
                  src={experience.videoMedia.url}
                >
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.seniorStudent.name && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Student Name</p>
                    <p className="text-sm text-muted-foreground">
                      {experience.seniorStudent.name}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Company</p>
                  <div className="flex items-center gap-2 mt-1">
                    {experience.companyDetails?.logoUrl && (
                      <Image
                        src={experience.companyDetails.logoUrl}
                        alt={experience.companyDetails.name}
                        width={24}
                        height={24}
                        className="flex-shrink-0"
                      />
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {experience.companyDetails?.name}
                    </p>
                  </div>
                  {experience.companyDetails?.industry && (
                    <Badge variant="outline" className="mt-2">
                      {experience.companyDetails.industry}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <School className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">College</p>
                  <p className="text-sm text-muted-foreground break-words">
                    {experience.collegeDetails?.name}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Batch</p>
                  <p className="text-sm text-muted-foreground">
                    {experience.seniorStudent.batch}
                  </p>
                </div>
              </div>

              {experience.seniorStudent.placedYear && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Placed Year</p>
                      <p className="text-sm text-muted-foreground">
                        {experience.seniorStudent.placedYear}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(experience.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(experience.updatedAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Quick Actions Card (Desktop) */}
          {experience.videoMedia?.url && (
            <Card className="hidden lg:block">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToVideo}
                  className="w-full"
                >
                  <VideoIcon className="h-4 w-4 mr-2" />
                  Jump to Video
                </Button>
                {experience.documentMedia?.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full"
                  >
                    {isDownloading ? (
                      <>
                        <Download className="h-4 w-4 mr-2 animate-pulse" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
