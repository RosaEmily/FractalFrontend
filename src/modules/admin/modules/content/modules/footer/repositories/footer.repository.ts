import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { Footer } from "../models/footer.model";
import type { FooterDTO } from "../dto/footer.dto";
import { FooterAdapter } from "../adapters/footer.adapter";

/**
 * No extiende `BaseRepository`: el pie de página es un **registro único**
 * (`GET`/`PUT landing/footer`), sin id, sin listado y sin borrado.
 */
class FooterRepository {
  private route = "landing/footer";

  async show(): Promise<ApiResponse<Footer>> {
    const response = await apiFractal.get<FooterDTO>(this.route);
    return { ...response, data: FooterAdapter.one(response.data) };
  }

  async update(body: FooterDTO): Promise<ApiResponse<Footer>> {
    const response = await apiFractal.put<FooterDTO>(this.route, body);
    return { ...response, data: FooterAdapter.one(response.data) };
  }
}

export default new FooterRepository();
