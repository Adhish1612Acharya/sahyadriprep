import { getAdminCollegeStudentsType } from "@/lib/api/student/student.api.types";

export function StudentCard({
  student,
}: {
  student: getAdminCollegeStudentsType;
}) {
  const { authProfile, studentProfile } = student;
  const profileCompleted = authProfile.profileCompleted;

  return (
    <div className="border rounded-lg p-5 bg-white shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-lg">
          {studentProfile?.fullName ?? (
            <span className="italic text-gray-400">No profile</span>
          )}
        </span>
        <span
          className={`px-2 py-1 text-xs rounded font-semibold ${
            profileCompleted
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {profileCompleted ? "Profile Complete" : "Incomplete"}
        </span>
      </div>

      <div className="text-sm text-muted-foreground">
        Email:{" "}
        {authProfile?.email ?? (
          <span className="italic text-gray-400">N/A</span>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        USN:{" "}
        {studentProfile?.usn ?? (
          <span className="italic text-gray-400">N/A</span>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Branch:{" "}
        {studentProfile?.branch ?? (
          <span className="italic text-gray-400">N/A</span>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Batch:{" "}
        {studentProfile?.batch ?? (
          <span className="italic text-gray-400">N/A</span>
        )}
      </div>

      <div className="text-xs text-gray-400 mt-2">
        Registered: {new Date(authProfile.createdAt).toLocaleDateString()}
      </div>

      {profileCompleted && studentProfile?.createdAt && (
        <div className="text-xs text-green-700 mt-1">
          Profile completed on:{" "}
          {new Date(studentProfile.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
