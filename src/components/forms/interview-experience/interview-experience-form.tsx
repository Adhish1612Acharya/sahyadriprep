"use client";

import type React from "react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Step0StudentDetails } from "./steps/step-0-student-details";
import { Step1CompanyDetails } from "./steps/step-1-company-details";
import { Step2InterviewRounds } from "./steps/step-2-interview-rounds";
import { Step3ProjectDiscussion } from "./steps/step-3-project-discussion";
import { Step4Tips } from "./steps/step-4-tips";
import { Step5ResumeUpload } from "./steps/step-5-resume-upload";
import { Step6Review } from "./steps/step-6-review";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  InterviewExperienceFormValues,
  interviewExperienceSchema,
} from "@/lib/zod/schema/interview-experience.schema";
import { Stepper } from "./form-stepper";
import { ChatGPTFillButton } from "./chat-gpt-fill-button";
import { ChatGPTImportSection } from "./chat-gpt-import-section";
import { useInterviewExperiences } from "@/hooks/useInterviewExperiences.hook";

const steps = [
  { title: "Your Details" },
  { title: "Company" },
  { title: "Interview" },
  { title: "Project" },
  { title: "Tips" },
  { title: "Resume" },
  { title: "Review" },
];

export const InterviewExperienceForm: React.FC = () => {
  const { sendExperience } = useInterviewExperiences();

  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<InterviewExperienceFormValues>({
    resolver: zodResolver(interviewExperienceSchema),
    defaultValues: {
      name: "",
      branch: "",
      batch: "",
      email: "",
      linkedin: "",
      company: "",
      role: "",
      placementType: "Full-Time",
      package: "",
      rounds: [{ roundTitle: "", difficulty: "Medium", description: "" }],
      projectDiscussion: "",
      resumeDiscussion: "",
      tipsForJuniors: "",
    },
    mode: "onTouched",
  });

  const { handleSubmit, trigger, formState } = methods;

  const onNext = async () => {
    const fieldsToValidate: (keyof InterviewExperienceFormValues)[] = [];

    if (currentStep === 0) {
      fieldsToValidate.push("name", "branch", "batch", "email");
    } else if (currentStep === 1) {
      fieldsToValidate.push("company", "role", "placementType");
    } else if (currentStep === 2) {
      fieldsToValidate.push("rounds");
    } else if (currentStep === 3) {
      fieldsToValidate.push("projectDiscussion", "resumeDiscussion");
    } else if (currentStep === 4) {
      fieldsToValidate.push("tipsForJuniors");
    }

    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  const onPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: InterviewExperienceFormValues) => {
    try {
      console.log("Submitting interview experience:", data);
      await sendExperience.mutateAsync(data);
      toast.success("Interview experience submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mb-8 flex flex-col gap-4 items-center">
        {/* AI-Assisted Form Filling */}
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
          <div className="border rounded-lg p-4 bg-muted/40">
            <h3 className="font-semibold mb-2 text-lg">
              Smart AI-Assisted Form Filling
            </h3>
            <div className="flex flex-col gap-4">
              {/* Button to copy prompt and open ChatGPT */}
              <ChatGPTFillButton />
              {/* Section to paste JSON and autofill */}
              <ChatGPTImportSection />
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Stepper steps={steps} currentStep={currentStep} />

        <div className="animate-in fade-in duration-500">
          {currentStep === 0 && <Step0StudentDetails />}
          {currentStep === 1 && <Step1CompanyDetails />}
          {currentStep === 2 && <Step2InterviewRounds />}
          {currentStep === 3 && <Step3ProjectDiscussion />}
          {currentStep === 4 && <Step4Tips />}
          {currentStep === 5 && <Step5ResumeUpload />}
          {currentStep === 6 && <Step6Review />}
        </div>

        <div className="flex gap-4 pt-8 border-t">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              className="px-8 bg-transparent"
            >
              Previous
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button type="button" onClick={onNext} className="ml-auto px-8">
              Next
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="ml-auto px-8"
            >
              {formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
