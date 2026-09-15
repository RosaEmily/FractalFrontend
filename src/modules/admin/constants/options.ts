/**
 * Opciones espejo de `App\Shared\Constant\User` en la API.
 * Si cambian allá, hay que cambiarlas acá.
 */
export interface SelectOption {
  label: string;
  value: string;
}

export const GENDER_OPTIONS: SelectOption[] = [
  { label: "Masculino", value: "m" },
  { label: "Femenino", value: "f" },
  { label: "Otro", value: "o" },
];

export const CAREER_OPTIONS: SelectOption[] = [
  { label: "Ingeniería Civil", value: "civil_engineering" },
  { label: "Arquitectura", value: "architecture" },
  { label: "Diseño de Interiores", value: "interior_design" },
  { label: "Otro", value: "other" },
];

/**
 * TÍTULO profesional del docente (`teachers.academic_degree`).
 *
 * Comparte las disciplinas de `CAREER_OPTIONS` **a propósito**: aquí describen
 * al docente ("Ingeniería Civil" = es ingeniero civil) y en `CAREER_OPTIONS` la
 * carrera que estudia el alumno. Se muestra en la landing encima del nombre,
 * como credencial.
 *
 * Los `value` deben coincidir con `User::ACADEMIC_DEGREE` de la API.
 */
export const ACADEMIC_DEGREE_OPTIONS: SelectOption[] = [...CAREER_OPTIONS];

export const EDUCATION_LEVEL_OPTIONS: SelectOption[] = [
  { label: "Técnico", value: "technical" },
  { label: "Universitario", value: "university" },
  { label: "Licenciatura", value: "bachelor" },
  { label: "Posgrado", value: "graduate" },
  { label: "Otro", value: "other" },
];

export const DOCUMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: "DNI", value: "DNI" },
  { label: "Carné de extranjería", value: "CE" },
  { label: "Pasaporte", value: "Pasaporte" },
];

/**
 * Sesiones simultáneas permitidas. El tope (4) lo valida también la API en
 * UpdateProfileRequest; si cambia allá, hay que cambiarlo acá.
 */
export const MAX_SESSIONS_OPTIONS: { label: string; value: number }[] = [
  { label: "1 dispositivo", value: 1 },
  { label: "2 dispositivos", value: 2 },
  { label: "3 dispositivos", value: 3 },
  { label: "4 dispositivos", value: 4 },
];
