import dashboardRepository from "../repositories/dashboard.repository";
import type {
  AttentionItem,
  ClassToday,
  Quota,
  Stats,
} from "../models/dashboard.model";

class DashboardService {
  /** null si la API respondió sin cuerpo; la página muestra los guiones. */
  async stats(): Promise<Stats | null> {
    const resp = await dashboardRepository.stats();
    return resp.data;
  }

  async attention(): Promise<AttentionItem[]> {
    const resp = await dashboardRepository.attention();
    return resp.data ?? [];
  }

  async classesToday(date?: string): Promise<ClassToday[]> {
    const resp = await dashboardRepository.classesToday(date);
    return resp.data ?? [];
  }

  async quotas(): Promise<Quota[]> {
    const resp = await dashboardRepository.quotas();
    return resp.data ?? [];
  }
}

export default new DashboardService();
