/** Tipos de programa (`offers.type`). */
export const OFFER_TYPE_LABELS: Record<"course" | "learning_path", string> = {
  course: "Curso",
  learning_path: "Línea",
};

export const OFFER_TYPE_OPTIONS = [
  { label: "Líneas de carrera", value: "learning_path" },
  { label: "Cursos sueltos", value: "course" },
];

/** Estados de ocupación de una cohorte. */
export const OCCUPANCY_STATES = {
  ok: { label: "En rango", class: "bg-success-soft text-success-DEFAULT" },
  below_min: { label: "Bajo mínimo", class: "bg-amber-soft text-amber-DEFAULT" },
  over_max: { label: "Excede cupo", class: "bg-danger-soft text-danger-DEFAULT" },
} as const;
