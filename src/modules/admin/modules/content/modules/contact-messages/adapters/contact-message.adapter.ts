import type { ContactMessage } from "../models/contact-message.model";
import type { ContactMessageDTO } from "../dto/contact-message.dto";

export const contactMessageAdapter = {
  one: (dto: ContactMessageDTO): ContactMessage => ({
    id: dto.id,
    fullName: `${dto.first_name} ${dto.last_name}`.trim(),
    email: dto.email,
    phone: dto.phone,
    profession: dto.profession,
    program: dto.program_interest,
    message: dto.message,
    consent: Boolean(dto.consent),
    isAttended: Boolean(dto.is_attended),
    createdAt: dto.created_at,
  }),

  many: (dtos: ContactMessageDTO[]): ContactMessage[] =>
    dtos.map((dto) => contactMessageAdapter.one(dto)),
};
