<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import coordinatorService, {
  SEVERITY_TONE,
} from "../../services/coordinator.service";
import type { AttentionItemDTO } from "../../dto/coordinator.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaPill,
} from "../../components/ui";

const attention = ref<AttentionItemDTO[]>([]);
const loading = ref(true);

/**
 * Los avisos que se resuelven sobre un programa: clases sin generar y pesos que
 * no suman 100%. El listado completo de programas vive en el panel
 * administrativo; acá solo se vigila lo que está mal.
 */
const items = computed(() =>
  attention.value.filter((a) =>
    ["offers_without_sessions", "evaluation_weights"].includes(a.key),
  ),
);

onMounted(async () => {
  const { data } = await safeRequest(() => coordinatorService.attention());
  attention.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="PROGRAMAS"
      title="Programas"
      sub="Lo que falta resolver en los cursos de cada grupo antes de que puedan cerrarse."
    />

    <AulaSkeleton v-if="loading" kind="table" :rows="4" />

    <template v-else>
      <AulaCard v-if="items.length" pad="sm" class="mb-4">
        <div
          v-for="item in items"
          :key="item.key"
          class="flex items-start justify-between gap-3 px-2 py-3 border-b border-line-soft last:border-0"
        >
          <div class="flex items-start gap-2.5 min-w-0">
            <AulaPill
              :tone="(SEVERITY_TONE[item.severity] ?? 'info') as never"
              size="sm"
            >
              {{ item.count }}
            </AulaPill>
            <div class="min-w-0">
              <p class="text-secondary-900">{{ item.title }}</p>
              <p class="text-adm-sm text-secondary-500 mt-0.5">
                {{ item.detail }}
              </p>
            </div>
          </div>
        </div>
      </AulaCard>

      <AulaEmpty
        v-else
        title="Los programas están en orden"
        sub="Todos los grupos tienen sus clases generadas y sus pesos de evaluación al 100%."
      />

      <AulaNotice tone="info" class="mt-4">
        La generación de clases desde el horario y la edición del cuadro de
        evaluación se hacen desde el panel administrativo.
      </AulaNotice>
    </template>
  </div>
</template>
