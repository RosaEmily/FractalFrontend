import { BaseService } from "@/modules/admin/services/base.service";
import EnrollmentRepository from "../repositories/enrollment.repository";
import type { EnrollmentRepositoryTypes } from "../models/enrollment.model";

class EnrollmentService extends BaseService<
  typeof EnrollmentRepository,
  EnrollmentRepositoryTypes
> {
  constructor() {
    super(EnrollmentRepository);
  }
}

export default new EnrollmentService();
