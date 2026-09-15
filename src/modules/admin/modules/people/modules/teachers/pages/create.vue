<script setup lang="ts">
import { z } from "zod";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { lettersSpaces, numbersOnly } from "@/shared/utils/zod/shortcuts";
import {
  InputTextCore,
  InputPasswordCore,
  InputNumberCore,
  SelectCore,
  TextAreaCore,
} from "@/shared/components";
import {
  GENDER_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  ACADEMIC_DEGREE_OPTIONS,
} from "@/modules/admin/constants/options";
import { EXPERIENCE_YEARS_LIMIT } from "@/modules/admin/constants/numeric-limits";

import { useToastStore } from "@/shared/stores/useToastStore";
import userService from "@/modules/admin/modules/security/modules/users/services/user.service";
import type { UserBodyDTO } from "@/modules/admin/modules/security/modules/users/dto/user.dto";
import roleService from "@/modules/admin/modules/security/modules/roles/services/role.service";

/**
 * Alta de instructores.
 *
 * ⚠️ **Crea un USUARIO con rol TEACHER, no una fila suelta en `teachers`.**
 * El perfil es 1:1 con `users`: sin usuario no hay correo ni acceso, y
 * `academic/teachers` solo escribe su propia tabla. `security/users` crea ambos
 * registros en una sola petición —foto incluida— y es ADMIN-only.
 */
const router = useRouter();
const toast = useToastStore();

/** Id del rol TEACHER, necesario para el alta. Se resuelve al montar. */
const roleId = ref<number | null>(null);
const photo = ref<File | null>(null);

const initialValues = ref<UserBodyDTO>({
  first_name: null,
  last_name: null,
  // El rol lo fija el submit con el id resuelto al montar.
  roles: [],
  email: null,
  password: null,
  gender: null,
  document_type: null,
  document_number: null,
  phone: null,
  specialty: null,
  experience_years: null,
  description: null,
  academic_degree: null,
  other_academic_degree: null,
  // Campos de la ficha de alumno: este formulario no los pide.
  education_level: null,
  career: null,
  other_career: null,
  birth_date: null,
  address: null,
});

const initials = computed(() => {
  const first = initialValues.value.first_name ?? "";
  const last = initialValues.value.last_name ?? "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
});

onMounted(async () => {
  const roles = await roleService.all();
  roleId.value = roles.find((role) => role.name === "TEACHER")?.id ?? null;

  // Sin el rol no se puede crear el perfil: la API lo exige para validar sus
  // campos. Es preferible avisar acá que fallar al enviar.
  if (!roleId.value) {
    toast.showToastError({
      detail: 'No encontramos el rol TEACHER. Créalo en Seguridad → Roles.',
    });
    router.replace({ name: "teachers.list" });
  }
});

const formSchema = z.object({
  first_name: withRefinements(
    z
      .string({ message: "El nombre es obligatorio" })
      .min(2, { message: "Debe tener al menos 2 caracteres" })
      .max(100, { message: "No puede tener más de 100 caracteres" }),
    lettersSpaces,
  ),
  last_name: withRefinements(
    z
      .string({ message: "El apellido es obligatorio" })
      .min(2, { message: "Debe tener al menos 2 caracteres" })
      .max(100, { message: "No puede tener más de 100 caracteres" }),
    lettersSpaces,
  ),
  email: z
    .string({ message: "El correo es obligatorio" })
    .email({ message: "Debes ingresar un correo válido" })
    .max(150),
  password: z
    .string({ message: "La contraseña es obligatoria" })
    .min(6, { message: "Debe tener al menos 6 caracteres" }),
  gender: z.enum(["m", "f", "o"], { message: "Debes seleccionar un género" }),
  document_type: z.string({ message: "El tipo de documento es obligatorio" }),
  document_number: withRefinements(
    z
      .string({ message: "El número de documento es obligatorio" })
      .min(6, { message: "Debe tener al menos 6 caracteres" })
      .max(50),
    numbersOnly,
  ),
  phone: z.string({ message: "El teléfono es obligatorio" }).max(20),
  specialty: z
    .string({ message: "La especialidad es obligatoria" })
    .max(255),
  experience_years: z
    .number({ message: "Los años de experiencia son obligatorios" })
    .int()
    .min(EXPERIENCE_YEARS_LIMIT.min, { message: "No puede ser negativo" })
    .max(EXPERIENCE_YEARS_LIMIT.max, {
      message: `No puede superar ${EXPERIENCE_YEARS_LIMIT.max} años`,
    }),
  academic_degree: z.string({ message: "El grado académico es obligatorio" }),
  other_academic_degree: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
});

/** Manda el rol y la foto junto al resto: `BaseRepository` arma el multipart. */
const onSubmit = (body: Record<string, unknown>) =>
  userService.create({
    ...body,
    roles: [roleId.value],
    ...(photo.value ? { photo_url: photo.value } : {}),
  } as never);
</script>

<template>
  <CrudForm
    title="Crear Instructor"
    :schema="formSchema"
    :initial-values="initialValues"
    redirect="teachers.list"
    :service="onSubmit"
  >
    <template #default="{ fields, errors }">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.email.value"
          label="Correo"
          hint-label="Con este correo iniciará sesión"
          :invalid="!!errors.email"
          :message-error="errors.email"
        />
        <InputPasswordCore
          v-model="fields.password.value"
          label="Contraseña temporal"
          :invalid="!!errors.password"
          :message-error="errors.password"
        />
      </div>

      <ImageField
        label="Foto de perfil"
        variant="avatar"
        :fallback-text="initials"
        :max-kb="500"
        accept="image/jpeg,image/png"
        hint="JPG o PNG, hasta 500 KB. Opcional."
        @select="photo = $event"
        @clear="photo = null"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <InputTextCore
          v-model="fields.phone.value"
          label="Teléfono"
          :invalid="!!errors.phone"
          :message-error="errors.phone"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectCore
          v-model="fields.document_type.value"
          label="Tipo de documento"
          :options="DOCUMENT_TYPE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un tipo"
          :invalid="!!errors.document_type"
          :message-error="errors.document_type"
        />
        <InputTextCore
          v-model="fields.document_number.value"
          label="Número de documento"
          :invalid="!!errors.document_number"
          :message-error="errors.document_number"
          v-keyfilter.numbersOnly
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.specialty.value"
          label="Especialidad"
          :invalid="!!errors.specialty"
          :message-error="errors.specialty"
        />
        <InputNumberCore
          v-model="fields.experience_years.value"
          label="Años de experiencia"
          :min="EXPERIENCE_YEARS_LIMIT.min"
          :max="EXPERIENCE_YEARS_LIMIT.max"
          :invalid="!!errors.experience_years"
          :message-error="errors.experience_years"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectCore
          v-model="fields.academic_degree.value"
          label="Grado académico"
          :options="ACADEMIC_DEGREE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un grado"
          :invalid="!!errors.academic_degree"
          :message-error="errors.academic_degree"
        />
        <!-- La API lo exige solo cuando el grado es "other". -->
        <InputTextCore
          v-if="fields.academic_degree.value === 'other'"
          v-model="fields.other_academic_degree.value"
          label="Especifica el grado"
          :invalid="!!errors.other_academic_degree"
          :message-error="errors.other_academic_degree"
        />
      </div>

      <TextAreaCore
        v-model="fields.description.value"
        label="Biografía"
        hint-label="Se muestra en la web pública"
        :rows="4"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />

    </template>
  </CrudForm>
</template>
