import { SingletonDocRepository } from "@/repositories/core/collection-repository";
import type { SingletonRepository } from "@/repositories/core/repository";
import { seedSiteContent } from "@/data/seed";
import type { SiteContent } from "./types";

export type SiteContentRepository = SingletonRepository<SiteContent>;

export class DefaultSiteContentRepository extends SingletonDocRepository<SiteContent> implements SiteContentRepository {
  constructor() {
    super("site-content", seedSiteContent);
  }
}
