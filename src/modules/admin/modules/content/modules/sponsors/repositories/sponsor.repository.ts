import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { SponsorRepositoryTypes, Sponsor } from "../models/sponsor.model";
import type { SponsorDTO, SponsorBodyDTO } from "../dto/sponsor.dto";
import { sponsorAdapter } from "../adapters/sponsor.adapter";

/**
 * El logo se sube como archivo, así que create/update mandan multipart en vez
 * del JSON que arma BaseRepository. El cliente axios fija
 * `Content-Type: application/json` por defecto: hay que sobrescribirlo para
 * que el navegador ponga el boundary.
 */
class SponsorRepository extends BaseRepository<SponsorRepositoryTypes> {
  constructor() {
    super("landing/sponsors", sponsorAdapter);
  }

  private toFormData(body: SponsorBodyDTO): FormData {
    const payload = new FormData();
    if (body.name != null) payload.append("name", body.name);
    if (body.image instanceof File) payload.append("image", body.image);
    return payload;
  }

  private get multipartConfig() {
    return { headers: { "Content-Type": "multipart/form-data" } };
  }

  async create(body: SponsorBodyDTO): Promise<ApiResponse<Sponsor | null>> {
    const response = await apiFractal.post<SponsorDTO>(
      this.route,
      this.toFormData(body),
      this.multipartConfig,
    );
    return {
      ...response,
      data: response.data ? sponsorAdapter.one(response.data) : null,
    };
  }

  /**
   * PUT no parsea multipart en PHP: se usa POST con method spoofing,
   * el mismo mecanismo que ya usan las colecciones Bruno del proyecto.
   */
  async update(
    id: number | string,
    body: SponsorBodyDTO,
  ): Promise<ApiResponse<Sponsor | null>> {
    const payload = this.toFormData(body);
    payload.append("_method", "PUT");

    const response = await apiFractal.post<SponsorDTO>(
      `${this.route}/${id}`,
      payload,
      this.multipartConfig,
    );
    return {
      ...response,
      data: response.data ? sponsorAdapter.one(response.data) : null,
    };
  }
}

export default new SponsorRepository();
