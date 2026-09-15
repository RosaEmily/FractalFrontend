<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import studentService from "../../services/student.service";
import type { Session } from "../../models/classroom.model";
import {
  AulaCard,
  AulaEmpty,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
} from "../../components/ui";
import { WEEKDAY_LABEL, WEEKDAY_ORDER } from "../../constants/labels";
import {
  addDays,
  formatDate,
  formatMonth,
  formatTimeRange,
  minutesOf,
  mondayOf,
  toDay,
} from "../../utils/format";

const router = useRouter();

const sessions = ref<Session[]>([]);
const loading = ref(true);
const view = ref<"week" | "month" | "list">("week");

/** Rejilla horaria: de 8:00 a 22:00, 46px por hora. */
const HOUR_FROM = 8;
const HOUR_TO = 22;
const PX_PER_HOUR = 46;

const today = new Date().toISOString().slice(0, 10);
const weekStart = ref(mondayOf(today));
/** Mes visible en la vista Mes, como `YYYY-MM`. */
const monthRef = ref(today.slice(0, 7));

const weekDays = computed(() =>
  WEEKDAY_ORDER.map((key, index) => ({
    key,
    label: WEEKDAY_LABEL[key] ?? key,
    date: addDays(weekStart.value, index),
  })),
);

const hours = computed(() =>
  Array.from({ length: HOUR_TO - HOUR_FROM + 1 }, (_, i) => HOUR_FROM + i),
);

/** Clases de la semana visible, indexadas por día. */
const byDay = computed(() => {
  const map = new Map<string, Session[]>();
  const end = addDays(weekStart.value, 6);

  sessions.value
    .filter((s) => toDay(s.date) >= weekStart.value && toDay(s.date) <= end)
    .forEach((s) => {
      const key = toDay(s.date);
      map.set(key, [...(map.get(key) ?? []), s]);
    });

  return map;
});

/**
 * Posición del bloque en la rejilla. Una clase sin hora no se puede ubicar, así
 * que se omite del calendario: aparece igual en la vista de lista.
 */
const blockStyle = (session: Session) => {
  if (!session.startTime) return null;

  const start = minutesOf(session.startTime);
  const end = minutesOf(session.endTime ?? session.startTime);
  const duration = Math.max(end - start, 30);

  return {
    top: `${(start / 60 - HOUR_FROM) * PX_PER_HOUR}px`,
    height: `${(duration / 60) * PX_PER_HOUR}px`,
  };
};

/** Próximas clases agrupadas por mes, para la vista de lista. */
const upcoming = computed(() => {
  const groups = new Map<string, Session[]>();

  sessions.value
    .filter((s) => !s.isDone)
    .forEach((s) => {
      const key = formatMonth(s.date);
      groups.set(key, [...(groups.get(key) ?? []), s]);
    });

  return [...groups.entries()];
});

const shiftWeek = (weeks: number) => {
  weekStart.value = addDays(weekStart.value, weeks * 7);
};

/**
 * Rejilla del mes: 6 semanas completas desde el lunes de la primera.
 *
 * Se recortan las filas que quedan enteras fuera del mes — un mes que arranca
 * lunes ocupa 5 semanas, no 6, y dejar una fila vacía abajo descuadra la
 * tarjeta.
 */
const monthCells = computed(() => {
  const [year, month] = monthRef.value.split("-").map(Number);
  if (!year || !month) return [];

  const first = `${monthRef.value}-01`;
  const start = mondayOf(first);
  const all = Array.from({ length: 42 }, (_, i) => addDays(start, i));

  const firstOutside = all.findIndex((d) => d.slice(0, 7) > monthRef.value);
  const visible =
    firstOutside === -1 ? all : all.slice(0, Math.ceil(firstOutside / 7) * 7);

  return visible.map((date) => ({
    date,
    day: Number(date.slice(8)),
    outside: date.slice(0, 7) !== monthRef.value,
    isToday: date === today,
    sessions: sessions.value.filter((s) => toDay(s.date) === date),
  }));
});

const shiftMonth = (months: number) => {
  const [year, month] = monthRef.value.split("-").map(Number);
  if (!year || !month) return;

  const next = new Date(Date.UTC(year, month - 1 + months, 1));
  monthRef.value = next.toISOString().slice(0, 7);
};

/** Título del rango visible, según la vista. */
const rangeLabel = computed(() => {
  if (view.value === "week") {
    return `${formatDate(weekStart.value)} — ${formatDate(addDays(weekStart.value, 6), true)}`;
  }
  if (view.value === "month") {
    return formatMonth(`${monthRef.value}-01`);
  }
  return "";
});

