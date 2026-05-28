import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type UpdateNominationRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch List
export function useNominationsList(filters?: { district?: string; post?: string; status?: string }) {
    return useQuery({
        queryKey: [api.nominations.list.path, filters],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            if (filters?.district) queryParams.append("district", filters.district);
            if (filters?.post) queryParams.append("post", filters.post);
            if (filters?.status) queryParams.append("status", filters.status);

            const url = `${api.nominations.list.path}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
            const res = await fetch(url, { credentials: "include" });
            
            if (!res.ok) throw new Error("Failed to fetch nominations");
            return api.nominations.list.responses[200].parse(await res.json());
        },
    });
}

// Update Status (Admin)
export function useUpdateNomination() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: number } & UpdateNominationRequest) => {
            const url = buildUrl(api.nominations.update.path, { id });
            const res = await fetch(url, {
                method: api.nominations.update.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to update nomination");
            return api.nominations.update.responses[200].parse(await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.nominations.list.path] });
            toast({ title: "Success", description: "Nomination updated successfully" });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
}

// Delete (Admin)
export function useDeleteNomination() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: number) => {
            const url = buildUrl(api.nominations.delete.path, { id });
            const res = await fetch(url, {
                method: api.nominations.delete.method,
                credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to delete nomination");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.nominations.list.path] });
            toast({ title: "Success", description: "Nomination deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
}
