import { SingletonDocRepository } from "@/repositories/core/collection-repository";
import type { SingletonRepository } from "@/repositories/core/repository";
import { seedSettings } from "@/data/seed";
import type { ClinicSettings } from "./types";

export type SettingsRepository = SingletonRepository<ClinicSettings>;

export class DefaultSettingsRepository extends SingletonDocRepository<ClinicSettings> implements SettingsRepository {
  constructor() {
    super("settings", seedSettings);
  }
}
