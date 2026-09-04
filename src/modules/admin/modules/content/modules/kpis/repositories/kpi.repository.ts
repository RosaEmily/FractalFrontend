import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { KpiRepositoryTypes } from "../models/kpi.model";
import { kpiAdapter } from "../adapters/kpi.adapter";

class KpiRepository extends BaseRepository<KpiRepositoryTypes> {
  constructor() {
    super("landing/kpis", kpiAdapter);
  }
}

export default new KpiRepository();
