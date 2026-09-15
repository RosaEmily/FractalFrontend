import { BaseService } from "@/modules/admin/services/base.service";
import TagRepository from "../repositories/tag.repository";
import type { TagRepositoryTypes } from "../models/tag.model";

class TagService extends BaseService<typeof TagRepository, TagRepositoryTypes> {
  constructor() {
    super(TagRepository);
  }
}

export default new TagService();
