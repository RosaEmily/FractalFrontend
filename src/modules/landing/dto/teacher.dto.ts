export interface TeacherDTO {
  id?: string;
  /** PK real de `teachers`. Ausente en el listado antes de este cambio. */
  document_number: string;
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

export interface TeacherDetailScheduleDTO {
  day: string;
  start_time: string;
  end_time: string;
}

export interface TeacherDetailCourseDTO {
  program_name: string | null;
  program_prefix: string | null;
  name: string;
  tags: string[];
  start_date: string;
  end_date: string;
  schedules: TeacherDetailScheduleDTO[];
}

export interface TeacherDetailDTO {
  document_number: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  academic_degree_name: string;
  specialty: string;
  experience_years: number;
  description: string;
  social_networks: {
    other: string | null;
    linkedin: string | null;
    instagram: string | null;
  };
  courses: TeacherDetailCourseDTO[];
  courses_count: number;
  programs_count: number;
}
