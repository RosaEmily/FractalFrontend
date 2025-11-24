<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <footer class="px-6 md:px-16 lg:px-24 xl:px-32 pt-12 items-center w-full text-white bg-primary-500">
    <div class="flex flex-col md:flex-row items-start justify-center gap-10 pb-10 border-b border-primary-400">
        <div class="max-w-full xs:px-12 sm:px-32 text-center md:max-w-96 md:px-0 md:text-left">
            <h1 class="text-2xl font-bold text-white">FRACTAL STUDIO</h1>
            <p class="mt-3 text-sm text-secondary-100">
              Centro Autodesk Authorized Training Center, logra obtener con nosotros reconocimiento internacional.
            </p>
            <div class="flex items-center justify-center md:justify-start gap-4 mt-8 text-primary-100">
              <a v-for="item in social_networks" :key="item.name" :href="item.url" target="_blank" class="hover:-translate-y-0.5 transition-all duration-300">
                <span v-html="item.logo"></span>
              </a>
            </div>
        </div>
        <div class="w-full flex flex-wrap md:flex-nowrap justify-center md:justify-end gap-8 md:gap-12 lg:gap-20 xl:gap-32">
            <div>
                <h2 class="text-lg font-semibold text-primary-100 mb-3">CONTACTO</h2>
                <ul class="text-base text-secondary-100 space-y-2 list-none">
                    <li v-for="item in contact" :key="item.id">{{ item.value }}</li>
                </ul>
            </div>
            <div>
                <h2 class="text-lg font-semibold text-primary-100 mb-3">INFORMACIÓN</h2>
                <ul class="text-base text-secondary-100 space-y-2 list-none">
                    <li><a href="#">Preguntas frecuentes</a></li>
                    <li><a href="#">Comunidad</a></li>
                </ul>
            </div>
            <div>
                <h2 class="text-lg font-semibold text-primary-100 mb-3">COMPAÑÍA</h2>
                <div class="text-base text-secondary-100 space-y-2 list-none">
                    <li><a href="#">Política de privacidad</a></li>
                    <li><a href="#">Términos y condiciones</a></li>
                    <li><a :href="complaints_book" target="_blank">Libro de reclamaciones</a></li>
                </div>
            </div>
        </div>
    </div>
    <p class="pt-4 text-center text-sm md:text-base pb-5">
      Copyright 2025 © Fractal Studio S.A.C. Todos los derechos reservados.
    </p>
  </footer>
</template>

<script setup lang="ts">
  import type { Contact } from '@/types/contact';
  import type { SocialNetwork } from '@/types/social-network';

  defineProps<{ 
    contact: Contact[],
    social_networks: SocialNetwork[],
    complaints_book: string
  }>()
</script>