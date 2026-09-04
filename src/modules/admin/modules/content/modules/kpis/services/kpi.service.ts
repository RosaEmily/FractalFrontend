import { BaseService } from "@/modules/admin/services/base.service";
import KpiRepository from "../repositories/kpi.repository";
import type { KpiRepositoryTypes } from "../models/kpi.model";

class KpiService extends BaseService<typeof KpiRepository, KpiRepositoryTypes> {
  constructor() {
    super(KpiRepository);
  }
}

export default new KpiService();
