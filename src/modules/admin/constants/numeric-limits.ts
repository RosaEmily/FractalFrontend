/**
 * Límites de los campos numéricos, derivados del tipo real de cada columna
 * en la BD. Evita guardar valores que la base rechazaría.
 *
 * Referencia MySQL:
 *   tinyint unsigned  → 0..255
 *   tinyint (signed)  → -128..127
 *   int unsigned      → 0..4294967295
 *   decimal(p,s)      → hasta (p - s) dígitos enteros
 */
export interface NumericLimit {
  min: number;
  max: number;
  /** Decimales permitidos; 0 para enteros. */
  fractionDigits?: number;
}

/** `currencies.decimal_places` es tinyint, pero ISO 4217 no pasa de 4. */
export const DECIMAL_PLACES_LIMIT: NumericLimit = { min: 0, max: 10 };

/** `users.max_sessions` es tinyint unsigned; el negocio lo acota a 4. */
export const MAX_SESSIONS_LIMIT: NumericLimit = { min: 1, max: 4 };

/** `teachers.experience_years` es int unsigned; 80 es el techo razonable. */
export const EXPERIENCE_YEARS_LIMIT: NumericLimit = { min: 0, max: 80 };

/** `offers.min_students` / `max_students` son int. */
export const STUDENTS_LIMIT: NumericLimit = { min: 0, max: 9999 };

/** decimal(10,2): 8 dígitos enteros + 2 decimales. */
export const PRICE_LIMIT: NumericLimit = {
  min: 0,
  max: 99999999.99,
  fractionDigits: 2,
};

/** decimal(5,2) usado como porcentaje de peso de una evaluación. */
export const WEIGHT_LIMIT: NumericLimit = {
  min: 0,
  max: 100,
  fractionDigits: 2,
};

/** decimal(5,2): 3 dígitos enteros + 2 decimales. */
export const SCORE_LIMIT: NumericLimit = {
  min: 0,
  max: 999.99,
  fractionDigits: 2,
};
