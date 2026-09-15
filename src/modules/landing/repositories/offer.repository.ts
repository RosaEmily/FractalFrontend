import apiClient from "@/shared/helpers/axios/api-fractal";
import { OfferAdapter } from "../adapters/offer.adapter";
import type { OfferDTO, OfferListDTO } from "../dto/offer.dto";
import type { Offer, OfferList } from "../models/offer.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class OfferRepository {
  private readonly route = "landing/offers";

  async list(params?: Record<string, string>): Promise<ApiResponse<OfferList>> {
    const response = await apiClient.get<OfferListDTO>(this.route, { params });
    return { ...response, data: response.data ? OfferAdapter.many(response.data.items, response.data.meta) : null };
  }

  async get(id: number): Promise<ApiResponse<Offer>> {
    const response = await apiClient.get<OfferDTO>(`${this.route}/${id}`);
    return { ...response, data: response.data ? OfferAdapter.one(response.data) : null };
  }
}

export const offerRepository = new OfferRepository();
