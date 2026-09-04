import type { SiteConfig } from "../models/site-config.model";
import type { SiteConfigDTO } from "../dto/site-config.dto";

export const SiteConfigAdapter = {
  one: (dto: SiteConfigDTO): SiteConfig => ({
    logo: dto.logo ?? null,
    complaintsBook: dto.complaints_book ?? null,
    siteName: dto.site_name ?? null,
    whatsapp: dto.whatsapp ?? null,
    metaTitle: dto.meta_title ?? null,
    metaDescription: dto.meta_description ?? null,
  }),
};
