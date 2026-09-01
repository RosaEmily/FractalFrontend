<script setup lang="ts">
import { z } from "zod";
import { computed, ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { lettersSpaces } from "@/shared/utils/zod/shortcuts";
import {
  InputTextCore,
  InputPasswordCore,
  InputNumberCore,
  SelectCore,
  MultiselectCore,
  DatePicketCore,
  TextAreaCore,
} from "@/shared/components";
import {
  GENDER_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  ACADEMIC_DEGREE_OPTIONS,
  CAREER_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from "@/modules/admin/constants/options";
import { EXPERIENCE_YEARS_LIMIT } from "@/modules/admin/constants/numeric-limits";

import userService from "../services/user.service";
import type { UserBodyDTO } from "../dto/user.dto";
import roleService from "../../roles/services/role.service";
import type { Role } from "../../roles/models/role.model";

/**
 * La API valida los campos del perfil según los roles enviados: con TEACHER
 * exige los de docente y con STUDENT los de alumno, en el mismo request.
 * El formulario los muestra u oculta siguiendo esa misma regla.
 */
const roles = ref<Role[]>([]);
const selectedRoles = ref<number[]>([]);

const loadRoles = async () => {
  roles.value = await roleService.all();
  return roles.value;
};

const roleNames = computed(() =>
  roles.value
    .filter((role) => selectedRoles.value.includes(role.id))
    .map((role) => role.name),
);

const isTeacher = computed(() => roleNames.value.includes("TEACHER"));
const isStudent = computed(() => roleNames.value.includes("STUDENT"));

const initialValues = ref<UserBodyDTO>({
  first_name: null,
  last_name: null,
  email: null,
  password: null,
  gender: null,
  roles: [],
  // Perfil docente
  specialty: null,
  experience_years: null,
  description: null,
  academic_degree: null,
  other_academic_degree: null,
  // Perfil alumno
  education_level: null,
  career: null,
  other_career: null,
  birth_date: null,
  address: null,
  // Comunes a ambos perfiles
  document_type: null,
  document_number: null,
  phone: null,
});

/** Mantiene `selectedRoles` en sincronía con lo elegido en el multiselect. */
const onRolesChange = (value: unknown) => {
  selectedRoles.value = Array.isArray(value) ? (value as number[]) : [];
};

const formSchema = computed(() => {
  const base = {
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
    roles: z
      .array(z.number())
      .min(1, { message: "Debes seleccionar al menos un rol" }),
  } as Record<string, z.ZodTypeAny>;

  // Campos que la API exige cuando el usuario tiene ficha de perfil.
  if (isTeacher.value || isStudent.value) {
    base.document_type = z.string({
      message: "El tipo de documento es obligatorio",
    });
    base.document_number = z
      .string({ message: "El número de documento es obligatorio" })
      .max(50);
    base.phone = z.string({ message: "El teléfono es obligatorio" }).max(20);
  }

  if (isTeacher.value) {
    base.specialty = z
      .string({ message: "La especialidad es obligatoria" })
      .max(255);
    base.experience_years = z
      .number({ message: "Los años de experiencia son obligatorios" })
      .int()
      .min(EXPERIENCE_YEARS_LIMIT.min)
      .max(EXPERIENCE_YEARS_LIMIT.max, {
        message: `No puede superar ${EXPERIENCE_YEARS_LIMIT.max} años`,
      });
    base.description = z.string({ message: "La descripción es obligatoria" });
    base.academic_degree = z.string({
      message: "El grado académico es obligatorio",
    });
  }

  if (isStudent.value) {
    base.education_level = z.string({
      message: "El nivel educativo es obligatorio",
    });
    base.career = z.string({ message: "La carrera es obligatoria" });
    base.birth_date = z.string({
      message: "La fecha de nacimiento es obligatoria",
    });
    base.address = z.string({ message: "La dirección es obligatoria" });
  }

  return z.object(base).passthrough();
});
</script>

<template>
  <CrudForm
    title="Crear Usuario"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="users.list"
    :service="(body) => userService.create(body)"
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
          :invalid="!!errors.email"
          :message-error="errors.email"
        />
        <InputPasswordCore
          v-model="fields.password.value"
          label="Contraseña"
          :invalid="!!errors.password"
          :message-error="errors.password"
        />
      </div>

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
        <!--
          El multiselect enlaza al campo del formulario (igual que en Roles);
          `selectedRoles` se actualiza aparte porque de él dependen los
          campos de perfil que se muestran.
        -->
        <MultiselectCore
          v-model="fields.roles.value"
          label="Roles · define qué datos adicionales se piden"
          :options="roles"
          option-label="name"
          option-value="id"
          placeholder="Selecciona los roles"
          :service="loadRoles"
          auto-load
          :invalid="!!errors.roles"
          :message-error="errors.roles"
          @update:model-value="onRolesChange"
        />
      </div>

      <!-- Datos comunes a las fichas de docente y alumno -->
      <template v-if="isTeacher || isStudent">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <InputTextCore
            v-model="fields.phone.value"
            label="Teléfono"
            :invalid="!!errors.phone"
            :message-error="errors.phone"
          />
        </div>
      </template>

      <!-- Ficha de docente -->
      <template v-if="isTeacher">
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
        <InputTextCore
          v-if="fields.academic_degree.value === 'other'"
          v-model="fields.other_academic_degree.value"
          label="Especifica el grado académico"
          :invalid="!!errors.other_academic_degree"
          :message-error="errors.other_academic_degree"
        />
        <TextAreaCore
          v-model="fields.description.value"
          label="Descripción"
          :rows="3"
          :invalid="!!errors.description"
          :message-error="errors.description"
        />
      </template>

      <!-- Ficha de alumno -->
      <template v-if="isStudent">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectCore
            v-model="fields.education_level.value"
            label="Nivel educativo"
            :options="EDUCATION_LEVEL_OPTIONS"
            option-label="label"
            option-value="value"
            placeholder="Selecciona un nivel"
            :invalid="!!errors.education_level"
            :message-error="errors.education_level"
          />
          <SelectCore
            v-model="fields.career.value"
            label="Carrera"
            :options="CAREER_OPTIONS"
            option-label="label"
            option-value="value"
            placeholder="Selecciona una carrera"
            :invalid="!!errors.career"
            :message-error="errors.career"
          />
        </div>
        <InputTextCore
          v-if="fields.career.value === 'other'"
          v-model="fields.other_career.value"
          label="Especifica la carrera"
          :invalid="!!errors.other_career"
          :message-error="errors.other_career"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicketCore
            v-model="fields.birth_date.value"
            label="Fecha de nacimiento"
            dayjs-format-value="YYYY-MM-DD"
            :invalid="!!errors.birth_date"
            :message-error="errors.birth_date"
          />
          <InputTextCore
            v-model="fields.address.value"
            label="Dirección"
            :invalid="!!errors.address"
            :message-error="errors.address"
          />
        </div>
      </template>
    </template>
  </CrudForm>
</template>
