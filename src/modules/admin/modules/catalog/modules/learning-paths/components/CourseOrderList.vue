<script setup lang="ts">
/**
 * Orden de los cursos de una línea de carrera.
 *
 * El orden ES la regla de negocio: el curso N se habilita al aprobar el N−1.
 * Antes solo se definía por el orden en que se marcaban en el selector, y para
 * cambiarlo había que desmarcar y volver a marcar. Acá se ve numerado y se
 * mueve con ↑↓; el array reordenado es el que viaja (`toCourseItems` le pone
 * `order` según la posición).
 */
import { onMounted, ref } from "vue";
import { ButtonCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import courseService from "../../courses/services/course.service";

const model = defineModel<number[]>({ default: () => [] });

/* Nombres de todos los cursos (también inactivos: una línea vieja puede tenerlos). */
const names = ref<Record<number, string>>({});

onMounted(async () => {
  const { data } = await safeRequest(() => courseService.all(), { showAlert: false });
  names.value = Object.fromEntries(
    ((data ?? []) as { id: number; name: string }[]).map((c) => [c.id, c.name]),
  );
});

const move = (index: number, delta: -1 | 1) => {
  const target = index + delta;
  if (target < 0 || target >= model.value.length) return;
  const next = [...model.value];
  [next[index], next[target]] = [next[target]!, next[index]!];
  model.value = next;
};
</script>

<template>
  <div v-if="model.length" class="rounded-adm-sm border border-line">
    <p
      class="border-b border-line bg-admin-bg px-4 py-2 font-mono text-adm-label uppercase tracking-[0.06em] text-secondary-400"
    >
      Orden de la línea · cada curso se habilita al aprobar el anterior
    </p>
    <ol>
      <li
        v-for="(courseId, index) in model"
        :key="courseId"
        class="flex items-center gap-3 border-b border-line px-4 py-2 last:border-b-0"
      >
        <span
          class="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-adm-sm font-bold text-primary-600"
        >
          {{ index + 1 }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-adm-base font-semibold text-secondary-900">
            {{ names[courseId] ?? `Curso #${courseId}` }}
          </span>
          <span v-if="index > 0" class="block truncate text-adm-sm text-secondary-500">
            Se habilita al aprobar: {{ names[model[index - 1]!] ?? `Curso #${model[index - 1]}` }}
          </span>
        </span>
        <ButtonCore
          class="!w-auto"
          size="small"
          text
          severity="secondary"
          label="↑ Subir"
          :disabled="index === 0"
          @click="move(index, -1)"
        />
        <ButtonCore
          class="!w-auto"
          size="small"
          text
          severity="secondary"
          label="↓ Bajar"
          :disabled="index === model.length - 1"
          @click="move(index, 1)"
        />
      </li>
    </ol>
  </div>
</template>
