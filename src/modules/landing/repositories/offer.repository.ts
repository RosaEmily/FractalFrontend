import apiClient from "@/shared/helpers/axios/api-fractal";
import { OfferAdapter } from "../adapters/offer.adapter";
import type { OfferListDTO } from "../dto/offer.dto";
import type { OfferList } from "../models/offer.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class OfferRepository {
  private readonly route = "landing/offers";

  async list(params?: Record<string, string>): Promise<ApiResponse<OfferList>> {
    const response = await apiClient.get<OfferListDTO>(this.route, { params });
    return { ...response, data: response.data ? OfferAdapter.many(response.data.items, response.data.meta) : null };
  }
}

export const offerRepository = new OfferRepository();
