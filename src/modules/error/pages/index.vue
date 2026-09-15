<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import Logo from "@/assets/fractal.png";
import LandingButton from "@/modules/landing/components/ui/LandingButton.vue";
import BlueprintGrid from "../components/BlueprintGrid.vue";
import ErrorFigure from "../components/ErrorFigure.vue";
import { ERROR_CODES, SERVER_CODES, SUPPORT_WHATSAPP } from "../constants/codes";

const props = defineProps<{ status?: number }>();

const route = useRoute();
const router = useRouter();

const state = computed(() => ERROR_CODES[props.status ?? 404] ?? ERROR_CODES[404]!);

const isServer = computed(() => SERVER_CODES.includes(props.status ?? 404));

const accent = computed(() =>
  state.value.tone === "danger"
    ? "text-danger-DEFAULT"
    : state.value.tone === "accent"
      ? "text-primary-500"
      : "text-secondary-500",
);

/*
 * La ruta que falló, para que el usuario vea si se equivocó al escribirla. Solo
 * tiene sentido en el 404 y el 410: en los demás la URL es correcta y lo que
 * falló es otra cosa.
 */
const failedPath = computed(() =>
  [404, 410].includes(props.status ?? 404)
    ? (route.query.path as string) || route.fullPath
    : null,
);

/*
 * Referencia para soporte: identifica ESTE fallo concreto en los logs. Se
 * genera una vez al montar — regenerarla en cada render daría un id distinto
 * al que el usuario ya copió.
 */
const reference = ref("");
const stamp = ref("");

/** Cuenta atrás del 429: el único código que reintenta solo. */
const secondsLeft = ref(state.value.autoRedirect ?? 0);
let timer: ReturnType<typeof setInterval> | undefined;

const onPrimary = () => {
  const code = props.status ?? 404;

  // Cada código vuelve a donde tiene sentido, no todos "al inicio".
  if (code === 401) return router.push({ name: "login" });
  if ([400, 422].includes(code)) return router.back();
  if ([408, 409, 429, 500, 502, 503, 504].includes(code)) return window.location.reload();

  return router.push({ name: "home" });
};

const onSecondary = () => {
  if (props.status === 403) {
    window.open(SUPPORT_WHATSAPP, "_blank", "noopener");
    return;
  }
  router.push({ name: "home" });
};

onMounted(() => {
  reference.value = `FRA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  stamp.value = `${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`;

  if (!state.value.autoRedirect) return;

  timer = setInterval(() => {
    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0) {
      clearInterval(timer);
      onPrimary();
    }
  }, 1000);
});

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div class="relative flex min-h-dvh flex-col overflow-hidden bg-surface-page">
    <BlueprintGrid />

    <header class="relative flex items-center justify-between px-6 py-[1.375rem] md:px-8">
      <RouterLink :to="{ name: 'home' }">
        <img :src="Logo" alt="Fractal Studio" class="h-[1.875rem]" />
      </RouterLink>
      <RouterLink
        :to="{ name: 'home' }"
        class="font-body text-[0.844rem] font-semibold text-secondary-500 transition-colors hover:text-secondary-900"
      >
        Volver al inicio →
      </RouterLink>
    </header>

    <div class="relative flex flex-1 items-center justify-center px-6 pt-6 pb-14">
      <!-- El código gigante casi invisible: da escala sin robar atención. -->
      <span
        class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] font-display text-[20rem] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap text-secondary-900 opacity-[0.035] select-none"
        aria-hidden="true"
      >
        {{ state.code }}
      </span>

      <div class="relative w-full max-w-100 text-center">
        <ErrorFigure :tone="state.tone" :icon="state.icon" />

        <p
          class="mt-[1.375rem] font-mono text-xs font-semibold tracking-[0.14em]"
          :class="accent"
        >
          ERROR {{ state.code }}
        </p>

        <h1 class="mt-2.5 font-display text-[1.563rem] leading-tight font-bold tracking-[-0.01em] text-secondary-900">
          {{ state.title }}
        </h1>

        <p class="mt-2.5 text-[0.938rem] leading-relaxed text-secondary-500">
          {{ state.sub }}
        </p>

        <p
          v-if="failedPath"
          class="mt-3.5 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-paper px-3 py-1.5 font-mono text-xs text-secondary-400"
        >
          {{ failedPath }}
        </p>

        <div class="mt-[1.625rem] flex flex-wrap justify-center gap-2.5">
          <LandingButton variant="primary" size="md" :arrow="false" @click="onPrimary">
            {{ state.cta }}
          </LandingButton>
          <LandingButton
            v-if="state.secondary"
            variant="ghost"
            size="md"
            :arrow="false"
            @click="onSecondary"
          >
            {{ state.secondary }}
          </LandingButton>
        </div>

        <p v-if="secondsLeft > 0" class="mt-5 font-mono text-[0.719rem] text-secondary-400">
          Reintentamos en {{ secondsLeft }}s…
        </p>

        <!--
          Los errores de servidor no son culpa del usuario y no puede resolverlos:
          lo único útil es darle algo concreto que pasar a soporte.
        -->
        <div
          v-if="isServer"
          class="mt-7 flex flex-col gap-1 border-t border-line pt-[1.125rem]"
        >
          <span class="text-xs text-secondary-400">
            Si el problema sigue, comparte esto con soporte:
          </span>
          <span class="font-mono text-xs text-secondary-500">
            ID {{ reference }} · {{ stamp }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
