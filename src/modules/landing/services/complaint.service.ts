import apiClient from "@/shared/helpers/axios/api-fractal";
import type { ComplaintBodyDTO, ComplaintReceiptDTO } from "../dto/complaint.dto";

class ComplaintService {
  /** Registra una hoja del Libro de Reclamaciones. Los errores se propagan (los muestra la página). */
  async send(body: ComplaintBodyDTO): Promise<ComplaintReceiptDTO | null> {
    const resp = await apiClient.post<ComplaintReceiptDTO>("landing/complaints", body);
    // Un envío descartado por el señuelo responde sin constancia.
    return resp.data ?? null;
  }
}

export const complaintService = new ComplaintService();
