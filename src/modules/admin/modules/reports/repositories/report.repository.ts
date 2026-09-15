import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ReportFilters } from "../dto/report.dto";
import type {
  AcademicReport,
  AttendanceReport,
  CertificateReport,
  EnrollmentReport,
  OccupancyReport,
  RevenueReport,
} from "../models/report.model";

/**
 * Solo lectura: 6 GET con filtros por query string. No extiende
 * `BaseRepository` porque no hay id, paginación ni escritura.
 */
class ReportRepository {
  private readonly route = "/reports";

  private async fetch<T>(path: string, filters: ReportFilters): Promise<T | null> {
    const resp = await apiFractal.get<T>(`${this.route}/${path}`, {
      // Las claves sin valor se omiten: mandar `offer_id=` vacío rompe la
      // validación `integer` del backend.
      params: Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== null && value !== "",
        ),
      ),
    });
    return resp.data;
  }

  revenue = (filters: ReportFilters = {}) =>
    this.fetch<RevenueReport>("revenue", filters);

  enrollments = (filters: ReportFilters = {}) =>
    this.fetch<EnrollmentReport>("enrollments", filters);

  occupancy = (filters: ReportFilters = {}) =>
    this.fetch<OccupancyReport>("occupancy", filters);

  academic = (filters: ReportFilters = {}) =>
    this.fetch<AcademicReport>("academic", filters);

  certificates = (filters: ReportFilters = {}) =>
    this.fetch<CertificateReport>("certificates", filters);

  attendance = (filters: ReportFilters = {}) =>
    this.fetch<AttendanceReport>("attendance", filters);
}

export default new ReportRepository();
