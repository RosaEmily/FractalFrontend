import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { ContactMessageDTO } from "../dto/contact-message.dto";

export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  profession: string | null;
  program: string | null;
  message: string;
  consent: boolean;
  isAttended: boolean;
  createdAt: string;
}

/** Solo lectura: no hay `create` ni `update` en el panel. */
export interface ContactMessageRepositoryTypes {
  base: RepositoryBase<ContactMessage, ContactMessageDTO>;
}
