"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { beforeAfterService } from "./service";

export const useBeforeAfter = () => useLiveQuery(() => beforeAfterService.list(), ["before-after"]);
export const usePublishedCases = () => useLiveQuery(() => beforeAfterService.listPublished(), ["before-after"]);
