import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { TeacherRepositoryTypes } from "../models/teacher.model";
import { teacherAdapter } from "../adapters/teacher.adapter";

/** Identificados por document_number, no por id numérico. */
class TeacherRepository extends BaseRepository<TeacherRepositoryTypes> {
  constructor() {
    super("academic/teachers", teacherAdapter);
  }
}

export default new TeacherRepository();
