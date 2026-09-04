export type TransactionStatus = "pending" | "paid" | "failed" | "refunded";

export interface TransactionDTO {
  id: number;
  enrollment_id: number;
  payment_method_id: number;
  amount: string | number;
  currency: string;
  status: TransactionStatus;
  status_name: string;
  amount_format: string;
  payment_method_name: string | null;
  /** Alumno de la matrícula: un "#12" no dice de quién es el pago. */
  student_name: string | null;
  gateway_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}
