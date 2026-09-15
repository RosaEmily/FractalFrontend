import dayjs from "dayjs";
import type { JobOffer } from "../models/job-offer.model";
import type { JobOfferDTO } from "../dto/job-offer.dto";

export const JobOfferAdapter = {
  one: (dto: JobOfferDTO): JobOffer => ({
    id: dto.id,
    title: dto.title,
    company: dto.company,
    location: dto.location,
    url: dto.url,
    source: dto.source,
    description: dto.description,
    salary: dto.salary,
    employmentType: dto.employment_type,
    postedAt: dto.posted_at ? dayjs(dto.posted_at).format("DD/MM/YYYY") : null,
    scrapeFailed: (dto.scrape_status ?? "").toLowerCase() === "failed",
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: JobOfferDTO[]): JobOffer[] =>
    dtos.map((dto) => JobOfferAdapter.one(dto)),
};
