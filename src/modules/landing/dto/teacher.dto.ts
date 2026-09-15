export interface TeacherDTO {
  id?: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  academic_degree_name: string;
  other_academic_degree: string;
  specialty: string;
  experience_years: number;
  description: string;
  cv: string;
  social_networks: {
    other: string | null;
    linkedin: string | null;
    instagram: string | null;
  };
}
