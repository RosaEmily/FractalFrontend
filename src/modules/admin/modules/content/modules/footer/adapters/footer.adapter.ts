import type { Footer } from "../models/footer.model";
import type { FooterBodyDTO, FooterColumnDTO, FooterDTO } from "../dto/footer.dto";

const text = (value: string | null | undefined): string | null => value ?? null;

export const FooterAdapter = {
  one: (dto: FooterDTO | null): Footer => {
    const cp = dto?.contact_page ?? {};
    return {
      form: {
        brand_text: text(dto?.brand_text),
        legal_name: text(dto?.legal_name),
        location_text: text(dto?.location_text),
        cp_eyebrow: text(cp.eyebrow),
        cp_title: text(cp.title),
        cp_title_accent: text(cp.title_accent),
        cp_description: text(cp.description),
        cp_email_note: text(cp.email_note),
        cp_phone_note: text(cp.phone_note),
        cp_address_note: text(cp.address_note),
        cp_whatsapp_note: text(cp.whatsapp_note),
        cp_form_note: text(cp.form_note),
      },
      columns: (dto?.columns ?? []).map((c) => ({
        title: c.title,
        links: (c.links ?? []).map((l) => ({
          label: l.label,
          type: l.type,
          page: l.page ?? null,
          url: l.url ?? null,
        })),
      })),
    };
  },

  /** Del formulario plano al cuerpo anidado que espera la API. */
  toBody: (form: FooterBodyDTO, columns: FooterColumnDTO[]): FooterDTO => ({
    brand_text: form.brand_text,
    legal_name: form.legal_name,
    location_text: form.location_text,
    columns: columns.map((c) => ({
      title: c.title,
      links: c.links.map((l) => ({
        label: l.label,
        type: l.type,
        // Solo viaja el destino que corresponde al tipo.
        page: l.type === "page" ? l.page : null,
        url: l.type === "url" ? l.url : null,
      })),
    })),
    contact_page: {
      eyebrow: form.cp_eyebrow,
      title: form.cp_title,
      title_accent: form.cp_title_accent,
      description: form.cp_description,
      email_note: form.cp_email_note,
      phone_note: form.cp_phone_note,
      address_note: form.cp_address_note,
      whatsapp_note: form.cp_whatsapp_note,
      form_note: form.cp_form_note,
    },
  }),
};
