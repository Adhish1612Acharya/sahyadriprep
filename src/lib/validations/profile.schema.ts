import { z } from "zod";

/**
 * Student Profile Update Schema
 * Validates student profile updates
 */
export const studentProfileUpdateSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required").max(100),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
      .optional()
      .nullable(),
    avatar_url: z.string().url("Invalid avatar URL").optional().nullable(),
    college_id: z.string().uuid("Invalid college ID").optional().nullable(),
    usn: z
      .string()
      .min(10, "USN must be at least 10 characters")
      .max(20)
      .optional()
      .nullable(),
    batch: z.string().min(4, "Batch must be at least 4 characters").max(10),
    branch: z.string().min(2).max(50).optional().nullable(),
    current_semester: z
      .number()
      .int()
      .min(1, "Semester must be between 1 and 8")
      .max(8)
      .optional()
      .nullable(),
    current_cgpa: z
      .number()
      .min(0, "CGPA must be between 0 and 10")
      .max(10)
      .optional()
      .nullable(),
    technical_skills: z
      .array(z.string().min(1).max(50))
      .max(20, "Maximum 20 skills allowed")
      .optional()
      .nullable(),
    projects: z
      .array(
        z.object({
          title: z.string().min(1).max(100),
          description: z.string().max(500).optional(),
          technologies: z.array(z.string()).optional(),
          github_url: z.string().url().optional(),
          live_url: z.string().url().optional(),
          start_date: z.string().optional(),
          end_date: z.string().optional(),
        })
      )
      .max(10, "Maximum 10 projects allowed")
      .optional()
      .nullable(),
    internships: z
      .array(
        z.object({
          company: z.string().min(1).max(100),
          role: z.string().min(1).max(100),
          description: z.string().max(500).optional(),
          start_date: z.string(),
          end_date: z.string().optional(),
          is_current: z.boolean().optional(),
        })
      )
      .max(10, "Maximum 10 internships allowed")
      .optional()
      .nullable(),
    placement_status: z
      .enum(["seeking", "placed"], {
        errorMap: () => ({ message: "Status must be 'seeking' or 'placed'" }),
      })
      .optional()
      .nullable(),
    placed_company_id: z
      .string()
      .uuid("Invalid company ID")
      .optional()
      .nullable(),
    package_lpa: z
      .number()
      .min(0, "Package must be positive")
      .max(500, "Package seems too high")
      .optional()
      .nullable(),
    linkedin_url: z
      .string()
      .url("Invalid LinkedIn URL")
      .regex(/linkedin\.com/, "URL must be a valid LinkedIn profile")
      .optional()
      .nullable(),
    github_url: z
      .string()
      .url("Invalid GitHub URL")
      .regex(/github\.com/, "URL must be a valid GitHub profile")
      .optional()
      .nullable(),
    resume_url: z.string().url("Invalid resume URL").optional().nullable(),
    profile_visibility: z
      .enum(["public", "private", "college_only"])
      .optional()
      .nullable(),
  })
  .partial(); // Allow partial updates

/**
 * College Admin Profile Update Schema
 * Validates college admin profile updates
 */
export const collegeAdminProfileUpdateSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required").max(100),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
      .optional()
      .nullable(),
    avatar_url: z.string().url("Invalid avatar URL").optional().nullable(),
    college_id: z.string().uuid("Invalid college ID"),
    designation: z.string().min(2).max(100).optional().nullable(),
    department: z.string().min(2).max(100).optional().nullable(),
    employee_id: z.string().min(1).max(50).optional().nullable(),
    permissions: z
      .object({
        can_view_analytics: z.boolean().optional(),
        can_manage_students: z.boolean().optional(),
        can_upload_experiences: z.boolean().optional(),
      })
      .optional()
      .nullable(),
  })
  .partial(); // Allow partial updates

/**
 * Super Admin Profile Update Schema
 * Validates super admin profile updates (limited fields)
 */
export const superAdminProfileUpdateSchema = z.object({
  profile_completed: z.boolean().optional(),
});

/**
 * Type exports
 */
export type StudentProfileUpdate = z.infer<typeof studentProfileUpdateSchema>;
export type CollegeAdminProfileUpdate = z.infer<
  typeof collegeAdminProfileUpdateSchema
>;
export type SuperAdminProfileUpdate = z.infer<
  typeof superAdminProfileUpdateSchema
>;
