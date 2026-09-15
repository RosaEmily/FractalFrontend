import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { ContactDTO, ContactBodyDTO, ContactType } from "../dto/contact.dto";

export interface Contact {
  id: string;
  description: string;
  type: ContactType;
  typeLabel: string;
  value: string;
  isFavorite: boolean;
}

export interface ContactRepositoryTypes {
  base: RepositoryBase<Contact, ContactDTO>;
  create: { body: ContactBodyDTO };
  update: { body: ContactBodyDTO };
}
