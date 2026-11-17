import type { ComplaintStateDTO, ComplaintTypeDTO } from "../dto/complaint.dto";

/** Etiquetas de lo que la API guarda en inglés (`App\Shared\Constant\Complaint`). */
export const COMPLAINT_TYPE_LABEL: Record<ComplaintTypeDTO, string> = {
  claim: "Reclamo",
  complaint: "Queja",
};

export const CONTRACTED_TYPE_LABEL = {
  product: "Producto",
  service: "Servicio",
} as const;

export const COMPLAINT_STATE_LABEL: Record<ComplaintStateDTO, string> = {
  pending: "Pendiente",
  in_progress: "En proceso",
  answered: "Respondido",
};

export const COMPLAINT_STATE_TONE: Record<ComplaintStateDTO, "warning" | "info" | "success"> = {
  pending: "warning",
  in_progress: "info",
  answered: "success",
};

export const COMPLAINT_STATE_OPTIONS = (
  Object.keys(COMPLAINT_STATE_LABEL) as ComplaintStateDTO[]
).map((value) => ({ label: COMPLAINT_STATE_LABEL[value], value }));

export const COMPLAINT_TYPE_OPTIONS = (
  Object.keys(COMPLAINT_TYPE_LABEL) as ComplaintTypeDTO[]
).map((value) => ({ label: COMPLAINT_TYPE_LABEL[value], value }));
