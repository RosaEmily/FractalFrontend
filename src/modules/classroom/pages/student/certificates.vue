<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiCertificateOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
} from "@mdi/js";
import studentService from "../../services/student.service";
import type {
  StudentCertificate,
  StudentCourse,
} from "../../models/classroom.model";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
  AulaStat,
} from "../../components/ui";
import { formatDate, formatScore } from "../../utils/format";

const router = useRouter();

const certificates = ref<StudentCertificate[]>([]);
const courses = ref<StudentCourse[]>([]);
const loading = ref(true);

const approved = computed(
  () => courses.value.filter((c) => c.finalGrade?.approved).length,
);

/** Aprobado pero sin certificado emitido: está en cola de emisión. */
const pending = computed(() =>
  courses.value.filter((c) => c.finalGrade?.approved && !c.certificate),
);

/** Promedio de los cursos cerrados. Null si ninguno tiene nota final. */
const average = computed(() => {
  const scores = courses.value
    .map((c) => c.finalGrade?.score)
    .filter((s): s is number => s !== null && s !== undefined);

  if (!scores.length) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
});

onMounted(async () => {
  const [certs, list] = await Promise.all([
    safeRequest(() => studentService.certificates()),
    safeRequest(() => studentService.courses()),
  ]);

  certificates.value = certs.data ?? [];
  courses.value = list.data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="CERTIFICADOS"
      title="Certificados"
      sub="Cada curso aprobado genera su certificado con código verificable. Las líneas de carrera entregan además un diploma al completarse."
    />

    <AulaSkeleton v-if="loading" kind="cards" :cards="3" />

    <template v-else>
      <div class="grid gap-3.5 sm:grid-cols-3 mb-5">
        <AulaStat
          label="Certificados emitidos"
          :value="certificates.length || '—'"
          :icon="mdiCertificateOutline"
          tone="warning"
        />
        <AulaStat
          label="Cursos aprobados"
          :value="approved || '—'"
          :icon="mdiCheckCircleOutline"
          tone="success"
        />
        <AulaStat
          label="Promedio general"
          :value="formatScore(average)"
          :delta="average === null ? 'Sin cursos cerrados' : 'de tus notas finales'"
          tone="info"
        />
      </div>

      <AulaNotice v-if="pending.length" tone="info" class="mb-5">
        {{ pending.length }}
        {{ pending.length === 1 ? "curso aprobado está" : "cursos aprobados están" }}
        en cola de emisión. El certificado aparece acá cuando coordinación lo
        emite.
      </AulaNotice>

      <template v-if="certificates.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mb-3"
        >
          Mis certificados
        </h2>
        <div class="grid gap-3.5 xl:grid-cols-2">
          <AulaCard v-for="certificate in certificates" :key="certificate.id">
            <div class="flex items-start gap-3.5">
              <span
                class="size-9 shrink-0 rounded-adm-sm bg-success-soft text-success-DEFAULT inline-flex items-center justify-center"
              >
                <HeroCore :path="mdiCertificateOutline" class="size-4" />
              </span>
              <div class="min-w-0 flex-1">
                <span
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  {{ certificate.offerPrefix ?? certificate.offerName }}
                </span>
                <p
                  class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-1"
                >
                  {{ certificate.courseName }}
                </p>
                <p class="text-adm-sm text-secondary-500 mt-1">
                  {{ certificate.templateName ?? "Certificado del curso" }}
                </p>

                <div
                  class="mt-3 pt-3 border-t border-line-soft flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <span
                      class="font-mono text-adm-xs text-secondary-400 uppercase block"
                    >
                      Código de verificación
                    </span>
                    <span class="font-mono text-adm-base text-secondary-900">
                      {{ certificate.code }}
                    </span>
                  </div>
                  <AulaPill tone="success" size="sm">
                    {{ formatDate(certificate.issuedDate, true) }}
                  </AulaPill>
                </div>
              </div>
            </div>
          </AulaCard>
        </div>
      </template>

      <!-- Aprobados sin emitir: se listan aparte para que no parezcan perdidos -->
      <template v-if="pending.length">
        <h2
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight mt-6 mb-3"
        >
          En trámite
        </h2>
        <AulaCard pad="sm">
          <button
            v-for="course in pending"
            :key="course.id"
            type="button"
            class="adm-row w-full flex items-center justify-between gap-4 px-2 py-2.5 border-b border-line-soft last:border-0 text-left cursor-pointer"
            @click="
              router.push({ name: 'classroom-course', params: { id: course.id } })
            "
          >
            <div class="min-w-0">
              <p class="text-secondary-900 truncate">{{ course.courseName }}</p>
              <p class="text-adm-sm text-secondary-500 truncate mt-0.5">
                {{ course.offerName }} · nota
                {{ formatScore(course.finalGrade?.score) }}
              </p>
            </div>
            <AulaPill tone="warning" size="sm">
              <HeroCore :path="mdiClockOutline" class="size-3" />
              En trámite
            </AulaPill>
          </button>
        </AulaCard>
      </template>

      <AulaEmpty
        v-if="!certificates.length && !pending.length"
        title="Todavía no tienes certificados"
        sub="Cuando apruebes un curso y el docente cierre el acta, tu certificado aparecerá acá con su código verificable."
      />
    </template>
  </div>
</template>
