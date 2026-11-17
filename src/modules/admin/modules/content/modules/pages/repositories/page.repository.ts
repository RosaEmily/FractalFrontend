import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { PageRepositoryTypes } from "../models/page.model";
import { pageAdapter } from "../adapters/page.adapter";

class PageRepository extends BaseRepository<PageRepositoryTypes> {
  constructor() {
    super("landing/pages", pageAdapter);
  }
}

export default new PageRepository();
