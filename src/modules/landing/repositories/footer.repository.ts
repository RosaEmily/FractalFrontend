import footerConfig from "@/assets/config/footer.json";
import { FooterAdapter } from "../adapters/footer.adapter";
import type { FooterDTO } from "../dto/footer.dto";
import type { Footer } from "../models/footer.model";

class FooterRepository {
  get(): Footer {
    return FooterAdapter.one(footerConfig as FooterDTO);
  }
}

export const footerRepository = new FooterRepository();
