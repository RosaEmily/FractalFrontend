export interface SponsorDTO {
  id: string;
  name: string;
  image: string;
}

export interface SponsorBodyDTO {
  name: string | null;
  /** Archivo nuevo; al editar puede omitirse para conservar el actual. */
  image?: File | null;
}