const openSession = (session: Session) => {
  router.push({
    name: "classroom-session",
    params: { sessionId: session.id },
    query: { from: "classroom.agenda" },
  });
};

onMounted(async () => {
  const { data } = await safeRequest(() => studentService.agenda());
  sessions.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="CRONOGRAMA"
      title="Cronograma"
      sub="Tus clases en vivo, con el horario de cada curso."
    >
      <template #actions>
        <div class="flex gap-1">
          <button
            v-for="item in [
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mes' },
              { key: 'list', label: 'Lista' },
            ]"
            :key="item.key"
            type="button"
            class="px-3 py-1.5 rounded-adm-sm text-adm-sm cursor-pointer"
            :class="
              view === item.key
                ? 'bg-accent-soft text-primary-500 font-semibold'
                : 'text-secondary-500'
            "
            @click="view = item.key as never"
          >
            {{ item.label }}
          </button>
        </div>
      </template>
    </AulaPageHeader>

    <AulaSkeleton v-if="loading" kind="panel" />

    <template v-else-if="!sessions.length">
      <AulaEmpty
        title="Todavía no tienes clases"
        sub="Cuando coordinación genere las clases de tus cursos, las verás acá con su horario."
      />
    </template>

    <!-- ── Semana ──────────────────────────────────────────────────── -->
    <template v-else-if="view === 'week'">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="adm-icon-btn"
            aria-label="Semana anterior"
            @click="shiftWeek(-1)"
          >
            <HeroCore
              :path="mdiChevronLeft"
              class="size-4 text-secondary-500"
            />
          </button>
          <button
            type="button"
            class="adm-icon-btn"
            aria-label="Semana siguiente"
            @click="shiftWeek(1)"
          >
            <HeroCore
              :path="mdiChevronRight"
              class="size-4 text-secondary-500"
            />
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-adm-sm text-adm-sm text-secondary-500 cursor-pointer"
            @click="weekStart = mondayOf(today)"
          >
            Hoy
          </button>
        </div>
        <span class="font-mono text-adm-xs text-secondary-400 uppercase">
          {{ formatDate(weekStart) }} —
          {{ formatDate(addDays(weekStart, 6), true) }}
        </span>
      </div>

      <AulaCard pad="sm">
        <div class="overflow-x-auto">
          <div class="min-w-200">
            <!-- Cabecera de días -->
            <div
              class="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-line"
            >
              <div />
              <div
                v-for="day in weekDays"
                :key="day.key"
                class="px-2 py-2 text-center"
                :class="
                  day.date === today ? 'bg-accent-soft rounded-adm-sm' : ''
                "
              >
                <div
                  class="font-mono text-adm-xs uppercase tracking-[0.06em]"
                  :class="
                    day.date === today
                      ? 'text-primary-500'
                      : 'text-secondary-400'
                  "
                >
                  {{ day.label.slice(0, 3) }}
                </div>
                <div class="text-adm-sm text-secondary-900 mt-0.5">
                  {{ formatDate(day.date) }}
                </div>
              </div>
            </div>

            <!-- Rejilla horaria -->
            <div class="grid grid-cols-[3.5rem_repeat(7,1fr)]">
              <div>
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="font-mono text-adm-xs text-secondary-400 text-right pr-2"
                  :style="{ height: `${PX_PER_HOUR}px` }"
                >
                  {{ String(hour).padStart(2, "0") }}:00
                </div>
              </div>

              <div
                v-for="day in weekDays"
                :key="day.key"
                class="relative border-l border-line-soft"
                :style="{ height: `${hours.length * PX_PER_HOUR}px` }"
              >
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="border-t border-line-soft"
                  :style="{ height: `${PX_PER_HOUR}px` }"
                />

                <button
                  v-for="session in byDay.get(day.date) ?? []"
                  :key="session.id"
                  v-show="blockStyle(session)"
                  type="button"
                  class="absolute left-1 right-1 rounded-adm-sm px-1.5 py-1 text-left overflow-hidden cursor-pointer border"
                  :class="
                    session.isDone
                      ? 'bg-surface-soft border-line text-secondary-500'
                      : 'bg-accent-soft border-accent-tint text-primary-600'
                  "
                  :style="blockStyle(session) ?? undefined"
                  @click="openSession(session)"
                >
                  <span class="block font-mono text-adm-xs truncate">
                    {{ session.startTime }}
                  </span>
                  <span class="block text-adm-sm font-medium truncate">
                    {{ session.courseName }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </AulaCard>
    </template>

    <!-- ── Mes ─────────────────────────────────────────────────────── -->
    <template v-else-if="view === 'month'">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="adm-icon-btn"
            aria-label="Mes anterior"
            @click="shiftMonth(-1)"
          >
            <HeroCore
              :path="mdiChevronLeft"
              class="size-4 text-secondary-500"
            />
          </button>
          <button
            type="button"
            class="adm-icon-btn"
            aria-label="Mes siguiente"
            @click="shiftMonth(1)"
          >
            <HeroCore
              :path="mdiChevronRight"
              class="size-4 text-secondary-500"
            />
          </button>
        </div>
        <span class="text-adm-sm font-semibold text-secondary-900 capitalize">
          {{ rangeLabel }}
        </span>
      </div>

      <AulaCard class="overflow-hidden !p-0">
        <div class="grid grid-cols-7 border-b border-line bg-surface-cream">
          <div
            v-for="key in WEEKDAY_ORDER"
            :key="key"
            class="px-2 py-2.5 text-center font-mono text-[0.594rem] tracking-[0.06em] text-secondary-400"
          >
            {{ (WEEKDAY_LABEL[key] ?? key).slice(0, 3).toUpperCase() }}
          </div>
        </div>

        <div class="grid grid-cols-7">
          <!--
            Cada celda es un día. Las de otro mes se atenúan pero se dibujan:
            quitarlas rompería la rejilla de 7 columnas.
          -->
          <div
            v-for="cell in monthCells"
            :key="cell.date"
            class="flex min-h-[6.5rem] flex-col gap-1 border-l border-t border-line-soft p-1.5"
            :class="[
              cell.isToday
                ? 'bg-accent-soft/40'
                : cell.outside
                  ? 'bg-surface-cream'
                  : '',
              cell.outside ? 'opacity-50' : '',
            ]"
          >
            <span
              class="font-display text-adm-sm"
              :class="
                cell.isToday
                  ? 'font-extrabold text-primary-600'
                  : 'font-semibold text-secondary-500'
              "
            >
              {{ cell.day }}
            </span>

            <!--
              Solo 2 clases por celda: con más, la fila crece y descuadra el
              mes. El resto se cuenta abajo, como en el diseño.
            -->
            <button
              v-for="session in cell.sessions.slice(0, 2)"
              :key="session.id"
              type="button"
              class="truncate rounded-adm-sm bg-accent-soft px-1.5 py-1 text-left text-[0.688rem] font-semibold text-primary-600 cursor-pointer"
              :class="{ 'opacity-60': session.isDone }"
              :title="`${session.topic ?? session.name} · ${formatTimeRange(session.startTime, session.endTime)}`"
              @click="openSession(session)"
            >
              {{ session.topic ?? session.name }}
            </button>

            <span
              v-if="cell.sessions.length > 2"
              class="font-mono text-[0.594rem] text-secondary-400"
            >
              +{{ cell.sessions.length - 2 }} MÁS
            </span>
          </div>
        </div>
      </AulaCard>
    </template>

    <!-- ── Lista ───────────────────────────────────────────────────── -->
    <template v-else>
      <AulaEmpty
        v-if="!upcoming.length"
        title="No tienes clases próximas"
        sub="Todas tus clases ya fueron dictadas."
      />

      <div v-for="[month, list] in upcoming" :key="month" class="mb-5">
        <h2
          class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] mb-2"
        >
          {{ month }}
        </h2>
        <AulaCard pad="sm">
          <button
            v-for="session in list"
            :key="session.id"
            type="button"
            class="adm-row w-full flex items-center justify-between gap-4 px-2 py-2.5 border-b border-line-soft last:border-0 text-left cursor-pointer"
            @click="openSession(session)"
          >
            <div class="min-w-0">
              <p class="text-secondary-900 truncate">
                {{ session.name ?? "Sesión" }} · {{ session.topic ?? "—" }}
              </p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ session.courseName }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <div class="text-adm-sm text-secondary-900">
                {{ formatDate(session.date, true) }}
              </div>
              <div class="font-mono text-adm-xs text-secondary-400">
                {{ formatTimeRange(session.startTime, session.endTime) }}
              </div>
            </div>
            <AulaPill
              v-if="toDay(session.date) === today"
              tone="danger"
              size="sm"
            >
              Hoy
            </AulaPill>
          </button>
        </AulaCard>
      </div>
    </template>
  </div>
</template>
