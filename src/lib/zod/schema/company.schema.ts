import { z } from "zod";

// Zod schema for company validation
export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").trim(),
  logo_url: z
    .string()
    .url("Invalid logo URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  industry: z.string().optional().nullable(),
  headquarters: z.string().optional().nullable(),
  company_size: z
    .enum(["startup", "small", "medium", "large", "enterprise"])
    .optional()
    .nullable(),
  glassdoor_rating: z
    .number()
    .min(0, "Glassdoor rating must be at least 0")
    .max(5, "Glassdoor rating must be at most 5")
    .optional()
    .nullable()
    .or(
      z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return null;
        return num;
      })
    ),
});

// Export type for company input
export type CompanyInput = z.infer<typeof companySchema>;

export const updateCompanySchema = z.object({
  name: z.string().trim().min(1, "Company name cannot be empty").optional(),
  logoUrl: z
    .string()
    .trim()
    .url()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  website: z
    .string()
    .trim()
    .url()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  industry: z.string().trim().optional(),
  headquarters: z.string().trim().optional(),
  companySize: z
    .enum(["startup", "small", "medium", "large", "enterprise"])
    .optional(),
  glassdoorRating: z
    .union([z.number(), z.string()])
    .transform((v) => (v === "" || v == null ? null : Number(v)))
    .refine((v) => v === null || (!Number.isNaN(v) && v >= 0 && v <= 5), {
      message: "Glassdoor rating must be between 0 and 5",
    })
    .optional(),
});

export type UpdateCompanyBody = z.infer<typeof updateCompanySchema>;

// Schema for updating (all fields optional except they can be provided)
export const companyUpdateSchema = companySchema.partial();

// Export type for company update
export type CompanyUpdate = z.infer<typeof companyUpdateSchema>;

// Validation helper to transform empty strings to null
export const transformEmptyToNull = (value: string | null | undefined) => {
  if (value === "" || value === undefined) return null;
  return value;
};
