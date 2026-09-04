import type { Teacher } from "../models/teacher.model";
import type { TeacherDTO } from "../dto/teacher.dto";

export const teacherAdapter = {
  one: (dto: TeacherDTO): Teacher => ({
    document_number: dto.document_number,
    document_type: dto.document_type,
    // El diseño muestra "DNI 41022310" en una sola celda.
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
    specialty: dto.specialty,
    experience_years: dto.experience_years,
    description: dto.description,
    academic_degree: dto.academic_degree,
    academic_degree_name: dto.academic_degree_name,
    other_academic_degree: dto.other_academic_degree,
    cv: dto.cv,
    is_favorite: dto.is_favorite,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: TeacherDTO[]): Teacher[] =>
    dtos.map((dto) => teacherAdapter.one(dto)),
};
