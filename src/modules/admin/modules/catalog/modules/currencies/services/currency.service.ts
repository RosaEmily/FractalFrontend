import { BaseService } from "@/modules/admin/services/base.service";
import CurrencyRepository from "../repositories/currency.repository";
import type {
  CurrencyRepositoryTypes,
  CurrencyCountry,
} from "../models/currency.model";

class CurrencyService extends BaseService<
  typeof CurrencyRepository,
  CurrencyRepositoryTypes
> {
  constructor() {
    super(CurrencyRepository);
  }

  async countries(
    excludeId?: number | string | null,
  ): Promise<CurrencyCountry[]> {
    const resp = await CurrencyRepository.countries(excludeId);
    return resp.data ?? [];
  }
}

export default new CurrencyService();
