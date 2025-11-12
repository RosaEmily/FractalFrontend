<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="bg-white">
    <div class="relative isolate mx-auto max-w-7xl px-16 sm:px-6 md:px-8 lg:px-10">
      <div class="mx-auto max-w-2xl lg:max-w-none py-12 sm:py-16 lg:py-24 text-center">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance text-primary-500 pb-16">
            Docentes <span class="uppercase font-bold">EXPERTOS</span> en el rubro
          </h1>
          <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <div v-for="item in teachers.slice(0, visibleCount)" :key="item.name" class="contents">
              <div class="shadow-lg relative overflow-hidden group">
                <img :src="item.image" :alt="item.name" class="w-full h-96 object-cover object-top"/>
                <div class="absolute bg-black opacity-75 -translate-x-full group-hover:translate-x-0 top-0 left-0 w-full h-full flex items-center justify-center transition-transform duration-500">
                  <div class="relative p-4 text-center">
                    <h3 class="text-lg font-semibold text-primary-400">
                      {{ item.name }}
                    </h3>
                    <p class="mt-1 mb-2 text-sm text-primary-200">
                      {{ item.title }}
                    </p>
                    <p class="mt-1 mb-4 text-sm text-white">
                      {{ item.bio }}
                    </p>
                    <ul>
                      <li class="inline-block mx-1">
                        <a :href="item.linkedinUrl" target="_blank" class="text-primary-200 hover:text-primary-400">
                          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-6 inline-block ml-1">
                            <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" fill-rule="evenodd"></path>
                          </svg>
                        </a>
                      </li>
                      <li class="inline-block mx-1">
                        <a :href="item.otherUrl" target="_blank" class="text-primary-200 hover:text-primary-400">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-7 inline-block ml-1">
                            <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
                          </svg>
                        </a>
                      </li>
                      <li class="inline-block mx-1">
                        <a :href="item.cvUrl" target="_blank" class="text-primary-200 hover:text-primary-400">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="size-7 inline-block ml-1">
                            <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
                            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                          </svg> 
                        </a> 
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="hidden md:flex w-full h-96 p-16 bg-secondary-100 items-center justify-center transition-all duration-300 hover:bg-primary-200 text-primary-500 hover:text-primary-600">
                <span class="font-semibold text-lg uppercase tracking-widest">
                  {{ item.phrase }}
                </span>
              </div>
            </div>
            <div class="col-span-full flex items-center justify-center">
              <button class="uppercase font-semibold text-base tracking-widest w-full p-4 bg-primary-100 hover:bg-primary-200 text-primary-500 hover:text-primary-600 cursor-pointer">
                Ver todos los docentes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'

  type Teacher = {
    name: string
    title: string
    bio: string
    image: string
    linkedinUrl: string
    otherUrl: string
    cvUrl: string
    phrase: string
  }

  defineProps<{ teachers: Teacher[]}>()

  const screenWidth = ref(window.innerWidth)

  onMounted(() => {
    window.addEventListener('resize', () => {
      screenWidth.value = window.innerWidth
    })
  })

  const visibleCount = computed(() => {
    if (screenWidth.value >= 1024) return 5 // lg
    if (screenWidth.value >= 640) return 3 // md
    if (screenWidth.value >= 480) return 4 // sm
    return 3 // xs
  })
</script>
