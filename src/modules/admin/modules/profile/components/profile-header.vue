<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import "dayjs/locale/es";

import { AvatarCore, TagCore } from "@/shared/components";
import type { Profile } from "../models/profile.model";

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.locale("es");

interface Props {
  profile: Profile | null;
  sessionsCount: number;
  /** Actividad más reciente entre las sesiones activas del usuario. */
  lastAccess?: string | null;
}

const props = defineProps<Props>();

const initials = computed(() => {
  const p = props.profile;
  if (!p) return "";
  return `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase();
});

const mainRole = computed(() => props.profile?.roles?.[0] ?? null);

const lastAccessLabel = computed(() => {
  if (!props.lastAccess) return "—";
  const value = dayjs(props.lastAccess);
  return value.isSame(dayjs(), "day")
    ? `Hoy ${value.format("HH:mm")}`
    : value.calendar(null, {
        lastDay: "[Ayer] HH:mm",
        lastWeek: "dddd HH:mm",
        sameElse: "DD MMM HH:mm",
      });
});

/**
 * Se muestra la descripción ("Administrador del sistema") en vez del name
 * técnico ("ADMIN"), que es más claro para el usuario. En mayúscula por
 * consistencia con el chip del diseño.
 */
const roleLabel = computed(() => {
  const role = mainRole.value;
  if (!role) return null;
  return (role.description ?? role.name).toUpperCase();
});
</script>

<template>
  <div
    class="bg-surface-paper border border-line rounded-adm-lg shadow-sm overflow-hidden mb-4"
  >
    <!-- Banda decorativa -->
    <div
      class="h-[110px] relative overflow-hidden bg-gradient-to-br from-accent-soft to-admin-pane"
    >
      <span
        class="absolute -right-10 -top-10 w-[200px] h-[200px] rounded-full bg-accent-tint opacity-60"
      />
      <span
        class="absolute right-[120px] -bottom-[60px] w-[140px] h-[140px] rounded-full bg-accent-soft opacity-60"
      />
    </div>

    <div class="px-7 pb-5 flex flex-wrap items-end gap-6 relative">
      <!-- Avatar solapando la banda -->
      <div class="relative -mt-12">
        <AvatarCore
          v-if="profile?.photo_url"
          :text="profile.photo_url"
          shape="circle"
          class="!w-24 !h-24 border-4 border-surface-paper shadow-md"
        />
        <span
          v-else
          class="w-24 h-24 rounded-full bg-primary-500 text-white inline-flex items-center justify-center border-4 border-surface-paper shadow-md font-display text-[2rem] font-extrabold tracking-tight"
        >
          {{ initials }}
        </span>
      </div>

      <div class="flex-1 pt-4 min-w-0">
        <h1
          class="font-display text-[1.75rem] font-bold text-secondary-900 m-0 tracking-tight leading-tight"
        >
          {{ profile?.full_name }}
        </h1>
        <div class="flex gap-3 items-center mt-2 flex-wrap">
          <TagCore v-if="roleLabel" :value="roleLabel" />
          <span class="text-adm-base text-secondary-500">
            {{ profile?.email }}
          </span>
        </div>
      </div>

      <!-- Stats: solo los que la API puede responder de verdad -->
      <div class="pt-4 flex border border-line rounded-adm-md overflow-hidden">
        <div class="px-4.5 py-2.5">
          <div
            class="font-mono text-[0.563rem] text-secondary-400 tracking-widest uppercase"
          >
            Último acceso
          </div>
          <div class="font-display text-base font-bold text-secondary-900 mt-1">
            {{ lastAccessLabel }}
          </div>
        </div>
        <div class="px-4.5 py-2.5 border-l border-line">
          <div
            class="font-mono text-[0.563rem] text-secondary-400 tracking-widest uppercase"
          >
            Sesiones activas
          </div>
          <div
            class="font-display text-base font-bold text-secondary-900 mt-1"
          >
            {{ sessionsCount }}
          </div>
        </div>
        <div class="px-4.5 py-2.5 border-l border-line">
          <div
            class="font-mono text-[0.563rem] text-secondary-400 tracking-widest uppercase"
          >
            Rol
          </div>
          <div
            class="font-display text-base font-bold text-secondary-900 mt-1"
          >
            {{ mainRole?.description ?? mainRole?.name ?? "—" }}
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-t border-line-soft px-7 flex gap-1">
      <slot name="tabs" />
    </div>
  </div>
</template>
