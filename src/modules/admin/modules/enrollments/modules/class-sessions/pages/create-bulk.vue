<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { mdiClose } from "@mdi/js";

import { SelectCore, InputTextCore, HeroCore } from "@/shared/components";
import BulkFormShell from "@/modules/admin/components/ui/bulk-form-shell.vue";
import BulkCourseCard from "@/modules/admin/components/ui/bulk-course-card.vue";
import ModeToggle from "@/modules/admin/components/ui/mode-toggle.vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";
import type { Offer } from "@/modules/admin/modules/catalog/modules/offers/models/offer.model";
import classSessionService from "../services/class-session.service";
import { nextDateForDay } from "../utils/class-session-form";

/**
 * Alta MASIVA de clases: se elige un programa y se genera una clase por cada
 * uno de sus cursos, con el horario y la próxima fecha ya derivados.
 *
 * ⚠️ Usa `bulkStore` (`actions/bulk-store`), que SOLO AGREGA. El endpoint
 * parecido `offers/actions/sessions/{offer}` sincroniza: borra las clases del
 * horario que no vengan en el payload. Acá se mandan solo las tarjetas
 * visibles, así que sincronizar borraría clases existentes con su asistencia.
 */
interface BulkRow {
  scheduleId: number;
  courseName: string;
  /** Texto del horario, solo informativo. */
  scheduleLabel: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
  name: string;
  topic: string;
  meetLink: string;
}

/** El modo lo controla la página `create`: acá solo se emite para volver. */
const mode = defineModel<string>("mode", { required: true });

const MODE_OPTIONS = [
  { value: "individual", label: "Una clase" },
  { value: "bulk", label: "Generar varias" },
];

const router = useRouter();
const toastStore = useToastStore();

const offerId = ref<number | null>(null);
const rows = ref<BulkRow[]>([]);
const loadingCourses = ref(false);
const saving = ref(false);

/*
 * ⚠️ La exclusión es PERSISTENTE, como en el diseño: quitar una tarjeta excluye
 * ese curso, y volver a elegir el mismo programa repone solo las que faltan,
 * nunca las que ya se quitaron a mano. Vive fuera de `rows` justamente para
 * sobrevivir a que la fila se borre.
 */
const excluded = ref<Record<number, Set<number>>>({});

const loadOffers = async (): Promise<Offer[]> =>
  await offerService.all({ status: 1 });

const onOfferChange = async () => {
  if (!offerId.value) {
    rows.value = [];
    return;
  }

  loadingCourses.value = true;
  const { data } = await safeRequest(
    () => offerService.edit(offerId.value as number),
    { showAlert: false },
  );
  loadingCourses.value = false;

  const excludedHere = excluded.value[offerId.value] ?? new Set<number>();
  const already = new Set(rows.value.map((r) => r.scheduleId));

  const nuevas: BulkRow[] = [];
  for (const item of data?.courseItems ?? []) {
    // Una clase cuelga del HORARIO, no del curso: un curso con dos horarios
    // (lunes y miércoles) genera una tarjeta por cada uno.
    for (const schedule of item.schedules ?? []) {
      const scheduleId = schedule.id;
      if (!scheduleId) continue;
      if (already.has(scheduleId) || excludedHere.has(scheduleId)) continue;

      nuevas.push({
        scheduleId,
        courseName: item.name,
        scheduleLabel: `${schedule.dayOfWeek} ${schedule.startTime}–${schedule.endTime}`,
        sessionDate: nextDateForDay(schedule.dayOfWeek),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        name: "Sesión 1",
        topic: "",
        meetLink: item.meetLink ?? "",
      });
    }
  }

  rows.value = [...rows.value, ...nuevas];
};

const removeRow = (scheduleId: number) => {
  if (!offerId.value) return;
  if (!excluded.value[offerId.value]) {
    excluded.value[offerId.value] = new Set<number>();
  }
  excluded.value[offerId.value]?.add(scheduleId);
  rows.value = rows.value.filter((r) => r.scheduleId !== scheduleId);
};

const submitLabel = computed(() => {
  const n = rows.value.length;
  return n ? `Crear ${n} clase${n === 1 ? "" : "s"}` : "Crear clases";
});

const onSubmit = async () => {
  if (!rows.value.length) return;

  saving.value = true;
  const { data, error } = await safeRequest(() =>
    classSessionService.bulkStore({
      sessions: rows.value.map((r) => ({
        schedule_id: r.scheduleId,
        session_date: r.sessionDate,
        start_time: r.startTime,
        end_time: r.endTime,
        name: r.name,
        topic: r.topic || null,
        meet_link: r.meetLink || null,
      })),
    }),
  );
  saving.value = false;

  if (error || !data) return;

  /*
   * El servidor responde 200 aunque omita filas (una clase que ya existe no
   * aborta el lote). Hay que avisar de lo omitido: si no, el usuario cree que
   * se crearon todas.
   */
  if (data.skipped.length) {
    toastStore.showToastError({
      summary: "Algunas clases no se crearon",
      detail: `${data.created} creada(s). ${data.skipped.length} ya existía(n) para ese horario y fecha.`,
    });
  } else {
    toastStore.showToastSuccess({
      summary: "Clases creadas",
      detail: `Se crearon ${data.created} clase(s) correctamente.`,
    });
  }

  router.replace({ name: "classSessions.list" });
};
</script>

<template>
  <BulkFormShell
    title="Generar varias clases"
    :submit-label="submitLabel"
    redirect="classSessions.list"
    :loading="saving"
    :disabled="!rows.length"
    @submit="onSubmit"
  >
    <ModeToggle v-model="mode" :options="MODE_OPTIONS" />

    <SelectCore
      v-model="offerId"
      label="Programa"
      required
      hint-label="Se listan todos sus cursos abajo, uno por horario."
      filter
      option-label="name"
      option-value="id"
      placeholder="Selecciona un programa"
      :service="loadOffers"
      auto-load
      @update:model-value="onOfferChange"
    />

    <!--
      Orden del diseño: guard → carga → vacío → datos. Nunca se muestra "no hay
      nada" mientras todavía está cargando.
    -->
    <p v-if="loadingCourses" class="text-sm text-secondary-400">
      Cargando los cursos del programa…
    </p>

    <div
      v-else-if="offerId && !rows.length"
      class="rounded-adm-sm border-[1.5px] border-dashed border-control-border px-3.5 py-5 text-center text-sm text-secondary-400"
    >
      Ya agregaste todos los horarios de este programa. Vuelve a elegirlo
      después de guardar para traer los que falten.
    </div>

    <div v-else-if="rows.length" class="flex flex-col gap-2.5">
      <BulkCourseCard
        v-for="row in rows"
        :key="row.scheduleId"
        :title="row.courseName"
        :meta="`${row.scheduleLabel} · ${row.sessionDate}`"
      >
        <template #action>
          <button
            type="button"
            class="adm-icon-btn inline-flex size-7 items-center justify-center rounded-adm-sm text-secondary-500"
            title="Quitar este horario"
            @click="removeRow(row.scheduleId)"
          >
            <HeroCore :path="mdiClose" size="16" />
          </button>
        </template>

        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1.4fr_1.4fr]">
          <InputTextCore v-model="row.name" placeholder="Sesión 1" />
          <InputTextCore v-model="row.topic" placeholder="Tema de la clase" />
          <InputTextCore
            v-model="row.meetLink"
            placeholder="Enlace (Meet/Zoom)"
          />
        </div>
      </BulkCourseCard>
    </div>
  </BulkFormShell>
</template>
