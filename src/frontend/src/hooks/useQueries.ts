import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { City, Preferences } from "../backend.d";
import { useActor } from "./useActor";

const SESSION_KEY = "uhi-session";

function getSessionKey(): string {
  let key = sessionStorage.getItem(SESSION_KEY);
  if (!key) {
    key = `uhi-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, key);
  }
  return key;
}

export function useGetCities() {
  const { actor, isFetching } = useActor();
  return useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCities();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetPreferences() {
  const { actor, isFetching } = useActor();
  const sessionKey = getSessionKey();
  return useQuery<Preferences | null>({
    queryKey: ["preferences", sessionKey],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPreferences(sessionKey);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSavePreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionKey = getSessionKey();
  return useMutation({
    mutationFn: async (prefs: Preferences) => {
      if (!actor) return;
      await actor.savePreferences(sessionKey, prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });
}
