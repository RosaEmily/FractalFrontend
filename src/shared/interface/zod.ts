export type Item =
  | string
  | number
  | boolean
  | Record<string, string | number | boolean>;

/**
 * Tipo para los mensajes de validación
 */
export type ValidationMessageOptions = {
  message?: string;
  prefix?: string;
  suffix?: string;
};

export interface DuplicatesValidationOptions extends ValidationMessageOptions {
  key?: string; // si es objeto, la key que se valida
  maxRepeats?: number; // cantidad máxima permitida de duplicados (default 1)
  type?: "url" | "slug";
}

export type StringValidator = (val: string) => boolean;
