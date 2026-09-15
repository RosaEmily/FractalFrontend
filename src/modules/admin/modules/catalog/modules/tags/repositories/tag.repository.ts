import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { TagRepositoryTypes } from "../models/tag.model";
import { TagAdapter } from "../adapters/tag.adapter";

class TagRepository extends BaseRepository<TagRepositoryTypes> {
  constructor() {
    super("academic/tags", TagAdapter);
  }
}

export default new TagRepository();
