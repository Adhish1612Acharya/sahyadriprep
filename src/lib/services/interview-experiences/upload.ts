import { UPLOAD_DIRECTORIES } from "@/constants";
import { save_uploaded_file } from "@/helpers/file";

export async function saveTempInterviewExperienceFiles(
  experiencePdfFile: File,
  experienceVideoOverviewFile: File | null
): Promise<{
  success: boolean;
  experiencePdfFilePath: string | null;
  experienceVideoOverviewFilePath: string | null;
  tempFiles: string[];
  error?: string;
}> {
  const tempFiles: string[] = [];

  const experiencePdfFilePath = await save_uploaded_file(experiencePdfFile, {
    subdirectory: UPLOAD_DIRECTORIES.INTERVIEW_EXPERIENCES,
  });

  if (experiencePdfFilePath.error) {
    return {
      success: false,
      experiencePdfFilePath: null,
      experienceVideoOverviewFilePath: null,
      tempFiles,
      error: "Failed to save temporary PDF file",
    };
  }
  tempFiles.push(experiencePdfFilePath.path!);

  let experienceVideoOverviewFilePath: {
    path: string | null;
    error: string | null;
  } = { path: null, error: null };

  if (experienceVideoOverviewFile) {
    experienceVideoOverviewFilePath = await save_uploaded_file(
      experienceVideoOverviewFile,
      {
        subdirectory: `${UPLOAD_DIRECTORIES.INTERVIEW_EXPERIENCES}/videos`,
      }
    );
    if (experienceVideoOverviewFilePath?.error) {
      return {
        success: false,
        experiencePdfFilePath: experiencePdfFilePath.path!,
        experienceVideoOverviewFilePath: null,
        tempFiles,
        error: "Failed to save temporary video file",
      };
    }
    tempFiles.push(experienceVideoOverviewFilePath.path!);
  }

  return {
    success: true,
    experiencePdfFilePath: experiencePdfFilePath.path!,
    experienceVideoOverviewFilePath: experienceVideoOverviewFilePath.path,
    tempFiles,
  };
}
