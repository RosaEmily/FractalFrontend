<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LandingLayout from '../layouts/LandingLayout.vue'
import { InputTextCore, SelectCore, TextAreaCore } from '@/shared/components'
import { safeRequest } from '@/shared/utils/request'
import { useSiteContact } from '../composables/useSiteContact'
import { offerService } from '../services/offer.service'
import { contactMessageService } from '../services/contact-message.service'

const form = ref({
  firstName: '',
  lastName:  '',
  email:     '',
  phone:     '',
  profession:'',
  program:   '',
  message:   '',
  consent:   true,
})
const sent = ref(false)
const sending = ref(false)
const sendError = ref<string | null>(null)
/* Señuelo anti-bots: un visitante real nunca lo ve, así que nunca lo llena. */
const website = ref('')
const openFaq = ref<number | null>(0)

async function submit() {
  if (sending.value) return
  sending.value = true
  sendError.value = null

  const f = form.value
  const { error } = await safeRequest(
    () => contactMessageService.send({
      first_name: f.firstName.trim(),
      last_name: f.lastName.trim(),
      email: f.email.trim(),
      phone: f.phone.trim() || null,
      profession: f.profession.trim() || null,
      program_interest: f.program || null,
      message: f.message.trim(),
      consent: f.consent,
      website: website.value,
    }),
    { showAlert: false },
  )

  sending.value = false
  if (error) {
    // Un campo mal llenado trae el detalle por campo; si no, el mensaje general.
    const details = error.details && !Array.isArray(error.details)
      ? Object.values(error.details as Record<string, string[]>)[0]?.[0]
      : null
    sendError.value = details ?? error.message ?? 'No pudimos enviar tu mensaje. Inténtalo de nuevo.'
    return
  }
  sent.value = true
}
function resetForm() {
  form.value = { firstName: '', lastName: '', email: '', phone: '', profession: '', program: '', message: '', consent: true }
  sent.value = false
}
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

const { email, phone, address, mailHref, telHref, whatsappHref, faqs, footer } = useSiteContact()

/* Textos del panel (Sitio web → Pie de página); lo de la derecha es el respaldo. */
const cp = computed(() => footer.value?.contactPage)
const heroEyebrow = computed(() => cp.value?.eyebrow ?? 'CONTACTO · LIMA · PERÚ')
const heroTitle = computed(() => cp.value?.title ?? 'Conversa con un')
const heroAccent = computed(() => cp.value?.titleAccent ?? 'asesor académico')
const heroDescription = computed(
  () => cp.value?.description
    ?? 'Cuéntanos sobre tu rol, experiencia y meta profesional. Te ayudamos a elegir el programa correcto y resolvemos dudas de matrícula.',
)
const formNote = computed(() => cp.value?.formNote ?? 'Te responderemos en menos de 24 horas hábiles.')

/*
 * `/contact#faqs` (enlace del pie): la sección solo existe cuando las preguntas
 * ya llegaron del panel, así que el salto se hace al aparecer, no al montar.
 * Si llegan antes de que el router resuelva el hash, el scroll lo cubre acá.
 */
