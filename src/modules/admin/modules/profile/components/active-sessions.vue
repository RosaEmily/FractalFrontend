<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useConfirmStore } from "@/shared/stores/useConfirmStore";
import {
  CardCore,
  ButtonCore,
  TagCore,
  HeroCore,
} from "@/shared/components";

import profileService from "../services/profile.service";
import type { Session } from "../models/profile.model";

dayjs.extend(relativeTime);
dayjs.locale("es");

const emit = defineEmits<{ (e: "loaded", sessions: Session[]): void }>();

const sessions = ref<Session[]>([]);
const loading = ref<boolean>(false);
const revoking = ref<number | null>(null);

const others = computed(() => sessions.value.filter((s) => !s.is_current));

const load = async () => {
  loading.value = true;
  const { data } = await safeRequest(() => profileService.sessions(), {
    showAlert: false,
  });
  sessions.value = data ?? [];
  loading.value = false;
  emit("loaded", sessions.value);
};

const deviceTitle = (session: Session): string =>
  session.device_type ?? session.os ?? "Dispositivo desconocido";

const deviceMeta = (session: Session): string => {
  const parts = [session.os, session.browser].filter(Boolean);
  return parts.join(" · ");
};

const lastActivity = (session: Session): string => {
  if (session.is_current) return "Activa ahora";
  return session.last_activity ? dayjs(session.last_activity).fromNow() : "—";
};

const revoke = async (id: number) => {
  revoking.value = id;
  const toastStore = useToastStore();
  const { status, error } = await safeRequest(
    () => profileService.revokeSession(id),
    { showAlert: false },
  );
  revoking.value = null;

  if (status && !error) {
    toastStore.showToastSuccess({ detail: "Sesión cerrada correctamente" });
    await load();
    return false;
  }
  toastStore.showToastError({ detail: error?.message });
  return true;
};

const onRevoke = (session: Session) => {
  const confirmStore = useConfirmStore();
  confirmStore.confirmDelete({
    header: "Cerrar sesión",
    message: `¿Seguro que quieres cerrar la sesión de ${deviceTitle(session)}?`,
    accept: async () => {
      await revoke(session.id);
    },
  });
};

/**
 * No hay endpoint masivo: se cierran una por una, en secuencia, para no
 * disparar N requests en paralelo contra la Lambda.
 */
const onRevokeAll = () => {
  const confirmStore = useConfirmStore();
  confirmStore.confirmDelete({
    header: "Cerrar todas las otras sesiones",
    message: `Se cerrarán ${others.value.length} sesión(es) en otros dispositivos. Tu sesión actual seguirá abierta.`,
    accept: async () => {
      const toastStore = useToastStore();
      let failed = 0;
      for (const session of others.value) {
        const { status, error } = await safeRequest(
          () => profileService.revokeSession(session.id),
          { showAlert: false },
        );
        if (!status || error) failed += 1;
      }
      await load();
      if (failed) {
        toastStore.showToastError({
          detail: `No se pudieron cerrar ${failed} sesión(es).`,
        });
        return;
      }
      toastStore.showToastSuccess({
        detail: "Se cerraron las demás sesiones",
      });
    },
  });
};

defineExpose({ load });

onMounted(load);
</script>

<template>
  <CardCore :pt="{ body: { class: '!p-0' } }">
    <div
      class="px-7 py-4.5 border-b border-line-soft flex flex-wrap justify-between items-center gap-3"
    >
      <div>
        <h3
          class="font-display text-adm-lg font-bold text-secondary-900 m-0 tracking-tight"
        >
          Dispositivos con sesión activa
        </h3>
        <p class="text-adm-base text-secondary-500 mt-1 mb-0">
          Si reconoces algo extraño, cierra esa sesión inmediatamente.
        </p>
      </div>

      <ButtonCore
        v-if="others.length"
        class="!w-auto"
        severity="danger"
        outlined
        label="Cerrar todas las otras sesiones"
        @click="onRevokeAll"
      />
    </div>

    <p v-if="loading" class="px-7 py-5 text-adm-base text-secondary-500">
      Cargando sesiones...
    </p>

    <p
      v-else-if="!sessions.length"
      class="px-7 py-5 text-adm-base text-secondary-500"
    >
      No hay sesiones activas.
    </p>

    <div
      v-for="(session, index) in sessions"
      v-else
      :key="session.id"
      class="px-7 py-4.5 flex flex-wrap items-center gap-4.5"
      :class="index < sessions.length - 1 ? 'border-b border-line-soft' : ''"
    >
      <span
        class="w-12 h-12 rounded-adm-md inline-flex items-center justify-center shrink-0 border"
        :class="
          session.is_current
            ? 'bg-primary-500 text-white border-primary-500'
            : 'bg-admin-bg text-secondary-500 border-line'
        "
      >
        <HeroCore :path="session.icon" class="size-5" />
      </span>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2.5 mb-1">
          <span
            class="font-display text-[0.938rem] font-bold text-secondary-900 tracking-tight"
          >
            {{ deviceTitle(session) }}
          </span>
          <TagCore
            v-if="session.is_current"
            value="Este dispositivo"
            severity="success"
          />
        </div>
        <div
          class="flex gap-2 text-adm-sm text-secondary-500 flex-wrap items-center"
        >
          <span v-if="deviceMeta(session)">{{ deviceMeta(session) }}</span>
          <span v-if="session.location">· {{ session.location }}</span>
          <span v-if="session.ip_address" class="font-mono">
            · {{ session.ip_address }}
          </span>
        </div>
      </div>

      <div class="text-right">
        <div
          class="text-adm-sm font-semibold"
          :class="session.is_current ? 'text-success-DEFAULT' : 'text-secondary-500'"
        >
          {{ lastActivity(session) }}
        </div>
        <ButtonCore
          v-if="!session.is_current"
          class="!w-auto mt-1.5"
          severity="danger"
          outlined
          size="small"
          label="Cerrar sesión"
          :loading="revoking === session.id"
          @click="onRevoke(session)"
        />
      </div>
    </div>
  </CardCore>
</template>
