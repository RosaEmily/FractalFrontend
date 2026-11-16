export interface BannerMetaDTO {
  inicia: string | null;
  duracion: string | null;
  cupos: string | null;
  precio: string | null;
  offer_name: string | null;
  offer_enrollment_start_date: string | null;
  offer_enrollment_end_date: string | null;
}

export interface BannerDTO {
  id: string;
  desktop: string;
  mobile: string;
  alt_desktop: string | null;
  alt_mobile: string | null;
  tag: string | null;
  kicker: string | null;
  /** Texto libre; la porción entre `**...**` se resalta como acento. */
  title: string | null;
  sub: string | null;
  cta: string | null;
  cta2: string | null;
  dark: boolean;
  order: number | null;
  offer_id: number | null;
  /** Snapshot calculado por el backend al guardar. Null si no hay oferta asociada. */
  meta: BannerMetaDTO | null;
}

export interface BannerBodyDTO {
  alt_desktop: string | null;
  alt_mobile: string | null;
  tag: string | null;
  kicker: string | null;
  title: string | null;
  sub: string | null;
  cta: string | null;
  cta2: string | null;
  dark: boolean;
  order: number | null;
  offer_id: number | null;
  /** `string` = URL sugerida de la oferta asociada (viaja tal cual, sin volver a subir). */
  desktop?: File | string | null;
  mobile?: File | string | null;
}
