<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ButtonCore, ModalCore, TextAreaCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import studentService from "../services/student.service";
import type { StudentTestimonial } from "../models/testimonial.model";

/**
 * `AulaTestimonialModal` (diseño `shell.jsx:436`). Reemplaza la simulación en
 * `localStorage['aula_testimonios']` por el endpoint real: crea/edita (upsert)
 * el testimonio del alumno sobre un curso puntual o una línea de carrera.
 *
 * `offer` sigue la forma que ya usa el diseño: `{ code, name, existing }`,
 * donde `code` es `enrollment_course_id` (curso) o el id de la línea
 * (`enrollment_item_id`) — nunca los dos. `existing` llega precargado por la
 * pantalla que abre el modal (ya sabe si el alumno tiene testimonio o no).
 */
const props = defineProps<{
  offer: {
    enrollmentCourseId?: number;
    enrollmentItemId?: number;
    name: string;
    existing: StudentTestimonial | null;
  } | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [testimonial: StudentTestimonial];
}>();

const toastStore = useToastStore();

/*
 * `ModalCore.visible` es un `defineModel`: necesita `v-model`, no un prop +
 * evento sueltos. Como el estado real vive en `offer` (el padre lo pone a
 * null para cerrar), se refleja acá con un getter/setter y el `set` avisa al
 * padre por `close` cuando PrimeVue cierra el modal solo (Esc, clic afuera).
 */
const open = computed({
  get: () => !!props.offer,
  set: (value: boolean) => {
    if (!value) emit("close");
  },
});
const isEdit = computed(() => !!props.offer?.existing);

const rating = ref<number>(5);
const body = ref<string>("");
const saving = ref(false);
const done = ref(false);

// Cada apertura precarga lo existente, o el default del diseño (5 estrellas).
watch(
  () => props.offer,
  (offer) => {
    if (!offer) return;
    saving.value = false;
    done.value = false;
    rating.value = offer.existing?.rating ?? 5;
    body.value = offer.existing?.body ?? "";
  },
  { immediate: true },
);

/** Clic en la mitad izquierda de la estrella `n` = `n - 0.5`, derecha = `n`. */
function setRating(value: number) {
  rating.value = Math.max(0.5, Math.min(5, value));
}

/** Input numérico espejo: el diseño permite escribir el número exacto. */
function onRatingInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (Number.isNaN(value)) return;
  rating.value = Math.max(0, Math.min(5, value));
}

async function onSubmit() {
  if (!props.offer || !body.value.trim()) {
    toastStore.showToastWarning({ detail: "Cuéntanos tu experiencia." });
    return;
  }

  saving.value = true;
  const { status, data, error } = await safeRequest(
    () =>
      studentService.saveTestimonial({
        enrollment_course_id: props.offer?.enrollmentCourseId ?? null,
        enrollment_item_id: props.offer?.enrollmentItemId ?? null,
        rating: rating.value,
        body: body.value.trim(),
      }),
    { showAlert: false },
  );
  saving.value = false;

  if (status && data) {
    done.value = true;
    emit("saved", data);
    return;
  }

  toastStore.showToastError({
    detail: error?.message ?? "No se pudo guardar el testimonio.",
  });
}

function close() {
  emit("close");
}
</script>

<template>
  <ModalCore
    v-model:visible="open"
    modal
    :header="done ? ' ' : isEdit ? 'Editar tu testimonio' : 'Deja tu testimonio'"
    class="w-[min(28.75rem,90vw)]"
  >
    <!-- Confirmación dentro del modal, mismo patrón que el cambio de contraseña. -->
    <div v-if="done" class="py-2 text-center">
      <p class="font-display text-adm-lg font-bold text-secondary-900">
        {{ isEdit ? "Testimonio actualizado" : "¡Gracias por tu testimonio!" }}
      </p>
      <p class="mt-2 text-adm-base leading-relaxed text-secondary-500">
        Coordinación lo revisa antes de publicarlo en la web.
      </p>
      <div class="mt-5 flex justify-center">
        <ButtonCore label="Listo" size="small" class="!w-auto" @click="close" />
      </div>
    </div>

    <form v-else class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <p class="text-adm-sm text-secondary-500 -mt-2">{{ offer?.name }}</p>

      <div>
        <span class="block mb-2 text-adm-sm font-semibold text-secondary-900">
          Calificación
        </span>
        <div class="flex items-center gap-3.5">
          <div class="flex gap-1">
            <span
              v-for="n in 5"
              :key="n"
              class="relative inline-flex size-[1.625rem]"
            >
              <!-- Estrella vacía de fondo -->
              <svg viewBox="0 0 24 24" class="absolute inset-0 size-full">
                <path
                  d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                  class="fill-line"
                />
              </svg>
              <!-- Recorte proporcional a la calificación, encima -->
              <span
                class="absolute inset-0 overflow-hidden"
                :style="{
                  width: `${Math.max(0, Math.min(1, rating - (n - 1))) * 100}%`,
                }"
              >
                <svg viewBox="0 0 24 24" class="size-[1.625rem]">
                  <path
                    d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                    class="fill-amber-DEFAULT"
                  />
                </svg>
              </span>
              <!-- Mitad izquierda = n - 0.5, mitad derecha = n -->
              <button
                type="button"
                class="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                :aria-label="`${n - 0.5} estrellas`"
                @click="setRating(n - 0.5)"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                :aria-label="`${n} estrellas`"
                @click="setRating(n)"
              />
            </span>
          </div>

          <input
            type="number"
            :min="0"
            :max="5"
            step="0.5"
            :value="rating"
            class="w-16 rounded-adm-sm border-[1.5px] border-line bg-surface-page px-2.5 py-1.5 text-adm-sm text-secondary-900 outline-none"
            @input="onRatingInput"
          />
        </div>
        <span class="mt-1.5 block text-adm-xs text-secondary-400">
          Clic en la mitad de la estrella para medias, o escribe el número
          exacto.
        </span>
      </div>

      <TextAreaCore
        v-model="body"
        label="Tu experiencia"
        required
        :rows="4"
        placeholder="Cuenta cómo te ayudó este curso en tu trabajo…"
      />

      <div class="mt-1 flex justify-end gap-2">
        <ButtonCore
          label="Cancelar"
          size="small"
          text
          class="!w-auto"
          @click="close"
        />
        <ButtonCore
          :label="isEdit ? 'Guardar cambios' : 'Enviar'"
          size="small"
          type="submit"
          class="!w-auto"
          :loading="saving"
        />
      </div>
    </form>
  </ModalCore>
</template>
