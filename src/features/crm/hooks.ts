"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { crmService } from "./service";

export const useLeads = () => useLiveQuery(() => crmService.list(), ["leads"]);
