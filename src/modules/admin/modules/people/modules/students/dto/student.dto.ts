export interface StudentDTO {
  document_number: string;
  document_type: string | null;
  career_name: string | null;
  education_level_name: string | null;
  address: string | null;
  other_career: string | null;
  phone: string | null;
  birth_date_formatted: string | null;
  is_favorite: number;
  status: number;
  created_at: string;
  updated_at: string;

  // valores crudos para el formulario
  career: string | null;
  education_level: string | null;
  birth_date_raw: string | null;

  first_name: string;
  last_name: string;
  email: string;
  photo_url: string | null;
  gender: "m" | "f" | "o" | null;
  gender_name: string | null;
  user_id: number | null;
}

export interface StudentBodyDTO {
  document_type: string | null;
  document_number: string | null;
  education_level: string | null;
  career: string | null;
  other_career: string | null;
  birth_date: string | null;
  address: string | null;
  phone: string | null;
}
