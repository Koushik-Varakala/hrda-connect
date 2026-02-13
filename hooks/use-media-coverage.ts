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
        mutationFn: async (data: FormData | InsertMediaCoverage) => {
            let body;
            let headers = {};

            if (data instanceof FormData) {
                body = data;
                // Content-Type header is set automatically by browser for FormData
            } else {
                body = JSON.stringify(data);
                headers = { "Content-Type": "application/json" };
            }

            const res = await fetch("/api/media-coverage", {
                method: "POST",
                headers,
                body: body as BodyInit,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to create media coverage");
            }
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
        mutationFn: async (input: { id: number; data: FormData | UpdateMediaCoverageRequest }) => {
            const { id, data } = input;
            let body;
            let headers = {};

            if (data instanceof FormData) {
                body = data;
            } else {
                body = JSON.stringify(data);
                headers = { "Content-Type": "application/json" };
            }

            const res = await fetch(`/api/media-coverage/${id}`, {
                method: "PUT",
                headers,
                body: body as BodyInit,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to update media coverage");
            }
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
