export interface ContactMessageDTO {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profession: string | null;
  program_interest: string | null;
  message: string;
  consent: boolean;
  is_attended: boolean;
  created_at: string;
}
