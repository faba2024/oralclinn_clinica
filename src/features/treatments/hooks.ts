"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { treatmentService } from "./service";

export const useTreatments = () => useLiveQuery(() => treatmentService.list(), ["treatments"]);
