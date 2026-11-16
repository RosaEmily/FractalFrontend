<script setup lang="ts">
/**
 * Cursos del programa en el ALTA (`AdmCursoTimelineRow` del diseño).
 *
 * Los cursos los define el origen, así que se muestran como texto. Cada
 * tarjeta lleva su duración (de la que salen sus fechas en cascada), docente,
 * horarios y link; los avisos van dentro de la tarjeta, en ámbar. En una
 * línea de carrera las tarjetas se unen en una línea de tiempo: se cursan en
 * secuencia y cada una se habilita al aprobar la anterior.
 *
 * El componente solo avisa con `recalc` cuando cambia algo que mueve fechas;
 * el padre, que conoce el inicio de clases, recalcula.
 */
import { ref } from "vue";
import {
  SelectCore,
  InputTextCore,
  InputNumberCore,
  ButtonCore,
  HeroCore,
} from "@/shared/components";
import { mdiAlertOutline, mdiArrowDown, mdiArrowUp, mdiPlus } from "@mdi/js";
import ScheduleRow from "./ScheduleRow.vue";
import type { OfferCourseItem } from "../models/offer.model";
import type { Teacher } from "../../teachers/models/teacher.model";
import {
  copyScheduleToNextDay,
  courseWarnings,
  dayLabel,
  newScheduleFor,
} from "../utils/offer-form";

const model = defineModel<OfferCourseItem[]>({ default: () => [] });

defineProps<{ teachers: Teacher[] }>();
const emit = defineEmits<{ recalc: [] }>();

const DURATION_UNITS = [
  { label: "semanas", value: "weeks" },
  { label: "meses", value: "months" },
];

const setDuration = (
  item: OfferCourseItem,
  patch: Partial<Pick<OfferCourseItem, "durationValue" | "durationUnit">>,
) => {
  Object.assign(item, patch);
  emit("recalc");
};

/*
 * Reordenar mueve la tarjeta y sus fechas: la cascada se recalcula en el nuevo
 * orden y el array `courses` viaja a la API en ese orden.
 */
const MOVES = [
  { delta: -1, icon: mdiArrowUp, label: "Subir curso" },
  { delta: 1, icon: mdiArrowDown, label: "Bajar curso" },
] as const;

const move = (index: number, delta: -1 | 1) => {
  const target = index + delta;
  if (target < 0 || target >= model.value.length) return;
  const next = [...model.value];
  [next[index], next[target]] = [next[target]!, next[index]!];
  model.value = next;
  emit("recalc");
};

const addSchedule = (item: OfferCourseItem) => {
  item.schedules.push(newScheduleFor(item.schedules));
  emit("recalc");
};

const copySchedule = (item: OfferCourseItem, index: number) => {
  item.schedules.push(copyScheduleToNextDay(item.schedules, item.schedules[index]!));
  emit("recalc");
};

const removeSchedule = (item: OfferCourseItem, index: number) => {
  item.schedules.splice(index, 1);
  emit("recalc");
};

/*
 * Cada curso puede tener su propio link: "Copiar a todos" llena SOLO los que
 * están vacíos y dice cuántos se respetaron.
 */
const linkNotice = ref<string | null>(null);
const copyLinkToAll = (source: OfferCourseItem) => {
  let kept = 0;
  for (const item of model.value) {
    if (item === source) continue;
    if (!item.meetLink) item.meetLink = source.meetLink;
    else if (item.meetLink !== source.meetLink) kept++;
  }
  linkNotice.value = kept
    ? `Copiado a los cursos sin link. ${kept} ${kept === 1 ? "conserva su propio link" : "conservan su propio link"}.`
    : "Copiado a todos los cursos.";
};
</script>

