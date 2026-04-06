export interface BannerData { 
  id: string; 
  desktop: string; 
  mobile: string 
}

export interface Banner extends BannerData {
  image_alt: string
}