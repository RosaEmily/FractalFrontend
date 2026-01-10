import { type Ref } from "vue";
import { useForm, type GenericObject, type Path } from "vee-validate";
import type { ZodSchema, ZodType } from "zod";
import type { PartialDeep } from "type-fest"; // <-- importa PartialDeep
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";

interface UseFormFieldsOptions<Form extends GenericObject> {
  initialValues: PartialDeep<Form>;
  schema: ZodSchema<Form> | { [K in keyof Form]: ZodType<Form[K]> };
}
export function useFormFields<Form extends GenericObject>({
  initialValues,
  schema,
}: UseFormFieldsOptions<Form>) {
  /* =========================
   * 1. useForm CENTRAL
   * ========================= */
  const zodSchema: ZodSchema<Form> =
    schema instanceof z.ZodType
      ? schema
      : (z.object(
          schema as { [K in keyof Form]: ZodType<Form[K]> }
        ) as unknown as ZodSchema<Form>);

  const form = useForm<Form>({
    validationSchema: toFormValidator(zodSchema),
    initialValues,
  });

  const { defineField } = form;

  /* =========================
   * 2. Campos dinámicos
   * ========================= */
  const fields = {} as { [K in keyof Form]: Ref<Form[K]> };

  for (const key in initialValues) {
    const [field] = defineField(key as unknown as Path<Form>);
    fields[key] = field as Ref<Form[typeof key]>;
  }

  return {
    fields,
    ...form,
  };
}
