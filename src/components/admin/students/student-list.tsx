"use client";
import { useState, useMemo } from "react";
import { useAdminStudents } from "@/hooks/useAdminStudents.hook";
import { StudentCard } from "./student-card";
import { StudentListSkeleton } from "./student-list-skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function StudentList() {
  const { adminStudentsQuery } = useAdminStudents();
  const { data: studentData, isLoading, isError } = adminStudentsQuery;

  // Filters state
  const [profileStatus, setProfileStatus] = useState<
    "all" | "complete" | "incomplete"
  >("all");
  const [search, setSearch] = useState("");
  const [registeredFrom, setRegisteredFrom] = useState("");
  const [registeredTo, setRegisteredTo] = useState("");
  const [completedFrom, setCompletedFrom] = useState("");
  const [completedTo, setCompletedTo] = useState("");

  // Filtering logic
  const filteredStudents = useMemo(() => {
    if (!studentData) return [];
    return studentData.filter((student) => {
      // Profile status filter
      if (profileStatus === "complete" && !student.authProfile.profileCompleted)
        return false;
      if (
        profileStatus === "incomplete" &&
        student.authProfile.profileCompleted
      )
        return false;

      // Search filter
      const searchLower = search.toLowerCase();
      if (
        search &&
        !(
          student.studentProfile?.fullName
            ?.toLowerCase()
            .includes(searchLower) ||
          student.authProfile.email?.toLowerCase().includes(searchLower) ||
          student.studentProfile?.usn?.toLowerCase().includes(searchLower) ||
          student.studentProfile?.branch?.toLowerCase().includes(searchLower) ||
          student.studentProfile?.batch?.toLowerCase().includes(searchLower)
        )
      ) {
        return false;
      }

      // Registered date filter
      if (
        registeredFrom &&
        student.authProfile.createdAt &&
        new Date(student.authProfile.createdAt as Date) <
          new Date(registeredFrom)
      )
        return false;
      if (
        registeredTo &&
        student.authProfile.createdAt &&
        new Date(student.authProfile.createdAt as Date) > new Date(registeredTo)
      )
        return false;

      // Profile completed date filter
      if (
        completedFrom &&
        (!student.studentProfile?.createdAt ||
          new Date(student.studentProfile?.createdAt as Date) <
            new Date(completedFrom))
      )
        return false;
      if (
        completedTo &&
        (!student.studentProfile?.createdAt ||
          new Date(student.studentProfile?.createdAt as Date) >
            new Date(completedTo))
      )
        return false;

      return true;
    });
  }, [
    studentData,
    profileStatus,
    search,
    registeredFrom,
    registeredTo,
    completedFrom,
    completedTo,
  ]);

  // Stats
  const total = studentData?.length || 0;
  const completed =
    studentData?.filter((s) => s.authProfile.profileCompleted).length || 0;
  const incomplete = total - completed;

  if (isLoading) return <StudentListSkeleton />;
  if (isError || !studentData)
    return <div className="text-red-500">Failed to load students.</div>;
  if (studentData.length === 0)
    return <div className="text-muted-foreground">No students found.</div>;

  const clearFilters = () => {
    setProfileStatus("all");
    setSearch("");
    setRegisteredFrom("");
    setRegisteredTo("");
    setCompletedFrom("");
    setCompletedTo("");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[180px]">
          <div className="text-lg font-semibold">{total}</div>
          <div className="text-muted-foreground text-sm">Total Students</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 flex-1 min-w-[180px]">
          <div className="text-lg font-semibold text-green-700">
            {completed}
          </div>
          <div className="text-green-700 text-sm">Profile Completed</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 flex-1 min-w-[180px]">
          <div className="text-lg font-semibold text-yellow-700">
            {incomplete}
          </div>
          <div className="text-yellow-700 text-sm">Incomplete Profiles</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-full md:w-48">
          <Select
            value={profileStatus}
            onValueChange={(value) =>
              setProfileStatus(value as "all" | "complete" | "incomplete")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Profile Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by USN, Name, Email, Branch, Batch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Registered From</label>
          <Input
            type="date"
            value={registeredFrom}
            onChange={(e) => setRegisteredFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Registered To</label>
          <Input
            type="date"
            value={registeredTo}
            onChange={(e) => setRegisteredTo(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Profile Completed From</label>
          <Input
            type="date"
            value={completedFrom}
            onChange={(e) => setCompletedFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Profile Completed To</label>
          <Input
            type="date"
            value={completedTo}
            onChange={(e) => setCompletedTo(e.target.value)}
          />
        </div>
        <div>
          <Button variant="outline" className="mt-1" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-muted-foreground">
            No students found for selected filters.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <StudentCard key={student.authProfile.id} student={student} />
          ))
        )}
      </div>
    </div>
  );
}
