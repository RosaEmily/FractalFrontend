<script setup lang="ts">
import { HeroCore, ImageCore } from "@/shared/components";
import Logo from "@/assets/fractal.png";
import { mdiChevronRight } from "@mdi/js";
import {
  CLASSROOM_ROLE_ICON,
  CLASSROOM_ROLE_LABEL,
  CLASSROOM_ROLE_DESC,
} from "@/modules/classroom/constants/labels";

/**
 * "¿Cómo quieres entrar?" — la elección de rol del aula.
 *
 * El diseño (`aula/login.jsx`) la muestra SOLO cuando el usuario tiene más de
 * un rol: con uno solo no hay nada que preguntar y se entra directo. Va después
 * de autenticar, no antes, porque hasta que la API no devuelve el perfil no se
 * sabe cuántos roles tiene.
 *
 * No es un control de acceso: el guard vuelve a comprobar el rol en cada
 * navegación. Acá solo se elige con qué cara del perfil se dibuja el aula.
 */
defineProps<{ roles: string[] }>();

defineEmits<{ choose: [role: string] }>();
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-admin-bg p-6">
    <div class="w-full max-w-115">
      <ImageCore image-class="h-8" :src="Logo" />

      <p
        class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] mt-7"
      >
        Tienes más de un rol
      </p>
      <h2
        class="font-display text-[1.625rem] font-bold tracking-[-0.02em] text-secondary-900 mt-2.5 mb-1.5"
      >
        ¿Cómo quieres entrar?
      </h2>
      <p class="text-adm-base text-secondary-500 mb-5.5">
        Puedes cambiar de vista después sin volver a iniciar sesión.
      </p>

      <div class="flex flex-col gap-2.5">
        <button
          v-for="role in roles"
          :key="role"
          type="button"
          class="flex items-center gap-3.5 p-4.5 rounded-adm-md border-[1.5px] border-line bg-surface-paper cursor-pointer text-left transition-colors hover:border-primary-500"
          @click="$emit('choose', role)"
        >
          <span
            class="grid size-10.5 shrink-0 place-items-center rounded-adm-sm bg-accent-soft text-primary-600"
          >
            <HeroCore :path="CLASSROOM_ROLE_ICON[role]" class="size-5" />
          </span>

          <span class="flex-1">
            <span
              class="block font-display text-adm-lg font-bold text-secondary-900"
            >
              {{ CLASSROOM_ROLE_LABEL[role] ?? role }}
            </span>
            <span class="block text-adm-sm text-secondary-500 mt-0.5">
              {{ CLASSROOM_ROLE_DESC[role] ?? "" }}
            </span>
          </span>

          <HeroCore
            :path="mdiChevronRight"
            class="size-4 shrink-0 text-secondary-400"
          />
        </button>
      </div>
    </div>
  </div>
</template>
