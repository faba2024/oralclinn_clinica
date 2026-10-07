"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { contentService } from "./service";

export const useSiteContentQuery = () => useLiveQuery(() => contentService.get(), ["site-content"]);
