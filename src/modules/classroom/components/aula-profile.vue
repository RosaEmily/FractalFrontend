<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { mdiLockOutline, mdiTrayArrowUp } from "@mdi/js";
import {
  ButtonCore,
  HeroCore,
  InputTextCore,
  SelectCore,
  DatePicketCore,
  TextAreaCore,
  InputNumberCore,
} from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import profileService from "@/modules/admin/modules/profile/services/profile.service";
import type { Profile } from "@/modules/admin/modules/profile/models/profile.model";
import type { AulaProfileUpdateBodyDTO } from "@/modules/admin/modules/profile/dto/profile.dto";
import {
  GENDER_OPTIONS,
  CAREER_OPTIONS,
  ACADEMIC_DEGREE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from "@/modules/admin/constants/options";
import { AulaAvatar, AulaCard, AulaSpinner } from "./ui";
import { formatDate } from "../utils/format";

/**
 * Perfil del aula (`StuProfile` / `StaffProfile` del diseño).
 *
 * ⚠️ NO es el `PersonalInfo` del admin, que solo edita nombre, género y
 * `max_sessions`. El diseño del aula pide la ficha académica completa —
 * teléfono, dirección, formación— y la reparte en DOS columnas: lo editable a
 * la izquierda, y a la derecha la foto, lo que corrige administración y la
 * contraseña.
 */
const props = defineProps<{ profile: Profile | null }>();
const emit = defineEmits<{
  updated: [Profile];
  "change-password": [];
}>();

const toastStore = useToastStore();

const editing = ref(false);
const saving = ref(false);

const kind = computed(() => props.profile?.profile?.kind ?? null);
const isTeacher = computed(() => kind.value === "teacher");

/** Copia editable. Se rehace al entrar en edición para que Cancelar descarte. */
const form = reactive<AulaProfileUpdateBodyDTO>({});

const resetForm = () => {
  const p = props.profile;
  if (!p) return;

  Object.assign(form, {
    first_name: p.first_name,
    last_name: p.last_name,
    gender: p.gender,
  });

  const detail = p.profile;
  if (!detail) return;

  if (detail.kind === "student") {
    Object.assign(form, {
      birth_date: detail.birth_date,
      phone: detail.phone,
      address: detail.address,
      education_level: detail.education_level,
      career: detail.career,
      other_career: detail.other_career,
    });

    return;
  }

  Object.assign(form, {
    phone: detail.phone,
    academic_degree: detail.academic_degree,
    other_academic_degree: detail.other_academic_degree,
    specialty: detail.specialty,
    experience_years: detail.experience_years,
    description: detail.description,
  });
};

watch(() => props.profile, resetForm, { immediate: true });

/**
 * Filas en modo lectura. Salen de los `*_name` que ya resuelve el Resource, no
 * de mapear la clave acá: el catálogo vive en la API.
 */
const rows = computed<[string, string][]>(() => {
  const p = props.profile;
  if (!p) return [];

  const base: [string, string][] = [
    ["Nombres", p.first_name],
    ["Apellidos", p.last_name],
  ];

  const detail = p.profile;

  if (detail?.kind === "student") {
    return [
      ...base,
      ["Fecha de nacimiento", formatDate(detail.birth_date, true) || "—"],
      ["Género", p.gender_name],
      ["Teléfono", detail.phone ?? "—"],
      ["Dirección", detail.address ?? "—"],
      ["Nivel educativo", detail.education_level_name ?? "—"],
      ["Carrera", detail.career_name ?? "—"],
    ];
  }

  if (detail?.kind === "teacher") {
    return [
      ...base,
      ["Género", p.gender_name],
      ["Teléfono", detail.phone ?? "—"],
      ["Grado académico", detail.academic_degree_name ?? "—"],
      ["Especialidad", detail.specialty ?? "—"],
      ["Años de experiencia", String(detail.experience_years ?? "—")],
      ["Biografía", detail.description ?? "—"],
    ];
  }

  return [...base, ["Género", p.gender_name]];
});

/** "Alumna desde 10 ago 2025" — el género decide la palabra. */
const memberSince = computed(() => {
  const p = props.profile;
  if (!p) return "";

  const noun = isTeacher.value
    ? p.gender === "f"
      ? "Docente"
      : "Docente"
    : p.gender === "f"
      ? "Alumna"
      : "Alumno";

  return `${noun} desde ${formatDate(p.created_at, true)}`;
});

/*
 * FOTO DE PERFIL
 *
 * ⚠️ El límite es 900 KB, el que el propio texto promete ("JPG o PNG, hasta
 * 900 KB"). La API acepta hasta 2 MB (`photo_url` → `max:2048`), así que este
 * es el más estricto de los dos: rechazar acá da un mensaje claro en vez de un
 * 422 genérico, y nunca deja pasar algo que el backend fuera a rechazar.
 */
const MAX_PHOTO_BYTES = 900 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];
/** Mínimo del diseño (admin/profile.jsx:166): por debajo se ve pixelada. */
const MIN_PHOTO_SIDE = 200;

const photoInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const photoFailed = ref(false);
/** Modo edición propio de la tarjeta de foto. */
const editingPhoto = ref(false);
/**
 * Archivo elegido y todavía sin subir.
 *
 * ⚠️ El diseño nuevo (teacher.jsx:941) separa ELEGIR de GUARDAR: se ve la
 * imagen antes de confirmarla, y Cancelar la descarta sin haber tocado el
 * servidor.
 */
const pendingPhoto = ref<File | null>(null);
/**
 * Motivo del rechazo, VISIBLE en la tarjeta.
 *
 * ⚠️ No basta un toast: desaparece solo y el usuario se queda mirando el
 * avatar sin cambiar, sin saber si falló o si todavía está subiendo.
 */
const photoError = ref<string | null>(null);

/**
 * Ancho y alto reales del archivo.
 *
 * Hay que CARGAR la imagen para saberlos: el `File` solo trae tipo y tamaño.
 * Se resuelve `null` si el archivo no es una imagen legible, que también es un
 * rechazo — un .png con contenido corrupto pasa el filtro de `type`.
 */
const readImageSize = (file: File): Promise<{ w: number; h: number } | null> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
/** URL local mientras sube; después, la que devuelve el servidor. */
const localPhoto = ref<string | null>(null);

const photoPreview = computed(
  () => localPhoto.value ?? props.profile?.photo_url ?? null,
);

// Una foto nueva merece otro intento de carga.
watch(photoPreview, () => (photoFailed.value = false));

const pickPhoto = () => photoInput.value?.click();

/** Resalta la zona mientras se arrastra encima. */
const draggingPhoto = ref(false);

const onPhotoDrop = (event: DragEvent) => {
  draggingPhoto.value = false;
  void uploadPhoto(event.dataTransfer?.files?.[0]);
};

const onPhotoChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  // Permite volver a elegir el MISMO archivo tras un error.
  target.value = "";

  void uploadPhoto(file);
};

/** Formatea el peso con la misma unidad del texto de ayuda. */
const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

/**
 * Valida y sube. La usan tanto el selector como el arrastre.
 *
 * Cada rechazo dice QUÉ tiene el archivo, no solo cuál es el límite: "pesa
 * 1.4 MB" se corrige mirando el archivo; "no debe superar 900 KB" obliga a
 * adivinar cuál de las dos cosas falló.
 */
const uploadPhoto = async (file: File | undefined) => {
  if (!file) return;

  photoError.value = null;

  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    photoError.value = `Solo se admite JPG o PNG. Este archivo es ${
      file.type || "de un tipo desconocido"
    }.`;

    return;
  }

  if (file.size > MAX_PHOTO_BYTES) {
    photoError.value = `La imagen pesa ${kb(file.size)} y el máximo es ${kb(
      MAX_PHOTO_BYTES,
    )}.`;

    return;
  }

  const size = await readImageSize(file);

  if (!size) {
    photoError.value = "No se pudo leer la imagen: puede estar dañada.";

    return;
  }

  if (size.w < MIN_PHOTO_SIDE || size.h < MIN_PHOTO_SIDE) {
    photoError.value = `La imagen mide ${size.w}×${size.h}px y el mínimo es ${MIN_PHOTO_SIDE}×${MIN_PHOTO_SIDE}px.`;

    return;
  }

  // Validada: se muestra y espera a que confirmen con Guardar.
  releasePreview();
  localPhoto.value = URL.createObjectURL(file);
  pendingPhoto.value = file;
};

