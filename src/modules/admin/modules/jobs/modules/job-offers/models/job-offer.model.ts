import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { JobOfferDTO, JobOfferBodyDTO } from "../dto/job-offer.dto";

export interface JobOffer {
  id: number;
  title: string;
  company: string | null;
  location: string | null;
  url: string | null;
  source: string | null;
  description: string | null;
  salary: string | null;
  employmentType: string | null;
  postedAt: string | null;
  /** true cuando el último scraping falló: el diseño lo marca en rojo. */
  scrapeFailed: boolean;
  status: number;
  updated_at: string;
}

export interface JobOfferRepositoryTypes {
  base: RepositoryBase<JobOffer, JobOfferDTO>;
  create: { body: JobOfferBodyDTO };
  update: { body: JobOfferBodyDTO };
}
