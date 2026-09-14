<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { FilterMatchMode } from "@primevue/core/api";

import { SelectCore, DatePicketCore } from "@/shared/components";
import BulkFormShell from "@/modules/admin/components/ui/bulk-form-shell.vue";
import BulkCourseCard from "@/modules/admin/components/ui/bulk-course-card.vue";
import ModeToggle from "@/modules/admin/components/ui/mode-toggle.vue";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";
import type { Offer } from "@/modules/admin/modules/catalog/modules/offers/models/offer.model";
import finalGradeService from "@/modules/admin/modules/evaluations/modules/final-grades/services/final-grade.service";
import templateService from "../../templates/services/template.service";
import certificateService from "../services/certificate.service";

/**
 * Emisión MASIVA de certificados: se elige una cohorte y se listan todos sus
 * cursos, cada uno con SU plantilla y SU fecha de emisión.
 *
 * Plantilla y fecha son por curso, no globales: un curso puede certificarse
 * "con Mención" y otro con la estándar, y las fechas de cierre no coinciden.
 *
 * Solo se listan alumnos con nota final APROBATORIA. El servidor lo revalida:
 * este filtro es comodidad, no la regla.
 */
interface StudentRow {
  enrollmentCourseId: number;
  studentName: string;
  score: number | null;
  include: boolean;
}

interface CourseCard {
  courseName: string;
  templateId: number | null;
  issuedDate: string | null;
  students: StudentRow[];
}

const mode = defineModel<string>("mode", { required: true });

const MODE_OPTIONS = [
  { value: "individual", label: "Un estudiante" },
  { value: "bulk", label: "Varios estudiantes" },
];

const router = useRouter();
const toastStore = useToastStore();

const offerId = ref<number | null>(null);
const offerName = ref<string>("");
const cards = ref<CourseCard[]>([]);
const loading = ref(false);
const saving = ref(false);

const loadOffers = async (): Promise<Offer[]> =>
  await offerService.all({ status: 1 });

const loadTemplates = () => templateService.all({ status: 1 });

const onOfferChange = async () => {
  cards.value = [];
  if (!offerId.value) return;

  loading.value = true;
  const [offerRes, gradesRes] = await Promise.all([
    safeRequest(() => offerService.edit(offerId.value as number), {
      showAlert: false,
    }),
    // Las notas finales aprobadas de toda la cohorte, en una sola petición.
    safeRequest(
      () =>
        finalGradeService.all({
          filters: {
            approved: { value: 1, matchMode: FilterMatchMode.EQUALS },
            status: { value: 1, matchMode: FilterMatchMode.EQUALS },
          },
        }),
      { showAlert: false },
    ),
  ]);
  loading.value = false;

  offerName.value = offerRes.data?.name ?? "";
  const grades = gradesRes.data ?? [];

  cards.value = (offerRes.data?.courseItems ?? []).map((item) => ({
    courseName: item.name,
    templateId: null,
    issuedDate: null,
    /*
     * `final_grades` no expone `offer_course_id`, así que el cruce se hace por
     * nombre de curso + nombre del programa, que es lo que el Resource sí
     * resuelve. Si algún día expone el id, cambiar por él.
     */
    students: grades
      .filter(
        (g) =>
          g.courseName === item.name && g.offerName === offerRes.data?.name,
      )
      .map((g) => ({
        enrollmentCourseId: g.enrollmentCourseId,
        studentName: g.studentName ?? "—",
        score: g.finalScore,
        include: true,
      })),
  }));
};

const selectedOf = (card: CourseCard) => card.students.filter((s) => s.include);

const total = computed(() =>
  cards.value.reduce((acc, card) => acc + selectedOf(card).length, 0),
);

const submitLabel = computed(() =>
  total.value
    ? `Emitir ${total.value} certificado${total.value === 1 ? "" : "s"}`
    : "Emitir certificados",
);

