export interface JobOfferDTO {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  source: string | null;
  description: string | null;
  skills: string | null;
  salary: string | null;
  employment_type: string | null;
  posted_at: string | null;
  courses_id: number[] | null;
  /** "failed" cuando el último scraping no pudo capturar la oferta. */
  scrape_status: string | null;
  scraper_name: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface JobOfferBodyDTO {
  title: string | null;
  company: string | null;
  location: string | null;
  url: string | null;
  source: string | null;
  description: string | null;
  salary: string | null;
  employment_type: string | null;
  posted_at: string | null;
}
