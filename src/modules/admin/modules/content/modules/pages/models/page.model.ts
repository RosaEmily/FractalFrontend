import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { PageDTO, PageBodyDTO } from "../dto/page.dto";

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
}

export interface PageRepositoryTypes {
  base: RepositoryBase<Page, PageDTO>;
  create: { body: PageBodyDTO };
  update: { body: PageBodyDTO };
}
