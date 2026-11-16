<script setup lang="ts">
/**
 * Resumen del alta de programa (columna oscura del diseño): lo que se va a
 * crear, antes de guardar. El mini calendario ubica cada curso en el tiempo
 * y lo tiñe de ámbar si su tarjeta tiene avisos.
 */
import { computed } from "vue";
import { ButtonCore, HeroCore } from "@/shared/components";
import { mdiAlertOutline } from "@mdi/js";
import type { OfferCourseItem } from "../models/offer.model";
import {
  courseWarnings,
  dayLabel,
  estimateClasses,
  firstClassDay,
  lastClassDay,
  parseDay,
  scheduleDuration,
  weeklyMinutes,
  weeksSpan,
} from "../utils/offer-form";

const props = defineProps<{
  name: string;
  items: OfferCourseItem[];
  minStudents: number | null;
  maxStudents: number | null;
  price: number | null;
  /** Símbolo de la moneda (S/, $); el código ISO solo si no tiene símbolo. */
  currencySymbol: string;
  enrollmentStart: string | null;
  enrollmentEnd: string | null;
  loading: boolean;
  /** Problemas que impiden guardar (tras intentar crear). */
  problems: string[];
  /** Texto del botón: el alta y la edición comparten el resumen. */
  submitLabel?: string;
}>();

defineEmits<{ submit: [] }>();

const DAY_SHORT: Record<string, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

const DAY_MS = 86_400_000;

const span = computed(() => {
  const first = parseDay(firstClassDay(props.items));
  const last = parseDay(lastClassDay(props.items));
  return first && last ? { first, last, days: Math.max(1, (last.getTime() - first.getTime()) / DAY_MS) } : null;
});

const weeks = computed(() => weeksSpan(firstClassDay(props.items), lastClassDay(props.items)));

const rows = computed(() =>
  props.items.map((item, index) => {
    const start = parseDay(item.startDate);
    const end = parseDay(item.endDate);
    const s = span.value;
    const left = s && start ? ((start.getTime() - s.first.getTime()) / DAY_MS / s.days) * 100 : 0;
    const width =
      s && start && end ? Math.max(4, ((end.getTime() - start.getTime()) / DAY_MS / s.days) * 100) : 0;
    return {
      name: item.name,
      weeks: weeksSpan(item.startDate, item.endDate),
      left,
      width,
      start: dayLabel(item.startDate),
      schedule: item.schedules.length
        ? item.schedules
            .map((sch) => `${DAY_SHORT[sch.dayOfWeek] ?? "—"} ${sch.startTime.slice(0, 5)}–${sch.endTime.slice(0, 5)}`)
            .join(" · ")
        : "sin horario",
      conflict: courseWarnings(item, props.items[index - 1]).length > 0,
    };
  }),
);

const classes = computed(() => props.items.reduce((sum, item) => sum + estimateClasses(item), 0));

/* Horas por semana del primer curso, como el diseño (en una línea los cursos no se superponen). */
const weeklyHours = computed(() => {
  const first = props.items[0];
  if (!first) return null;
  const minutes = weeklyMinutes(first) || first.schedules.reduce((s, sch) => s + (scheduleDuration(sch) ?? 0), 0);
  return minutes ? `${Math.round((minutes / 60) * 10) / 10} h` : null;
});

const priceLabel = computed(() =>
  props.price !== null && props.price !== undefined
    ? `${props.currencySymbol} ${Number(props.price).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—",
);

const classesRange = computed(() =>
  span.value ? `${dayLabel(firstClassDay(props.items))} – ${dayLabel(lastClassDay(props.items))}` : "—",
);
</script>

<template>
  <aside class="flex flex-col gap-4 rounded-adm-lg bg-secondary-900 p-[1.375rem] text-white">
    <p class="font-mono text-[0.656rem] uppercase tracking-[0.08em] text-white/55">Resumen</p>
    <p class="text-[0.938rem] font-bold">{{ name || "—" }}</p>

    <!-- Mini calendario: un carril por curso. -->
    <div v-if="span" class="flex flex-col gap-3">
      <div v-for="(row, index) in rows" :key="index">
        <div class="mb-1 flex items-baseline justify-between gap-2">
          <span class="truncate text-xs font-bold" :title="row.name">{{ row.name }}</span>
          <span v-if="row.weeks" class="shrink-0 font-mono text-[0.594rem] text-white/55">{{ row.weeks }} sem.</span>
        </div>
        <div class="relative h-2 rounded-full bg-white/10">
          <div
            class="absolute h-full rounded-full"
            :class="row.conflict ? 'bg-amber-DEFAULT' : 'bg-primary-500'"
            :style="{ left: `${row.left}%`, width: `${row.width}%` }"
          />
        </div>
        <div class="mt-1 flex flex-col gap-px font-mono text-[0.563rem] text-white/50">
          <span>Inicia {{ row.start }}</span>
          <span class="break-words">{{ row.schedule }}</span>
          <span v-if="row.conflict" class="mt-0.5 flex items-center gap-1 font-body text-[0.656rem] font-semibold text-amber-DEFAULT">
            <HeroCore :path="mdiAlertOutline" class="size-3" />
            Horario con conflicto
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2.5">
      <div class="summary-stat">
        <p class="summary-stat__label">Clases estimadas</p>
        <p class="summary-stat__value">{{ classes || "—" }}</p>
      </div>
      <div class="summary-stat">
        <p class="summary-stat__label">Duración total</p>
        <p class="summary-stat__value">{{ weeks ? `${weeks} sem.` : "—" }}</p>
      </div>
      <div class="summary-stat">
        <p class="summary-stat__label">Horas / semana</p>
        <p class="summary-stat__value">{{ weeklyHours ?? "—" }}</p>
      </div>
      <div class="summary-stat">
        <p class="summary-stat__label">Cupo</p>
        <p class="summary-stat__value">{{ minStudents ?? "—" }}–{{ maxStudents ?? "—" }}</p>
      </div>
    </div>

    <div class="h-px bg-white/15" />

    <dl class="flex flex-col gap-1.5 text-[0.781rem]">
      <div class="flex justify-between gap-2.5">
        <dt class="text-white/60">Matrícula</dt>
        <dd class="text-right font-semibold">
          {{ enrollmentStart ? `${dayLabel(enrollmentStart)} – ${dayLabel(enrollmentEnd)}` : "—" }}
        </dd>
      </div>
      <div class="flex justify-between gap-2.5">
        <dt class="text-white/60">Clases</dt>
        <dd class="text-right font-semibold">{{ classesRange }}</dd>
      </div>
      <div class="flex justify-between gap-2.5">
        <dt class="text-white/60">Precio</dt>
        <dd class="text-right font-semibold">{{ priceLabel }}</dd>
      </div>
    </dl>

    <ul v-if="problems.length" class="flex flex-col gap-1 rounded-adm-sm bg-white/10 px-3 py-2.5 text-[0.719rem] text-amber-DEFAULT">
      <li v-for="problem in problems" :key="problem">{{ problem }}</li>
    </ul>

    <ButtonCore
      class="mt-1"
      rounded
      :label="submitLabel ?? 'Crear programa'"
      :loading="loading"
      @click="$emit('submit')"
    />
  </aside>
</template>

<style scoped>
.summary-stat {
  border-radius: var(--radius-adm-sm);
  background: rgb(255 255 255 / 0.06);
  padding: 0.625rem 0.75rem;
}
.summary-stat__label {
  font-family: var(--font-mono);
  font-size: 0.563rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.55;
}
.summary-stat__value {
  margin-top: 0.1875rem;
  font-size: 0.938rem;
  font-weight: 700;
}
</style>
