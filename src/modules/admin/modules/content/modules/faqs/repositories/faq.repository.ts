import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { FaqRepositoryTypes } from "../models/faq.model";
import { faqAdapter } from "../adapters/faq.adapter";

class FaqRepository extends BaseRepository<FaqRepositoryTypes> {
  constructor() {
    super("landing/faqs", faqAdapter);
  }
}

export default new FaqRepository();
