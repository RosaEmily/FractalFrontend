export interface PartnerData { 
  id: string; 
  name: string; 
  image: string 
}

export interface Partner extends PartnerData {
  imageAlt: string
}