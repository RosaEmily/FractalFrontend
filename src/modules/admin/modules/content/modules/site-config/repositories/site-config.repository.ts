import apiFractal from "@/shared/helpers/axios/api-fractal";
import { buildRequestBody } from "@/shared/utils/form-data";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { SiteConfig } from "../models/site-config.model";
import type { SiteConfigDTO, SiteConfigBodyDTO } from "../dto/site-config.dto";
import { SiteConfigAdapter } from "../adapters/site-config.adapter";

/**
 * No extiende `BaseRepository`: la configuración del sitio es un **registro
 * único** (`GET`/`PUT landing/config`), sin id, sin listado y sin borrado.
 */
class SiteConfigRepository {
  private route = "landing/config";

  async show(): Promise<ApiResponse<SiteConfig | null>> {
    const response = await apiFractal.get<SiteConfigDTO>(this.route);

    return {
      ...response,
      data: response.data ? SiteConfigAdapter.one(response.data) : null,
    };
  }

  /**
   * Guarda la configuración.
   *
   * Con logo va por POST con `_method: PUT`: PHP no parsea
   * `multipart/form-data` en peticiones PUT y el body llegaría vacío.
   * `buildRequestBody` detecta el `File` y arma el multipart solo.
   */
  async update(body: SiteConfigBodyDTO): Promise<ApiResponse<SiteConfig | null>> {
    const { data: payload, config, spoofed } = buildRequestBody(
      body as unknown as Record<string, unknown>,
      "PUT",
    );

    const response = spoofed
      ? await apiFractal.post<SiteConfigDTO>(this.route, payload, config)
      : await apiFractal.put<SiteConfigDTO>(this.route, payload);

    return {
      ...response,
      data: response.data ? SiteConfigAdapter.one(response.data) : null,
    };
  }
}

export default new SiteConfigRepository();
