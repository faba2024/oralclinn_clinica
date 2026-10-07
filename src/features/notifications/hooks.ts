"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { notificationService } from "./service";

export const useNotifications = () => useLiveQuery(() => notificationService.list(), ["notifications"]);
