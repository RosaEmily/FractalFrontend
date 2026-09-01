import type { Transaction } from "../models/transaction.model";
import type { TransactionDTO } from "../dto/transaction.dto";

export const TransactionAdapter = {
  one: (dto: TransactionDTO): Transaction => ({
    id: dto.id,
    enrollmentId: dto.enrollment_id,
    paymentMethodName: dto.payment_method_name,
    amountFormat: dto.amount_format,
    gatewayId: dto.gateway_transaction_id,
    status: dto.status,
    statusName: dto.status_name,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  }),

  many: (dtos: TransactionDTO[]): Transaction[] =>
    dtos.map((dto) => TransactionAdapter.one(dto)),
};
