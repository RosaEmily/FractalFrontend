import { generalRepository } from "../repositories/general.repository";
import type { General } from "../models/general.model";

class GeneralService {
  async get(): Promise<General | null> {
    const resp = await generalRepository.get();
    return resp.data;
  }
}

export const generalService = new GeneralService();
