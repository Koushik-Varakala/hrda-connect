import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type MediaCoverage, type InsertMediaCoverage, type UpdateMediaCoverageRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMediaCoverage() {
    return useQuery<MediaCoverage[]>({
        queryKey: ["/api/media-coverage"],
    });
}

export function useCreateMediaCoverage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (item: InsertMediaCoverage) => {
            const res = await apiRequest("POST", "/api/media-coverage", item);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/media-coverage"] });
            toast({
                title: "Media Coverage Added",
                description: "The press clipping has been successfully added.",
            });
        },
        onError: (error) => {
            toast({
                title: "Failed to add media",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useUpdateMediaCoverage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (item: UpdateMediaCoverageRequest & { id: number }) => {
            const { id, ...data } = item;
            const res = await apiRequest("PUT", `/api/media-coverage/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/media-coverage"] });
            toast({
                title: "Media Updated",
                description: "Coverage details have been updated.",
            });
        },
        onError: (error) => {
            toast({
                title: "Failed to update media",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useDeleteMediaCoverage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/media-coverage/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/media-coverage"] });
            toast({
                title: "Media Deleted",
                description: "The coverage item has been removed.",
            });
        },
    });
}
