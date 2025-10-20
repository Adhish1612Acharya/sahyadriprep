import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moduleService } from "@/services/module.service";
import { Module } from "@/models/module.types";

export const useModules = (subjectId?: string) => {
  const queryClient = useQueryClient();

  const modulesQuery = useQuery({
    queryKey: ["modules", subjectId],
    queryFn: subjectId
      ? () => moduleService.getBySubjectId(subjectId)
      : moduleService.getAll,
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
  });

  const createModule = useMutation({
    mutationFn: (data: Omit<Module, "id" | "created_at">) =>
      moduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });

  const updateModule = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Module> }) =>
      moduleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });

  const deleteModule = useMutation({
    mutationFn: (id: string) => moduleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });

  return {
    modulesQuery,
    createModule,
    updateModule,
    deleteModule,
  };
};
