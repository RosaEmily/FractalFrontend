<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import {
  mdiLockOutline,
  mdiCertificateOutline,
  mdiBookOpenPageVariantOutline,
  mdiCalendarBlankOutline,
} from "@mdi/js";
import { AulaCard, AulaPill, AulaProgress } from "./ui";
import type { StudentCourse } from "../models/classroom.model";
import { formatDate, formatScore, formatTimeRange } from "../utils/format";

const props = defineProps<{
  course: StudentCourse;
  /** Ítem del menú desde el que se entra, para marcar el activo en el detalle. */
  from?: string;
}>();

const router = useRouter();

const locked = computed(() => props.course.progressStatus === "locked");

const icon = computed(() => {
  if (props.course.certificate) return mdiCertificateOutline;
  if (locked.value) return mdiLockOutline;
  return mdiBookOpenPageVariantOutline;
});

/** Qué contar en la columna derecha según dónde está el curso. */
const timing = computed(() => {
  const next = props.course.nextSession;
  if (next) {
    return {
      label: "Próxima clase",
      value: `${formatDate(next.date)} · ${formatTimeRange(next.startTime, next.endTime)}`,
    };
  }
  if (locked.value) {
    return { label: "Se abre", value: formatDate(props.course.startDate) };
  }
  return { label: "Cierra", value: formatDate(props.course.endDate) };
});

const open = () => {
  if (locked.value) return;
  router.push({
    name: "classroom-course",
    params: { id: props.course.id },
    query: props.from ? { from: props.from } : undefined,
  });
};
</script>

<template>
  <AulaCard :hover="!locked" :class="locked ? 'opacity-70' : ''" @click="open">
    <div class="flex items-start gap-3.5">
      <span
        class="size-9 shrink-0 rounded-adm-sm inline-flex items-center justify-center"
        :class="
          course.certificate
            ? 'bg-success-soft text-success-DEFAULT'
            : locked
              ? 'bg-surface-soft text-secondary-400'
              : 'bg-accent-soft text-primary-500'
        "
      >
        <HeroCore :path="icon" class="size-4" />
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p
              class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight truncate"
            >
              {{ course.courseName }}
            </p>
            <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
              {{ course.teacherName ?? "Docente por asignar" }} ·
              {{ course.offerName }}
            </p>
          </div>
          <AulaPill :tone="course.stateTone as never" size="sm">
            {{ course.stateLabel }}
          </AulaPill>
        </div>

        <!-- Dos barras: avance de clases y peso ya evaluado -->
        <div v-if="course.sessionsTotal > 0" class="mt-3.5 space-y-1.5">
          <AulaProgress :value="course.sessionsPercent" />
          <AulaProgress :value="course.weightPercent" tone="info" />
          <p class="font-mono text-adm-xs text-secondary-400">
            {{ course.sessionsDone }}/{{ course.sessionsTotal }} clases ·
            {{ course.evaluatedWeight }}% evaluado
            <template v-if="course.equivalentScore !== null">
              · nota {{ formatScore(course.equivalentScore) }}
            </template>
          </p>
        </div>
        <p v-else class="font-mono text-adm-xs text-amber-DEFAULT mt-3.5">
          SIN CLASES GENERADAS
        </p>

        <div
          class="flex items-center gap-1.5 mt-3 pt-3 border-t border-line-soft text-adm-sm text-secondary-500"
        >
          <HeroCore :path="mdiCalendarBlankOutline" class="size-3.5" />
          <span class="font-mono text-adm-xs uppercase tracking-[0.06em]">
            {{ timing.label }}
          </span>
          <span class="text-secondary-900">{{ timing.value }}</span>
        </div>
      </div>
    </div>
  </AulaCard>
</template>
