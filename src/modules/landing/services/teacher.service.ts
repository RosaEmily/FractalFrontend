import { teacherRepository } from "../repositories/teacher.repository";
import type { TeacherList } from "../models/teacher.model";

class TeacherService {
  async get(): Promise<TeacherList | null> {
    const resp = await teacherRepository.get();
    return resp.data;
  }
}

export const teacherService = new TeacherService();
