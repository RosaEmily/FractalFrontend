import type { Teacher } from "../models/teacher.model";
import type { TeacherDTO } from "../dto/teacher.dto";

export const TeacherAdapter = {
  one: (dto: TeacherDTO): Teacher => ({
    documentNumber: dto.document_number,
    firstName: dto.first_name,
    lastName: dto.last_name,
    fullName: [dto.first_name, dto.last_name].filter(Boolean).join(" "),
    email: dto.email,
    specialty: dto.specialty,
    experienceYears: dto.experience_years,
    photoUrl: dto.photo_url,
    status: dto.status,
  }),

  many: (dtos: TeacherDTO[]): Teacher[] =>
    dtos.map((dto) => TeacherAdapter.one(dto)),
};
