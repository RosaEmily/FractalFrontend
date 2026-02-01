<script setup lang="ts" generic="T">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ZodSchema } from "zod";
import { useFormFields } from "@/shared/composables/useFormFields";
import { useToastStore } from "@/shared/stores/useToastStore";
import { safeRequest } from "@/shared/utils/request";
import { CardCore, ButtonCore } from "@/shared/components";

const router = useRouter();

interface Props<T> {
  title: string;
  schema: ZodSchema;
  initialValues: T;
  service: (payload: T) => Promise<any>;
  redirect: string;
  redirectOnCancel?: string;
  redirectOnSuccess?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

const props = withDefaults(defineProps<Props<T>>(), {
  cancelLabel: "Cancelar",
  submitLabel: "Guardar",
});
const loading = ref<boolean>(false);

const { fields, handleSubmit, errors, setValues, setFieldError } =
  useFormFields<T>({
    initialValues: props.initialValues,
    schema: props.schema,
  });

const onSubmit = handleSubmit(async (values: T) => {
  loading.value = true;
  const toastStore = useToastStore();
  const { status, error } = await safeRequest(
    () => {
      return props.service(values);
    },
    { showAlert: false },
  );
  loading.value = false;
  if (status && !error) {
    toastStore.showToastSuccess({
      detail: "Registro creado o actualizado correctamente",
    });
    console.log("props ==>", {
      name: props.redirectOnSuccess ?? props.redirect,
    });
    router.replace({ name: props.redirectOnSuccess ?? props.redirect });
  } else if (error?.details && !Array.isArray(error.details)) {
    (Object.keys(error.details) as (keyof T)[]).forEach((key) => {
      setFieldError(key, error.details[key][0]);
    });
    toastStore.showToastError({
      detail: error.message,
    });
  }
});

watch(
  () => props.initialValues,
  (newValues) => {
    if (!newValues) return;
    setValues(newValues);
  },
  { deep: true },
);
</script>

<template>
  <CardCore>
    <template #title>
      {{ title }}
    </template>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <!-- FORM CONTENT -->
      <slot :fields="fields" :errors="errors" />

      <!-- ACTIONS -->
      <div class="flex gap-2 justify-end items-center">
        <ButtonCore
          as="RouterLink"
          :to="{ name: redirectOnCancel ?? props.redirect }"
          class="!w-auto"
          :label="cancelLabel"
        />
        <ButtonCore
          class="!w-auto"
          type="submit"
          :label="submitLabel"
          :loading="loading"
        />
      </div>
    </form>
  </CardCore>
</template>
