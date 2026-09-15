import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type {
  AttentionItemDTO,
  ClassTodayDTO,
  QuotaDTO,
  StatsDTO,
} from "../dto/dashboard.dto";
import {
  attentionAdapter,
  classTodayAdapter,
  quotaAdapter,
  statsAdapter,
} from "../adapters/dashboard.adapter";
import type {
  AttentionItem,
  ClassToday,
  Quota,
  Stats,
} from "../models/dashboard.model";

/**
 * No extiende `BaseRepository`: el dashboard no es un CRUD, son cuatro GET
 * de solo lectura sin id, paginación ni filtros.
 */
class DashboardRepository {
  private readonly route = "/dashboard";

  async stats(): Promise<ApiResponse<Stats | null>> {
    // `data` del envoltorio es `T | null`: si la API respondiera sin cuerpo,
    // adaptarlo reventaría. Se propaga el null y lo resuelve la página.
    const resp = await apiFractal.get<StatsDTO>(`${this.route}/stats`);
    return { ...resp, data: resp.data ? statsAdapter.one(resp.data) : null };
  }

  async attention(): Promise<ApiResponse<AttentionItem[]>> {
    const resp = await apiFractal.get<AttentionItemDTO[]>(
      `${this.route}/attention`,
    );
    return { ...resp, data: attentionAdapter.many(resp.data ?? []) };
  }

  async classesToday(date?: string): Promise<ApiResponse<ClassToday[]>> {
    const resp = await apiFractal.get<ClassTodayDTO[]>(
      `${this.route}/classes-today`,
      { params: date ? { date } : undefined },
    );
    return { ...resp, data: classTodayAdapter.many(resp.data ?? []) };
  }

  async quotas(): Promise<ApiResponse<Quota[]>> {
    const resp = await apiFractal.get<QuotaDTO[]>(`${this.route}/quotas`);
    return { ...resp, data: quotaAdapter.many(resp.data ?? []) };
  }
}

export default new DashboardRepository();
