<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import coordinatorService from "../../services/coordinator.service";
import type { ClassTodayDTO } from "../../dto/coordinator.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
} from "../../components/ui";
import { formatTimeRange } from "../../utils/format";

const classes = ref<ClassTodayDTO[]>([]);
const loading = ref(true);

const teacherName = (item: ClassTodayDTO) =>
  [item.teacher_first_name, item.teacher_last_name].filter(Boolean).join(" ") ||
  "Sin docente asignado";

/**
 * Carga docente del día, derivada de las clases: cuántas dicta cada uno y en
 * qué cursos. El directorio completo de docentes vive en el panel.
 */
const load = computed(() => {
  const map = new Map<string, { name: string; sessions: ClassTodayDTO[] }>();

  classes.value.forEach((item) => {
    const name = teacherName(item);
    const entry = map.get(name) ?? { name, sessions: [] };
    entry.sessions.push(item);
    map.set(name, entry);
  });

  return [...map.values()].sort((a, b) => b.sessions.length - a.sessions.length);
});

onMounted(async () => {
  const { data } = await safeRequest(() => coordinatorService.classesToday());
  classes.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="DOCENTES"
      title="Docentes"
      sub="Quién dicta hoy y en qué cursos."
    />

    <AulaSkeleton v-if="loading" kind="table" :rows="4" />

    <template v-else>
      <AulaCard v-if="load.length" pad="sm">
        <div
          v-for="entry in load"
          :key="entry.name"
          class="px-2 py-3 border-b border-line-soft last:border-0"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="font-display text-adm-base font-bold text-secondary-900">
              {{ entry.name }}
            </p>
            <span class="font-mono text-adm-xs text-secondary-400 uppercase">
              {{ entry.sessions.length }}
              {{ entry.sessions.length === 1 ? "clase" : "clases" }}
            </span>
          </div>
          <p
            v-for="session in entry.sessions"
            :key="session.id"
            class="text-adm-sm text-secondary-500 mt-1"
          >
            {{ session.course_name }} ·
            {{ formatTimeRange(session.start_time, session.end_time) }}
          </p>
        </div>
      </AulaCard>

      <AulaEmpty
        v-else
        title="No hay clases hoy"
        sub="Ningún docente tiene clases programadas para el día de hoy."
      />

      <AulaNotice tone="info" class="mt-4">
        El directorio completo de docentes, con su especialidad y sus cursos
        asignados, se administra desde el panel.
      </AulaNotice>
    </template>
  </div>
</template>
