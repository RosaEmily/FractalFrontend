<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { HeroCore } from "@/shared/components";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import profileService from "@/modules/admin/modules/profile/services/profile.service";
import type { Session } from "@/modules/admin/modules/profile/models/profile.model";
import { AulaCard, AulaNotice, AulaPill, AulaSkeleton } from "./ui";
import { formatDate } from "../utils/format";

/**
 * Sesiones activas del aula (`StuSessions`, student2.jsx:520).
 *
 * ⚠️ NO es `ActiveSessions` del admin, que las dibuja como tarjetas con avatar
 * de color. El diseño del aula usa una TABLA de cinco columnas —equipo,
 * navegador, IP y ubicación, inicio, acción— encabezada por el aviso del cupo.
 */
const props = defineProps<{ maxSessions?: number }>();
const emit = defineEmits<{ loaded: [Session[]] }>();

const toastStore = useToastStore();

const sessions = ref<Session[]>([]);
const loading = ref(true);
const revoking = ref<number | null>(null);

const load = async () => {
  loading.value = true;
  const { data } = await safeRequest(() => profileService.sessions(), {
    showAlert: false,
  });
  sessions.value = data ?? [];
  loading.value = false;
  emit("loaded", sessions.value);
};

const revoke = async (session: Session) => {
  revoking.value = session.id;
  const { error } = await safeRequest(() =>
    profileService.revokeSession(session.id),
  );
  revoking.value = null;

  if (error) return;

  toastStore.showToastSuccess({ detail: "Sesión cerrada" });
  await load();
};

/** `3 de 4 sesiones en uso` — el aviso que encabeza la tabla. */
const usage = computed(
  () => `${sessions.value.length} de ${props.maxSessions ?? 1} sesiones en uso`,
);

onMounted(load);

defineExpose({ load });
</script>

<template>
  <div class="flex flex-col gap-4.5">
    <AulaNotice tone="info" :title="usage">
      Al llegar al tope, un nuevo inicio de sesión se rechaza. Cierra la sesión
      de un equipo que ya no uses para liberar el cupo.
    </AulaNotice>

    <AulaSkeleton v-if="loading" kind="table" :rows="3" />

    <!--
      GRID con anchos fijos y UNA columna flexible, como el resto del aula: una
      `<table>` repartiría el sobrante entre todas y la columna del equipo —la
      que debe crecer— quedaría estrecha.
    -->
    <AulaCard v-else pad="none">
      <div class="overflow-x-auto">
        <div class="min-w-195">
          <div
            class="grid grid-cols-[minmax(11.875rem,1fr)_9.0625rem_9.0625rem_7.8125rem_6.25rem] items-center gap-3.5 bg-surface-page px-[1.125rem] py-2.5 font-mono text-adm-label uppercase tracking-[0.05em] text-secondary-400"
          >
            <span>Equipo</span>
            <span>Navegador</span>
            <span>IP y ubicación</span>
            <span>Inicio</span>
            <span />
          </div>

          <div
            v-for="session in sessions"
            :key="session.id"
            class="grid grid-cols-[minmax(11.875rem,1fr)_9.0625rem_9.0625rem_7.8125rem_6.25rem] items-center gap-3.5 border-t border-line-soft px-[1.125rem] py-[0.8125rem]"
          >
            <div class="flex min-w-0 items-center gap-2.5">
              <HeroCore
                :path="session.icon"
                class="size-4.5 shrink-0 text-secondary-400"
              />
              <div class="min-w-0">
                <p class="truncate text-adm-md font-semibold text-secondary-900">
                  {{ session.device_info ?? "Equipo desconocido" }}
                </p>
                <!--
                  El diseño marca el equipo propio con una etiqueta mono verde,
                  no con una pill: es una aclaración, no un estado.
                -->
                <span
                  v-if="session.is_current"
                  class="font-mono text-adm-xs font-semibold text-success-DEFAULT"
                >
                  ESTE EQUIPO
                </span>
              </div>
            </div>

            <span class="truncate text-adm-base text-secondary-500">
              {{ session.browser ?? "—" }}
            </span>

            <div class="min-w-0">
              <p class="truncate font-mono text-adm-sm text-secondary-500">
                {{ session.ip_address ?? "—" }}
              </p>
              <p class="truncate text-adm-sm text-secondary-400">
                {{ session.location ?? "—" }}
              </p>
            </div>

            <span class="text-adm-base text-secondary-500">
              {{ formatDate(session.last_activity, true) }}
            </span>

            <div>
              <AulaPill v-if="session.is_current" tone="success" size="sm">
                Activa
              </AulaPill>
              <button
                v-else
                type="button"
                class="cursor-pointer text-adm-base font-semibold text-primary-600 disabled:opacity-50"
                :disabled="revoking === session.id"
                @click="revoke(session)"
              >
                {{ revoking === session.id ? "Cerrando…" : "Cerrar" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AulaCard>
  </div>
</template>
