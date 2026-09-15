import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { StudentRepositoryTypes } from "../models/student.model";
import { studentAdapter } from "../adapters/student.adapter";

/**
 * La API expone students con `document_number` como identificador, no un id
 * numérico; BaseRepository ya acepta string en edit/update.
 */
class StudentRepository extends BaseRepository<StudentRepositoryTypes> {
  constructor() {
    super("academic/students", studentAdapter);
  }
}

export default new StudentRepository();
