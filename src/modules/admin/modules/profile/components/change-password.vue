<script setup lang="ts">
import { z } from "zod";
import { computed, ref } from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

import { useFormFields } from "@/shared/composables/useFormFields";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { CardCore, ButtonCore, InputPasswordCore } from "@/shared/components";

import profileService from "../services/profile.service";
import type { ChangePasswordBodyDTO } from "../dto/profile.dto";

interface Props {
  /** Fecha de la última actualización del perfil, para el pie del medidor. */
  lastUpdate?: string | null;
}
const props = defineProps<Props>();
const emit = defineEmits<{ (e: "changed"): void }>();

const lastUpdateLabel = computed(() =>
  props.lastUpdate ? dayjs(props.lastUpdate).fromNow() : null,
);

dayjs.extend(relativeTime);
dayjs.locale("es");

const loading = ref<boolean>(false);

/**
 * Medidor de fortaleza del diseño: 4 barras. Es orientativo para el usuario,
 * la validación real la hacen el schema y el backend.
 */
const strength = computed(() => {
  const value = fields.password.value ?? "";
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value) || /\d/.test(value)) score += 1;
  return score;
});

const strengthLabel = computed(
  () => ["", "DÉBIL", "REGULAR", "BUENA", "FUERTE"][strength.value] ?? "",
);

/**
 * Un solo origen para el color del medidor: las barras y la etiqueta deben
 * coincidir (una barra verde con el texto "DÉBIL" es contradictoria).
 */
const strengthTone = computed(() => {
  if (strength.value >= 4) return "success";
  if (strength.value === 3) return "amber";
  return "danger";
});

const strengthColor = computed(
  () =>
    ({
      success: "text-success-DEFAULT",
      amber: "text-amber-DEFAULT",
      danger: "text-danger-DEFAULT",
    })[strengthTone.value],
);

const strengthBarColor = computed(
  () =>
    ({
      success: "bg-success-DEFAULT",
      amber: "bg-amber-DEFAULT",
      danger: "bg-danger-DEFAULT",
    })[strengthTone.value],
);

const formSchema = z
  .object({
    current_password: z
      .string({ message: "Debes ingresar tu contraseña actual" })
      .min(1, { message: "Debes ingresar tu contraseña actual" }),
    password: z
      .string({ message: "La nueva contraseña es obligatoria" })
      .min(6, { message: "Debe tener al menos 6 caracteres" })
      .max(100, { message: "No puede tener más de 100 caracteres" }),
    password_confirmation: z
      .string({ message: "Debes confirmar la nueva contraseña" })
      .min(1, { message: "Debes confirmar la nueva contraseña" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  })
  .refine((data) => data.password !== data.current_password, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["password"],
  });

const { fields, errors, handleSubmit, resetForm, setFieldError } =
  useFormFields<ChangePasswordBodyDTO>({
    initialValues: {
      current_password: null,
      password: null,
      password_confirmation: null,
    },
    schema: formSchema,
  });

const onSubmit = handleSubmit(async (values: ChangePasswordBodyDTO) => {
  loading.value = true;
  const toastStore = useToastStore();

  const { status, data, error } = await safeRequest(
    () => profileService.changePassword(values),
    { showAlert: false },
  );
  loading.value = false;

  if (status && !error) {
    const revoked = data ?? 0;
    toastStore.showToastSuccess({
      detail: revoked
        ? `Contraseña actualizada. Se cerraron ${revoked} sesión(es) en otros dispositivos.`
        : "Contraseña actualizada correctamente",
    });
    resetForm();
    emit("changed");
    return;
  }

  if (error?.details && !Array.isArray(error.details)) {
    const details = error.details as Record<string, string[]>;
    (Object.keys(details) as (keyof ChangePasswordBodyDTO)[]).forEach((key) => {
      setFieldError(key, details[key as string]?.[0]);
    });
  }
  toastStore.showToastError({ detail: error?.message });
});
</script>

<template>
  <CardCore>
    <template #title>
      <span
        class="font-display text-adm-xl font-bold tracking-tight text-secondary-900"
      >
        Cambiar contraseña
      </span>
    </template>

    <form @submit.prevent="onSubmit">
      <div class="space-y-4">
        <p class="text-adm-sm text-secondary-500">
          Al cambiar tu contraseña se cerrarán automáticamente tus sesiones en
          otros dispositivos. La sesión actual se mantiene abierta.
        </p>

        <InputPasswordCore
          v-model="fields.current_password.value"
          label="Contraseña actual"
          :invalid="!!errors.current_password"
          :message-error="errors.current_password"
          :feedback="false"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <InputPasswordCore
            v-model="fields.password.value"
            label="Nueva contraseña"
            placeholder="Mín. 6 caracteres"
            :invalid="!!errors.password"
            :message-error="errors.password"
          />

          <InputPasswordCore
            v-model="fields.password_confirmation.value"
            label="Confirmar nueva contraseña"
            placeholder="Repítela"
            :invalid="!!errors.password_confirmation"
            :message-error="errors.password_confirmation"
            :feedback="false"
          />
        </div>

        <!-- Medidor de fortaleza -->
        <div v-if="strength" class="mt-2">
          <div class="flex gap-1.5 mb-1.5">
            <span
              v-for="bar in 4"
              :key="bar"
              class="flex-1 h-1 rounded-full"
              :class="bar <= strength ? strengthBarColor : 'bg-line'"
            />
          </div>
          <div
            class="flex justify-between items-center gap-3 font-mono text-adm-xs text-secondary-400 tracking-wider"
          >
            <span>
              SEGURIDAD:
              <strong :class="strengthColor">{{ strengthLabel }}</strong>
            </span>
            <span v-if="lastUpdateLabel">
              Última actualización: {{ lastUpdateLabel }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="flex gap-2.5 justify-end items-center mt-7 -mx-6 -mb-6 px-7 py-4.5 border-t border-line-soft bg-admin-bg rounded-b-adm-lg"
      >
        <ButtonCore
          class="!w-auto"
          type="submit"
          label="Actualizar contraseña"
          :loading="loading"
        />
      </div>
    </form>
  </CardCore>
</template>
