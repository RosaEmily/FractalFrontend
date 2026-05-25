import { footerRepository } from "../repositories/footer.repository";
import type { Footer } from "../models/footer.model";

class FooterService {
  get(): Footer {
    return footerRepository.get();
  }
}

export const footerService = new FooterService();
