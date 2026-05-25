import type { TeacherDTO } from "../dto/teacher.dto";
import type { Teacher, TeacherList } from "../models/teacher.model";

const TEACHER_PHRASES: string[] = [
  "Transformación Digital en AEC",
  "Urbanismo Sostenible",
  "Gestión de la Construcción",
  "Innovación en Infraestructura",
  "Programación Dynamo BIM",
];

export const TeacherAdapter = {
  one: (dto: TeacherDTO, index = 0): Teacher => ({
    ...dto,
    phrase: TEACHER_PHRASES[index % TEACHER_PHRASES.length] ?? "Fractal Studio",
  }),

  many: (dto: TeacherDTO[]): TeacherList => ({
    teachers: dto.map((t, i) => TeacherAdapter.one(t, i)),
  }),
};
