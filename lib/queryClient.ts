import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: false,
        },
    },
});

export const apiRequest = async (
    method: string,
    url: string,
    data?: unknown | undefined,
): Promise<Response> => {
    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined, // Fix checking for undefined/null
    });

    if (!res.ok) {
        // Attempt to parse error JSON
        let errorData;
        try {
            errorData = await res.json();
        } catch {
            // ignore
        }
        throw new Error((errorData as any)?.message || res.statusText);
    }

    return res;
};
