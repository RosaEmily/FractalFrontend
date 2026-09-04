import type { Student } from "../models/student.model";
import type { StudentDTO } from "../dto/student.dto";

export const studentAdapter = {
  one: (dto: StudentDTO): Student => ({
    document_number: dto.document_number,
    document_type: dto.document_type,
    // El diseño muestra "DNI 45211398" en una sola celda.
    documentLabel: [dto.document_type, dto.document_number]
      .filter(Boolean)
      .join(" "),
    // La foto y el correo viven en `users`; el formulario los edita por ahí.
    user_id: dto.user_id ?? null,
    full_name: `${dto.first_name ?? ""} ${dto.last_name ?? ""}`.trim(),
    first_name: dto.first_name,
    last_name: dto.last_name,
    email: dto.email,
    phone: dto.phone,
    photo_url: dto.photo_url,
    career: dto.career,
    career_name: dto.career_name,
    education_level: dto.education_level,
    education_level_name: dto.education_level_name,
    other_career: dto.other_career,
    // birth_date_raw viene ISO; el form necesita solo la fecha.
    birth_date: dto.birth_date_raw ? dto.birth_date_raw.slice(0, 10) : null,
    birth_date_formatted: dto.birth_date_formatted,
    address: dto.address,
    gender: dto.gender,
    is_favorite: dto.is_favorite,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: StudentDTO[]): Student[] =>
    dtos.map((dto) => studentAdapter.one(dto)),
};
