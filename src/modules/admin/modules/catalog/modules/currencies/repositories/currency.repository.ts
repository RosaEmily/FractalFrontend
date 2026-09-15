import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ApiResponse } from "@/shared/interface/api-response";
import type {
  CurrencyRepositoryTypes,
  CurrencyCountry,
} from "../models/currency.model";
import type { CurrencyCountryDTO } from "../dto/currency.dto";
import {
  CurrencyAdapter,
  CurrencyCountryAdapter,
} from "../adapters/currency.adapter";

class CurrencyRepository extends BaseRepository<CurrencyRepositoryTypes> {
  constructor() {
    super("catalog/currencies", CurrencyAdapter);
  }

  /**
   * Catálogo país → moneda para el formulario. La API descarta las monedas
   * ya registradas; `excludeId` mantiene visible la que se está editando.
   */
  async countries(
    excludeId?: number | string | null,
  ): Promise<ApiResponse<CurrencyCountry[]>> {
    const response = await apiFractal.get<CurrencyCountryDTO[]>(
      `${this.route}/actions/countries`,
      { params: excludeId ? { exclude: excludeId } : undefined },
    );

    return {
      ...response,
      data: response.data ? CurrencyCountryAdapter.many(response.data) : [],
    };
  }
}

export default new CurrencyRepository();