/** Suelta la URL local: reserva memoria hasta revocarse explícitamente. */
const releasePreview = () => {
  if (!localPhoto.value) return;

  URL.revokeObjectURL(localPhoto.value);
  localPhoto.value = null;
};

/** Sube la foto elegida. Solo desde el botón Guardar. */
const savePhoto = async () => {
  const file = pendingPhoto.value;

  if (!file) return;

  uploading.value = true;
  const { data, error } = await safeRequest(
    () => profileService.update({}, file),
    { showAlert: false },
  );
  uploading.value = false;

  if (error || !data) {
    // El fallo del servidor va al mismo sitio que los de validación.
    photoError.value = error?.message ?? "No se pudo subir la imagen.";

    return;
  }

  releasePreview();
  pendingPhoto.value = null;
  editingPhoto.value = false;

  emit("updated", data);
  toastStore.showToastSuccess({ detail: "Foto actualizada" });
};

/** Descarta la elección sin haber tocado el servidor. */
const cancelPhoto = () => {
  releasePreview();
  pendingPhoto.value = null;
  photoError.value = null;
  editingPhoto.value = false;
};

const save = async () => {
  saving.value = true;
  const { data, error } = await safeRequest(() => profileService.update(form));
  saving.value = false;

  if (error || !data) return;

  emit("updated", data);
  editing.value = false;
  toastStore.showToastSuccess({ detail: "Perfil actualizado" });
};

