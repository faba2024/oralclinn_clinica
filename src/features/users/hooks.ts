"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { useAuthStore } from "@/stores/auth-store";
import { canAccess } from "./permissions";
import { userService } from "./service";
import type { ModuleKey } from "./types";

export const useUsers = () => useLiveQuery(() => userService.list(), ["users"]);

export function usePermission(moduleKey: ModuleKey): boolean {
  const role = useAuthStore((s) => s.user?.role);
  return canAccess(role, moduleKey);
}

export function useSessionUser() {
  return useAuthStore((s) => s.user);
}
