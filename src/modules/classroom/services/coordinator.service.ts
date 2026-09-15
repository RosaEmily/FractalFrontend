import apiFractal from "@/shared/helpers/axios/api-fractal";
import type {
  AttentionItemDTO,
  ClassTodayDTO,
  QuotaDTO,
  StatsDTO,
} from "../dto/coordinator.dto";

/**
 * Coordinación académica.
 *
 * No tiene endpoints propios: su panel es exactamente lo que ya devuelven
 * `dashboard` y `reports`, que agregan sobre todas las cohortes. Duplicarlos en
 * `Classroom` habría sido mantener dos veces las mismas consultas.
 */
class CoordinatorService {
  async stats(): Promise<StatsDTO | null> {
    const response = await apiFractal.get<StatsDTO>("dashboard/stats");
    return response.data;
  }

  async attention(): Promise<AttentionItemDTO[]> {
    const response = await apiFractal.get<AttentionItemDTO[]>(
      "dashboard/attention",
    );
    return response.data ?? [];
  }

  async quotas(): Promise<QuotaDTO[]> {
    const response = await apiFractal.get<QuotaDTO[]>("dashboard/quotas");
    return response.data ?? [];
  }

  async classesToday(date?: string): Promise<ClassTodayDTO[]> {
    const response = await apiFractal.get<ClassTodayDTO[]>(
      "dashboard/classes-today",
      { params: date ? { date } : undefined },
    );
    return response.data ?? [];
  }
}

export default new CoordinatorService();

/**
 * Destino de cada aviso del panel.
 *
 * Un `key` nuevo en la API que no esté acá se muestra sin enlace, no rompe la
 * pantalla — es el mismo criterio del dashboard del admin.
 */
export const ATTENTION_ROUTES: Record<string, string> = {
  offers_below_minimum: "classroom-coordinator-cohorts",
  offers_over_maximum: "classroom-coordinator-cohorts",
  offers_without_sessions: "classroom-coordinator-programs",
  evaluation_weights: "classroom-coordinator-programs",
  certificates_pending: "classroom-coordinator-reports",
  pending_payments: "classroom-coordinator-reports",
};

/** Tono del aviso según su gravedad. */
export const SEVERITY_TONE: Record<string, string> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

/** Estado del cupo de una cohorte. */
export const QUOTA_STATE: Record<string, { label: string; tone: string }> = {
  over_max: { label: "Sobre el cupo", tone: "danger" },
  below_min: { label: "Bajo el mínimo", tone: "warning" },
  ok: { label: "En rango", tone: "success" },
};
