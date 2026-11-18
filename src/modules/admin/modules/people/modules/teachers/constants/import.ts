import { z } from "zod";
import type { ImportColumn } from "../../../shared/import/types";
import {
  ACADEMIC_DEGREE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
} from "@/modules/admin/constants/options";
import { EXPERIENCE_YEARS_LIMIT } from "@/modules/admin/constants/numeric-limits";
import {
  documentNumberSchema,
  phoneSchema,
} from "@/modules/admin/utils/document-schema";
import {
  compact,
  numberMapper,
  optionMapper,
} from "../../../shared/import-helpers";

/** Columnas del Excel de docentes, en el orden de la plantilla. */
export const TEACHER_IMPORT_COLUMNS: ImportColumn[] = [
  { key: "first_name", label: "Nombres", required: true, example: "Luis" },
  {
    key: "last_name",
    label: "Apellidos",
    required: true,
    example: "Paredes Soto",
  },
  {
    key: "email",
    label: "Correo",
    required: true,
    aliases: ["email", "correo electronico"],
    example: "luis@correo.com",
  },
  {
    key: "gender",
    label: "Género",
    required: true,
    example: "Masculino",
    map: optionMapper(GENDER_OPTIONS),
  },
  {
    key: "document_type",
    label: "Tipo de documento",
    required: true,
    aliases: ["tipo doc"],
    example: "DNI",
    map: optionMapper(DOCUMENT_TYPE_OPTIONS),
  },
  {
    key: "document_number",
    label: "Número de documento",
    required: true,
    aliases: ["documento", "dni"],
    example: "87654321",
    map: compact,
  },
  {
    key: "phone",
    label: "Teléfono",
    required: true,
    aliases: ["celular"],
    example: "987654321",
    map: compact,
  },
  {
    key: "specialty",
    label: "Especialidad",
    required: true,
    example: "BIM y Revit",
  },
  {
    key: "experience_years",
    label: "Años de experiencia",
    required: true,
    aliases: ["experiencia"],
    example: "8",
    map: numberMapper,
  },
  {
    key: "academic_degree",
    label: "Título académico",
    required: true,
    aliases: ["titulo"],
    example: "Arquitectura",
    map: optionMapper(ACADEMIC_DEGREE_OPTIONS),
  },
  {
    key: "other_academic_degree",
    label: "Otro título",
    example: "(solo si Título = Otro)",
  },
  {
    key: "description",
    label: "Biografía",
    required: true,
    aliases: ["descripcion"],
    example: "Arquitecto con 8 años en proyectos BIM.",
  },
];

const name = (label: string) =>
  z
    .string({ message: `${label} es obligatorio` })
    .min(2, { message: "Mínimo 2 caracteres" })
    .max(100, { message: "Máximo 100 caracteres" })
    .regex(/^[\p{L} .'-]+$/u, { message: "Solo letras y espacios" });

export const teacherImportSchema = z
  .object({
    first_name: name("El nombre"),
    last_name: name("El apellido"),
    email: z
      .string({ message: "El correo es obligatorio" })
      .email({ message: "Correo inválido" })
      .max(150),
    gender: z.enum(["m", "f", "o"], {
      message: "Usa Masculino, Femenino u Otro",
    }),
    document_type: z.string({ message: "El tipo de documento es obligatorio" }),
    document_number: z.string({ message: "El documento es obligatorio" }),
    phone: phoneSchema(),
    specialty: z
      .string({ message: "La especialidad es obligatoria" })
      .min(2)
      .max(255),
    experience_years: z
      .number({ message: "Los años de experiencia deben ser un número" })
      .int({ message: "Debe ser un número entero" })
      .min(EXPERIENCE_YEARS_LIMIT.min, { message: "No puede ser negativo" })
      .max(EXPERIENCE_YEARS_LIMIT.max, {
        message: `No puede superar ${EXPERIENCE_YEARS_LIMIT.max} años`,
      }),
    academic_degree: z.enum(
      ACADEMIC_DEGREE_OPTIONS.map((o) => String(o.value)) as [
        string,
        ...string[],
      ],
      { message: "Título académico no válido" },
    ),
    other_academic_degree: z.string().max(100).optional(),
    description: z
      .string({ message: "La biografía es obligatoria" })
      .min(3, { message: "Muy corta" }),
  })
  .superRefine((row, ctx) => {
    if (!DOCUMENT_TYPE_OPTIONS.some((o) => o.value === row.document_type)) {
      ctx.addIssue({
        code: "custom",
        path: ["document_type"],
        message: "Usa DNI, CE o Pasaporte",
      });
      return;
    }
    const doc = documentNumberSchema(row.document_type).safeParse(
      row.document_number,
    );
    if (!doc.success) {
      ctx.addIssue({
        code: "custom",
        path: ["document_number"],
        message: doc.error.issues[0]?.message ?? "Documento no válido",
      });
    }
    if (row.academic_degree === "other" && !row.other_academic_degree) {
      ctx.addIssue({
        code: "custom",
        path: ["other_academic_degree"],
        message: "Indica el título",
      });
    }
  });
