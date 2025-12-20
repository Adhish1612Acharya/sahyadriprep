import { Suspense } from "react";
import { StudentList } from "@/components/admin/students/student-list";
import { StudentListSkeleton } from "@/components/admin/students/student-list-skeleton";

export default function AdminStudentsPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Registered Students</h1>
      <Suspense fallback={<StudentListSkeleton />}>
        <StudentList />
      </Suspense>
    </main>
  );
}
