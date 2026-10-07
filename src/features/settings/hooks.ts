"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { settingsService } from "./service";

export const useSettings = () => useLiveQuery(() => settingsService.get(), ["settings"]);
