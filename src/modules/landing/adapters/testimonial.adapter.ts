import type { TestimonialDTO } from "../dto/testimonial.dto";
import type { Testimonial } from "../models/testimonial.model";

export const TestimonialAdapter = {
  one: (dto: TestimonialDTO): Testimonial => ({
    name: dto.name ?? "Alumno de Fractal Studio",
    career: dto.career ?? "",
    work: dto.work,
    // `Review.image` no es nullable: sin foto, cae a inicial coloreada (ver
    // `ReviewsSection.vue`, que hoy ni siquiera renderiza este campo).
    image: dto.image ?? "",
    opinion: dto.opinion,
    stars: Number(dto.stars),
    program: dto.program ?? undefined,
  }),

  many: (dtos: TestimonialDTO[]): Testimonial[] =>
    dtos.map((dto) => TestimonialAdapter.one(dto)),
};
