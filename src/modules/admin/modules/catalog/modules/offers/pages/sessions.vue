<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import TableSkeleton from "@/modules/admin/components/ui/table-skeleton.vue";
import { mdiArrowLeft } from "@mdi/js";
import { safeRequest } from "@/shared/utils/request";
import { DAY_OF_WEEK_OPTIONS } from "../constants/offer.constant";
import classSessionService from "@/modules/admin/modules/enrollments/modules/class-sessions/services/class-session.service";
import type { ClassSession } from "@/modules/admin/modules/enrollments/modules/class-sessions/models/class-session.model";
import offerService from "../services/offer.service";
import type { Offer, OfferCourseItem } from "../models/offer.model";

/**
 * Sesiones del programa, agrupadas POR CURSO.
 *
 * Es el destino del ojo del listado ("Ver sesiones generadas"). No es una tabla
 * plana de clases: el diseño (`admin/clases.jsx:231` → `AdmProgramaSesiones`)
 * agrupa por curso porque la pregunta que responde la pantalla es "¿qué cursos
 * de este programa ya tienen clases y cuáles no?".
 *
 * Por eso un curso SIN sesiones no desaparece: se muestra con su aviso propio,
 * que es justo el dato que se viene a buscar.
 */
const route = useRoute();
const router = useRouter();

const offerId = Number(route.params.id);
const offer = ref<Offer | null>(null);
const sessions = ref<ClassSession[]>([]);
const loading = ref(true);

/** Sesiones de cada curso, en el orden en que el programa los declara. */
const groups = computed(() =>
  (offer.value?.courseItems ?? []).map((course) => {
    const own = sessions.value
      .filter((s) => s.offerCourseId === course.id)
      .sort((a, b) => (a.sessionDate ?? "").localeCompare(b.sessionDate ?? ""));

    return {
      course,
      sessions: own,
      // `status === 1` es dictada; lo demás sigue pendiente.
      done: own.filter((s) => s.status === 1).length,
    };
  }),
);

/** "Martes · 7:00 PM–9:00 PM · Jueves · …" — el horario semanal del curso. */
const scheduleText = (course: OfferCourseItem): string =>
  course.schedules
    .map((s) => {
      const day =
        DAY_OF_WEEK_OPTIONS.find((d) => d.value === s.dayOfWeek)?.label ??
        s.dayOfWeek;

      return `${day} · ${(s.startTime ?? "").slice(0, 5)}–${(s.endTime ?? "").slice(0, 5)}`;
    })
    .join(" · ");

onMounted(async () => {
  const [{ data: detail }, { data: list }] = await Promise.all([
    safeRequest(() => offerService.edit(offerId), { showAlert: false }),
    safeRequest(
      () => classSessionService.list({ offer_id: offerId, take: 200 }),
      { showAlert: false },
    ),
  ]);

  offer.value = (detail as Offer | null) ?? null;
  sessions.value = (list?.items ?? []) as ClassSession[];
  loading.value = false;
});
</script>

<template>
  <div>
    <!--
      Enlace, no `ButtonCore`: con el texto en el slot por defecto PrimeVue no
      reserva ancho (lo calcula del `label`) y la etiqueta salía CORTADA. Y una
      vuelta atrás es navegación, no una acción.
    -->
    <button
      type="button"
      class="inline-flex items-center gap-2 mb-4 cursor-pointer text-adm-base font-semibold text-primary-600 hover:text-primary-500"
      @click="router.push({ name: 'offers.list' })"
    >
      <HeroCore :path="mdiArrowLeft" class="size-4 shrink-0" />
      Volver a programas
    </button>

    <div
      class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden shadow-sm"
    >
      <div class="px-7 py-5 border-b border-line-soft">
        <p
          class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
        >
          Sesiones del programa
        </p>
        <h2
          class="font-display text-[1.375rem] font-bold text-secondary-900 tracking-[-0.015em] mt-2"
        >
          {{ offer?.name ?? "—" }}
        </h2>
      </div>

      <div class="p-6 flex flex-col gap-3.5">
        <TableSkeleton
          v-if="loading"
          :columns="['Clase', 'Fecha', 'Hora', 'Tema', 'Estado']"
          :rows="4"
        />

        <div
          v-for="group in groups"
          v-else
          :key="group.course.id ?? group.course.name"
          class="border-[1.5px] border-line rounded-adm-sm overflow-hidden"
        >
          <!-- Cabecera del curso: quién lo dicta, cuándo y su avance. -->
          <div
            class="flex items-center gap-3.5 flex-wrap px-4 py-3 bg-admin-bg border-b border-line"
          >
            <span class="text-adm-base font-bold text-secondary-900">
              {{ group.course.name }}
            </span>
            <span class="text-adm-sm text-secondary-500">
              {{ group.course.teacherName ?? "—" }}
            </span>
            <span class="font-mono text-adm-xs text-secondary-400">
              {{ scheduleText(group.course) }}
            </span>
            <span
              class="ml-auto font-mono text-adm-xs font-bold"
              :class="
                group.sessions.length && group.done === group.sessions.length
                  ? 'text-success-DEFAULT'
                  : 'text-secondary-400'
              "
            >
              {{ group.done }}/{{ group.sessions.length }} dictadas
            </span>
          </div>

          <!--
            Un curso sin clases NO se oculta: saber cuáles faltan por generar es
            el motivo de entrar acá.
          -->
          <p
            v-if="!group.sessions.length"
            class="px-3.5 py-4 text-center text-adm-sm text-secondary-400"
          >
            Aún no se generaron sesiones para este curso.
          </p>

          <div
            v-for="(session, index) in group.sessions"
            v-else
            :key="session.id"
            class="grid grid-cols-[5.625rem_5.625rem_8.125rem_1.5fr_6.875rem] gap-2.5 items-center px-4 py-2.5"
            :class="
              index === group.sessions.length - 1
                ? ''
                : 'border-b border-line-soft'
            "
          >
            <span class="font-mono text-adm-xs text-secondary-500">
              {{ session.name }}
            </span>
            <span class="font-mono text-adm-xs text-secondary-500">
              {{ session.sessionDate }}
            </span>
            <span class="font-mono text-adm-xs text-secondary-400">
              {{ (session.startTime ?? "").slice(0, 5) }}–{{
                (session.endTime ?? "").slice(0, 5)
              }}
            </span>
            <span class="text-adm-sm text-secondary-500 truncate">
              {{ session.topic ?? "—" }}
            </span>
            <StatusPill
              :label="session.status === 1 ? 'Completada' : 'Pendiente'"
              :tone="session.status === 1 ? 'success' : 'warning'"
              :dot="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
