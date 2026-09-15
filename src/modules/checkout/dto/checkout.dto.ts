import type {
  CartTotals,
  CartProblem,
  PaymentMethodType,
  PurchaseResult,
} from "../models/checkout.model";

export interface PaymentMethodDTO {
  id: number;
  name: string;
  description: string | null;
  type: PaymentMethodType;
  sort_order: number;
}

export interface CartValidationDTO {
  valid: boolean;
  problems: CartProblem[];
  totals: CartTotals;
}

export type PurchaseResultDTO = PurchaseResult;
