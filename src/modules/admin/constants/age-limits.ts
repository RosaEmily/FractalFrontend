/**
 * Rango de edad admitido para instructores y estudiantes.
 *
 * Regla de negocio: la persona debe ser mayor de edad y no pasar de 70 años.
 * Fuera de ese rango el calendario **no habilita la fecha**, así que el error
 * se evita antes de escribirlo en vez de avisarlo después de enviar.
 */
export const AGE_LIMIT = { min: 18, max: 70 } as const;

/**
 * Fecha de nacimiento MÁS RECIENTE admitida: la de quien cumple hoy la edad
 * mínima. Nacer después significa ser más joven, así que es el `maxDate`.
 */
export const birthDateMax = (): Date => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - AGE_LIMIT.min);
  return date;
};

/**
 * Fecha de nacimiento MÁS ANTIGUA admitida: la de quien cumple hoy la edad
 * máxima. Es el `minDate`.
 *
 * ⚠️ Se resta un día: quien cumple exactamente 70 hoy debe poder registrarse,
 * y el `minDate` de PrimeVue es inclusivo pero deja fuera el día anterior.
 */
export const birthDateMin = (): Date => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - AGE_LIMIT.max);
  date.setDate(date.getDate() - 1);
  return date;
};

/**
 * Edad cumplida a partir de una fecha `YYYY-MM-DD`.
 *
 * No usa la diferencia de años a secas: quien nació en diciembre y estamos en
 * enero tiene un año menos del que sugiere la resta.
 */
export const ageFrom = (birthDate: string): number | null => {
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
};

/** ¿La fecha cae dentro del rango? Se valida también en el esquema del form. */
export const isValidBirthDate = (birthDate: string): boolean => {
  const age = ageFrom(birthDate);
  return age !== null && age >= AGE_LIMIT.min && age <= AGE_LIMIT.max;
};
