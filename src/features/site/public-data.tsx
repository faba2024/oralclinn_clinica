"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicSiteData } from "@/server/public-data";

const SitePublicDataContext = createContext<PublicSiteData | null>(null);

/** Entrega ao site os dados lidos do banco no servidor (mesmo banco do painel). */
export function SitePublicDataProvider({ data, children }: { data: PublicSiteData; children: ReactNode }) {
  return <SitePublicDataContext.Provider value={data}>{children}</SitePublicDataContext.Provider>;
}

export function useSitePublicData(): PublicSiteData {
  const data = useContext(SitePublicDataContext);
  if (!data) throw new Error("useSitePublicData deve ser usado dentro do site público.");
  return data;
}
