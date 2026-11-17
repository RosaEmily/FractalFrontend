import footerRepository from "../repositories/footer.repository";
import { FooterAdapter } from "../adapters/footer.adapter";
import type { Footer } from "../models/footer.model";
import type { FooterBodyDTO, FooterColumnDTO } from "../dto/footer.dto";

/** Registro único: solo leer y guardar. */
class FooterService {
  async show(): Promise<Footer> {
    const resp = await footerRepository.show();
    return resp.data ?? FooterAdapter.one(null);
  }

  async update(form: FooterBodyDTO, columns: FooterColumnDTO[]): Promise<Footer> {
    const resp = await footerRepository.update(FooterAdapter.toBody(form, columns));
    return resp.data ?? FooterAdapter.one(null);
  }
}

export default new FooterService();
