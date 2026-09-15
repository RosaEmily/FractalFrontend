import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { TeacherRepositoryTypes } from "../models/teacher.model";
import { TeacherAdapter } from "../adapters/teacher.adapter";

class TeacherRepository extends BaseRepository<TeacherRepositoryTypes> {
  constructor() {
    super("academic/teachers", TeacherAdapter);
  }
}

export default new TeacherRepository();
