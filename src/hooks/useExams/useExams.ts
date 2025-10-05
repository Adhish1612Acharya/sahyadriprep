import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exams/examService";
import { Exam } from "@/models/exam";

export const useExams = () => {
  const queryClient = useQueryClient();

  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: examService.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const createExam = useMutation({
    mutationFn: (data: Omit<Exam, "id" | "created_at">) =>
      examService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });

  const updateExam = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exam> }) =>
      examService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });

  const deleteExam = useMutation({
    mutationFn: (id: string) => examService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
  });

  return {
    examsQuery,
    createExam,
    updateExam,
    deleteExam,
  };
};
