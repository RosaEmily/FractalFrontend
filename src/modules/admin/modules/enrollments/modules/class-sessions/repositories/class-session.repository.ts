import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ClassSessionRepositoryTypes } from "../models/class-session.model";
import { ClassSessionAdapter } from "../adapters/class-session.adapter";
import type {
  ClassSessionBulkBodyDTO,
  ClassSessionBulkResultDTO,
} from "../dto/class-session.dto";
import type { ApiResponse } from "@/shared/interface/api-response";

class ClassSessionRepository extends BaseRepository<ClassSessionRepositoryTypes> {
  constructor() {
    super("offers/class-sessions", ClassSessionAdapter);
  }

  /**
   * Alta por lote. Devuelve cuántas se crearon y cuáles se omitieron.
   *
   * ⚠️ El servidor responde 200 aunque omita filas: en un lote es normal que
   * una clase ya exista, y fallar entero obligaría a rehacer el formulario.
   * Hay que mirar `skipped`, no solo el éxito de la petición.
   */
  async bulkStore(
    body: ClassSessionBulkBodyDTO,
  ): Promise<ClassSessionBulkResultDTO> {
    const response = await apiFractal.post<
      ApiResponse<ClassSessionBulkResultDTO>
    >(`${this.route}/actions/bulk-store`, body);

    // `ApiResponse.data` es `T | null`. Un 200 sin cuerpo no debería pasar,
    // pero devolver un resultado vacío evita que la página reviente leyendo
    // `.skipped` de null.
    return response.data?.data ?? { created: 0, skipped: [] };
  }
}

export default new ClassSessionRepository();
