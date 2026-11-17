import { z } from "zod";

export const PAGE_SCHEMA = z.object({
  title: z
    .string({ message: "El título es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(150, { message: "No puede tener más de 150 caracteres" }),
  slug: z
    .string({ message: "La dirección es obligatoria" })
    .max(80, { message: "No puede tener más de 80 caracteres" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Solo minúsculas, números y guiones (ej. politica-de-privacidad)",
    }),
  content: z
    .string({ message: "El contenido es obligatorio" })
    .min(10, { message: "Debe tener al menos 10 caracteres" })
    .max(50000, { message: "No puede tener más de 50 000 caracteres" }),
  published: z.boolean(),
});
