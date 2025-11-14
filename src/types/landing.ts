export interface Banner { id: string; desktop: string; mobile: string }
export interface KPI { id: string; name: string; number: number; format: string }
export interface Partner { id: string; name: string; image: string }
export interface Contact { id: string; description: string; isFavorite: boolean; type: string; value: string }
export interface SocialNetwork { name: string; url: string }

export interface LandingData {
  logo: string
  banner: Banner[]
  kpis: KPI[]
  partners: Partner[]
  contact: Contact[]
  social_networks: SocialNetwork[]
  libro_reclamaciones: string
}

export interface ErrorDetails {
  [key: string]: unknown
}

export interface LandingResponse {
  success: boolean
  error: { code: number; message: string; details: ErrorDetails | null }
  data: LandingData[]
}