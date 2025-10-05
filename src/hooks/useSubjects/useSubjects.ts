import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectService } from "@/services/subjects/subjectService";
import { Subject } from "@/models/subject";

export const useSubjects = () => {
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getAll,
  });

  const createSubject = useMutation({
    mutationFn: (data: Omit<Subject, "id">) => subjectService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const updateSubject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) =>
      subjectService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const deleteSubject = useMutation({
    mutationFn: (id: string) => subjectService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  return { subjectsQuery, createSubject, updateSubject, deleteSubject };
};
