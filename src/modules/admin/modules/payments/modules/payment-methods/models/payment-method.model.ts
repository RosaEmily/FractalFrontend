import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  PaymentMethodDTO,
  PaymentMethodBodyDTO,
} from "../dto/payment-method.dto";

export interface PaymentMethod {
  id: number;
  name: string;
  description: string | null;
  /** La tabla usa `active`; la API lo expone también como `status`. */
  status: number;
  updated_at: string;
}

export interface PaymentMethodRepositoryTypes {
  base: RepositoryBase<PaymentMethod, PaymentMethodDTO>;
  create: { body: PaymentMethodBodyDTO };
  update: { body: PaymentMethodBodyDTO };
}
