export type FooterLinkType = "page" | "url" | "faqs";

export interface FooterLinkDTO {
  label: string;
  type: FooterLinkType;
  page?: string | null;
  url?: string | null;
  icon?: string | null;
}

export interface FooterColumnDTO {
  title: string;
  links: FooterLinkDTO[];
}

export interface FooterContactPageDTO {
  eyebrow?: string | null;
  title?: string | null;
  title_accent?: string | null;
  description?: string | null;
  email_note?: string | null;
  phone_note?: string | null;
  address_note?: string | null;
  whatsapp_note?: string | null;
  form_note?: string | null;
}

export interface FooterDTO {
  brand_text?: string | null;
  legal_name?: string | null;
  location_text?: string | null;
  ruc?: string | null;
  legal_address?: string | null;
  columns?: FooterColumnDTO[] | null;
  contact_page?: FooterContactPageDTO | null;
}

/** Lo que edita el formulario: campos planos + columnas (que se manejan aparte). */
export interface FooterBodyDTO {
  brand_text: string | null;
  legal_name: string | null;
  location_text: string | null;
  ruc: string | null;
  legal_address: string | null;
  cp_eyebrow: string | null;
  cp_title: string | null;
  cp_title_accent: string | null;
  cp_description: string | null;
  cp_email_note: string | null;
  cp_phone_note: string | null;
  cp_address_note: string | null;
  cp_whatsapp_note: string | null;
  cp_form_note: string | null;
}
