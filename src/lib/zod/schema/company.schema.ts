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

// Schema for updating (all fields optional except they can be provided)
export const companyUpdateSchema = companySchema.partial();

// Export type for company update
export type CompanyUpdate = z.infer<typeof companyUpdateSchema>;

// Validation helper to transform empty strings to null
export const transformEmptyToNull = (value: string | null | undefined) => {
  if (value === "" || value === undefined) return null;
  return value;
};
