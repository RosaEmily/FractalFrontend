import { BaseService } from "@/modules/admin/services/base.service";
import TestimonialRepository from "../repositories/testimonial.repository";
import type { TestimonialRepositoryTypes } from "../models/testimonial.model";

class TestimonialService extends BaseService<
  typeof TestimonialRepository,
  TestimonialRepositoryTypes
> {
  constructor() {
    super(TestimonialRepository);
  }

  /** Ver el repositorio: alterna la curación editorial. */
  featured(ids: (number | string)[], isFeatured: boolean): Promise<void> {
    return TestimonialRepository.featured(ids, isFeatured);
  }
}

export default new TestimonialService();
