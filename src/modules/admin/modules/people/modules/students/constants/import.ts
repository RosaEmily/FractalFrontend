import { z } from "zod";
import type { ImportColumn } from "@/modules/admin/components/ui/bulk-import.vue";
import {
  CAREER_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  GENDER_OPTIONS,
} from "@/modules/admin/constants/options";
import { AGE_LIMIT, isValidBirthDate } from "@/modules/admin/constants/age-limits";
import { documentNumberSchema, phoneSchema } from "@/modules/admin/utils/document-schema";
import {
  compact,
  dateMapper,
  optionMapper,
} from "../../../shared/import-helpers";

/** Columnas del Excel de alumnos, en el orden de la plantilla. */
export const STUDENT_IMPORT_COLUMNS: ImportColumn[] = [
  { key: "first_name", label: "Nombres", required: true, example: "Ana María" },
  { key: "last_name", label: "Apellidos", required: true, example: "Quispe Rojas" },
  { key: "email", label: "Correo", required: true, aliases: ["email", "correo electronico"], example: "ana@correo.com" },
  { key: "gender", label: "Género", required: true, example: "Femenino", map: optionMapper(GENDER_OPTIONS) },
  { key: "document_type", label: "Tipo de documento", required: true, aliases: ["tipo doc"], example: "DNI", map: optionMapper(DOCUMENT_TYPE_OPTIONS) },
  { key: "document_number", label: "Número de documento", required: true, aliases: ["documento", "dni"], example: "12345678", map: compact },
  { key: "phone", label: "Teléfono", required: true, aliases: ["celular"], example: "987654321", map: compact },
  { key: "education_level", label: "Nivel educativo", required: true, example: "Universitario", map: optionMapper(EDUCATION_LEVEL_OPTIONS) },
  { key: "career", label: "Carrera", required: true, example: "Arquitectura", map: optionMapper(CAREER_OPTIONS) },
  { key: "other_career", label: "Otra carrera", example: "(solo si Carrera = Otro)" },
  { key: "birth_date", label: "Fecha de nacimiento", required: true, aliases: ["nacimiento"], example: "25/03/1995", map: dateMapper },
  { key: "address", label: "Dirección", required: true, example: "Av. Lima 123, Miraflores" },
];

const name = (label: string) =>
  z
    .string({ message: `${label} es obligatorio` })
    .min(2, { message: "Mínimo 2 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(/^[\p{L} .'-]+$/u, { message: "Solo letras y espacios" });

export const studentImportSchema = z
  .object({
    first_name: name("El nombre"),
    last_name: name("El apellido"),
    email: z.string({ message: "El correo es obligatorio" }).email({ message: "Correo inválido" }).max(150),
    gender: z.enum(["m", "f", "o"], { message: "Usa Masculino, Femenino u Otro" }),
    document_type: z.string({ message: "El tipo de documento es obligatorio" }),
    document_number: z.string({ message: "El documento es obligatorio" }),
    phone: phoneSchema(),
    education_level: z.enum(
      EDUCATION_LEVEL_OPTIONS.map((o) => String(o.value)) as [string, ...string[]],
      { message: "Nivel educativo no válido" },
    ),
    career: z.enum(CAREER_OPTIONS.map((o) => String(o.value)) as [string, ...string[]], {
      message: "Carrera no válida",
    }),
    other_career: z.string().max(100).optional(),
    birth_date: z
      .string({ message: "La fecha de nacimiento es obligatoria" })
      .refine(isValidBirthDate, {
        message: `Edad entre ${AGE_LIMIT.min} y ${AGE_LIMIT.max} años (AAAA-MM-DD)`,
      }),
    address: z.string({ message: "La dirección es obligatoria" }).min(3, { message: "Muy corta" }),
  })
  .superRefine((row, ctx) => {
    if (!DOCUMENT_TYPE_OPTIONS.some((o) => o.value === row.document_type)) {
      ctx.addIssue({ code: "custom", path: ["document_type"], message: "Usa DNI, CE o Pasaporte" });
      return;
    }
    const doc = documentNumberSchema(row.document_type).safeParse(row.document_number);
    if (!doc.success) {
      ctx.addIssue({ code: "custom", path: ["document_number"], message: doc.error.issues[0]?.message ?? "Documento no válido" });
    }
    if (row.career === "other" && !row.other_career) {
      ctx.addIssue({ code: "custom", path: ["other_career"], message: "Indica la carrera" });
    }
  });