const cancel = () => {
  resetForm();
  editing.value = false;
};
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
    <!-- Columna izquierda: lo que el usuario sí puede cambiar -->
    <AulaCard pad="lg">
      <div class="mb-4.5 flex items-center justify-between gap-3">
        <span
          class="font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
        >
          Datos que puedes editar
        </span>

        <div v-if="editing" class="flex gap-2">
          <ButtonCore
            label="Guardar"
            size="small"
            class="!w-auto"
            :loading="saving"
            @click="save"
          />
          <ButtonCore
            label="Cancelar"
            size="small"
            text
            class="!w-auto"
            @click="cancel"
          />
        </div>
        <ButtonCore
          v-else
          label="Editar"
          size="small"
          class="!w-auto v3-btn-soft"
          @click="editing = true"
        />
      </div>

      <!-- Modo edición -->
      <div v-if="editing" class="flex flex-col gap-3.5">
        <div class="grid gap-3.5 sm:grid-cols-2">
          <InputTextCore v-model="form.first_name" label="Nombres" />
          <InputTextCore v-model="form.last_name" label="Apellidos" />
        </div>

        <!--
          El diseño empareja los campos cortos de dos en dos: el alumno lleva
          `Fecha de nacimiento + Teléfono` y luego `Género` (student2.jsx:341),
          y el docente `Género + Teléfono` (teacher.jsx:898). Un campo corto
          suelto a ancho completo desalinea la columna entera.
        -->
        <div v-if="isTeacher" class="grid gap-3.5 sm:grid-cols-2">
          <SelectCore
            v-model="form.gender"
            label="Género"
            :options="GENDER_OPTIONS"
            option-label="label"
            option-value="value"
          />
          <InputTextCore v-model="form.phone" label="Teléfono" />
        </div>

        <template v-else>
          <div class="grid gap-3.5 sm:grid-cols-2">
            <DatePicketCore
              v-model="form.birth_date"
              label="Fecha de nacimiento"
              dayjs-format-value="YYYY-MM-DD"
            />
            <InputTextCore v-model="form.phone" label="Teléfono" />
          </div>

          <div class="grid gap-3.5 sm:grid-cols-2">
            <SelectCore
              v-model="form.gender"
              label="Género"
              :options="GENDER_OPTIONS"
              option-label="label"
              option-value="value"
            />
          </div>
        </template>

        <template v-if="isTeacher">
          <SelectCore
            v-model="form.academic_degree"
            label="Grado académico"
            :options="ACADEMIC_DEGREE_OPTIONS"
            option-label="label"
            option-value="value"
          />
          <!-- "Otro" abre el campo libre: es lo que guarda la columna aparte. -->
          <InputTextCore
            v-if="form.academic_degree === 'other'"
            v-model="form.other_academic_degree"
            label="¿Cuál?"
          />
          <InputTextCore
            v-model="form.specialty"
            label="Especialidad"
          />
          <InputNumberCore
            v-model="form.experience_years"
            label="Años de experiencia"
            :min="0"
            :max="70"
          />
          <TextAreaCore
            v-model="form.description"
            label="Biografía"
            :rows="4"
          />
        </template>

        <template v-else>
          <InputTextCore v-model="form.address" label="Dirección" />
          <div class="grid gap-3.5 sm:grid-cols-2">
            <SelectCore
              v-model="form.education_level"
              label="Nivel educativo"
              :options="EDUCATION_LEVEL_OPTIONS"
              option-label="label"
              option-value="value"
            />
            <SelectCore
              v-model="form.career"
              label="Carrera"
              :options="CAREER_OPTIONS"
              option-label="label"
              option-value="value"
            />
          </div>
          <InputTextCore
            v-if="form.career === 'other'"
            v-model="form.other_career"
            label="¿Cuál?"
          />
        </template>
      </div>

      <!-- Modo lectura -->
      <div
        v-for="[label, value] in rows"
        v-else
        :key="label"
        class="flex justify-between gap-3.5 border-b border-line-soft py-[0.8125rem] last:border-0"
      >
        <span class="shrink-0 text-adm-base text-secondary-500">
          {{ label }}
        </span>
        <span
          class="max-w-[65%] text-right text-adm-md font-semibold text-secondary-900"
        >
          {{ value }}
        </span>
      </div>
    </AulaCard>

    <!-- Columna derecha: foto, datos bloqueados y contraseña -->
    <div class="flex flex-col gap-5">
      <!--
        ⚠️ `@dragover/@drop.prevent` en TODA la tarjeta: sin esto, soltar la
        imagen un pixel fuera del avatar hace que el navegador la ABRA y saque
        al usuario de la página con el formulario a medio editar.
      -->
      <AulaCard
        pad="lg"
        class="text-center"
        @dragover.prevent
        @drop.prevent="onPhotoDrop"
      >
        <!--
          Toda la zona del avatar acepta ARRASTRAR una imagen, no solo el botón:
          es el gesto que la gente intenta primero al ver una foto de perfil.
          El anillo de acento confirma que soltará ahí.
        -->
        <div
          class="relative inline-flex rounded-full ring-offset-4 ring-offset-surface-paper transition-shadow"
          :class="draggingPhoto ? 'ring-2 ring-primary-500' : ''"
          @dragover.prevent="editingPhoto && (draggingPhoto = true)"
          @dragleave.prevent="draggingPhoto = false"
          @drop.prevent="onPhotoDrop"
        >
          <!--
            La foto real si existe; si no —o si la URL falla—, las iniciales.
            Mismo criterio que `AvatarCell`: un icono de imagen rota se ve peor
            que no tener foto.
          -->
          <img
            v-if="photoPreview && !photoFailed"
            :src="photoPreview"
            alt=""
            class="size-23 shrink-0 rounded-full object-cover"
            @error="photoFailed = true"
          />
          <AulaAvatar
            v-else
            :name="`${profile?.first_name} ${profile?.last_name}`"
            :size="92"
          />

          <!--
            El botón de subir aparece SOLO en modo edición, como el resto del
            perfil (`photoEdit`, teacher.jsx:932). Fuera de ese modo la tarjeta
            es de lectura y el icono flotando invitaba a un cambio accidental.
          -->
          <button
            v-if="editingPhoto"
            type="button"
            class="absolute -right-1 -bottom-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-pill border border-line bg-surface-paper shadow-sm disabled:cursor-wait"
            :title="uploading ? 'Subiendo…' : 'Cambiar foto'"
            :disabled="uploading"
            @click="pickPhoto"
          >
            <AulaSpinner v-if="uploading" :size="14" />
            <HeroCore
              v-else
              :path="mdiTrayArrowUp"
              class="size-4 text-secondary-500"
            />
          </button>

          <!--
            El `input file` va oculto: es el disparador del diálogo del SO, no
            un control visible (la excepción conocida a la regla PrimeVue).
          -->
          <input
            ref="photoInput"
            type="file"
            accept="image/jpeg,image/png"
            class="hidden"
            @change="onPhotoChange"
          />
        </div>

        <p
          class="mt-3.5 font-display text-adm-xl font-bold text-secondary-900 tracking-tight"
        >
          {{ profile?.first_name }} {{ profile?.last_name }}
        </p>
        <p class="mt-1 text-adm-base text-secondary-500">{{ memberSince }}</p>
        <!--
          El motivo del rechazo OCUPA EL LUGAR del texto de ayuda: repetir las
          reglas debajo del error las vuelve ruido, y el error ya las nombra.
          Se limpia al elegir otro archivo.
        -->
        <p
          v-if="photoError"
          class="mt-3 text-adm-sm leading-relaxed text-danger-DEFAULT"
        >
          {{ photoError }}
        </p>
        <p v-else class="mt-3 text-adm-sm text-secondary-400">
          JPG o PNG, hasta 900 KB · mínimo 200×200px
        </p>

        <!--
          La foto tiene su PROPIO modo edición (teacher.jsx:941), separado del
          de los datos: son dos guardados distintos contra el mismo endpoint y
          mezclarlos obligaría a subir una imagen para corregir un teléfono.
        -->
        <div class="mt-4 flex justify-center gap-2">
          <template v-if="editingPhoto">
            <ButtonCore
              label="Guardar"
              size="small"
              class="!w-auto"
              :loading="uploading"
              :disabled="!pendingPhoto"
              @click="savePhoto"
            />
            <ButtonCore
              label="Cancelar"
              size="small"
              text
              class="!w-auto"
              @click="cancelPhoto"
            />
          </template>
          <ButtonCore
            v-else
            label="Editar"
            size="small"
            class="!w-auto v3-btn-soft"
            @click="editingPhoto = true"
          />
        </div>
      </AulaCard>

      <AulaCard v-if="profile?.document_number || profile?.email" pad="lg">
        <span
          class="mb-3.5 block font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
        >
          Datos que corrige administración
        </span>

        <div
          v-if="profile?.document_number"
          class="flex justify-between gap-3.5 border-b border-line-soft py-[0.8125rem]"
        >
          <span class="text-adm-base text-secondary-500">Documento</span>
          <span
            class="inline-flex items-center gap-2 text-adm-md font-semibold text-secondary-900"
          >
            {{ profile.document_type }} {{ profile.document_number }}
            <HeroCore :path="mdiLockOutline" class="size-3.5 text-secondary-400" />
          </span>
        </div>

        <div class="flex justify-between gap-3.5 border-b border-line-soft py-[0.8125rem]">
          <span class="shrink-0 text-adm-base text-secondary-500">
            Correo de acceso
          </span>
          <span
            class="inline-flex min-w-0 items-center gap-2 text-adm-md font-semibold text-secondary-900"
          >
            <span class="truncate">{{ profile?.email }}</span>
            <HeroCore
              :path="mdiLockOutline"
              class="size-3.5 shrink-0 text-secondary-400"
            />
          </span>
        </div>

        <p class="mt-3 text-adm-sm leading-relaxed text-secondary-400">
          {{
            profile?.document_number
              ? "El documento y el correo identifican tu matrícula y tus certificados. Para cambiarlos escribe a administración."
              : "El correo identifica tu cuenta. Para cambiarlo escribe a administración."
          }}
        </p>
      </AulaCard>

      <AulaCard pad="lg">
        <span
          class="mb-3 block font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
        >
          Contraseña
        </span>
        <p class="text-adm-base leading-relaxed text-secondary-500">
          Al cambiarla se cierran las demás sesiones y solo queda abierta la
          actual.
        </p>
        <p
          v-if="profile?.password_changed_at"
          class="mt-2.5 text-adm-sm text-secondary-400"
        >
          Último cambio: {{ formatDate(profile.password_changed_at, true) }}
        </p>
        <div class="mt-4">
          <!--
            `secondary` del diseño (teacher.jsx:967): borde e ink principal, no
            el gris de `outlined`. Vive en `style.css` como `.v3-btn-secondary`.
          -->
          <ButtonCore
            label="Cambiar contraseña"
            size="small"
            class="!w-auto v3-btn-secondary"
            @click="emit('change-password')"
          />
        </div>
      </AulaCard>
    </div>
  </div>
</template>
