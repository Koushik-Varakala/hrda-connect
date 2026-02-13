import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreatePanelRequest, type UpdatePanelRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function usePanels(filters?: { type?: 'state' | 'district', district?: string }) {
  // Construct query string for key
  const queryKey = [api.panels.list.path, filters?.type, filters?.district].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.panels.list.path;
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.district) params.append('district', filters.district);

      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch panels");
      return api.panels.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePanelRequest | FormData) => {
      const isFormData = data instanceof FormData;
      const res = await fetch(api.panels.create.path, {
        method: api.panels.create.method,
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: isFormData ? data : JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create panel member");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.panels.list.path] });
      toast({ title: "Success", description: "Member added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdatePanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & (UpdatePanelRequest | { formData: FormData })) => {
      const url = buildUrl(api.panels.update.path, { id });
      const isFormData = 'formData' in data;
      const body = isFormData ? data.formData : JSON.stringify(data);

      const res = await fetch(url, {
        method: api.panels.update.method,
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update panel member");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.panels.list.path] });
      toast({ title: "Success", description: "Member updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeletePanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.panels.delete.path, { id });
      const res = await fetch(url, {
        method: api.panels.delete.method,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete panel member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.panels.list.path] });
      toast({ title: "Success", description: "Member removed" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
