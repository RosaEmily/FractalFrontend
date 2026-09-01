import { BaseService } from "@/modules/admin/services/base.service";
import TransactionRepository from "../repositories/transaction.repository";
import type { TransactionRepositoryTypes } from "../models/transaction.model";

class TransactionService extends BaseService<
  typeof TransactionRepository,
  TransactionRepositoryTypes
> {
  constructor() {
    super(TransactionRepository);
  }
}

export default new TransactionService();
