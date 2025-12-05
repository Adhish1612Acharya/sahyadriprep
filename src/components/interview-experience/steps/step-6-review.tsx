"use client";

import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InterviewExperienceFormValues } from "@/lib/zod/interviewExperience.schema";

export function Step6Review() {
  const formContext = useFormContext();
  const getValues = formContext?.getValues;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // Always call hooks at the top level
  const values = getValues
    ? (getValues() as InterviewExperienceFormValues)
    : ({} as InterviewExperienceFormValues);

  // Handle PDF blob url for resume preview
  useEffect(() => {
    if (!getValues) return;

    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    if (
      values.resume instanceof File &&
      values.resume.type === "application/pdf"
    ) {
      const url = URL.createObjectURL(values.resume);
      setPdfUrl(url);
      prevUrlRef.current = url;
    } else {
      setPdfUrl(null);
    }
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues, values.resume]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Submission</CardTitle>
          <CardDescription>
            Please review all information before submitting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Student Details */}
            <AccordionItem value="student">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold">Student Details</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Name:</span> {values.name}
                  </p>
                  <p>
                    <span className="font-semibold">Branch:</span>{" "}
                    {values.branch}
                  </p>
                  <p>
                    <span className="font-semibold">Batch:</span> {values.batch}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {values.email}
                  </p>
                  {values.linkedin && (
                    <p>
                      <span className="font-semibold">LinkedIn:</span>{" "}
                      <a
                        href={values.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline break-all"
                      >
                        {values.linkedin}
                      </a>
                    </p>
                  )}
                  {values.resume && pdfUrl && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Resume:</span>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition text-xs font-medium"
                        onClick={() =>
                          window.open(pdfUrl, "_blank", "noopener,noreferrer")
                        }
                      >
                        <FileText className="h-4 w-4" />
                        <span>Preview PDF</span>
                      </button>
                      <span className="text-xs text-muted-foreground ml-2">
                        {values.resume.name}
                      </span>
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Company Details */}
            <AccordionItem value="company">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold">Company & Role</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Company:</span>{" "}
                    {values.company}
                  </p>
                  <p>
                    <span className="font-semibold">Role:</span> {values.role}
                  </p>
                  <p>
                    <span className="font-semibold">Type:</span>
                    <Badge className="ml-2" variant="secondary">
                      {values.placementType}
                    </Badge>
                  </p>
                  {values.package && (
                    <p>
                      <span className="font-semibold">Package:</span>{" "}
                      {values.package}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Interview Rounds */}
            <AccordionItem value="rounds">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold">
                  Interview Rounds ({values.rounds?.length || 0})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {values.rounds?.map((round, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-muted rounded text-sm space-y-1"
                    >
                      <p>
                        <span className="font-semibold">
                          {round.roundTitle}
                        </span>
                        <Badge className="ml-2" variant="outline">
                          {round.difficulty}
                        </Badge>
                      </p>
                      <p className="text-muted-foreground">
                        {round.description}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Discussion */}
            <AccordionItem value="discussion">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold">
                  Project & Resume Discussion
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-2">
                    Project Discussion:
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {values.projectDiscussion}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-2">
                    Resume Discussion:
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {values.resumeDiscussion}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tips */}
            <AccordionItem value="tips">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold">Tips for Juniors</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {values.tipsForJuniors}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ All information is ready to be submitted. Click &quot;Submit&quot;
            to share your interview experience with the community.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
