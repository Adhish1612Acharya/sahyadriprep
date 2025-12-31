import {
  studentProfileUpdateSchema,
  collegeAdminProfileUpdateSchema,
  superAdminProfileUpdateSchema,
} from "@/lib/zod/schema/profile.schema";

export const profileUpdateSchemas = {
  student: studentProfileUpdateSchema,
  college_admin: collegeAdminProfileUpdateSchema,
  super_admin: superAdminProfileUpdateSchema,
} as const;

export type ProfileRole = keyof typeof profileUpdateSchemas;
