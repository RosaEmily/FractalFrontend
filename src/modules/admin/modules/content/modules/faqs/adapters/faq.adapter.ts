import type { Faq } from "../models/faq.model";
import type { FaqDTO } from "../dto/faq.dto";

export const faqAdapter = {
  one: (dto: FaqDTO): Faq => ({
    id: dto.id,
    question: dto.question,
    answer: dto.answer,
  }),

  many: (dtos: FaqDTO[]): Faq[] => dtos.map((dto) => faqAdapter.one(dto)),
};
