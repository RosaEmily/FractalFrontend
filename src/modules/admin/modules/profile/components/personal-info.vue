<script setup lang="ts">
import { z } from "zod";
import { computed, ref, watchEffect } from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

import { useFormFields } from "@/shared/composables/useFormFields";
import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { lettersSpaces } from "@/shared/utils/zod/shortcuts";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useUserStore } from "@/modules/admin/stores/useUserStore";
import {
  CardCore,
  ButtonCore,
  InputTextCore,
  SelectCore,
  LabelCore,
} from "@/shared/components";
import {
  GENDER_OPTIONS,
  MAX_SESSIONS_OPTIONS,
} from "@/modules/admin/constants/options";
import { MAX_SESSIONS_LIMIT } from "@/modules/admin/constants/numeric-limits";

import PhotoUpload from "./photo-upload.vue";
import profileService from "../services/profile.service";
import type { ProfileUpdateBodyDTO } from "../dto/profile.dto";
import type { Profile } from "../models/profile.model";

dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  profile: Profile | null;
}
const props = defineProps<Props>();
const emit = defineEmits<{ (e: "updated", profile: Profile): void }>();

const loading = ref<boolean>(false);
const photoFile = ref<File | null>(null);

const formSchema = z.object({
  first_name: withRefinements(
    z
      .string({ message: "El campo nombre es obligatorio" })
      .min(2, { message: "Debe tener al menos 2 caracteres" })
      .max(100, { message: "No puede tener más de 100 caracteres" }),
    lettersSpaces,
  ),
  last_name: withRefinements(
    z
      .string({ message: "El campo apellido es obligatorio" })
      .min(2, { message: "Debe tener al menos 2 caracteres" })
      .max(100, { message: "No puede tener más de 100 caracteres" }),
    lettersSpaces,
  ),
  gender: z.enum(["m", "f", "o"], { message: "Debes seleccionar un género" }),
  max_sessions: z
    .number({ message: "Indica cuántas sesiones permites" })
    .int()
    .min(MAX_SESSIONS_LIMIT.min, {
      message: `Debes permitir al menos ${MAX_SESSIONS_LIMIT.min} sesión`,
    })
    .max(MAX_SESSIONS_LIMIT.max, {
      message: `No puedes permitir más de ${MAX_SESSIONS_LIMIT.max} sesiones`,
    }),
});

const { fields, errors, handleSubmit, setValues, setFieldError } =
  useFormFields<ProfileUpdateBodyDTO>({
    initialValues: {
      first_name: props.profile?.first_name ?? null,
      last_name: props.profile?.last_name ?? null,
      gender: props.profile?.gender ?? null,
      max_sessions: props.profile?.max_sessions ?? null,
    },
    schema: formSchema,
  });

// El padre carga el perfil; al llegar (o cambiar) se refleja en el form.
watchEffect(() => {
  if (!props.profile) return;
  setValues({
    first_name: props.profile.first_name,
    last_name: props.profile.last_name,
    gender: props.profile.gender,
    max_sessions: props.profile.max_sessions,
  });
});

const lastUpdate = computed(() =>
  props.profile?.updated_at ? dayjs(props.profile.updated_at).fromNow() : "—",
);

const isActive = computed(() => props.profile?.status === 1);

const createdAt = computed(() =>
  props.profile?.created_at
    ? dayjs(props.profile.created_at).format("DD MMM YYYY")
    : "—",
);

/** Descarta los cambios y restaura los valores que vinieron de la API. */
const onCancel = () => {
  photoFile.value = null;
  if (!props.profile) return;
  setValues({
    first_name: props.profile.first_name,
    last_name: props.profile.last_name,
    gender: props.profile.gender,
    max_sessions: props.profile.max_sessions,
  });
};

