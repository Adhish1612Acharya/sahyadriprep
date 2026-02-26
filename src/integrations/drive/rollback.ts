import { deleteFromDrive } from "./delete";

/**
 * Common Drive rollback logic used by orchestrators to clean up 
 * uploaded files when a subsequent database operation fails.
 */
export const createDriveRollback = () => {
  return {
    driveFileId: null as string | null,
    
    /**
     * Set the file ID to be deleted.
     */
    setFileId(id: string) {
      this.driveFileId = id;
    },

    /**
     * Executes the rollback by deleting the file from Drive.
     * Should be called in catch blocks.
     */
    async execute() {
      if (this.driveFileId) {
        try {
          await deleteFromDrive(this.driveFileId);
        } catch (err) {
          // Log but do not re-throw — rollback should never mask the
          // original error that triggered it.
          console.error(
            "[DriveRollback] Failed to delete Drive file:",
            this.driveFileId,
            err
          );
        }
      }
    }
  };
};
