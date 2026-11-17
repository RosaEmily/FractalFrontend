import { BaseService } from "@/modules/admin/services/base.service";
import PageRepository from "../repositories/page.repository";
import type { PageRepositoryTypes } from "../models/page.model";

class PageService extends BaseService<typeof PageRepository, PageRepositoryTypes> {
  constructor() {
    super(PageRepository);
  }
}

export default new PageService();
