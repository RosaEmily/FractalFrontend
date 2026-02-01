import type { ZodString } from "zod";
import type { RefinementShortcut } from "./shortcuts";

export const withRefinements = <T extends ZodString>(
  schema: T,
  refinements?: RefinementShortcut | readonly RefinementShortcut[],
): T => {
  if (!refinements) return schema;
  const list = Array.isArray(refinements) ? refinements : [refinements];
  return list.reduce(
    (acc, { validator, message }) => acc.refine(validator, { message }),
    schema,
  );
};
