import apiClient from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import { PaymentMethodAdapter } from "../adapters/checkout.adapter";
import type {
  CartValidationDTO,
  PaymentMethodDTO,
  PurchaseResultDTO,
} from "../dto/checkout.dto";
import type {
  CartValidation,
  PaymentMethod,
  PurchaseResult,
} from "../models/checkout.model";

class CheckoutRepository {
  private readonly route = "checkout";

  async methods(): Promise<ApiResponse<PaymentMethod[]>> {
    const response = await apiClient.get<PaymentMethodDTO[]>(`${this.route}/methods`);
    return {
      ...response,
      data: response.data ? PaymentMethodAdapter.many(response.data) : null,
    };
  }

  /** Revisa el carrito sin cobrar: cupo, recompra, moneda e importes. */
  async validate(offerIds: number[]): Promise<ApiResponse<CartValidation>> {
    return await apiClient.post<CartValidationDTO>(`${this.route}/validate`, {
      offer_id: offerIds,
    });
  }

  async purchase(
    offerIds: number[],
    paymentMethodId: number,
  ): Promise<ApiResponse<PurchaseResult>> {
    return await apiClient.post<PurchaseResultDTO>(`${this.route}/purchase`, {
      offer_id: offerIds,
      payment_method_id: paymentMethodId,
    });
  }
}

export const checkoutRepository = new CheckoutRepository();
