export interface CurrencyDTO {
  id: number;
  code: string;
  name: string;
  symbol: string;
  iso_number: string | number;
  decimal_places: number;
  country: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface CurrencyBodyDTO {
  code: string | null;
  name: string | null;
  symbol: string | null;
  iso_number: number | null;
  decimal_places: number | null;
  country: string | null;
}

/** Opción del catálogo país → moneda que expone la API. */
export interface CurrencyCountryDTO {
  key: string;
  country: string;
  code: string;
  name: string;
  symbol: string;
  iso_number: number;
  decimal_places: number;
}
