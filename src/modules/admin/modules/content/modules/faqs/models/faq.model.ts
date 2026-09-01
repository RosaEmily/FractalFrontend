import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { FaqDTO, FaqBodyDTO } from "../dto/faq.dto";

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface FaqRepositoryTypes {
  base: RepositoryBase<Faq, FaqDTO>;
  create: { body: FaqBodyDTO };
  update: { body: FaqBodyDTO };
}
