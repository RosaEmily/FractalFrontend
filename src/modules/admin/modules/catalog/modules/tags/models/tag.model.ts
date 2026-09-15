import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { TagBodyDTO, TagDTO } from "../dto/tag.dto";

export interface Tag {
  id: number;
  name: string;
  slug: string;
  coursesCount: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface TagRepositoryTypes {
  base: RepositoryBase<Tag, TagDTO>;
  create: {
    body: TagBodyDTO;
  };
  update: {
    body: TagBodyDTO;
  };
}
