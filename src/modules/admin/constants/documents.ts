/**
 * Reglas de los documentos de identidad peruanos (RENIEC / SUNAT).
 *
 * Los valores de `type` son los mismos que guarda la columna
 * `document_type` y los que lista `DOCUMENT_TYPE_OPTIONS`.
 */
export interface DocumentRule {
  /** Longitud exacta; si el documento admite rango, usar `min`/`max`. */
  length?: number;
  min?: number;
  max?: number;
  /** Solo dígitos (DNI, RUC) o alfanumérico (CE, pasaporte). */
  numericOnly: boolean;
  /** Texto de ayuda bajo el campo. */
  hint: string;
  /** Máscara de `InputMask`; solo para los de longitud fija y numérica. */
  mask?: string;
}

export const DOCUMENT_RULES: Record<string, DocumentRule> = {
  DNI: {
    length: 8,
    numericOnly: true,
    hint: "8 dígitos.",
    mask: "99999999",
  },
  /*
   * El carné de extranjería no tiene una longitud única publicada: los
   * antiguos son de 9 y los actuales llegan a 12, y pueden traer letras.
   * Por eso va con rango y sin máscara.
   */
  CE: {
    min: 9,
    max: 12,
    numericOnly: false,
    hint: "Entre 9 y 12 caracteres.",
  },
  Pasaporte: {
    min: 6,
    max: 12,
    numericOnly: false,
    hint: "Entre 6 y 12 caracteres.",
  },
};

/** Fallback para un tipo aún no elegido o desconocido. */
export const DEFAULT_DOCUMENT_RULE: DocumentRule = {
  min: 6,
  max: 20,
  numericOnly: false,
  hint: "Selecciona primero el tipo de documento.",
};

export const getDocumentRule = (type?: string | null): DocumentRule =>
  (type && DOCUMENT_RULES[type]) || DEFAULT_DOCUMENT_RULE;

/**
 * Dígito verificador del DNI peruano.
 *
 * ⚠️ RENIEC **no publica** el algoritmo del dígito de verificación del DNI, y
 * el número que se imprime en el carné no siempre viaja con el DNI de 8
 * dígitos. Por eso aquí solo se valida la longitud y que sean dígitos: un
 * check inventado rechazaría documentos válidos, que es peor que no validarlo.
 *
 * El RUC sí tiene algoritmo público — ver `isValidRuc`.
 */

/**
 * Valida un RUC peruano: 11 dígitos, prefijo de tipo de contribuyente y
 * dígito verificador por módulo 11.
 *
 * Se deja disponible aunque el RUC **no esté en el catálogo de tipos de
 * documento** (un docente o alumno se registra con su documento de identidad,
 * no con RUC). Si algún día se agrega —o hace falta para facturación— la regla
 * ya está escrita y probada, y no hay que improvisarla.
 *
 * Pesos oficiales SUNAT: 5,4,3,2,7,6,5,4,3,2 sobre los 10 primeros dígitos.
 */
const RUC_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const RUC_VALID_PREFIXES = ["10", "15", "17", "20"];

export const isValidRuc = (value: string): boolean => {
  const ruc = value.trim();
  if (!/^\d{11}$/.test(ruc)) return false;
  if (!RUC_VALID_PREFIXES.includes(ruc.slice(0, 2))) return false;

  const sum = RUC_WEIGHTS.reduce(
    (acc, weight, index) => acc + weight * Number(ruc[index]),
    0,
  );
  const remainder = 11 - (sum % 11);
  // 10 → 0 y 11 → 1, según la regla de SUNAT.
  const checkDigit = remainder === 10 ? 0 : remainder === 11 ? 1 : remainder;

  return checkDigit === Number(ruc[10]);
};

/* ==========================================================================
 *  Teléfono (Perú)
 * ========================================================================== */

/**
 * Móvil peruano: 9 dígitos que empiezan en 9.
 *
 * Se valida solo Perú a propósito: no hay componente de teléfono
 * internacional en PrimeVue ni librería instalada, y todos los usuarios son
 * locales. Si mañana hay extranjeros, esto es lo que hay que ampliar.
 */
export const PHONE_PE = {
  length: 9,
  mask: "999 999 999",
  hint: "9 dígitos, empieza en 9. Ej: 987 654 321.",
  regex: /^9\d{8}$/,
};
