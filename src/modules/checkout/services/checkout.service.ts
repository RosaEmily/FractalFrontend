import { checkoutRepository } from "../repositories/checkout.repository";
import type {
  CartValidation,
  PaymentMethod,
  PurchaseResult,
} from "../models/checkout.model";

class CheckoutService {
  async methods(): Promise<PaymentMethod[]> {
    const resp = await checkoutRepository.methods();
    return resp.data ?? [];
  }

  async validate(offerIds: number[]): Promise<CartValidation | null> {
    const resp = await checkoutRepository.validate(offerIds);
    return resp.data;
  }

  async purchase(
    offerIds: number[],
    paymentMethodId: number,
  ): Promise<PurchaseResult | null> {
    const resp = await checkoutRepository.purchase(offerIds, paymentMethodId);
    return resp.data;
  }
}

export const checkoutService = new CheckoutService();
