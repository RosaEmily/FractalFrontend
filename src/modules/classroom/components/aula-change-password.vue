<script setup lang="ts">
import { ref, watch } from "vue";
import { z } from "zod";
import { ButtonCore, InputPasswordCore, ModalCore } from "@/shared/components";
import { useFormFields } from "@/shared/composables/useFormFields";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import profileService from "@/modules/admin/modules/profile/services/profile.service";
import type { ChangePasswordBodyDTO } from "@/modules/admin/modules/profile/dto/profile.dto";

/**
 * Cambio de contraseña del aula (`AulaChangePasswordModal`, shell.jsx:396).
 *
 * ⚠️ No reusa `ChangePassword` del admin: ese viene envuelto en un `CardCore`
 * con su propio título, así que dentro de un modal el encabezado salía DOS
 * veces. Además el diseño apila los tres campos y cierra con un estado de
 * confirmación, no con un toast.
 */
const emit = defineEmits<{ changed: [] }>();

const open = defineModel<boolean>("visible", { default: false });

const loading = ref(false);
/** Segundo paso: el diseño confirma dentro del modal antes de cerrarlo. */
const done = ref(false);
const revokedCount = ref(0);

/**
 * ⚠️ Mínimo SEIS, no los ocho que dibuja el diseño: la API valida
 * `min:6` (`ChangePasswordRequest`). Prometer 8 en el placeholder y aceptar 6
 * confundiría, y subirlo es una decisión de negocio, no un ajuste visual.
 */
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

// Cada apertura empieza limpia: si no, se vería el éxito del cambio anterior.
watch(open, (visible) => {
  if (!visible) return;

  done.value = false;
  resetForm();
});

const onSubmit = handleSubmit(async (values: ChangePasswordBodyDTO) => {
  loading.value = true;
  const { status, data, error } = await safeRequest(
    () => profileService.changePassword(values),
    { showAlert: false },
  );
  loading.value = false;

  if (status && !error) {
    revokedCount.value = data ?? 0;
    done.value = true;
    emit("changed");

    return;
  }

  // El backend responde campo a campo: cada error va junto a su input.
  if (error?.details && !Array.isArray(error.details)) {
    const details = error.details as Record<string, string[]>;
    (Object.keys(details) as (keyof ChangePasswordBodyDTO)[]).forEach((key) => {
      setFieldError(key, details[key as string]?.[0]);
    });

    return;
  }

  useToastStore().showToastError({ detail: error?.message });
});
</script>

<template>
  <ModalCore
    v-model:visible="open"
    modal
    :header="done ? ' ' : 'Cambiar contraseña'"
    class="w-[min(26.25rem,90vw)]"
  >
    <!-- Paso 2: confirmación dentro del modal, como el diseño. -->
    <div v-if="done" class="py-2 text-center">
      <p class="font-display text-adm-lg font-bold text-secondary-900">
        Contraseña actualizada
      </p>
      <p class="mt-2 text-adm-base leading-relaxed text-secondary-500">
        {{
          revokedCount
            ? "Se cerraron las demás sesiones. Esta sigue abierta."
            : "Esta sesión sigue abierta."
        }}
      </p>
      <div class="mt-5 flex justify-center">
        <ButtonCore
          label="Listo"
          size="small"
          class="!w-auto"
          @click="open = false"
        />
      </div>
    </div>

    <!-- Paso 1: los tres campos APILADOS, no dos en fila. -->
    <form v-else class="flex flex-col gap-3.5" @submit.prevent="onSubmit">
      <InputPasswordCore
        v-model="fields.current_password.value"
        label="Contraseña actual"
        toggle-mask
        :feedback="false"
        :invalid="!!errors.current_password"
        :message-error="errors.current_password"
      />
      <InputPasswordCore
        v-model="fields.password.value"
        label="Nueva contraseña"
        hint-label="Mínimo 6 caracteres"
        toggle-mask
        :feedback="false"
        :invalid="!!errors.password"
        :message-error="errors.password"
      />
      <InputPasswordCore
        v-model="fields.password_confirmation.value"
        label="Confirmar nueva contraseña"
        toggle-mask
        :feedback="false"
        :invalid="!!errors.password_confirmation"
        :message-error="errors.password_confirmation"
      />

      <div class="mt-2 flex justify-end gap-2">
        <ButtonCore
          label="Cancelar"
          size="small"
          text
          class="!w-auto"
          @click="open = false"
        />
        <ButtonCore
          label="Guardar"
          size="small"
          type="submit"
          class="!w-auto"
          :loading="loading"
        />
      </div>
    </form>
  </ModalCore>
</template>
