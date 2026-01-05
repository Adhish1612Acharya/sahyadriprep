import z from "zod/v3";

export const createInterviewExperienceSchema = z.object({
  studentName: z.string().min(2, "Student name must be at least 2 characters"),
  companyId: z.string().uuid("Invalid company ID"),
  batch: z
    .string()
    .regex(
      /^\d{4}-\d{4}$/,
      "Batch must be in format YYYY-YYYY (e.g., 2023-2027)"
    ),
  placedYear: z.number().int().min(2000).max(2100),
  source: z.enum(["admin_upload"]),
});

export const interviewExperienceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  branch: z.string().min(1, "Please select your branch"),
  batch: z.string().min(4, "Please select your batch"),
  email: z.string().email("Invalid email address"),
  linkedin: z.string().url("Invalid URL"),
  resume: z.instanceof(File).nullable().optional(),
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Role name is required"),
  placementType: z.enum(["Internship", "Full-Time", "PPO"], {
    errorMap: () => ({ message: "Please select placement type" }),
  }),
  package: z.string().optional(),
  rounds: z
    .array(
      z.object({
        roundTitle: z.string().min(1, "Round title is required"),
        difficulty: z.enum(["Easy", "Medium", "Hard"]),
        description: z
          .string()
          .min(
            10,
            "Please describe the topics asked in this round and the questions in detail"
          ),
      })
    )
    .min(1, "Add at least one interview round"),
  projectDiscussion: z
    .string()
    .min(10, "Please describe the project discussion in detail"),
  resumeDiscussion: z
    .string()
    .min(10, "Please describe the resume discussion in detail"),
  tipsForJuniors: z
    .string()
    .min(20, "Please provide meaningful tips for juniors in detail"),
});

export type InterviewExperienceFormValues = z.infer<
  typeof interviewExperienceSchema
>;

export type CreateInterviewExperienceInput = z.infer<
  typeof createInterviewExperienceSchema
>;
