import type {
  AcademicRowDTO,
  AcademicTotalsDTO,
  AttendanceRowDTO,
  AttendanceTotalsDTO,
  CertificateRowDTO,
  CertificateTotalsDTO,
  EnrollmentRowDTO,
  EnrollmentTotalsDTO,
  OccupancyRowDTO,
  OccupancyTotalsDTO,
  RevenueRowDTO,
  RevenueTotalsDTO,
} from "../dto/report.dto";

/**
 * Los reportes NO llevan adapter: la API ya devuelve los agregados y los
 * porcentajes calculados, en snake_case plano y sin anidamiento. Renombrar
 * campos acá solo agregaría una capa que hay que mantener sincronizada.
 *
 * El resto del admin sí usa adapters porque sus endpoints devuelven modelos
 * con relaciones y valores formateados que el formulario no puede consumir.
 */
export interface Report<TRow, TTotals> {
  totals: TTotals;
  items: TRow[];
}

export type RevenueReport = Report<RevenueRowDTO, RevenueTotalsDTO>;
export type EnrollmentReport = Report<EnrollmentRowDTO, EnrollmentTotalsDTO>;
export type OccupancyReport = Report<OccupancyRowDTO, OccupancyTotalsDTO>;
export type AcademicReport = Report<AcademicRowDTO, AcademicTotalsDTO>;
export type CertificateReport = Report<CertificateRowDTO, CertificateTotalsDTO>;
export type AttendanceReport = Report<AttendanceRowDTO, AttendanceTotalsDTO>;

export type RevenueRow = RevenueRowDTO;
export type EnrollmentRow = EnrollmentRowDTO;
export type OccupancyRow = OccupancyRowDTO;
export type AcademicRow = AcademicRowDTO;
export type CertificateRow = CertificateRowDTO;
export type AttendanceRow = AttendanceRowDTO;
