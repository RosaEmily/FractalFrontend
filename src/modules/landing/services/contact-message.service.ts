import apiClient from "@/shared/helpers/axios/api-fractal";
import type { ContactMessageBodyDTO } from "../dto/contact-message.dto";

class ContactMessageService {
  /** Envía el formulario de Contacto. Los errores se propagan (los muestra la página). */
  async send(body: ContactMessageBodyDTO): Promise<null> {
    await apiClient.post("landing/contact-messages", body);
    return null;
  }
}

export const contactMessageService = new ContactMessageService();
