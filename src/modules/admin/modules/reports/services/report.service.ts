import reportRepository from "../repositories/report.repository";
import type { ReportFilters } from "../dto/report.dto";

class ReportService {
  revenue = (filters?: ReportFilters) => reportRepository.revenue(filters);
  enrollments = (filters?: ReportFilters) => reportRepository.enrollments(filters);
  occupancy = (filters?: ReportFilters) => reportRepository.occupancy(filters);
  academic = (filters?: ReportFilters) => reportRepository.academic(filters);
  certificates = (filters?: ReportFilters) => reportRepository.certificates(filters);
  attendance = (filters?: ReportFilters) => reportRepository.attendance(filters);
  executive = (filters?: ReportFilters) => reportRepository.executive(filters);
  aging = () => reportRepository.aging();
  complaints = () => reportRepository.complaints();
  retention = (filters?: ReportFilters) => reportRepository.retention(filters);
}

export default new ReportService();