const onSubmit = async () => {
  if (!total.value) return;

  // La plantilla es obligatoria por curso: sin ella el certificado no se puede
  // componer, y la API rechazaría el lote entero.
  const missing = cards.value
    .filter((c) => selectedOf(c).length && !c.templateId)
    .map((c) => c.courseName);

  if (missing.length) {
    toastStore.showToastError({
      summary: "Falta la plantilla",
      detail: `Elige una plantilla en: ${missing.join(" · ")}`,
    });
    return;
  }

  const body = {
    items: cards.value
      .filter((card) => selectedOf(card).length)
      .map((card) => ({
        certificate_template_id: card.templateId as number,
        issued_date: card.issuedDate,
        enrollment_course_ids: selectedOf(card).map(
          (s) => s.enrollmentCourseId,
        ),
      })),
  };

  saving.value = true;
  const { data, error } = await safeRequest(() =>
    certificateService.bulkIssue(body),
  );
  saving.value = false;

  if (error || !data) return;

  /*
   * El servidor omite a quien ya tiene certificado o no aprobó, y responde 200
   * igual. Hay que decirlo: si no, el usuario cree que se emitieron todos.
   */
  if (data.skipped.length) {
    toastStore.showToastError({
      summary: "Algunos certificados no se emitieron",
      detail: `${data.issued} emitido(s). ${data.skipped.length} omitido(s) por estar ya certificados o sin nota aprobatoria.`,
    });
  } else {
    toastStore.showToastSuccess({
      summary: "Certificados emitidos",
      detail: `Se emitieron ${data.issued} certificado(s).`,
    });
  }

  router.replace({ name: "certificates.list" });
};
</script>

<template>
  <BulkFormShell
    title="Emitir certificados a varios estudiantes"
    :submit-label="submitLabel"
    redirect="certificates.list"
    :loading="saving"
    :disabled="!total"
    @submit="onSubmit"
  >
    <ModeToggle v-model="mode" :options="MODE_OPTIONS" />

    <SelectCore
      v-model="offerId"
      label="Programa (cohorte)"
      required
      hint-label="Cada curso lleva su propia plantilla y fecha de emisión."
      filter
      option-label="name"
      option-value="id"
      placeholder="Selecciona una cohorte"
      :service="loadOffers"
      auto-load
      @update:model-value="onOfferChange"
    />

    <p v-if="loading" class="text-sm text-secondary-400">
      Buscando estudiantes aprobados…
    </p>

    <div
      v-else-if="offerId && !cards.length"
      class="rounded-adm-sm border-[1.5px] border-dashed border-control-border px-3.5 py-5 text-center text-sm text-secondary-400"
    >
      Esta cohorte todavía no tiene cursos configurados.
    </div>

    <div v-else-if="cards.length" class="flex flex-col gap-3">
      <BulkCourseCard
        v-for="card in cards"
        :key="card.courseName"
        :title="card.courseName"
        :meta="`${card.students.length} aprobado${card.students.length === 1 ? '' : 's'}`"
      >
        <!--
          El texto del vacío depende del filtro: "ninguno aprobó todavía" dice
          algo distinto de "el curso no tiene alumnos".
        -->
        <p
          v-if="!card.students.length"
          class="py-2 text-center text-xs text-secondary-400"
        >
          Ningún estudiante tiene nota final aprobatoria todavía en este curso.
        </p>

        <div v-else class="flex flex-col gap-3">
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <SelectCore
              v-model="card.templateId"
              option-label="name"
              option-value="id"
              placeholder="Selecciona una plantilla"
              :service="loadTemplates"
              auto-load
            />
            <DatePicketCore
              v-model="card.issuedDate"
              dayjs-format-value="YYYY-MM-DD"
              placeholder="Fecha de emisión (hoy si se deja vacía)"
            />
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="student in card.students"
              :key="student.enrollmentCourseId"
              class="flex items-center gap-3.5 transition-opacity"
              :class="{ 'opacity-45': !student.include }"
            >
              <ToggleCheck
                :label="student.studentName"
                :on="student.include"
                class="flex-1"
                @toggle="student.include = $event"
              />
              <span
                class="font-display text-[0.938rem] font-bold text-secondary-900"
              >
                {{ student.score?.toFixed(1) ?? "—" }}
              </span>
              <StatusPill tone="success" label="Aprobado" />
            </div>
          </div>
        </div>
      </BulkCourseCard>
    </div>
  </BulkFormShell>
</template>
