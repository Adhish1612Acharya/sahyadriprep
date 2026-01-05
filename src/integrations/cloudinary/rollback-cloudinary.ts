import { cleanup_temp_files } from "@/helpers/file";
import { deleteFromCloudinary } from "./delete";
import { RollbackContext } from "./types";
import { deleteMediaByIds } from "@/lib/repositories/media";
import { deleteInterviewExperienceById } from "@/lib/repositories/interview-expereinces";

export async function rollbackInterviewCreation(ctx: RollbackContext) {
  const { tempFiles, cloudinaryAssets, mediaIds, experienceId, supabase } = ctx;

  try {
    await cleanup_temp_files(tempFiles);

    await Promise.allSettled(
      cloudinaryAssets.map((a) =>
        deleteFromCloudinary(a.publicId, a.resourceType)
      )
    );

    if (mediaIds.length) {
      const { error } = await deleteMediaByIds(supabase, mediaIds);
      if (error) console.warn("Media rollback partial:", error);
    }

    if (experienceId) {
      const { error } = await deleteInterviewExperienceById(
        supabase,
        experienceId
      );
      if (error) console.warn("Experience rollback partial:", error);
    }
  } catch (error) {
    console.error("Rollback failed:", error);
  }
}
