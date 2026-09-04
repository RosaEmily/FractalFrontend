import type { Contact } from "../models/contact.model";
import type { ContactDTO } from "../dto/contact.dto";
import { CONTACT_TYPE_LABEL } from "../constants/contact.constant";

export const ContactAdapter = {
  one: (dto: ContactDTO): Contact => ({
    id: dto.id,
    description: dto.description,
    type: dto.type,
    typeLabel: CONTACT_TYPE_LABEL[dto.type] ?? dto.type,
    value: dto.value,
    isFavorite: Boolean(dto.isFavorite),
  }),

  many: (dtos: ContactDTO[]): Contact[] =>
    dtos.map((dto) => ContactAdapter.one(dto)),
};
