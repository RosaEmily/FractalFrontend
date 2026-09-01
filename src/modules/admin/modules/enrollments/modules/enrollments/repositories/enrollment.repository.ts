import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { EnrollmentRepositoryTypes } from "../models/enrollment.model";
import { EnrollmentAdapter } from "../adapters/enrollment.adapter";

/**
 * Solo lectura para el admin: `store` está restringido a STUDENT porque
 * matricula al usuario del token.
 */
class EnrollmentRepository extends BaseRepository<EnrollmentRepositoryTypes> {
  constructor() {
    super("enrollments/enrollment", EnrollmentAdapter);
  }
}

export default new EnrollmentRepository();
