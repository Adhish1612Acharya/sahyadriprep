"use client";

import { useParams, useRouter } from "next/navigation";
import { useInterviewExperiences } from "@/hooks/useInterviewExperiences.hook";
import { PDFViewer } from "@/components/pdf-viewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { useState } from "react";

export default function InterviewExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  const { useExperienceQuery, deleteExperience } = useInterviewExperiences();
  const {
    data: experience,
    isLoading,
    isError,
    error,
  } = useExperienceQuery(experienceId);

  console.log("Experience Data:", experience);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    deleteExperience.mutate(experienceId, {
      onSuccess: () => {
        router.push("/admin/interview-experiences");
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
          onClick={() => router.push("/admin/interview-experiences")}
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
          onClick={() => router.push("/admin/interview-experiences")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>

        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteExperience.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interview Experience Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              {experience.document_media?.url && (
                <PDFViewer url={experience.document_media.url} />
              )}
            </CardContent>
          </Card>

          {/* Video Preview */}
          {experience.video_media?.url && (
            <Card>
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
                  src={experience.video_media.url}
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
              {experience.student_name && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Student Name</p>
                    <p className="text-sm text-muted-foreground">
                      {experience.student_name}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Company</p>
                  <div className="flex items-center gap-2 mt-1">
                    {experience.companies?.logo_url && (
                      <img
                        src={experience.companies.logo_url}
                        alt={experience.companies.name}
                        className="h-6 w-6 object-contain"
                      />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {experience.companies?.name}
                    </p>
                  </div>
                  {experience.companies?.industry && (
                    <Badge variant="outline" className="mt-2">
                      {experience.companies.industry}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <School className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">College</p>
                  <p className="text-sm text-muted-foreground">
                    {experience.colleges?.name}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Batch</p>
                  <p className="text-sm text-muted-foreground">
                    {experience.batch}
                  </p>
                </div>
              </div>

              {experience.placed_year && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Placed Year</p>
                      <p className="text-sm text-muted-foreground">
                        {experience.placed_year}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* File Info */}
          <Card>
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.document_media && (
                <div>
                  <p className="text-sm font-medium mb-2">PDF Document</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Name: {experience.document_media.file_name}</p>
                    <p>
                      Size:{" "}
                      {(
                        experience.document_media.file_size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                    <p>Type: {experience.document_media.file_type}</p>
                  </div>
                </div>
              )}

              {experience.video_media && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Video File</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Name: {experience.video_media.file_name}</p>
                      <p>
                        Size:{" "}
                        {(
                          experience.video_media.file_size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                      <p>Type: {experience.video_media.file_type}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p>{new Date(experience.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <p>{new Date(experience.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
