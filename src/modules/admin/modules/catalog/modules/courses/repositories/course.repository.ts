import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { CourseRepositoryTypes } from "../models/course.model";
import { CourseAdapter } from "../adapters/course.adapter";

class CourseRepository extends BaseRepository<CourseRepositoryTypes> {
  constructor() {
    super("academic/courses", CourseAdapter);
  }
}

export default new CourseRepository();
