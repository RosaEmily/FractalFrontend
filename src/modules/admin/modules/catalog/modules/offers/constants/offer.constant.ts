import type { OfferType } from "../dto/offer.dto";

export const OFFER_TYPE_LABEL: Record<string, string> = {
  course: "Curso",
  learning_path: "Línea de carrera",
};

export const OFFER_TYPE_OPTIONS: { label: string; value: OfferType }[] = [
  { label: "Línea de carrera", value: "learning_path" },
  { label: "Curso individual", value: "course" },
];

/** Días tal como los espera la API (`Date::DAYS_OF_WEEK`). */
export const DAY_OF_WEEK_OPTIONS: { label: string; value: string }[] = [
  { label: "Lunes", value: "monday" },
  { label: "Martes", value: "tuesday" },
  { label: "Miércoles", value: "wednesday" },
  { label: "Jueves", value: "thursday" },
  { label: "Viernes", value: "friday" },
  { label: "Sábado", value: "saturday" },
  { label: "Domingo", value: "sunday" },
];
