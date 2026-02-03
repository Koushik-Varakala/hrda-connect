import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateRegistrationRequest, type UpdateRegistrationRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Admin List
export function useRegistrationsList() {
  return useQuery({
    queryKey: [api.registrations.list.path],
    queryFn: async () => {
      const res = await fetch(api.registrations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch registrations");
      return api.registrations.list.responses[200].parse(await res.json());
    },
  });
}

// Search (Public)
export function useSearchRegistration(tgmcId: string | undefined) {
  return useQuery({
    queryKey: [api.registrations.search.path, tgmcId],
    queryFn: async () => {
      if (!tgmcId) return null;
      const url = `${api.registrations.search.path}?tgmcId=${tgmcId}`;
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to search");
      return api.registrations.search.responses[200].parse(await res.json());
    },
    enabled: !!tgmcId && tgmcId.length > 2,
    retry: false,
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateRegistrationRequest) => {
      const res = await fetch(api.registrations.create.path, {
        method: api.registrations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create registration");
      return api.registrations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.registrations.list.path] });
      toast({ title: "Success", description: "Registration added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateRegistrationRequest) => {
      const url = buildUrl(api.registrations.update.path, { id });
      const res = await fetch(url, {
        method: api.registrations.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update registration");
      return api.registrations.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.registrations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.registrations.search.path] });
      toast({ title: "Success", description: "Registration updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
