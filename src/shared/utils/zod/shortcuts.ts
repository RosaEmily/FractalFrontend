import { STRING_REGEX } from "@/shared/constants/zod";
import {
  regexValidator,
  validateHttpsUrl,
  validateNoDuplicates,
  validateQuestionFormat,
} from "./validators";
import type { DuplicatesValidationOptions, Item } from "@/shared/interface/zod";

export type RefinementShortcut = {
  validator: (val: string) => boolean;
  message: string;
};

/* =======================
 * Básicos
 * ======================= */

export const lettersOnly: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.lettersOnly),
  message: "Solo letras",
};

export const lettersSpaces: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.lettersSpaces),
  message: "Solo letras y espacios",
};

export const numbersOnly: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.numbersOnly),
  message: "Solo números",
};

export const numbersSpaces: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.numbersSpaces),
  message: "Solo números y espacios",
};

export const lettersNumbers: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.lettersNumbers),
  message: "Solo letras y números",
};

export const lettersNumbersSpaces: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.lettersNumbersSpaces),
  message: "Solo letras, números y espacios",
};

export const lettersUppercaseOnly: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.lettersUppercaseOnly),
  message: "Solo letras mayúsculas",
};

export const lettersUppercaseAsciiOnly: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.lettersUppercaseAsciiOnly),
  message: "Solo letras mayúsculas (A–Z)",
};

/* =======================
 * Espacios
 * ======================= */

export const noLeadingTrailingSpaces: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.noLeadingTrailingSpaces),
  message: "No debe iniciar ni terminar con espacios",
};

export const singleSpacesOnly: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.singleSpacesOnly),
  message: "No se permiten espacios consecutivos",
};

/* =======================
 * Texto / símbolos
 * ======================= */

export const alphanumericWithSymbols: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.alphaNumericWithSymbols),
  message: "Contiene caracteres no permitidos",
};

export const latin1Safe: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.latin1safe),
  message: "El campo contiene caracteres no permitidos",
};

export const noEmojis: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.noeEmojis),
  message: "No se permiten emojis",
};

/* =======================
 * Identificadores
 * ======================= */

export const username: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.username),
  message: "Usuario inválido",
};

export const slug: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.slug),
  message: "Formato de slug inválido",
};

/* =======================
 * Contacto
 * ======================= */

export const emailSimple: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.emailSimple),
  message: "Correo electrónico inválido",
};

export const phoneSimple: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.phoneSimple),
  message: "Teléfono inválido",
};

/* =======================
 * Seguridad
 * ======================= */

export const passwordBasic: RefinementShortcut = {
  validator: regexValidator(STRING_REGEX.passwordBasic),
  message: "Debe tener al menos 8 caracteres, una letra y un número",
};

/* =======================
 * Formato de pregunta
 * ======================= */

export const questionFormat = (requireStart = true): RefinementShortcut => ({
  validator: validateQuestionFormat(requireStart),
  message: requireStart
    ? "Debe empezar con ¿ y terminar con ?"
    : "Debe terminar con ?",
});

export const noDuplicates = (
  items: Item[] | (() => Item[]),
  options?: DuplicatesValidationOptions,
): RefinementShortcut => ({
  validator: validateNoDuplicates(items, options),
  message: "Este valor ya está duplicado",
});

export const httpsUrl: RefinementShortcut = {
  validator: validateHttpsUrl(),
  message: "URL inválida, debe empezar con https:// y ser un dominio válido",
};
