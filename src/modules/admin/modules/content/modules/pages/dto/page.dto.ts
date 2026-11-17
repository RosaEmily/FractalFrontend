export interface PageDTO {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  updated_at?: string;
}

export interface PageBodyDTO {
  title: string | null;
  slug: string | null;
  content: string | null;
  published: boolean;
}
