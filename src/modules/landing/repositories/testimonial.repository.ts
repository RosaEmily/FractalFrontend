import apiClient from "@/shared/helpers/axios/api-fractal";
import { TestimonialAdapter } from "../adapters/testimonial.adapter";
import type { TestimonialDTO } from "../dto/testimonial.dto";
import type { Testimonial } from "../models/testimonial.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class TestimonialRepository {
  private readonly route = "landing/testimonials";

  /** Testimonios curados (`is_featured=1`) para el Home. Puede venir vacío. */
  async get(): Promise<ApiResponse<Testimonial[]>> {
    const response = await apiClient.get<TestimonialDTO[]>(this.route);
    return {
      ...response,
      data: response.data ? TestimonialAdapter.many(response.data) : null,
    };
  }
}

export const testimonialRepository = new TestimonialRepository();
