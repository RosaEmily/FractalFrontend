import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ApiResponse } from "@/shared/interface/api-response";
import type {
  CertificateTemplateRepositoryTypes,
  CertificateTemplate,
} from "../models/template.model";
import type {
  CertificateTemplateDTO,
  CertificateTemplateBodyDTO,
} from "../dto/template.dto";
import { CertificateTemplateAdapter } from "../adapters/template.adapter";

/** Lleva dos imágenes, así que create/update van en multipart. */
class CertificateTemplateRepository extends BaseRepository<CertificateTemplateRepositoryTypes> {
  constructor() {
    super("certification/templates", CertificateTemplateAdapter);
  }

  private toFormData(body: CertificateTemplateBodyDTO): FormData {
    const payload = new FormData();
    if (body.name != null) payload.append("name", body.name);
    if (body.font_family != null) payload.append("font_family", body.font_family);
    if (body.background_image instanceof File)
      payload.append("background_image", body.background_image);
    if (body.signature_image instanceof File)
      payload.append("signature_image", body.signature_image);
    return payload;
  }

  private get multipartConfig() {
    return { headers: { "Content-Type": "multipart/form-data" } };
  }

  async create(
    body: CertificateTemplateBodyDTO,
  ): Promise<ApiResponse<CertificateTemplate | null>> {
    const response = await apiFractal.post<CertificateTemplateDTO>(
      this.route,
      this.toFormData(body),
      this.multipartConfig,
    );
    return {
      ...response,
      data: response.data
        ? CertificateTemplateAdapter.one(response.data)
        : null,
    };
  }

  /** PHP no parsea multipart en PUT: se usa POST con method spoofing. */
  async update(
    id: number | string,
    body: CertificateTemplateBodyDTO,
  ): Promise<ApiResponse<CertificateTemplate | null>> {
    const payload = this.toFormData(body);
    payload.append("_method", "PUT");

    const response = await apiFractal.post<CertificateTemplateDTO>(
      `${this.route}/${id}`,
      payload,
      this.multipartConfig,
    );
    return {
      ...response,
      data: response.data
        ? CertificateTemplateAdapter.one(response.data)
        : null,
    };
  }
}

export default new CertificateTemplateRepository();
