<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LandingSectionHeader from './ui/LandingSectionHeader.vue'
import LandingButton from './ui/LandingButton.vue'
import TeacherCard from './TeacherCard.vue'
import type { Teacher } from '@/modules/landing/models/teacher.model'

defineProps<{ teachers: Teacher[]; skeleton: boolean }>()
</script>

<template>
  <section class="bg-surface-page py-24">
    <div class="px-6 md:px-16">
      <LandingSectionHeader
        :index="5"
        eyebrow="CLAUSTRO · DOCENTES EN ACTIVO"
        subtitle="Profesionales que diseñan, modelan y coordinan obras BIM en Perú y el extranjero. No solo enseñan: ejercen."
      >
        <template #title>
          Aprende con <span class="text-primary-500 italic">expertos</span><br>que coordinan obras reales.
        </template>
        <template #action>
          <RouterLink to="/instructors">
            <LandingButton variant="secondary" size="md">Ver claustro completo</LandingButton>
          </RouterLink>
        </template>
      </LandingSectionHeader>

      <div class="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Skeleton -->
        <template v-if="skeleton">
          <div v-for="i in 4" :key="i" class="bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm animate-pulse">
            <div class="aspect-4/5 bg-line-soft" />
            <div class="p-5 flex flex-col gap-3">
              <div class="h-4 w-3/4 bg-line rounded" />
              <div class="h-3 w-1/2 bg-line-soft rounded" />
              <div class="flex gap-2 mt-2">
                <div class="h-5 w-12 bg-line-soft rounded" />
                <div class="h-5 w-16 bg-line-soft rounded" />
              </div>
            </div>
          </div>
        </template>

        <!-- Real teachers -->
        <template v-else>
          <TeacherCard
            v-for="(teacher, i) in teachers.slice(0, 4)"
            :key="teacher.document_number"
            :teacher="teacher"
            :index="i"
          />
        </template>
      </div>
    </div>
  </section>
</template>
