import type { Currency, CurrencyCountry } from "../models/currency.model";
import type {
  CurrencyDTO,
  CurrencyCountryDTO,
} from "../dto/currency.dto";

export const CurrencyAdapter = {
  one: (dto: CurrencyDTO): Currency => ({
    id: dto.id,
    code: dto.code,
    name: dto.name,
    symbol: dto.symbol,
    isoNumber: dto.iso_number != null ? Number(dto.iso_number) : null,
    decimalPlaces: dto.decimal_places,
    country: dto.country,
    status: dto.status,
    updated_at: String(dto.updated_at),
    label: `${dto.code} · ${dto.name} (${dto.symbol})`,
  }),

  many: (dtos: CurrencyDTO[]): Currency[] =>
    dtos.map((dto) => CurrencyAdapter.one(dto)),
};

export const CurrencyCountryAdapter = {
  one: (dto: CurrencyCountryDTO): CurrencyCountry => ({
    key: dto.key,
    country: dto.country,
    code: dto.code,
    name: dto.name,
    symbol: dto.symbol,
    isoNumber: Number(dto.iso_number),
    decimalPlaces: Number(dto.decimal_places),
  }),

  many: (dtos: CurrencyCountryDTO[]): CurrencyCountry[] =>
    dtos.map((dto) => CurrencyCountryAdapter.one(dto)),
};
