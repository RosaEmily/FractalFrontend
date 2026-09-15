import type { PaymentMethod } from "../models/payment-method.model";
import type { PaymentMethodDTO } from "../dto/payment-method.dto";

export const PaymentMethodAdapter = {
  one: (dto: PaymentMethodDTO): PaymentMethod => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status ?? dto.active,
    updated_at: dto.updated_at,
  }),

  many: (dtos: PaymentMethodDTO[]): PaymentMethod[] =>
    dtos.map((dto) => PaymentMethodAdapter.one(dto)),
};
