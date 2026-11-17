export type ComplaintTypeDTO = "claim" | "complaint";
export type ComplaintStateDTO = "pending" | "in_progress" | "answered";

export interface ComplaintDTO {
  id: number;
  code: string | null;
  type: ComplaintTypeDTO;
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
  contracted_type: "product" | "service";
  offer_id: number | null;
  good_description: string;
  amount_claimed: string | null;
  currency_id: number | null;
  detail: string;
  consumer_request: string;
  state: ComplaintStateDTO;
  due_at: string | null;
  response: string | null;
  responded_at: string | null;
  responded_by: number | null;
  created_at: string;
}

export interface ComplaintRespondBodyDTO {
  state: "in_progress" | "answered";
  response?: string | null;
}
