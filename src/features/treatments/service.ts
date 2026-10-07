import { repositories } from "@/repositories";
import type { CreateInput } from "@/types/common";
import { slugify } from "@/utils/format";
import type { Treatment } from "./types";

export const treatmentService = {
  list: async () => (await repositories.treatments.list()).sort((a, b) => a.order - b.order),
  listActive: async () => (await treatmentService.list()).filter((t) => t.active),
  get: (id: string) => repositories.treatments.getById(id),
  getBySlug: (slug: string) => repositories.treatments.getBySlug(slug),

  async create(input: Omit<CreateInput<Treatment>, "slug" | "order"> & { slug?: string }): Promise<Treatment> {
    const all = await repositories.treatments.list();
    const base = slugify(input.slug || input.name);
    let slug = base;
    let n = 2;
    while (all.some((t) => t.slug === slug)) slug = `${base}-${n++}`;
    return repositories.treatments.create({ ...input, slug, order: all.length + 1 });
  },

  update: (id: string, patch: Partial<Treatment>) => repositories.treatments.update(id, patch),
  remove: (id: string) => repositories.treatments.remove(id),
};
