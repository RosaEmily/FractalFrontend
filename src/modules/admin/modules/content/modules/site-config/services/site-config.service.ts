import siteConfigRepository from "../repositories/site-config.repository";
import type { SiteConfig } from "../models/site-config.model";
import type { SiteConfigBodyDTO } from "../dto/site-config.dto";

/** Registro único: sin `list` ni `delete`, solo leer y guardar. */
class SiteConfigService {
  async show(): Promise<SiteConfig | null> {
    const resp = await siteConfigRepository.show();
    return resp.data;
  }

  async update(body: SiteConfigBodyDTO): Promise<SiteConfig | null> {
    const resp = await siteConfigRepository.update(body);
    return resp.data;
  }
}

export default new SiteConfigService();
