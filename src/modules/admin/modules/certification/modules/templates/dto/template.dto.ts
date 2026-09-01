export interface CertificateTemplateDTO {
  id: number;
  name: string;
  background_image: string | null;
  font_family: string | null;
  signature_image: string | null;
  layout_config: Record<string, unknown> | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface CertificateTemplateBodyDTO {
  name: string | null;
  font_family: string | null;
  /** Archivos nuevos; al editar pueden omitirse para conservar los actuales. */
  background_image?: File | null;
  signature_image?: File | null;
}
