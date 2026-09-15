<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { HeroCore } from "@/shared/components";
import { useClickOutsideMulti } from "@/shared/composables/useClickOutside";
import { safeRequest } from "@/shared/utils/request";
import { mdiBellOutline } from "@mdi/js";
import studentService from "../services/student.service";
import type { NotificationDTO } from "../dto/classroom.dto";
import { AulaBar, AulaPill } from "./ui";
import { formatDate } from "../utils/format";

const router = useRouter();

const open = ref(false);
const items = ref<NotificationDTO[]>([]);
const loading = ref(false);

const bellRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
useClickOutsideMulti([bellRef, panelRef], () => (open.value = false));

const unread = computed(() => items.value.filter((n) => !n.read).length);

const TONES: Record<string, string> = {
  accent: "bg-accent-soft text-primary-500",
  success: "bg-success-soft text-success-DEFAULT",
  warning: "bg-amber-soft text-amber-DEFAULT",
  danger: "bg-danger-soft text-danger-DEFAULT",
  info: "bg-info-soft text-info-DEFAULT",
};

const load = async () => {
  loading.value = true;
  const { data } = await safeRequest(() => studentService.notifications(), {
    showAlert: false,
  });
  items.value = data?.items ?? [];
  loading.value = false;
};

const markAll = async () => {
  if (!unread.value) return;
  await safeRequest(() => studentService.readNotifications(), {
    showAlert: false,
  });
  await load();
};

/**
 * Cada aviso lleva la ruta a la que pertenece. Se marca leído solo ese, no
 * todos: abrir uno no significa haber visto el resto.
 */
const goTo = async (notification: NotificationDTO) => {
  open.value = false;

  if (!notification.read) {
    await safeRequest(() => studentService.readNotifications([notification]), {
      showAlert: false,
    });
    await load();
  }

  const routes: Record<string, string> = {
    course: "classroom-course",
    certificates: "classroom-certificates",
  };

  const name = routes[notification.route.name];
  if (!name) return;

  router.push(
    notification.route.id
      ? { name, params: { id: notification.route.id } }
      : { name },
  );
};

onMounted(load);
</script>

<template>
  <div class="relative">
    <button
      ref="bellRef"
      type="button"
      class="relative size-9.5 rounded-pill inline-flex items-center justify-center border cursor-pointer transition-colors"
      :class="
        open
          ? 'border-primary-500 bg-accent-soft'
          : 'border-line bg-surface-paper'
      "
      aria-label="Notificaciones"
      @click="open = !open"
    >
      <HeroCore
        :path="mdiBellOutline"
        class="size-4.5"
        :class="open ? 'text-primary-500' : 'text-secondary-500'"
      />
      <!-- El borde blanco separa el contador del icono -->
      <span
        v-if="unread"
        class="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-pill bg-primary-500 text-white font-mono text-adm-xs font-bold inline-flex items-center justify-center border-2 border-surface-paper"
      >
        {{ unread }}
      </span>
    </button>

    <transition name="fade-scale">
      <div
        v-if="open"
        ref="panelRef"
        class="absolute right-0 top-12 w-100 max-w-[calc(100vw-2rem)] bg-surface-paper border border-line rounded-adm-lg shadow-lg z-9999 overflow-hidden"
      >
        <div class="flex items-center gap-2.5 px-4 py-3.5">
          <span
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
          >
            Notificaciones
          </span>
          <AulaPill v-if="unread" tone="accent" size="sm">
            {{ unread }} sin leer
          </AulaPill>
          <button
            v-if="unread"
            type="button"
            class="ml-auto text-adm-sm font-semibold text-primary-600 cursor-pointer"
            @click="markAll"
          >
            Marcar todas
          </button>
        </div>

        <div class="max-h-105 overflow-y-auto border-t border-line-soft">
          <div v-if="loading" class="px-4 py-3 space-y-3">
            <div v-for="n in 3" :key="n" class="flex items-start gap-3">
              <AulaBar :w="32" :h="32" :r="8" />
              <span class="flex-1 min-w-0">
                <AulaBar w="70%" :h="12" />
                <AulaBar w="45%" :h="9" class="mt-2" />
              </span>
            </div>
          </div>

          <button
            v-for="notification in items"
            :key="`${notification.entity_type}-${notification.entity_id}`"
            type="button"
            class="adm-row w-full flex items-start gap-3 px-4 py-3 border-b border-line-soft last:border-0 text-left cursor-pointer"
            :class="notification.read ? '' : 'bg-accent-soft/40'"
            @click="goTo(notification)"
          >
            <span
              class="size-8 shrink-0 rounded-adm-sm inline-flex items-center justify-center"
              :class="TONES[notification.tone] ?? TONES.info"
            >
              <HeroCore :path="mdiBellOutline" class="size-3.5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-adm-base text-secondary-900">
                {{ notification.title }}
              </p>
              <p
                v-if="notification.body"
                class="text-adm-sm text-secondary-500 mt-0.5"
              >
                {{ notification.body }}
              </p>
              <p class="font-mono text-adm-xs text-secondary-400 mt-1">
                {{ formatDate(notification.at, true) }}
              </p>
            </div>
            <span
              v-if="!notification.read"
              class="size-1.5 shrink-0 mt-2 rounded-pill bg-primary-500"
            />
          </button>

          <p
            v-if="!loading && !items.length"
            class="text-adm-base text-secondary-500 px-4 py-6 text-center"
          >
            No tienes avisos por ahora.
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s cubic-bezier(0.2, 0.7, 0.3, 1);
  transform-origin: top right;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
