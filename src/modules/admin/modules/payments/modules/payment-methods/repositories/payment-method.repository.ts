import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { PaymentMethodRepositoryTypes } from "../models/payment-method.model";
import { PaymentMethodAdapter } from "../adapters/payment-method.adapter";

class PaymentMethodRepository extends BaseRepository<PaymentMethodRepositoryTypes> {
  constructor() {
    super("payments/methods", PaymentMethodAdapter);
  }
}

export default new PaymentMethodRepository();
