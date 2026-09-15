import { BaseService } from "@/modules/admin/services/base.service";
import CourseRepository from "../repositories/course.repository";
import type { CourseRepositoryTypes } from "../models/course.model";

class CourseService extends BaseService<
  typeof CourseRepository,
  CourseRepositoryTypes
> {
  constructor() {
    super(CourseRepository);
  }
}

export default new CourseService();
