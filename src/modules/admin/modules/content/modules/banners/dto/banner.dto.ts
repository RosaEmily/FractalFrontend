export interface BannerDTO {
  id: string;
  desktop: string;
  mobile: string;
  alt_desktop: string | null;
  alt_mobile: string | null;
}

export interface BannerBodyDTO {
  alt_desktop: string | null;
  alt_mobile: string | null;
  desktop?: File | null;
  mobile?: File | null;
}
