export interface ContactMessageBodyDTO {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profession: string | null;
  program_interest: string | null;
  message: string;
  consent: boolean;
  /** Señuelo anti-bots: siempre vacío en un envío real. */
  website: string;
}
