export interface OfferFilterTypeDTO {
  value: string;
  label: string;
  count: number;
}

export interface OfferFilterTagDTO {
  id: number;
  name: string;
  count: number;
}

export interface OfferFilterTeacherDTO {
  document_number: string;
  name: string;
  count: number;
}

export interface OfferFilterCurrencyDTO {
  id: number;
  code: string;
  symbol: string;
  name: string;
  count: number;
}

export interface OfferFilterRangeDTO {
  min: number | string | null;
  max: number | string | null;
}

export interface OfferFiltersDTO {
  types: OfferFilterTypeDTO[];
  tags: OfferFilterTagDTO[];
  teachers: OfferFilterTeacherDTO[];
  currencies: OfferFilterCurrencyDTO[];
  price_range: OfferFilterRangeDTO;
  duration_range: OfferFilterRangeDTO;
}
