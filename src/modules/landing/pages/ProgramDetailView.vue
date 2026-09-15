<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import LandingLayout from "../layouts/LandingLayout.vue";
import LandingBadge from "../components/ui/LandingBadge.vue";
import LandingButton from "../components/ui/LandingButton.vue";
import { useOfferDetailStore } from "../stores/useOfferDetailStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useCartStore } from "@/modules/checkout/stores/useCartStore";
import type { OfferCourse } from "../models/offer.model";
import { useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const store = useOfferDetailStore();
const toastStore = useToastStore();
const cart = useCartStore();

const offer = computed(() => store.data);
const isPath = computed(() => (offer.value?.courses.length ?? 0) > 1);

/*
 * Cupo. `max_students` es NOT NULL con default 0 en la BD, así que **0 significa
 * "sin límite definido"**, no "sin vacantes": tratarlo como tope dejaría agotado
 * todo programa recién creado. Misma regla que aplica el backend al validar.
 */
const soldOut = computed(() => {
  const o = offer.value;
  if (!o) return false;
  return o.max_students > 0 && o.enrolled_students_count >= o.max_students;
});

const inCart = computed(() => (offer.value ? cart.has(offer.value.id) : false));

/*
 * Agrega al carrito y lleva al checkout. No compra: el alumno revisa el carrito
 * primero, y así puede sumar más programas (una matrícula admite varios).
 */
const enroll = () => {
  if (!offer.value || soldOut.value) return;

  cart.add(offer.value);
  router.push({ name: "checkout-cart" });
};

/** Consulta por WhatsApp con el programa ya mencionado, para no repetirlo. */
const advisorHref = computed(() => {
  const name = offer.value?.name ?? "";
  return `https://wa.me/51987654321?text=${encodeURIComponent(
    `Hola, quiero información sobre el programa ${name}`.trim(),
  )}`;
});

// `window` no existe en el scope del template: la apertura va en una función.
const openAdvisor = () => window.open(advisorHref.value, "_blank", "noopener");

/** Docente del primer curso, con los datos que guarda `teachers`. */
const teacher = computed(() => offer.value?.courses[0]?.teacher_detail ?? null);

// Roadmap / Path course expanded row
const openCourse = ref<number>(0);

// Meta strip for single-course hero
const metaItems = computed(() => {
  if (!offer.value) return [];
  /*
   * Solo datos que existen: la duración se deriva de las fechas de los cursos y
   * la modalidad es un hecho del negocio (todo es en vivo).
   *
   * v4 quitó "INICIA · 10 JUL": era una fecha fija del mockup, y derivarla del
   * primer curso daba un dato que no siempre existe.
   */
  return [
    { label: "CURSOS", value: String(offer.value.courses.length) },
    {
      label: "DURACIÓN",
      value: offer.value.duration_months
        ? `${offer.value.duration_months} ${offer.value.duration_months === 1 ? "mes" : "meses"}`
        : "—",
    },
    { label: "MODALIDAD", value: "En vivo" },
  ];
});

// Path stats
const uniqueTeachers = computed(() => [
  ...new Set(offer.value?.courses.map((c) => c.teacher) ?? []),
]);

// Monthly installment
const installment = computed(() => {
  const p = parseInt(offer.value?.price ?? "0");
  return isNaN(p) ? "—" : Math.round(p / 6).toLocaleString("es-PE");
});

const priceFormatted = computed(() => {
  const p = parseInt(offer.value?.price ?? "0");
  return isNaN(p) ? (offer.value?.price ?? "—") : p.toLocaleString("es-PE");
});

const initials = (name: string) =>
  name
    .split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("");

function teacherInitials(course: OfferCourse) {
  return initials(course.teacher);
}

function statusVariant(status: string): "open" | "upcoming" | "soft" | "ink" {
  const map: Record<string, "open" | "upcoming" | "soft" | "ink"> = {
    open: "open",
    upcoming: "upcoming",
    ongoing: "soft",
    ended: "ink",
  };
  return map[status] ?? "soft";
}

function loadOffer() {
  const id = Number(route.params.id);
  if (!isNaN(id)) store.fetch(id);
}

watch(
  () => store.error,
  (err) => {
    if (err) toastStore.showToastError({ detail: err });
  },
);
onMounted(loadOffer);
</script>

<template>
  <LandingLayout>
    <!-- SKELETON -->
    <template v-if="store.loading">
      <div class="bg-surface-page px-6 md:px-16 py-10 animate-pulse">
        <div class="h-4 w-48 bg-line rounded mb-8" />
        <div class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12">
          <div class="flex flex-col gap-5">
            <div class="h-6 w-32 bg-line rounded-full" />
            <div class="h-20 w-3/4 bg-line rounded" />
            <div class="h-4 w-full bg-line rounded" />
            <div class="h-4 w-5/6 bg-line rounded" />
            <div class="h-24 bg-line rounded-xl mt-4" />
          </div>
          <div class="h-96 bg-line rounded-xl" />
        </div>
      </div>
    </template>

    <!-- ERROR -->
    <template v-else-if="store.error && !offer">
      <div
        class="bg-surface-page px-6 md:px-16 py-32 flex flex-col items-center justify-center gap-4 text-center"
      >
        <p class="font-display font-bold text-[1.5rem] text-secondary-900">
          No se pudo cargar el programa
        </p>
        <p class="font-body text-[0.9375rem] text-secondary-500">
          {{ store.error }}
        </p>
        <RouterLink to="/programs">
          <LandingButton variant="primary" size="md"
            >Volver al catálogo</LandingButton
          >
        </RouterLink>
      </div>
    </template>

    <template v-else-if="offer">
      <!-- ─── Breadcrumb ─────────────────────────────────────────────────────────── -->
      <div class="bg-surface-page px-6 md:px-16 pt-5">
        <nav
          class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 flex items-center gap-2"
        >
          <RouterLink
            to="/programs"
            class="hover:text-secondary-900 transition-colors"
            >Programas</RouterLink
          >
          <span>/</span>
          <span
            v-if="isPath"
            class="hover:text-secondary-900 transition-colors cursor-default"
            >Líneas de carrera</span
          >
          <span
            v-else
            class="hover:text-secondary-900 transition-colors cursor-default"
            >Certificaciones</span
          >
          <span>/</span>
          <span class="text-secondary-900">{{ offer.prefix }}</span>
        </nav>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           HERO — SINGLE COURSE
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        v-if="!isPath"
        class="bg-surface-page px-6 md:px-16 pt-9 pb-20 relative overflow-hidden"
      >
        <div
          class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 items-start"
        >
          <!-- Left -->
          <div>
            <div class="flex flex-wrap items-center gap-2.5 mb-6">
              <LandingBadge variant="soft" size="md">{{
                offer.prefix
              }}</LandingBadge>
              <LandingBadge :variant="statusVariant(offer.status)" size="md">{{
                offer.status_label
              }}</LandingBadge>
            </div>

            <h1
              class="font-display font-bold leading-[0.95] tracking-tight text-[clamp(48px,6vw,80px)] text-secondary-900 text-balance"
            >
              {{ offer.name }}<span class="text-primary-500">.</span>
            </h1>

            <p
              class="font-body text-[1.125rem] leading-relaxed text-secondary-500 mt-5 mb-6 max-w-[36rem] text-pretty"
            >
              {{
                offer.courses[0]?.description ||
                `Certifícate oficialmente en ${offer.name} con el sello Autodesk. Aprende con docentes que ejercen y produce entregables a nivel profesional.`
              }}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in offer.courses[0]?.tags ?? []"
                :key="tag"
                class="font-mono text-[0.6875rem] text-secondary-500 px-2.5 py-1 bg-surface-paper border border-line rounded-full tracking-wide"
                >{{ tag }}</span
              >
            </div>

            <!-- Meta strip -->
            <div
              class="mt-9 bg-surface-paper border border-line rounded-xl overflow-hidden grid grid-cols-2 md:grid-cols-4"
            >
              <div
                v-for="(m, i) in metaItems"
                :key="m.label"
                :class="[
                  'px-4 py-4 flex items-center gap-3',
                  i > 0 && 'border-l border-line',
                ]"
              >
                <div
                  class="w-9 h-9 rounded-lg bg-accent-soft text-primary-500 flex items-center justify-center shrink-0"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <template v-if="i === 0">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </template>
                    <template v-else-if="i === 1">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3.5 2" />
                    </template>
                    <template v-else-if="i === 2">
                      <polygon points="5 3 19 12 5 21" />
                    </template>
                    <template v-else>
                      <circle cx="12" cy="8" r="5" />
                      <path d="M5 20a7 7 0 0114 0" />
                    </template>
                  </svg>
                </div>
                <div>
                  <p
                    class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400"
                  >
                    {{ m.label }}
                  </p>
                  <p
                    class="font-display text-[1rem] font-bold text-secondary-900 mt-0.5 tracking-tight"
                  >
                    {{ m.value }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Enroll card -->
          <div class="sticky top-24 self-start">
            <div
              class="bg-surface-paper border border-line rounded-xl p-7 shadow-md"
            >
              <div class="flex justify-between items-center mb-4">
                <span
                  class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400"
                  >INVERSIÓN</span
                >
                <!-- El estado se deriva del cupo y de la ventana de matrícula;
                     antes decía "Matrícula abierta" fijo, incluso agotado. -->
                <span
                  v-if="soldOut"
                  class="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wide bg-amber-soft text-amber-DEFAULT rounded-full px-2.5 py-1"
                >
                  Cupo lleno
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wide rounded-full px-2.5 py-1"
                  :class="offer?.status_class"
                >
                  <span
                    v-if="offer?.status === 'open'"
                    class="w-1.5 h-1.5 rounded-full bg-success-DEFAULT animate-pulse-dot"
                  />
                  {{ offer?.status_label }}
                </span>
              </div>

              <div
                class="font-display text-[3.5rem] font-extrabold text-secondary-900 leading-none tracking-tight"
              >
                S/ {{ priceFormatted }}
              </div>
              <p class="font-body text-[0.8125rem] text-secondary-500 mt-2">
                O en cuotas de S/ {{ installment }} × 6 meses sin intereses.
              </p>

              <div class="flex flex-col gap-2 mt-6">
                <!-- Agotado no ofrece comprar: el botón llevaría a un carrito
                     que el backend rechaza. Se ofrece el asesor en su lugar. -->
                <LandingButton
                  v-if="!soldOut"
                  variant="primary"
                  size="lg"
                  class="w-full justify-center"
                  @click="enroll"
                >
                  {{ inCart ? "Ver mi carrito" : "Inscribirme ahora" }}
                </LandingButton>
                <div
                  v-else
                  class="rounded-adm-md border border-amber-DEFAULT/40 bg-amber-soft px-4 py-3 text-center font-body text-[0.8125rem] leading-relaxed text-secondary-500"
                >
                  Esta cohorte alcanzó su cupo máximo. Escríbenos y te avisamos
                  de la siguiente.
                </div>
                <LandingButton
                  variant="soft"
                  size="md"
                  :arrow="false"
                  class="w-full justify-center"
                  @click="openAdvisor"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                    />
                    <path
                      d="M11.5 2C6.261 2 2 6.261 2 11.5c0 1.852.537 3.576 1.459 5.033L2 22l5.612-1.437A9.5 9.5 0 0011.5 21c5.239 0 9.5-4.261 9.5-9.5S16.739 2 11.5 2z"
                    />
                  </svg>
                  Hablar con un asesor
                </LandingButton>
              </div>

              <div class="mt-6 pt-5 border-t border-line flex flex-col gap-3">
                <div
                  v-for="(item, i) in [
                    'Material descargable PDF + DWG',
                    'Acceso a aula virtual 24/7',
                    'Certificado oficial Autodesk ATC',
                    'Bolsa de trabajo Fractal',
                  ]"
                  :key="i"
                  class="flex items-center gap-2.5 font-body text-[0.8125rem] text-secondary-900"
                >
                  <span
                    class="w-4.5 h-4.5 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  {{ item }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           HERO — PATH (línea de carrera)
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        v-else
        class="bg-surface-page px-6 md:px-16 pt-9 pb-20 relative overflow-hidden"
      >
        <div
          class="absolute -right-30 top-15 w-125 h-125 rounded-full bg-accent-soft opacity-40 pointer-events-none"
        />
        <div
          class="relative grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 items-start"
        >
          <div>
            <div class="flex flex-wrap items-center gap-2.5 mb-6">
              <LandingBadge variant="accent" size="md">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21" />
                </svg>
                Ruta de carrera
              </LandingBadge>
              <LandingBadge variant="paper" size="md"
                >{{ offer.courses.length }} cursos</LandingBadge
              >
              <LandingBadge :variant="statusVariant(offer.status)" size="md">{{
                offer.status_label
              }}</LandingBadge>
            </div>

            <p
              class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-500 mb-3"
            >
              {{ offer.prefix }}
            </p>
            <h1
              class="font-display font-bold leading-[0.95] tracking-tight text-[clamp(52px,6.5vw,88px)] text-secondary-900 text-balance"
            >
              {{ offer.name }}<span class="text-primary-500">.</span>
            </h1>
            <p
              class="font-body text-[1.125rem] leading-relaxed text-secondary-500 mt-5 max-w-[37.5rem] text-pretty"
            >
              {{ offer.courses.length }} cursos secuenciales que te llevan de
              cero a especialista. Con metodología BIM, casos reales de obra y
              proyectos entregables al final de cada módulo.
            </p>

            <!-- Stats -->
            <div
              class="mt-9 bg-surface-paper border border-line rounded-xl overflow-hidden grid grid-cols-2 md:grid-cols-4"
            >
              <div
                v-for="(s, i) in [
                  {
                    label: 'CURSOS',
                    value: offer.courses.length,
                    accent: true,
                  },
                  {
                    label: 'DURACIÓN',
                    value: `${offer.duration_months} meses`,
                    accent: false,
                  },
                  {
                    label: 'DOCENTES',
                    value: uniqueTeachers.length,
                    accent: false,
                  },
                ]"
                :key="s.label"
                :class="['px-5 py-5', i > 0 && 'border-l border-line']"
              >
                <p
                  class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400"
                >
                  {{ s.label }}
                </p>
                <p
                  :class="[
                    'font-display text-[1.75rem] font-bold mt-1 tracking-tight leading-none',
                    s.accent ? 'text-primary-500' : 'text-secondary-900',
                  ]"
                >
                  {{ s.value }}
                </p>
              </div>
            </div>
          </div>

          <!-- Enroll card (same as single) -->
          <div class="sticky top-24 self-start">
            <div
              class="bg-surface-paper border border-line rounded-xl p-7 shadow-md"
            >
              <div class="flex justify-between items-center mb-4">
                <span
                  class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400"
                  >INVERSIÓN</span
                >
                <!-- El estado se deriva del cupo y de la ventana de matrícula;
                     antes decía "Matrícula abierta" fijo, incluso agotado. -->
                <span
                  v-if="soldOut"
                  class="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wide bg-amber-soft text-amber-DEFAULT rounded-full px-2.5 py-1"
                >
                  Cupo lleno
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-wide rounded-full px-2.5 py-1"
                  :class="offer?.status_class"
                >
                  <span
                    v-if="offer?.status === 'open'"
                    class="w-1.5 h-1.5 rounded-full bg-success-DEFAULT animate-pulse-dot"
                  />
                  {{ offer?.status_label }}
                </span>
              </div>
              <div
                class="font-display text-[3.5rem] font-extrabold text-secondary-900 leading-none tracking-tight"
              >
                S/ {{ priceFormatted }}
              </div>
              <p class="font-body text-[0.8125rem] text-secondary-500 mt-2">
                O en cuotas de S/ {{ installment }} × 6 meses sin intereses.
              </p>
              <div class="flex flex-col gap-2 mt-6">
                <!-- Agotado no ofrece comprar: el botón llevaría a un carrito
                     que el backend rechaza. Se ofrece el asesor en su lugar. -->
                <LandingButton
                  v-if="!soldOut"
                  variant="primary"
                  size="lg"
                  class="w-full justify-center"
                  @click="enroll"
                >
                  {{ inCart ? "Ver mi carrito" : "Inscribirme ahora" }}
                </LandingButton>
                <div
                  v-else
                  class="rounded-adm-md border border-amber-DEFAULT/40 bg-amber-soft px-4 py-3 text-center font-body text-[0.8125rem] leading-relaxed text-secondary-500"
                >
                  Esta cohorte alcanzó su cupo máximo. Escríbenos y te avisamos
                  de la siguiente.
                </div>
                <LandingButton
                  variant="soft"
                  size="md"
                  :arrow="false"
                  class="w-full justify-center"
                  @click="openAdvisor"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                    />
                    <path
                      d="M11.5 2C6.261 2 2 6.261 2 11.5c0 1.852.537 3.576 1.459 5.033L2 22l5.612-1.437A9.5 9.5 0 0011.5 21c5.239 0 9.5-4.261 9.5-9.5S16.739 2 11.5 2z"
                    />
                  </svg>
                  Hablar con un asesor
                </LandingButton>
              </div>
              <div class="mt-6 pt-5 border-t border-line flex flex-col gap-3">
                <div
                  v-for="(item, i) in [
                    `${offer.courses.length} cursos incluidos`,
                    'Acceso a aula virtual 24/7',
                    'Certificado oficial Autodesk ATC',
                    'Bolsa de trabajo Fractal',
                  ]"
                  :key="i"
                  class="flex items-center gap-2.5 font-body text-[0.8125rem] text-secondary-900"
                >
                  <span
                    class="w-4.5 h-4.5 rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  {{ item }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           INSTRUCTOR (single course)
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        v-if="!isPath"
        class="bg-surface-paper border-t border-line px-6 md:px-16 py-20"
      >
        <div class="mb-12">
          <p
            class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500 mb-3"
          >
            01 · Tu instructor
          </p>
          <h2
            class="font-display font-bold text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-secondary-900"
          >
            Aprende con quien<br />lo hace en
            <span class="text-primary-500">obra real</span>.
          </h2>
        </div>

        <div
          class="bg-surface-page border border-line rounded-2xl p-12 grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-14 items-center relative overflow-hidden"
        >
          <div
            class="absolute -right-15 -bottom-15 w-60 h-60 rounded-full bg-accent-soft opacity-50 pointer-events-none"
          />

          <!-- Photo placeholder -->
          <div
            class="relative aspect-[4/5] bg-accent-tint rounded-xl flex items-center justify-center overflow-hidden"
          >
            <div
              class="absolute inset-0"
              style="
                background-image: radial-gradient(
                  #e94e1b26 1px,
                  transparent 1px
                );
                background-size: 14px 14px;
                mask: radial-gradient(circle, black 30%, transparent 70%);
                -webkit-mask: radial-gradient(
                  circle,
                  black 30%,
                  transparent 70%
                );
              "
            />
            <span
              class="relative font-display text-[8.75rem] font-extrabold text-primary-500 leading-none tracking-tight"
            >
              {{ teacherInitials(offer.courses[0]) }}
            </span>
          </div>

          <!-- Info -->
          <div class="relative">
            <!--
              Datos REALES del docente (`teachers`), no el bloque de muestra:
              antes decía "14+ años" y "Senior Trainer · Fractal Studio" para
              cualquiera. Cada línea se omite si el docente no la tiene cargada.
            -->
            <p
              v-if="teacher?.experience_years"
              class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500"
            >
              {{ teacher.experience_years }}+ AÑOS DE EXPERIENCIA
            </p>
            <h3
              class="font-display text-[2.75rem] font-bold text-secondary-900 mt-3.5 mb-1.5 leading-none tracking-tight"
            >
              {{ offer.courses[0]?.teacher }}
            </h3>
            <p
              v-if="teacher?.academic_degree_name"
              class="font-body text-[1.0625rem] text-secondary-500 mb-6"
            >
              {{ teacher.academic_degree_name }}
            </p>
            <p
              v-if="teacher?.description"
              class="font-body text-[1rem] leading-relaxed text-secondary-500 mb-6 max-w-[33.75rem] text-pretty"
            >
              {{ teacher.description }}
            </p>
            <!-- `specialty` es texto libre en la BD, no una lista de tags. -->
            <div v-if="teacher?.specialty" class="flex flex-wrap gap-1.5 mb-6">
              <span
                class="font-mono text-[0.625rem] text-secondary-500 px-2.5 py-1 border border-line rounded-full bg-surface-paper tracking-wide"
                >{{ teacher.specialty }}</span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           ROADMAP (path only)
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        v-if="isPath"
        class="bg-surface-paper border-t border-line px-6 md:px-16 py-[5.625rem]"
      >
        <div class="mb-14">
          <p
            class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500 mb-3"
          >
            01 · Roadmap · Progresión completa
          </p>
          <h2
            class="font-display font-bold text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-secondary-900"
          >
            De cero a <span class="text-primary-500">especialista</span>, paso a
            paso.
          </h2>
          <p class="font-body text-[1rem] text-secondary-500 mt-3 max-w-xl">
            Cada módulo se construye sobre el anterior. No saltas etapas, no
            aprendes a medias.
          </p>
        </div>

        <!-- Roadmap nodes -->
        <div class="relative px-5">
          <div
            class="absolute top-9 left-15 right-15 h-0.5 bg-line pointer-events-none"
          />
          <div
            :class="`grid gap-0`"
            :style="`grid-template-columns: repeat(${offer.courses.length}, 1fr)`"
          >
            <div
              v-for="(c, i) in offer.courses"
              :key="i"
              class="flex flex-col items-center text-center px-2 relative"
            >
              <div
                class="w-18 h-18 rounded-full bg-surface-paper border-[0.188rem] border-primary-500 text-primary-500 flex items-center justify-center font-display text-[1.5rem] font-extrabold tracking-tight shadow-sm relative z-10"
              >
                {{ String(i + 1).padStart(2, "0") }}
              </div>
              <p
                class="font-mono text-[0.5625rem] tracking-widest uppercase text-primary-500 mt-3"
              >
                MÓDULO {{ i + 1 }}
              </p>
              <h4
                class="font-display text-[1rem] font-bold text-secondary-900 mt-1.5 leading-tight tracking-tight text-balance"
              >
                {{ c.name }}
              </h4>
              <p
                class="font-mono text-[0.625rem] text-secondary-400 tracking-wide mt-1"
              >
                44h · 4–6 sem
              </p>
            </div>
          </div>
        </div>

        <!-- Summary strip -->
        <div
          class="mt-14 bg-surface-page border border-line rounded-xl px-7 py-5 flex flex-wrap justify-between items-center gap-6"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-11 h-11 rounded-lg bg-accent-soft text-primary-500 flex items-center justify-center shrink-0"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21" />
              </svg>
            </div>
            <div>
              <p
                class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400"
              >
                RUTA · ESTRUCTURA
              </p>
              <p
                class="font-display text-[1.125rem] font-bold text-secondary-900 mt-0.5 tracking-tight"
              >
                {{ offer.courses.length }} módulos secuenciales
              </p>
            </div>
          </div>
          <div class="flex flex-wrap gap-7">
            <div
              v-for="[l, v] in [
                ['CURSOS', String(offer.courses.length)],
                ['MODALIDAD', 'En vivo'],
              ]"
              :key="l"
            >
              <p
                class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400"
              >
                {{ l }}
              </p>
              <p
                class="font-display text-[0.9375rem] font-bold text-secondary-900 mt-1 tracking-tight"
              >
                {{ v }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           HORARIOS (single course only)
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        v-if="!isPath && offer.courses[0]?.schedules?.length"
        class="bg-surface-page px-6 md:px-16 py-20"
      >
        <div class="mb-12">
          <p
            class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500 mb-3"
          >
            02 · Horarios · Calendario
          </p>
          <h2
            class="font-display font-bold text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-secondary-900"
          >
            Cuándo es y cómo se desarrolla.
          </h2>
        </div>

        <div class="max-w-[40rem]">
          <!-- Schedule list -->
          <div class="bg-surface-paper border border-line rounded-xl p-8">
            <p
              class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400"
            >
              HORARIO SEMANAL · LIMA UTC-5
            </p>
            <div class="mt-4 flex flex-col gap-2.5">
              <div
                v-for="(s, i) in offer.courses[0].schedules"
                :key="i"
                class="flex items-center justify-between px-5 py-4 bg-surface-page border border-line rounded-xl"
              >
                <div class="flex items-center gap-3.5">
                  <div
                    class="w-12 h-12 rounded-lg bg-primary-500 text-white flex flex-col items-center justify-center shrink-0"
                  >
                    <span
                      class="font-mono text-[0.5rem] opacity-80 uppercase tracking-wider"
                      >DÍA</span
                    >
                    <span
                      class="font-display text-[1rem] font-bold leading-none mt-0.5"
                      >{{ s.day.slice(0, 3) }}</span
                    >
                  </div>
                  <div>
                    <p
                      class="font-display text-[1.1875rem] font-bold text-secondary-900 tracking-tight"
                    >
                      {{ s.start_time }} – {{ s.end_time }}
                    </p>
                    <p
                      class="font-body text-[0.75rem] text-secondary-400 mt-0.5"
                    >
                      3 horas · clases en vivo + grabación
                    </p>
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C5BCAD"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           CURSOS INCLUIDOS (path only)
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        v-if="isPath"
        class="bg-surface-cream px-6 md:px-16 py-[5.625rem]"
      >
        <div class="mb-12">
          <p
            class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500 mb-3"
          >
            02 · Cursos incluidos · Detalle
          </p>
          <h2
            class="font-display font-bold text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-secondary-900"
          >
            Lo que aprenderás en cada módulo.
          </h2>
          <p class="font-body text-[1rem] text-secondary-500 mt-3 max-w-xl">
            Cada curso es independiente: docente, horarios, fechas y proyecto
            entregable.
          </p>
        </div>

        <div class="flex flex-col gap-3.5 max-w-[68.75rem] mx-auto">
          <div
            v-for="(c, i) in offer.courses"
            :key="i"
            :class="[
              'bg-surface-paper border rounded-xl overflow-hidden transition-all duration-200',
              openCourse === i ? 'border-primary-500 shadow-sm' : 'border-line',
            ]"
          >
            <button
              class="w-full grid items-center gap-6 px-7 py-6 cursor-pointer"
              style="grid-template-columns: 3.75rem 1fr auto"
              @click="openCourse = openCourse === i ? -1 : i"
            >
              <div
                class="w-15 h-15 rounded-xl bg-primary-500 text-white flex flex-col items-center justify-center shrink-0"
              >
                <span
                  class="font-mono text-[0.5rem] opacity-70 uppercase tracking-wide"
                  >MÓD</span
                >
                <span
                  class="font-display text-[1.375rem] font-extrabold leading-none mt-0.5 tracking-tight"
                  >{{ String(i + 1).padStart(2, "0") }}</span
                >
              </div>

              <div class="text-left">
                <div class="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h4
                    class="font-display text-[1.375rem] font-bold text-secondary-900 tracking-tight"
                  >
                    {{ c.name }}
                  </h4>
                  <span
                    v-for="tag in (c.tags ?? []).slice(0, 2)"
                    :key="tag"
                    class="font-mono text-[0.625rem] text-secondary-400 px-2 py-0.5 border border-line rounded tracking-wide"
                    >{{ tag }}</span
                  >
                </div>
                <div
                  class="flex flex-wrap gap-4 font-body text-[0.8125rem] text-secondary-500"
                >
                  <span class="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#E94E1B"
                      stroke-width="1.6"
                      stroke-linecap="round"
                    >
                      <circle cx="12" cy="8" r="5" />
                      <path d="M5 20a7 7 0 0114 0" />
                    </svg>
                    {{ c.teacher }}
                  </span>
                  <span
                    v-if="c.schedules?.[0]"
                    class="flex items-center gap-1.5"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#E94E1B"
                      stroke-width="1.6"
                      stroke-linecap="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l2 1" />
                    </svg>
                    {{ c.schedules[0].day }} · {{ c.schedules[0].start_time }} –
                    {{ c.schedules[0].end_time }}
                  </span>
                  <span v-if="c.start_date" class="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#E94E1B"
                      stroke-width="1.6"
                      stroke-linecap="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {{
                      new Date(c.start_date)
                        .toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "short",
                        })
                        .toUpperCase()
                    }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3.5 shrink-0">
                <span
                  class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400"
                  >44h</span
                >
                <span
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                    openCourse === i
                      ? 'bg-primary-500 text-white rotate-45'
                      : 'bg-surface-page text-secondary-500',
                  ]"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                </span>
              </div>
            </button>

            <Transition name="fade-down">
              <div
                v-if="openCourse === i"
                class="px-7 pb-7 border-t border-line"
              >
                <div
                  class="pt-5 grid grid-cols-1 md:grid-cols-[3.75rem_1fr_1fr] gap-6"
                >
                  <div class="hidden md:block" />
                  <!-- Topics -->
                  <div>
                    <p
                      class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400 mb-3.5"
                    >
                      QUÉ APRENDERÁS
                    </p>
                    <ul class="flex flex-col gap-2.5">
                      <li
                        v-for="(topic, j) in c.tags?.length
                          ? [
                              `Fundamentos de ${c.tags[0]}`,
                              `Casos prácticos en obra real`,
                              `Proyecto entregable evaluado`,
                              `Talleres en vivo con feedback`,
                            ]
                          : [
                              'Fundamentos teóricos',
                              'Aplicación práctica',
                              'Proyecto entregable',
                              'Talleres en vivo',
                            ]"
                        :key="j"
                        class="flex items-start gap-2.5 font-body text-[0.875rem] text-secondary-900 leading-snug"
                      >
                        <span
                          class="w-5 h-5 rounded-full bg-accent-soft text-primary-500 flex items-center justify-center shrink-0 mt-0.5"
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M3 8l3.5 3.5L13 5"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </span>
                        {{ topic }}
                      </li>
                    </ul>
                  </div>

                  <!-- Module facts -->
                  <div>
                    <p
                      class="font-mono text-[0.5625rem] tracking-widest uppercase text-secondary-400 mb-3.5"
                    >
                      FICHA DEL MÓDULO
                    </p>
                    <div class="grid grid-cols-2 gap-2.5">
                      <div
                        v-for="[label, value, icon] in [
                          ['Duración', '4–6 semanas', 'clock'],
                          [
                            'Frecuencia',
                            c.schedules?.[0]?.day || 'Sáb',
                            'calendar',
                          ],
                          ['Sesiones', '11 en vivo', 'play'],
                          ['Entregable', 'Proyecto final', 'sparkle'],
                        ]"
                        :key="label"
                        class="px-3.5 py-3 bg-surface-page border border-line rounded-xl flex items-center gap-2.5"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#E94E1B"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <template v-if="icon === 'clock'">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l2.5 1.5" />
                          </template>
                          <template v-else-if="icon === 'calendar'">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </template>
                          <template v-else-if="icon === 'play'">
                            <polygon points="5 3 19 12 5 21" />
                          </template>
                          <template v-else>
                            <path
                              d="M12 3l1.5 6H20l-5.25 3.75L16.5 19 12 15.5 7.5 19l1.75-6.25L4 9h6.5z"
                            />
                          </template>
                        </svg>
                        <div>
                          <p
                            class="font-mono text-[0.5rem] tracking-widest uppercase text-secondary-400"
                          >
                            {{ label }}
                          </p>
                          <p
                            class="font-display text-[0.8125rem] font-bold text-secondary-900 mt-0.5"
                          >
                            {{ value }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="mt-3.5 px-3.5 py-3 bg-accent-soft rounded-xl font-body text-[0.75rem] text-primary-600 flex gap-2.5 items-start leading-snug"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#E94E1B"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        class="shrink-0 mt-0.5"
                      >
                        <path
                          d="M12 3l1.5 6H20l-5.25 3.75L16.5 19 12 15.5 7.5 19l1.75-6.25L4 9h6.5z"
                        />
                      </svg>
                      <span
                        ><strong>Solo informativo:</strong> los módulos se
                        desarrollan en secuencia. Las fechas pueden variar por
                        cohorte.</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           INSTRUCTORES MÚLTIPLES (path only)
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        v-if="isPath"
        class="bg-surface-paper border-t border-line px-6 md:px-16 py-[5.625rem]"
      >
        <div class="mb-12">
          <p
            class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500 mb-3"
          >
            05 · Tu equipo docente
          </p>
          <h2
            class="font-display font-bold text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-secondary-900"
          >
            <span class="text-primary-500"
              >{{ uniqueTeachers.length }} expertos</span
            >
            a tu disposición.
          </h2>
          <p class="font-body text-[1rem] text-secondary-500 mt-3 max-w-xl">
            Cada curso lo dicta un docente especializado en su área. Todos
            coordinando obras reales en Perú.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="(name, i) in uniqueTeachers.slice(0, 3)"
            :key="i"
            class="bg-surface-page border border-line rounded-2xl overflow-hidden"
          >
            <!-- Photo area -->
            <div
              class="relative flex items-center justify-center overflow-hidden"
              style="aspect-ratio: 4/3"
              :style="`background: ${
                [
                  ['#FFE3D3', '#E94E1B'],
                  ['#FFF0D6', '#A56E00'],
                  ['#DBF1E9', '#2D9A7D'],
                ][i % 3][0]
              }`"
            >
              <div
                class="absolute inset-0"
                :style="`background-image: radial-gradient(${
                  [
                    ['#FFE3D3', '#E94E1B'],
                    ['#FFF0D6', '#A56E00'],
                    ['#DBF1E9', '#2D9A7D'],
                  ][i % 3][1]
                }26 1px, transparent 1px); background-size: 14px 14px; mask: radial-gradient(circle, black 30%, transparent 70%); -webkit-mask: radial-gradient(circle, black 30%, transparent 70%)`"
              />
              <span
                class="relative font-display font-extrabold leading-none tracking-tight text-[5.5rem]"
                :style="`color: ${
                  [
                    ['#FFE3D3', '#E94E1B'],
                    ['#FFF0D6', '#A56E00'],
                    ['#DBF1E9', '#2D9A7D'],
                  ][i % 3][1]
                }`"
                >{{ initials(name) }}</span
              >
            </div>
            <div class="p-6">
              <h4
                class="font-display text-[1.125rem] font-bold text-secondary-900 tracking-tight"
              >
                {{ name }}
              </h4>
              <!--
                Título y especialidad REALES del docente. Antes decía
                "Senior Trainer · Fractal Studio" para todos, y los tags eran
                los del CURSO, no del profesor.
              -->
              <p
                v-if="
                  offer.courses.find((c) => c.teacher === name)?.teacher_detail
                    ?.academic_degree_name
                "
                class="font-body text-[0.8125rem] text-secondary-500 mt-1"
              >
                {{
                  offer.courses.find((c) => c.teacher === name)?.teacher_detail
                    ?.academic_degree_name
                }}
              </p>
              <div
                v-if="
                  offer.courses.find((c) => c.teacher === name)?.teacher_detail
                    ?.specialty
                "
                class="flex flex-wrap gap-1.5 mt-4"
              >
                <span
                  class="font-mono text-[0.625rem] text-secondary-400 px-2.5 py-1 border border-line rounded-full tracking-wide"
                  >{{
                    offer.courses.find((c) => c.teacher === name)
                      ?.teacher_detail?.specialty
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════════════
           CTA FINAL
           ═══════════════════════════════════════════════════════════════════════════ -->
      <section
        class="bg-surface-paper border-t border-line px-6 md:px-16 py-20"
      >
        <div
          class="bg-primary-500 rounded-2xl px-10 py-16 text-center relative overflow-hidden"
        >
          <div
            class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 pointer-events-none"
          />
          <div
            class="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-white/8 pointer-events-none"
          />
          <div class="relative">
            <p
              class="font-mono text-[0.6875rem] tracking-widest uppercase text-white/70 mb-4"
            >
              CUPOS LIMITADOS
            </p>
            <h2
              class="font-display font-bold text-[clamp(36px,5vw,64px)] leading-[0.98] tracking-tight text-white text-balance mb-4"
            >
              Empieza tu carrera<br />en BIM hoy.
            </h2>
            <p
              class="font-body text-[1.0625rem] text-white/80 max-w-lg mx-auto mb-8 text-pretty"
            >
              Quedan pocos cupos en esta cohorte. Asegura tu lugar e inicia el
              programa con el mejor equipo docente del Perú.
            </p>
            <div class="flex flex-wrap justify-center gap-3">
              <LandingButton
                v-if="!soldOut"
                variant="on-accent"
                size="lg"
                @click="enroll"
              >
                {{ inCart ? "Ver mi carrito" : "Inscribirme ahora" }}
              </LandingButton>
              <LandingButton variant="on-accent-sec" size="lg" :arrow="false">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                  />
                  <path
                    d="M11.5 2C6.261 2 2 6.261 2 11.5c0 1.852.537 3.576 1.459 5.033L2 22l5.612-1.437A9.5 9.5 0 0011.5 21c5.239 0 9.5-4.261 9.5-9.5S16.739 2 11.5 2z"
                  />
                </svg>
                Hablar con un asesor
              </LandingButton>
            </div>
          </div>
        </div>
      </section>
    </template>
  </LandingLayout>
</template>

<style scoped>
.fade-down-enter-active,
.fade-down-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
