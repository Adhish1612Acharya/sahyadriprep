"use client";
import { useAdminStudents } from "@/hooks/useAdminStudents.hook";
import { StudentCard } from "./student-card";
import { StudentListSkeleton } from "./student-list-skeleton";

export function StudentList() {
  const { adminStudentsQuery } = useAdminStudents();
  const { data: studentData, isLoading, isError } = adminStudentsQuery;

  if (isLoading) return <StudentListSkeleton />;
  if (isError || !studentData)
    return <div className="text-red-500">Failed to load students.</div>;
  if (studentData.data.length === 0)
    return <div className="text-muted-foreground">No students found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {studentData.data.map((student) => {
        return <StudentCard key={student.authProfile.id} student={student} />;
      })}
    </div>
  );
}
