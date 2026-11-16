import { testimonialRepository } from "../repositories/testimonial.repository";
import type { Testimonial } from "../models/testimonial.model";

class TestimonialService {
  async get(): Promise<Testimonial[]> {
    const resp = await testimonialRepository.get();
    return resp.data ?? [];
  }
}

export const testimonialService = new TestimonialService();
