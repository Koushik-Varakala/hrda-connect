import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateAchievementRequest, type UpdateAchievementRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAchievements() {
  return useQuery({
    queryKey: [api.achievements.list.path],
    queryFn: async () => {
      const res = await fetch(api.achievements.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return api.achievements.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FormData | CreateAchievementRequest) => {
      let body;
      let headers = {};

      if (data instanceof FormData) {
        body = data;
      } else {
        body = JSON.stringify(data as CreateAchievementRequest);
        headers = { "Content-Type": "application/json" };
      }

      const res = await fetch(api.achievements.create.path, {
        method: api.achievements.create.method,
        headers,
        body: body as BodyInit,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create achievement");
      return api.achievements.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.achievements.list.path] });
      toast({ title: "Success", description: "Achievement created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: FormData | UpdateAchievementRequest }) => {
      const url = buildUrl(api.achievements.update.path, { id });
      let body;
      let headers = {};

      if (data instanceof FormData) {
        body = data;
      } else {
        body = JSON.stringify(data as UpdateAchievementRequest);
        headers = { "Content-Type": "application/json" };
      }

      const res = await fetch(url, {
        method: api.achievements.update.method,
        headers,
        body: body as BodyInit,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update achievement");
      return api.achievements.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.achievements.list.path] });
      toast({ title: "Success", description: "Achievement updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.achievements.delete.path, { id });
      const res = await fetch(url, {
        method: api.achievements.delete.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete achievement");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.achievements.list.path] });
      toast({ title: "Success", description: "Achievement deleted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
