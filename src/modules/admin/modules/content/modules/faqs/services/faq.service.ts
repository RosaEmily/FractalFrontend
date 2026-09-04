import { BaseService } from "@/modules/admin/services/base.service";
import FaqRepository from "../repositories/faq.repository";
import type { FaqRepositoryTypes } from "../models/faq.model";

class FaqService extends BaseService<typeof FaqRepository, FaqRepositoryTypes> {
  constructor() {
    super(FaqRepository);
  }
}

export default new FaqService();
