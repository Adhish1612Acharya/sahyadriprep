import { profileUpdateSchemas } from "@/constants/profile-schemas.constants";
import { HttpError } from "@/lib/api/http";

export type ProfileRole = keyof typeof profileUpdateSchemas;

export function getProfileUpdateSchema(role: ProfileRole) {
  const schema = profileUpdateSchemas[role];
  if (!schema) {
    throw new HttpError("Invalid role for profile update", 400, "INVALID_ROLE");
  }
  return schema;
}
