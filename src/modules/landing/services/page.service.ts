import { pageRepository } from "../repositories/page.repository";
import type { PageDTO } from "../dto/page.dto";

class PageService {
  async get(slug: string): Promise<PageDTO | null> {
    const resp = await pageRepository.get(slug);
    return resp.data;
  }
}

export const pageService = new PageService();
