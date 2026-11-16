import type { TeacherDetailDTO, TeacherDTO } from "../dto/teacher.dto";
import type { Teacher, TeacherDetail, TeacherList } from "../models/teacher.model";

export const TeacherAdapter = {
  one: (dto: TeacherDTO): Teacher => ({ ...dto }),

  many: (dto: TeacherDTO[]): TeacherList => ({
    teachers: dto.map((t) => TeacherAdapter.one(t)),
  }),

  detail: (dto: TeacherDetailDTO): TeacherDetail => ({ ...dto }),
};
