import { BaseService } from "@/modules/admin/services/base.service";
import ContactMessageRepository from "../repositories/contact-message.repository";
import type { ContactMessageRepositoryTypes } from "../models/contact-message.model";

class ContactMessageService extends BaseService<
  typeof ContactMessageRepository,
  ContactMessageRepositoryTypes
> {
  constructor() {
    super(ContactMessageRepository);
  }

  async attended(ids: (number | string)[], isAttended: 0 | 1): Promise<null> {
    await ContactMessageRepository.attended(ids, isAttended);
    return null;
  }
}

export default new ContactMessageService();
