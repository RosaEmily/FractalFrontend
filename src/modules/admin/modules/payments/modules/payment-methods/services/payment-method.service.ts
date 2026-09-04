import { BaseService } from "@/modules/admin/services/base.service";
import PaymentMethodRepository from "../repositories/payment-method.repository";
import type { PaymentMethodRepositoryTypes } from "../models/payment-method.model";

class PaymentMethodService extends BaseService<
  typeof PaymentMethodRepository,
  PaymentMethodRepositoryTypes
> {
  constructor() {
    super(PaymentMethodRepository);
  }
}

export default new PaymentMethodService();
