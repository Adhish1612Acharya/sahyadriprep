import z from "zod/v3";

export const createInterviewExperienceSchema = z
  .object({
    student_name: z
      .string()
      .min(2, "Student name must be at least 2 characters"),
    college_id: z.string().uuid("Invalid college ID"),
    company_id: z.string().uuid("Invalid company ID"),
    batch: z
      .string()
      .regex(
        /^\d{4}-\d{4}$/,
        "Batch must be in format YYYY-YYYY (e.g., 2023-2027)"
      ),
    placed_year: z.number().int().min(2000).max(2100),
    source: z.enum(["admin_upload"]),
    // position: z.string().optional(),
    // experienceText: z
    //   .string()
    //   .min(10, "Experience text must be at least 10 characters")
    //   .optional(),
    // result: z.enum(["selected", "rejected", "pending", "waiting"]).optional(),
    // salaryOffered: z.number().positive().optional(),
  });

export type CreateInterviewExperienceInput = z.infer<
  typeof createInterviewExperienceSchema
>;
