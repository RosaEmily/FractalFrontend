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
    if (body.tag != null) payload.append("tag", body.tag);
    if (body.kicker != null) payload.append("kicker", body.kicker);
    if (body.title != null) payload.append("title", body.title);
    if (body.sub != null) payload.append("sub", body.sub);
    if (body.cta != null) payload.append("cta", body.cta);
    if (body.cta2 != null) payload.append("cta2", body.cta2);
    payload.append("dark", body.dark ? "1" : "0");
    // Siempre se manda: "" es la señal explícita de "sin oferta asociada"
    // (FormData no puede llevar `null`, y omitir el campo dejaría la oferta
    // guardada sin poder quitarla desde el formulario).
    payload.append("offer_id", body.offer_id != null ? String(body.offer_id) : "");
    if (body.order != null) payload.append("order", String(body.order));
    // `string` = URL sugerida de la oferta (viaja tal cual); `File` = subida
    // real del admin. Ambos casos se mandan, solo `null` se omite (edición
    // sin tocar la imagen ya guardada).
    if (body.desktop instanceof File || typeof body.desktop === "string")
      payload.append("desktop", body.desktop);
    if (body.mobile instanceof File || typeof body.mobile === "string")
      payload.append("mobile", body.mobile);
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
