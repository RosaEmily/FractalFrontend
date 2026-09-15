export type ContactType = "email" | "mobile" | "phone" | "address" | "other";

export interface ContactDTO {
  id: string;
  description: string;
  /** camelCase: es el único campo de la API que rompe snake_case. */
  isFavorite: boolean;
  type: ContactType;
  value: string;
}

export interface ContactBodyDTO {
  description: string | null;
  type: ContactType | null;
  value: string | null;
  isFavorite: boolean;
}
