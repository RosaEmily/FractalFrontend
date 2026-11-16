import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { TestimonialRepositoryTypes } from "../models/testimonial.model";
import { TestimonialAdapter } from "../adapters/testimonial.adapter";

class TestimonialRepository extends BaseRepository<TestimonialRepositoryTypes> {
  constructor() {
    super("testimonials", TestimonialAdapter);
  }

  /**
   * Curación editorial: alterna `is_featured`, separado de `status`. Mismo
   * patrón que `status()` de `BaseRepository`, pero contra su propia acción.
   */
  async featured(
    ids: (number | string)[],
    isFeatured: boolean,
  ): Promise<void> {
    await apiFractal.patch(`${this.route}/actions/featured`, {
      ids,
      is_featured: isFeatured ? 1 : 0,
    });
  }
}

export default new TestimonialRepository();
