import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedBeforeAfter } from "@/data/seed";
import type { BeforeAfterCase } from "./types";

export type BeforeAfterRepository = Repository<BeforeAfterCase>;

export class DefaultBeforeAfterRepository extends CollectionRepository<BeforeAfterCase> implements BeforeAfterRepository {
  constructor() {
    super("before-after", seedBeforeAfter, "ba");
  }
}
