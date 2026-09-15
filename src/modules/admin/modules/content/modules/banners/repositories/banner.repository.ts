import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { BannerRepositoryTypes, Banner } from "../models/banner.model";
import type { BannerDTO, BannerBodyDTO } from "../dto/banner.dto";
import { bannerAdapter } from "../adapters/banner.adapter";

/** Dos imágenes (desktop y mobile), así que create/update van multipart. */
class BannerRepository extends BaseRepository<BannerRepositoryTypes> {
  constructor() {
    super("landing/banners", bannerAdapter);
  }

  private toFormData(body: BannerBodyDTO): FormData {
    const payload = new FormData();
    if (body.alt_desktop != null)
      payload.append("alt_desktop", body.alt_desktop);
    if (body.alt_mobile != null) payload.append("alt_mobile", body.alt_mobile);
    if (body.desktop instanceof File) payload.append("desktop", body.desktop);
    if (body.mobile instanceof File) payload.append("mobile", body.mobile);
    return payload;
  }

  private get multipartConfig() {
    return { headers: { "Content-Type": "multipart/form-data" } };
  }

  async create(body: BannerBodyDTO): Promise<ApiResponse<Banner | null>> {
    const response = await apiFractal.post<BannerDTO>(
      this.route,
      this.toFormData(body),
      this.multipartConfig,
    );
    return {
      ...response,
      data: response.data ? bannerAdapter.one(response.data) : null,
    };
  }

  /** PHP no parsea multipart en PUT: se usa POST con method spoofing. */
  async update(
    id: number | string,
    body: BannerBodyDTO,
  ): Promise<ApiResponse<Banner | null>> {
    const payload = this.toFormData(body);
    payload.append("_method", "PUT");

    const response = await apiFractal.post<BannerDTO>(
      `${this.route}/${id}`,
      payload,
      this.multipartConfig,
    );
    return {
      ...response,
      data: response.data ? bannerAdapter.one(response.data) : null,
    };
  }
}

export default new BannerRepository();
