"use client";

import { useLiveQuery } from "@/hooks/use-live-query";
import { getDashboardData } from "./service";

export const useDashboard = () =>
  useLiveQuery(getDashboardData, ["appointments", "patients", "leads", "receivables", "expenses", "treatment-plans"]);
