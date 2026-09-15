import { BaseService } from "@/modules/admin/services/base.service";
import ContactRepository from "../repositories/contact.repository";
import type { ContactRepositoryTypes } from "../models/contact.model";

class ContactService extends BaseService<
  typeof ContactRepository,
  ContactRepositoryTypes
> {
  constructor() {
    super(ContactRepository);
  }
}

export default new ContactService();
