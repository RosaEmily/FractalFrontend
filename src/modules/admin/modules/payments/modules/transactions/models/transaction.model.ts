import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { TransactionDTO, TransactionStatus } from "../dto/transaction.dto";

export interface Transaction {
  id: number;
  enrollmentId: number;
  paymentMethodName: string | null;
  studentName: string | null;
  /** Fecha del pago, formateada para la tabla. */
  createdAtLabel: string;
  amountFormat: string;
  gatewayId: string | null;
  /** Estado del pago; es un enum, no el 0/1 de status del resto. */
  status: TransactionStatus;
  statusName: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionRepositoryTypes {
  base: RepositoryBase<Transaction, TransactionDTO>;
}
