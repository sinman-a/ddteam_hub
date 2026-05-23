import useSWR from "swr";
import type { TeamProfile } from "@/types/profile";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProfiles() {
  const { data, error, isLoading, mutate } = useSWR<TeamProfile[]>(
    "/api/profiles",
    fetcher
  );

  return { profiles: data ?? [], error, isLoading, mutate };
}
