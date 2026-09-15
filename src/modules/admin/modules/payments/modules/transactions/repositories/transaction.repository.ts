import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { TransactionRepositoryTypes } from "../models/transaction.model";
import { TransactionAdapter } from "../adapters/transaction.adapter";

/** Solo lectura: la API no expone crear, editar ni borrar. */
class TransactionRepository extends BaseRepository<TransactionRepositoryTypes> {
  constructor() {
    super("payments/transactions", TransactionAdapter);
  }
}

export default new TransactionRepository();
