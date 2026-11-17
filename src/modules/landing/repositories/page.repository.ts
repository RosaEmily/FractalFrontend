import apiClient from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { PageDTO } from "../dto/page.dto";

class PageRepository {
  /** Página informativa publicada, por su slug. 404 si no existe o está sin publicar. */
  async get(slug: string): Promise<ApiResponse<PageDTO>> {
    return apiClient.get<PageDTO>(`landing/info/${encodeURIComponent(slug)}`);
  }
}

export const pageRepository = new PageRepository();