const route = useRoute()
const scrollToFaqs = () =>
  nextTick(() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' }))
// Datos que llegan después de montar la página (primera visita).
watch(
  () => [faqs.value.length, route.hash] as const,
  ([count, hash]) => { if (count && hash === '#faqs') scrollToFaqs() },
)
// Datos que ya estaban en caché (se llegó desde otra página): la sección existe al montar.
onMounted(() => { if (route.hash === '#faqs' && faqs.value.length) scrollToFaqs() })

type ContactCard = { icon: string; label: string; value: string; sub: string; href: string; external?: boolean }

/*
 * Los canales son los que cargó el panel (Sitio web → Contactos): antes estaban
 * escritos acá con una dirección de ejemplo. Un canal sin dato no se pinta.
 */
const contactCards = computed<ContactCard[]>(() => {
  const wa = whatsappHref()
  const cards: (ContactCard | null)[] = [
    email.value && mailHref.value
      ? { icon: 'mail', label: 'EMAIL', value: email.value, sub: cp.value?.emailNote ?? 'Respondemos en menos de 24h', href: mailHref.value }
      : null,
    phone.value && telHref.value
      ? { icon: 'phone', label: 'TELÉFONO', value: phone.value, sub: cp.value?.phoneNote ?? 'Lun a Vie · 9am – 7pm', href: telHref.value }
      : null,
    address.value && mapsHref.value
      ? { icon: 'pin', label: 'SEDE', value: address.value, sub: cp.value?.addressNote ?? 'Ver en el mapa', href: mapsHref.value, external: true }
      : null,
    wa && phone.value
      ? { icon: 'whatsapp', label: 'WHATSAPP', value: phone.value, sub: cp.value?.whatsappNote ?? 'Atención 24/7', href: wa, external: true }
      : null,
  ]
  return cards.filter((c): c is ContactCard => c !== null)
})

const mapsHref = computed(() =>
  address.value
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.value)}`
    : null,
)

/* Los programas del selector son los que están a la venta, más "Otro". */
const programOptions = ref<{ label: string; value: string }[]>([])
onMounted(async () => {
  const { data } = await safeRequest(() => offerService.list({ limit: '50' }), { showAlert: false })
  programOptions.value = [
    ...(data?.offers ?? []).map((o) => ({ label: o.name, value: o.name })),
    { label: 'Otro / aún no decido', value: 'Otro / aún no decido' },
  ]
})
</script>

<template>
  <LandingLayout>
    <!-- Hero + Form section -->
    <section class="bg-surface-page px-6 md:px-16 py-16 md:py-24 relative overflow-hidden">
      <!-- Decorative circle -->
      <div class="absolute -right-50 -top-1/5 w-150 h-150 rounded-full bg-accent-soft opacity-40 pointer-events-none" />

      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-16">
        <!-- Left: info + cards + map -->
        <div>
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">{{ heroEyebrow }}</p>
          <h1 class="font-display font-bold text-[clamp(48px,6vw,72px)] leading-[0.98] tracking-tight text-secondary-900 text-balance">
            {{ heroTitle }}<br><span class="text-primary-500">{{ heroAccent }}</span>.
          </h1>
          <p class="font-body text-[1.0625rem] text-secondary-500 leading-relaxed mt-3 mb-9 max-w-lg text-pretty">
            {{ heroDescription }}
          </p>

          <!-- Contact cards 2x2 -->
          <div class="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-7">
            <a
              v-for="c in contactCards"
              :key="c.label"
              :href="c.href"
              :target="c.external ? '_blank' : undefined"
              :rel="c.external ? 'noopener' : undefined"
              class="bg-surface-paper border border-line rounded-lg p-5 hover:border-primary-500/40 hover:shadow-sm transition-all duration-200"
            >
              <div class="flex justify-between items-start mb-2.5">
                <span class="font-mono text-[0.594rem] tracking-widest uppercase text-secondary-400">{{ c.label }}</span>
                <div class="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-primary-500 shrink-0">
                  <svg v-if="c.icon === 'mail'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7L12 13L22 7"/>
                  </svg>
                  <svg v-else-if="c.icon === 'phone'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 4L7 4L9 9L7 11C8 14 10 16 13 17L15 15L20 17L20 21C17 22 10 20 7 16C4 12 3 8 3 4Z"/>
                  </svg>
                  <svg v-else-if="c.icon === 'pin'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22S20 14 20 9A8 8 0 1 0 4 9C4 14 12 22 12 22Z"/><circle cx="12" cy="9" r="3"/>
                  </svg>
                  <svg v-else-if="c.icon === 'whatsapp'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21L4.5 16.5C2 12 4 6 9 4S20 6 20 12C20 17 14 21 9 18.5L3 21Z"/>
                  </svg>
                </div>
              </div>
              <div class="font-display text-[1rem] font-bold text-secondary-900 leading-tight mb-1 break-anywhere">{{ c.value }}</div>
              <div class="font-body text-[0.75rem] text-secondary-400">{{ c.sub }}</div>
            </a>
          </div>

          <!-- Map placeholder: ilustración; el enlace real es "Cómo llegar". -->
          <div v-if="address" class="bg-surface-paper border border-line rounded-lg overflow-hidden relative" style="height: 220px">
            <svg width="100%" height="100%" viewBox="0 0 600 220" class="absolute inset-0" style="background: #F4EBD9">
              <!-- Blocks -->
              <g fill="#FFFFFF" stroke="#EBE2D0" stroke-width="1">
                <rect x="40" y="30" width="80" height="50" rx="3"/>
                <rect x="140" y="20" width="60" height="40" rx="3"/>
                <rect x="40" y="100" width="60" height="40" rx="3"/>
                <rect x="120" y="100" width="80" height="60" rx="3"/>
                <rect x="220" y="20" width="60" height="60" rx="3"/>
                <rect x="300" y="30" width="70" height="50" rx="3"/>
                <rect x="220" y="100" width="80" height="60" rx="3"/>
                <rect x="320" y="100" width="60" height="50" rx="3"/>
                <rect x="400" y="20" width="80" height="40" rx="3"/>
                <rect x="400" y="80" width="60" height="60" rx="3"/>
                <rect x="480" y="40" width="70" height="80" rx="3"/>
                <rect x="40" y="160" width="100" height="50" rx="3"/>
                <rect x="160" y="170" width="70" height="40" rx="3"/>
                <rect x="250" y="170" width="80" height="40" rx="3"/>
                <rect x="350" y="160" width="100" height="50" rx="3"/>
                <rect x="470" y="140" width="80" height="70" rx="3"/>
              </g>
              <!-- Streets -->
              <g stroke="#EBE2D0" stroke-width="6" stroke-opacity="0.6">
                <line x1="0" y1="90" x2="600" y2="90"/>
                <line x1="0" y1="155" x2="600" y2="155"/>
                <line x1="125" y1="0" x2="125" y2="220"/>
                <line x1="290" y1="0" x2="290" y2="220"/>
                <line x1="450" y1="0" x2="450" y2="220"/>
              </g>
            </svg>

            <!-- Pin label -->
            <div class="absolute" style="top: 38%; left: 52%; transform: translate(-50%, -100%)">
              <div class="flex flex-col items-center gap-1.5">
                <div class="bg-primary-500 text-white px-3.5 py-1.5 rounded-full font-body text-[0.781rem] font-semibold flex items-center gap-2 shadow-md">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22S20 14 20 9A8 8 0 1 0 4 9C4 14 12 22 12 22Z"/><circle cx="12" cy="9" r="3"/>
                  </svg>
                  Fractal Studio
                </div>
                <div class="w-4 h-4 rounded-full bg-primary-500 border-3 border-white shadow-lg animate-pulse-dot" />
              </div>
            </div>

            <span class="absolute bottom-3 left-3.5 font-mono text-[0.594rem] tracking-widest uppercase text-secondary-400">
              {{ address }}
            </span>

            <!-- Directions button -->
            <a :href="mapsHref ?? undefined" target="_blank" rel="noopener" class="absolute top-3 right-3 px-3 py-1.5 bg-surface-paper border border-line rounded-full font-body text-[0.75rem] font-medium text-secondary-700 hover:bg-surface-cream transition-colors flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8H13M9 4L13 8L9 12"/>
              </svg>
              Cómo llegar
            </a>
          </div>
        </div>

        <!-- Right: form card -->
        <div class="bg-surface-paper border border-line rounded-lg p-10 self-start">
          <!-- Form header -->
          <div class="flex justify-between items-center pb-5 mb-7 border-b border-line">
            <span class="font-display text-[1.375rem] font-bold text-secondary-900 tracking-tight">Envíanos un mensaje</span>
            <span class="flex items-center gap-2 font-body text-[0.75rem] font-medium text-secondary-600 bg-surface-page border border-line px-3 py-1 rounded-full">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
              En línea
            </span>
          </div>

          <!-- Success state -->
          <div v-if="sent" class="flex flex-col items-center text-center gap-4 py-8">
            <div class="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17L4 12"/>
              </svg>
            </div>
            <p class="font-display font-bold text-[1.25rem] text-secondary-900">¡Mensaje recibido!</p>
            <p class="font-body text-[0.9375rem] text-secondary-500">Un asesor de Fractal Studio te contactará en las próximas 24 horas.</p>
            <button @click="resetForm" class="font-mono text-[0.75rem] text-primary-500 uppercase tracking-widest hover:underline mt-2">
              Enviar otro mensaje
            </button>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="submit" class="flex flex-col gap-3.5">
            <!-- Señuelo anti-bots: fuera de pantalla y fuera del tabulador -->
            <div class="sr-only" aria-hidden="true">
              <label>No llenar este campo<input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" /></label>
            </div>

            <!-- Name row -->
            <div class="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
              <div>
                <label class="block font-body text-[0.8125rem] font-medium text-secondary-700 mb-1.5">Nombre</label>
                <InputTextCore v-model="form.firstName" class="landing-field" required type="text" placeholder="Diego" />
              </div>
              <div>
                <label class="block font-body text-[0.8125rem] font-medium text-secondary-700 mb-1.5">Apellido</label>
                <InputTextCore v-model="form.lastName" class="landing-field" required type="text" placeholder="Vargas" />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block font-body text-[0.8125rem] font-medium text-secondary-700 mb-1.5">Correo electrónico</label>
              <InputTextCore v-model="form.email" class="landing-field" required type="email" placeholder="diego@ejemplo.com" />
            </div>

            <!-- Phone + Profession -->
            <div class="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
              <div>
                <label class="block font-body text-[0.8125rem] font-medium text-secondary-700 mb-1.5">Teléfono</label>
                <InputTextCore v-model="form.phone" class="landing-field" type="tel" placeholder="+51 ..." />
              </div>
              <div>
                <label class="block font-body text-[0.8125rem] font-medium text-secondary-700 mb-1.5">Profesión</label>
                <InputTextCore v-model="form.profession" class="landing-field" type="text" placeholder="Arquitecto / Ing. Civil" />
              </div>
            </div>

            <!-- Program select -->
            <div>
              <label class="block font-body text-[0.8125rem] font-medium text-secondary-700 mb-1.5">Programa de interés</label>
              <SelectCore
                v-model="form.program"
                class="landing-field"
                :options="programOptions"
                option-label="label"
                option-value="value"
                placeholder="— Selecciona un programa —"
                show-clear
              />
            </div>

            <!-- Message -->
            <div>
              <label class="block font-body text-[0.8125rem] font-medium text-secondary-700 mb-1.5">Mensaje</label>
              <TextAreaCore
                v-model="form.message"
                class="landing-field"
                :rows="4"
                placeholder="Cuéntanos sobre tu meta profesional…"
              />
            </div>

            <!-- Consent -->
            <label class="flex items-start gap-2.5 font-body text-[0.781rem] text-secondary-600 leading-relaxed cursor-pointer">
              <span
                class="w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors"
                :class="form.consent ? 'bg-primary-500 border-primary-500' : 'bg-surface-page border-line'"
                @click="form.consent = !form.consent"
              >
                <svg v-if="form.consent" width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1 4.5L3.5 7L8 1.5" stroke="#FFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              Acepto recibir información sobre programas, becas y novedades de Fractal Studio.
            </label>

            <p v-if="sendError" role="alert" class="font-body text-[0.8125rem] text-danger-DEFAULT">
              {{ sendError }}
            </p>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="sending"
              class="w-full flex items-center justify-between px-6 py-4 bg-primary-500 text-white font-body text-[0.9375rem] font-semibold rounded-lg hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 disabled:cursor-wait"
            >
              {{ sending ? 'Enviando…' : 'Enviar consulta' }}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8H13M9 4L13 8L9 12"/>
              </svg>
            </button>

            <p class="font-body text-[0.719rem] text-secondary-400 text-center">
              {{ formNote }}
            </p>
          </form>
        </div>
      </div>
    </section>

    <!-- FAQ section: las preguntas del panel (Sitio web → FAQ). Sin ninguna, no hay sección. -->
    <section v-if="faqs.length" id="faqs" class="scroll-mt-20 bg-surface-paper border-t border-line px-6 md:px-16 py-24">
      <div class="text-center mb-12">
        <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">FAQ · PREGUNTAS FRECUENTES</p>
        <h2 class="font-display font-bold text-[clamp(36px,4.5vw,52px)] leading-[1.05] tracking-tight text-secondary-900 text-balance">
          Resolvemos tus dudas antes de matricularte.
        </h2>
      </div>

      <div class="max-w-4xl mx-auto flex flex-col gap-3">
        <div
          v-for="(faq, i) in faqs"
          :key="faq.id"
          class="bg-surface-paper rounded-lg px-6 py-5 transition-all duration-200"
          :class="openFaq === i ? 'border border-primary-500 shadow-sm' : 'border border-line'"
        >
          <button
            @click="toggleFaq(i)"
            class="w-full flex items-center justify-between gap-4 text-left"
          >
            <span class="font-display text-[1.0625rem] font-semibold text-secondary-900 tracking-tight">{{ faq.question }}</span>
            <span
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-250"
              :class="openFaq === i ? 'bg-primary-500 text-white rotate-45' : 'bg-surface-page text-secondary-900 border border-line'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5V19M5 12H19"/>
              </svg>
            </span>
          </button>
          <p v-if="openFaq === i" class="font-body text-[0.906rem] text-secondary-500 leading-relaxed mt-3.5 max-w-3xl">
            {{ faq.answer }}
          </p>
        </div>
      </div>
    </section>
  </LandingLayout>
</template>
