export interface SiteConfigDTO {
  logo: string | null;
  complaints_book: string | null;
  site_name: string | null;
  whatsapp: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

/** Lo que acepta `PUT landing/config`. El logo viaja como archivo. */
export interface SiteConfigBodyDTO {
  site_name: string | null;
  whatsapp: string | null;
  meta_title: string | null;
  meta_description: string | null;
  complaints_book: string | null;
  logo?: File | null;
}
