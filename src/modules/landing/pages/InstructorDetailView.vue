<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import LandingLayout from "../layouts/LandingLayout.vue";
import LandingButton from "../components/ui/LandingButton.vue";
import { useTeacherDetailStore } from "../stores/useTeacherDetailStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { shortTime } from "@/shared/utils/format";

const route = useRoute();
const store = useTeacherDetailStore();
const toastStore = useToastStore();

const teacher = computed(() => store.data);

function initials() {
  const t = teacher.value;
  if (!t) return "";
  return `${t.first_name?.[0] ?? ""}${t.last_name?.[0] ?? ""}`.toUpperCase();
}

/** `specialty` es texto libre separado por coma en la BD, no una lista. */
const specialtyList = computed(() => {
  const t = teacher.value;
  if (!t) return [];
  return (t.specialty ?? "").split(",").map((s) => s.trim()).filter(Boolean);
});

function loadTeacher() {
  const documentNumber = String(route.params.documentNumber ?? "");
  if (documentNumber) store.fetch(documentNumber);
}

watch(
  () => store.error,
  (err) => {
    if (err) toastStore.showToastError({ detail: err });
  },
);
onMounted(loadTeacher);
</script>

<template>
  <LandingLayout>
    <!-- SKELETON -->
    <template v-if="store.loading">
      <div class="bg-surface-page px-6 md:px-16 py-10 animate-pulse">
        <div class="h-4 w-48 bg-line rounded mb-8" />
        <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12">
          <div class="aspect-4/5 bg-line rounded-xl" />
          <div class="flex flex-col gap-4">
            <div class="h-6 w-56 bg-line rounded-full" />
            <div class="h-16 w-3/4 bg-line rounded" />
            <div class="h-4 w-full bg-line rounded" />
            <div class="h-4 w-5/6 bg-line rounded" />
          </div>
        </div>
      </div>
    </template>

    <!-- ERROR -->
    <template v-else-if="store.error && !teacher">
      <div class="bg-surface-page px-6 md:px-16 py-32 flex flex-col items-center justify-center gap-4 text-center">
        <p class="font-display font-bold text-[1.5rem] text-secondary-900">
          No se pudo cargar el docente
        </p>
        <p class="font-body text-[0.9375rem] text-secondary-500">
          {{ store.error }}
        </p>
        <RouterLink to="/instructors">
          <LandingButton variant="primary" size="md">Volver a instructores</LandingButton>
        </RouterLink>
      </div>
    </template>

    <template v-else-if="teacher">
      <!-- Breadcrumb -->
      <div class="bg-surface-page px-6 md:px-16 pt-5">
        <nav class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 flex items-center gap-2">
          <RouterLink to="/instructors" class="hover:text-secondary-900 transition-colors">Instructores</RouterLink>
          <span>/</span>
          <span class="text-secondary-900">{{ teacher.first_name.toUpperCase() }} {{ teacher.last_name.toUpperCase() }}</span>
        </nav>
      </div>

      <!-- HERO -->
      <section class="bg-surface-page px-6 md:px-16 pt-9 pb-18">
        <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 items-start">
          <!-- Photo / Placeholder -->
          <div class="relative aspect-4/5 bg-accent-tint rounded-xl flex items-center justify-center overflow-hidden">
            <div
              class="absolute inset-0"
              style="
                background-image: radial-gradient(#e94e1b26 1px, transparent 1px);
                background-size: 14px 14px;
                mask: radial-gradient(circle, black 30%, transparent 70%);
                -webkit-mask: radial-gradient(circle, black 30%, transparent 70%);
              "
            />
            <img
              v-if="teacher.photo_url"
              :src="teacher.photo_url"
              :alt="`${teacher.first_name} ${teacher.last_name}`"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              class="absolute inset-0 w-full h-full object-cover object-top z-10"
            />
            <span class="relative font-display text-[7.5rem] font-extrabold text-primary-500 leading-none tracking-tight">
              {{ initials() }}
            </span>
          </div>

          <!-- Info -->
          <div>
            <p
              v-if="teacher.experience_years || teacher.academic_degree_name"
              class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500"
            >
              <template v-if="teacher.academic_degree_name">{{ teacher.academic_degree_name.toUpperCase() }} · </template>{{ teacher.experience_years }}+ AÑOS DE EXPERIENCIA
            </p>
            <h1 class="font-display font-bold text-[clamp(40px,5vw,60px)] leading-[0.98] tracking-tight mt-3.5 mb-2 text-secondary-900">
              {{ teacher.first_name }} {{ teacher.last_name }}<span class="text-primary-500">.</span>
            </h1>

            <div v-if="specialtyList.length" class="flex flex-wrap gap-1.5 mt-5">
              <span
                v-for="s in specialtyList"
                :key="s"
                class="font-mono text-[0.6875rem] text-secondary-500 px-2.5 py-1 bg-surface-paper border border-line rounded-full tracking-wide"
              >{{ s }}</span>
            </div>

            <p
              v-if="teacher.description"
              class="font-body text-[1rem] leading-relaxed text-secondary-500 mt-6 max-w-[38.75rem] text-pretty"
            >
              {{ teacher.description }}
            </p>

            <!-- Enlaces sociales: solo LinkedIn y "otro" existen en `social_networks`; el diseño asume mail/website que no tienen columna real. -->
            <div v-if="teacher.social_networks?.linkedin || teacher.social_networks?.other" class="flex gap-2.5 mt-7">
              <a
                v-if="teacher.social_networks.linkedin"
                :href="teacher.social_networks.linkedin"
                target="_blank"
                class="w-10 h-10 rounded-full bg-surface-paper border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" fill-rule="evenodd"/>
                </svg>
              </a>
              <a
                v-if="teacher.social_networks.other"
                :href="teacher.social_networks.other"
                target="_blank"
                class="w-10 h-10 rounded-full bg-surface-paper border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- KPIs -->
      <section class="bg-surface-paper border-t border-b border-line px-6 md:px-16">
        <div class="grid grid-cols-1 sm:grid-cols-3">
          <div
            v-for="(k, i) in [
              { label: 'AÑOS DE EXPERIENCIA', value: `${teacher.experience_years}+` },
              { label: 'CURSOS QUE DICTA', value: teacher.courses_count },
              { label: 'PROGRAMAS ASOCIADOS', value: teacher.programs_count },
            ]"
            :key="k.label"
            :class="['py-8 text-center', i > 0 && 'sm:border-l border-line']"
          >
            <div class="font-display text-[2.25rem] font-extrabold text-secondary-900 tracking-tight">{{ k.value }}</div>
            <p class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mt-1.5">{{ k.label }}</p>
          </div>
        </div>
      </section>

      <!-- Cursos que dicta -->
      <section v-if="teacher.courses.length" class="bg-surface-page px-6 md:px-16 py-20">
        <div class="mb-10">
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-primary-500 mb-3">01 · Cursos que dicta</p>
          <h2 class="font-display font-bold text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-secondary-900">
            Programas donde <span class="text-primary-500">{{ teacher.first_name }}</span> enseña.
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="(c, i) in teacher.courses"
            :key="i"
            class="bg-surface-paper border border-line rounded-xl p-6.5"
          >
            <p v-if="c.program_name" class="font-mono text-[0.594rem] tracking-widest uppercase text-secondary-400">
              {{ c.program_prefix ? `${c.program_prefix} · ` : "" }}{{ c.program_name.toUpperCase() }}
            </p>
            <h3 class="font-display text-[1.1875rem] font-bold text-secondary-900 mt-2 mb-2.5 tracking-tight">{{ c.name }}</h3>
            <div v-if="c.tags.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in c.tags"
                :key="tag"
                class="font-mono text-[0.625rem] text-secondary-500 px-2 py-0.5 border border-line rounded tracking-wide"
              >{{ tag }}</span>
            </div>
            <div
              v-if="c.schedules[0]"
              class="flex items-center gap-2 mt-4 pt-3.5 border-t border-line font-body text-[0.8125rem] text-secondary-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5BCAD" stroke-width="1.6" stroke-linecap="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l2 1"/>
              </svg>
              {{ c.schedules[0].day }} {{ shortTime(c.schedules[0].start_time) }}–{{ shortTime(c.schedules[0].end_time) }}
            </div>
          </div>
        </div>
      </section>
    </template>
  </LandingLayout>
</template>
