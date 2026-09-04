import type { ContactType } from "../dto/contact.dto";

/** Etiquetas de los tipos que acepta la API (`in:email,mobile,address,other,phone`). */
export const CONTACT_TYPE_LABEL: Record<ContactType, string> = {
  email: "Correo",
  mobile: "Celular",
  phone: "Teléfono",
  address: "Dirección",
  other: "Otro",
};

export const CONTACT_TYPE_OPTIONS = (
  Object.entries(CONTACT_TYPE_LABEL) as [ContactType, string][]
).map(([value, label]) => ({ value, label }));