const onSubmit = handleSubmit(async (values: ProfileUpdateBodyDTO) => {
  loading.value = true;
  const toastStore = useToastStore();

  const { status, data, error } = await safeRequest(
    () => profileService.update(values, photoFile.value),
    { showAlert: false },
  );
  loading.value = false;

  if (status && !error) {
    toastStore.showToastSuccess({
      detail: "Cambios guardados correctamente",
    });

    if (data) {
      const userStore = useUserStore();
      userStore.setUserData({
        firstName: data.first_name,
        lastName: data.last_name,
        photo: data.photo_url,
      });
      emit("updated", data);
    }
    photoFile.value = null;
    return;
  }

  if (error?.details && !Array.isArray(error.details)) {
    const details = error.details as Record<string, string[]>;
    (Object.keys(details) as (keyof ProfileUpdateBodyDTO)[]).forEach((key) => {
      setFieldError(key, details[key as string]?.[0]);
    });
  }
  toastStore.showToastError({ detail: error?.message });
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
    <!-- Formulario -->
    <CardCore>
      <template #title>
        <span
          class="font-display text-adm-xl font-bold tracking-tight text-secondary-900"
        >
          Información personal
        </span>
      </template>

      <form @submit.prevent="onSubmit">
        <div class="space-y-3.5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <InputTextCore
              v-model="fields.first_name.value"
              label="Nombres"
              :invalid="!!errors.first_name"
              :message-error="errors.first_name"
              v-keyfilter.lettersSpaces
            />
            <InputTextCore
              v-model="fields.last_name.value"
              label="Apellidos"
              :invalid="!!errors.last_name"
              :message-error="errors.last_name"
              v-keyfilter.lettersSpaces
            />
          </div>

          <!--
            El correo no es editable desde el perfil (la API lo ignora) y
            InputTextCore no expone `disabled`, así que va como texto.
          -->
          <div>
            <LabelCore text="Correo institucional" />
            <p
              class="w-full px-3 py-2 rounded-adm-md border border-line bg-admin-bg text-adm-md text-secondary-500"
            >
              {{ profile?.email }}
            </p>
            <span class="text-adm-sm text-secondary-400">
              No editable · contacta a TI para cambios
            </span>
          </div>

          <SelectCore
            v-model="fields.gender.value"
            label="Género"
            :options="GENDER_OPTIONS"
            option-label="label"
            option-value="value"
            placeholder="Selecciona un género"
            :invalid="!!errors.gender"
            :message-error="errors.gender"
          />

          <!-- SelectCore no expone messagesInfo: el aviso va aparte. -->
          <div>
            <SelectCore
              v-model="fields.max_sessions.value"
              label="Sesiones simultáneas permitidas"
              :options="MAX_SESSIONS_OPTIONS"
              option-label="label"
              option-value="value"
              placeholder="Selecciona un máximo"
              :invalid="!!errors.max_sessions"
              :message-error="errors.max_sessions"
            />
            <span class="text-adm-sm text-secondary-400">
              Si lo reduces se cerrarán tus sesiones más antiguas.
            </span>
          </div>

        </div>

        <div
          class="flex gap-2.5 justify-end items-center mt-7 -mx-6 -mb-6 px-7 py-4.5 border-t border-line-soft bg-admin-bg rounded-b-adm-lg"
        >
          <ButtonCore
            type="button"
            class="!w-auto"
            severity="secondary"
            outlined
            label="Cancelar"
            @click="onCancel"
          />
          <ButtonCore
            class="!w-auto"
            type="submit"
            label="Guardar cambios"
            :loading="loading"
          />
        </div>
      </form>
    </CardCore>

    <!-- Columna derecha -->
    <div class="flex flex-col gap-3.5">
      <CardCore>
        <PhotoUpload @select="(file) => (photoFile = file)" />
      </CardCore>

      <CardCore>
        <p
          class="font-mono text-adm-xs text-secondary-400 tracking-widest uppercase"
        >
          Cuenta
        </p>
        <div class="mt-3 flex flex-col gap-2.5">
          <div
            class="flex justify-between items-center py-1.5 border-b border-line-soft"
          >
            <span class="text-adm-sm text-secondary-500">Creada el</span>
            <span class="text-adm-base text-secondary-900">{{ createdAt }}</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-line-soft"
          >
            <span class="text-adm-sm text-secondary-500">
              Última actualización
            </span>
            <span class="text-adm-base text-secondary-900">
              {{ lastUpdate }}
            </span>
          </div>
          <div class="flex justify-between items-center py-1.5">
            <span class="text-adm-sm text-secondary-500">Estado</span>
            <span
              class="text-adm-base font-semibold inline-flex items-center gap-1.5"
              :class="
                isActive ? 'text-success-DEFAULT' : 'text-secondary-400'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="isActive ? 'bg-success-DEFAULT' : 'bg-secondary-400'"
              />
              {{ isActive ? "Activo" : "Inactivo" }}
            </span>
          </div>
        </div>
      </CardCore>
    </div>
  </div>
</template>
