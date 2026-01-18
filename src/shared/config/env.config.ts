const {
  VITE_API_FRACTAL,
  VITE_API_FRACTAL_V2,
  VITE_COOKIE_NAME_SESSION,
  VITE_COOKIE_NAME_EXPIRES,
  VITE_COOKIE_NAME_USER,
  VITE_APP,
  VITE_HOME_BASE_URL,
} = import.meta.env;

export const API_FRACTAL: string = VITE_API_FRACTAL ?? "";

export const API_FRACTAL_V2: string = VITE_API_FRACTAL_V2 ?? "";

export const COOKIE_NAME_SESSION: string =
  VITE_COOKIE_NAME_SESSION ?? "app_session";

export const COOKIE_NAME_EXPIRES: string =
  VITE_COOKIE_NAME_EXPIRES ?? "app_expires_at";

export const COOKIE_NAME_USER: string = VITE_COOKIE_NAME_USER ?? "app_user";

export const APP_ENV: string = VITE_APP ?? "local";

export const HOME_BASE_URL: string | null = VITE_HOME_BASE_URL ?? null;
