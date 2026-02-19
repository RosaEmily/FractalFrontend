export interface BannerData { 
  id: string; 
  desktop: string; 
  mobile: string 
}

export interface Banner extends BannerData {
  imageAlt: string
}