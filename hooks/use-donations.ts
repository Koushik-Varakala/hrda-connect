import { useQuery } from "@tanstack/react-query";

export function useDonationsList() {
  return useQuery({
    queryKey: ["/api/admin/donations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/donations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch donations");
      return await res.json();
    },
  });
}
