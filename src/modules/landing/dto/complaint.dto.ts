export type ComplaintType = "claim" | "complaint";
export type ContractedType = "product" | "service";

export interface ComplaintBodyDTO {
  type: ComplaintType;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string | null;
  address: string;
  is_minor: boolean;
  guardian_name: string | null;
  guardian_document: string | null;
  contracted_type: ContractedType;
  offer_id: number | null;
  good_description: string;
  amount_claimed: number | null;
  currency_id: number | null;
  detail: string;
  consumer_request: string;
  consent: boolean;
  /** Señuelo anti-bots: siempre vacío en un envío real. */
  website: string;
}

/** Constancia que devuelve la API al registrar la hoja. */
export interface ComplaintReceiptDTO {
  code: string;
  due_at: string;
}
