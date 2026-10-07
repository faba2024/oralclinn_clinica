import { repositories } from "@/repositories";
import type { SiteContent } from "./types";

export const contentService = {
  get: () => repositories.siteContent.get(),
  save: (content: SiteContent) => repositories.siteContent.save(content),
  patch: (content: Partial<SiteContent>) => repositories.siteContent.patch(content),
};
