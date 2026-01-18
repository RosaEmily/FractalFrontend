export interface BaseMeta {
  title?: string;
  description?: string;
  keywords?: string;
  icon?: string;
  image?: string;
}

export interface OpenGraphMeta {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | string;
  siteName?: string;
}

export interface TwitterMeta {
  card?: "summary" | "summary_large_image" | string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}

export interface PageMeta {
  base?: BaseMeta;
  og?: OpenGraphMeta;
  twitter?: TwitterMeta;
  custom?: Record<string, string>;
}
