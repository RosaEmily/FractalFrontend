import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ContactRepositoryTypes } from "../models/contact.model";
import { ContactAdapter } from "../adapters/contact.adapter";

class ContactRepository extends BaseRepository<ContactRepositoryTypes> {
  constructor() {
    super("landing/contacts", ContactAdapter);
  }
}

export default new ContactRepository();
