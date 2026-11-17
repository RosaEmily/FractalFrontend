import type { Complaint } from "../models/complaint.model";
import type { ComplaintDTO } from "../dto/complaint.dto";
import { COMPLAINT_TYPE_LABEL, CONTRACTED_TYPE_LABEL } from "../constants/complaint.constant";

/** `due_at` llega como `YYYY-MM-DD…`; se compara por día, sin hora. */
const isPast = (iso: string | null): boolean => {
  if (!iso) return false;
  const today = new Date().toISOString().slice(0, 10);
  return iso.slice(0, 10) < today;
};

const dateTime = (iso: string | null): string | null =>
  iso
    ? new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
    : null;

/** `YYYY-MM-DD` → `DD/MM/YYYY`, sin pasar por `Date` (evita el corrimiento por zona horaria). */
const day = (iso: string | null): string | null =>
  iso ? iso.slice(0, 10).split("-").reverse().join("/") : null;

export const complaintAdapter = {
  one: (dto: ComplaintDTO): Complaint => ({
    id: dto.id,
    code: dto.code ?? `#${dto.id}`,
    type: dto.type,
    typeLabel: COMPLAINT_TYPE_LABEL[dto.type] ?? dto.type,
    fullName: `${dto.first_name} ${dto.last_name}`.trim(),
    documentType: dto.document_type,
    documentNumber: dto.document_number,
    email: dto.email,
    phone: dto.phone,
    address: dto.address,
    isMinor: Boolean(dto.is_minor),
    guardianName: dto.guardian_name,
    guardianDocument: dto.guardian_document,
    contractedLabel: CONTRACTED_TYPE_LABEL[dto.contracted_type] ?? dto.contracted_type,
    goodDescription: dto.good_description,
    amount: dto.amount_claimed,
    detail: dto.detail,
    consumerRequest: dto.consumer_request,
    state: dto.state,
    dueAt: dto.due_at ? dto.due_at.slice(0, 10) : null,
    response: dto.response,
    respondedAt: dateTime(dto.responded_at),
    createdAt: dateTime(dto.created_at) ?? "",
    dueAtLabel: day(dto.due_at),
    isOverdue: dto.state !== "answered" && isPast(dto.due_at),
  }),

  many: (dtos: ComplaintDTO[]): Complaint[] => dtos.map((dto) => complaintAdapter.one(dto)),
};
