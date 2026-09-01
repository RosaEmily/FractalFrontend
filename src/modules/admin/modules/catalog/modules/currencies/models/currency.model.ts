import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  CurrencyDTO,
  CurrencyBodyDTO,
  CurrencyCountryDTO,
} from "../dto/currency.dto";

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  /** Código numérico ISO 4217 (ej. 840 = USD). Obligatorio en la API. */
  isoNumber: number | null;
  decimalPlaces: number;
  country: string | null;
  status: number;
  updated_at: string;
  /** Etiqueta lista para selects — ej: "PEN · Sol peruano (S/)". */
  label: string;
}

export interface CurrencyRepositoryTypes {
  base: RepositoryBase<Currency, CurrencyDTO>;
  create: { body: CurrencyBodyDTO };
  update: { body: CurrencyBodyDTO };
}

export interface CurrencyCountry {
  key: string;
  country: string;
  code: string;
  name: string;
  symbol: string;
  isoNumber: number;
  decimalPlaces: number;
}

export type { CurrencyCountryDTO };
