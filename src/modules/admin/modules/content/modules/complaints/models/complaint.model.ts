import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { ComplaintDTO, ComplaintStateDTO, ComplaintTypeDTO } from "../dto/complaint.dto";

export interface Complaint {
  id: number;
  code: string;
  type: ComplaintTypeDTO;
  typeLabel: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string | null;
  address: string;
  isMinor: boolean;
  guardianName: string | null;
  guardianDocument: string | null;
  contractedLabel: string;
  goodDescription: string;
  amount: string | null;
  detail: string;
  consumerRequest: string;
  state: ComplaintStateDTO;
  dueAt: string | null;
  /** `DD/MM/YYYY` para mostrar; `dueAt` queda en ISO para comparar. */
  dueAtLabel: string | null;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  /** Pendiente o en proceso y con la fecha límite ya pasada. */
  isOverdue: boolean;
}

/** Solo lectura y respuesta: una hoja de reclamación no se crea ni se edita en el panel. */
export interface ComplaintRepositoryTypes {
  base: RepositoryBase<Complaint, ComplaintDTO>;
}
