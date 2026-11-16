import apiClient from "@/shared/helpers/axios/api-fractal";
import { OfferFiltersAdapter } from "../adapters/offer-filters.adapter";
import type { OfferFiltersDTO } from "../dto/offer-filters.dto";
import type { OfferFilters } from "../models/offer.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class OfferFiltersRepository {
  private readonly route = "landing/offers/filters";

  async get(): Promise<ApiResponse<OfferFilters>> {
    const response = await apiClient.get<OfferFiltersDTO>(this.route);
    return {
      ...response,
      data: response.data ? OfferFiltersAdapter.one(response.data) : null,
    };
  }
}

export const offerFiltersRepository = new OfferFiltersRepository();
