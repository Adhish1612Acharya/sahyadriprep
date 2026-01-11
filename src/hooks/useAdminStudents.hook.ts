import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/api/student/student";

export const useAdminStudents = (filters?: any) => {
  const adminStudentsQuery = useQuery({
    queryKey: ["admin-students", filters],
    queryFn: () => studentApi.getAdminCollegeStudents(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    adminStudentsQuery,
  };
};