<template>
  <div class="flex flex-col">
    <div
      v-for="(item, index) in model"
      :key="item.courseId ?? index"
      class="relative"
      :class="[model.length > 1 ? 'pl-[1.625rem]' : '', index < model.length - 1 ? 'pb-[1.125rem]' : '']"
    >
      <!-- Línea de tiempo de la secuencia. -->
      <template v-if="model.length > 1">
        <span
          class="absolute left-1 top-1 size-[0.5625rem] rounded-full bg-primary-500 ring-2 ring-surface-paper outline outline-[1.5px] outline-primary-500"
        />
        <span
          v-if="index < model.length - 1"
          class="absolute left-2 top-4 bottom-0 w-[1.5px] bg-line"
        />
      </template>

      <div
        class="overflow-hidden rounded-adm-md border-[1.5px] bg-surface-paper"
        :class="courseWarnings(item, model[index - 1]).length ? 'border-amber-DEFAULT' : 'border-line'"
      >
        <!-- Encabezado: curso como texto, fechas calculadas, prerrequisito. -->
        <div class="flex flex-col gap-0.5 border-b border-line bg-admin-bg px-4 py-3">
          <span
            v-if="model.length > 1"
            class="font-mono text-adm-label uppercase tracking-[0.06em] text-secondary-400"
          >
            Curso {{ index + 1 }} de {{ model.length }}
          </span>
          <div class="flex flex-wrap items-baseline justify-between gap-2.5">
            <span class="text-adm-md font-bold text-secondary-900">{{ item.name }}</span>
            <span class="flex items-center gap-2">
              <span class="text-adm-sm text-secondary-500">
                {{ dayLabel(item.startDate) }} – {{ dayLabel(item.endDate) }}
              </span>
              <span
                v-if="model.length > 1"
                class="inline-flex overflow-hidden rounded-full border-[1.5px] border-line bg-surface-paper"
                role="group"
                aria-label="Mover curso"
              >
                <button
                  v-for="dir in MOVES"
                  :key="dir.delta"
                  type="button"
                  class="grid size-7 cursor-pointer place-items-center text-secondary-500 transition-colors first:border-r-[1.5px] first:border-line hover:bg-admin-bg hover:text-primary-600 disabled:cursor-not-allowed disabled:text-secondary-300 disabled:hover:bg-transparent"
                  :aria-label="dir.label"
                  :disabled="dir.delta < 0 ? index === 0 : index === model.length - 1"
                  @click="move(index, dir.delta)"
                >
                  <HeroCore :path="dir.icon" class="size-3.5" />
                </button>
              </span>
            </span>
          </div>
          <span v-if="index > 0" class="text-adm-sm text-secondary-400">
            Se habilita al aprobar: {{ model[index - 1]?.name }}
          </span>
        </div>

        <!-- Avisos de esta tarjeta. -->
        <div
          v-if="courseWarnings(item, model[index - 1]).length"
          class="flex flex-col gap-1 border-b border-line bg-amber-soft px-4 py-2.5"
        >
          <p
            v-for="(warning, wIndex) in courseWarnings(item, model[index - 1])"
            :key="wIndex"
            class="flex items-start gap-2 text-adm-sm text-secondary-900"
          >
            <HeroCore :path="mdiAlertOutline" class="mt-0.5 size-3.5 shrink-0 text-amber-deep" />
            {{ warning }}
          </p>
        </div>

        <div class="flex flex-col gap-3.5 p-4">
          <div>
            <p class="mb-1.5 text-adm-sm font-semibold text-secondary-900">
              Duración del curso
              <span class="font-normal text-secondary-400">
                · Mueve las fechas de este curso y de los siguientes.
              </span>
            </p>
            <div class="flex gap-2">
              <InputNumberCore
                class="w-24"
                :model-value="item.durationValue ?? null"
                :min="1"
                :max="52"
                @update:model-value="
                  setDuration(item, { durationValue: ($event as number | null) ?? null })
                "
              />
              <SelectCore
                class="w-36"
                :model-value="item.durationUnit ?? 'weeks'"
                optionLabel="label"
                optionValue="value"
                :options="DURATION_UNITS"
                @update:model-value="
                  setDuration(item, { durationUnit: $event as 'weeks' | 'months' })
                "
              />
            </div>
          </div>

          <SelectCore
            v-model="item.teacherId"
            label="Docente"
            optionLabel="fullName"
            optionValue="documentNumber"
            placeholder="Seleccione el docente"
            filter
            filter-placeholder="Buscar docente…"
            :options="teachers"
          />

          <div>
            <p
              class="mb-2 font-mono text-adm-label uppercase tracking-[0.05em] text-secondary-400"
            >
              Horario
            </p>
            <div class="flex flex-col gap-2">
              <ScheduleRow
                v-for="(schedule, sIndex) in item.schedules"
                :key="sIndex"
                :schedule="schedule"
                :removable="item.schedules.length > 1"
                @change="emit('recalc')"
                @copy="copySchedule(item, sIndex)"
                @remove="removeSchedule(item, sIndex)"
              />
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border-[1.5px] border-dashed border-line px-3.5 py-[0.4375rem] text-adm-sm font-semibold text-secondary-500 hover:border-secondary-400"
                @click="addSchedule(item)"
              >
                <HeroCore :path="mdiPlus" class="size-3.5" />
                Agregar horario
              </button>
            </div>
          </div>

          <div>
            <p class="mb-1.5 text-adm-sm font-semibold text-secondary-900">
              Enlace de videoconferencia
              <span class="font-normal text-secondary-400">
                · Opcional. Cada curso puede tener su propio link.
              </span>
            </p>
            <div class="flex gap-2">
              <InputTextCore
                class="flex-1"
                v-model="item.meetLink"
                placeholder="https://meet.google.com/…"
              />
              <ButtonCore
                v-if="index === 0 && model.length > 1"
                class="!w-auto shrink-0"
                severity="secondary"
                outlined
                label="Copiar a todos"
                :disabled="!item.meetLink"
                @click="copyLinkToAll(item)"
              />
            </div>
            <p
              v-if="index === 0 && linkNotice"
              class="mt-1 text-adm-sm text-secondary-500"
            >
              {{ linkNotice }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
