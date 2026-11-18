import type { PaginationMeta } from "@/shared/interface/api-response";

export interface Teacher {
  id?: string;
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

export interface TeacherList {
  teachers: Teacher[];
  meta?: PaginationMeta;
  stats?: { teachers: number; specialties: number; avgYears: number | null };
  specialties?: string[];
}

export interface TeacherQuery {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
}

export interface TeacherDetailSchedule {
  day: string;
  start_time: string;
  end_time: string;
}

export interface TeacherDetailCourse {
  program_name: string | null;
  program_prefix: string | null;
  name: string;
  tags: string[];
  start_date: string;
  end_date: string;
  schedules: TeacherDetailSchedule[];
}

export interface TeacherDetail {
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
  courses: TeacherDetailCourse[];
  courses_count: number;
  programs_count: number;
}
