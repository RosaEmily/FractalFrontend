<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LandingLayout from '../layouts/LandingLayout.vue'
import FaqItem from '../components/blocks/FaqItem.vue'
import ContactIntro from '../components/blocks/ContactIntro.vue'
import type { ContactCard } from '../components/blocks/ContactIntro.vue'
import { Checkbox } from 'primevue'
import { isValidPhone } from '@/shared/components/core/input/phone/countries'
import { z } from 'zod'
import { InputPhoneCore, InputTextCore, SelectCore, TextAreaCore } from '@/shared/components'
import MessageCore from '@/shared/components/core/message/index.vue'
import LabelCore from '@/shared/components/core/label/index.vue'
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

/*
 * Validación del formulario. El teléfono es un celular peruano (9 dígitos que
 * empiezan con 9), que es lo que fuerza la máscara; es opcional, pero si se
 * escribe tiene que estar completo.
 */
const schema = z.object({
  firstName: z.string().trim().min(2, 'Escribe tu nombre').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().trim().min(2, 'Escribe tu apellido').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().min(1, 'Escribe tu correo').email('Escribe un correo válido').max(150, 'Máximo 150 caracteres'),
  phone: z.string().refine((v) => !v || isValidPhone(v), 'Escribe un celular válido'),
  profession: z.string().trim().max(100, 'Máximo 100 caracteres'),
  program: z.string().nullable().optional(),
  message: z.string().trim().min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)').max(2000, 'Máximo 2000 caracteres'),
  consent: z.boolean().refine((v) => v, 'Debes aceptar para que podamos contactarte'),
})
type FieldName = keyof z.infer<typeof schema>

const errors = ref<Partial<Record<FieldName, string>>>({})
const touched = ref<Partial<Record<FieldName, boolean>>>({})

function validate(only?: FieldName): boolean {
  const result = schema.safeParse(form.value)
  const found: Partial<Record<FieldName, string>> = {}
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0] as FieldName
      if (!found[key]) found[key] = issue.message
    }
  }
  if (only) {
    errors.value = { ...errors.value, [only]: found[only] }
  } else {
    errors.value = found
  }
  return result.success
}
/** Valida un campo al salir de él, sin gritarle al visitante mientras todavía escribe. */
function onBlur(field: FieldName) {
  touched.value[field] = true
  validate(field)
}
/** Una vez que el campo tuvo error, se revalida al escribir para que desaparezca al corregirlo. */
watch(form, () => {
  for (const key of Object.keys(errors.value) as FieldName[]) {
    if (errors.value[key] || touched.value[key]) validate(key)
  }
}, { deep: true })

async function submit() {
  if (sending.value) return
  // Todos los campos se marcan, así el visitante ve de una vez lo que le falta.
  if (!validate()) {
    await nextTick()
    document.querySelector<HTMLElement>('form .p-invalid, form .p-inputtext[aria-invalid="true"]')?.focus()
    return
  }
  sending.value = true
  sendError.value = null

  const f = form.value
  const { error } = await safeRequest(
    () => contactMessageService.send({
      first_name: f.firstName.trim(),
      last_name: f.lastName.trim(),
      email: f.email.trim(),
      phone: f.phone || null,
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
  errors.value = {}
  touched.value = {}
  sendError.value = null
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
  const { data } = await safeRequest(() => offerService.list({ limit: '48' }), { showAlert: false })
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
          <ContactIntro
            :eyebrow="heroEyebrow"
            :title="heroTitle"
            :accent="heroAccent"
            :description="heroDescription"
            :cards="contactCards"
          />

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
          <form v-else novalidate @submit.prevent="submit" class="flex flex-col gap-3.5">
            <!-- Señuelo anti-bots: fuera de pantalla y fuera del tabulador -->
            <div class="sr-only" aria-hidden="true">
              <label>No llenar este campo<input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" /></label>
            </div>

            <!-- Name row -->
            <div class="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
              <InputTextCore v-model="form.firstName" class="landing-field" label="Nombre" required name="firstName" autocomplete="given-name"
                placeholder="Diego" :invalid="!!errors.firstName" :message-error="errors.firstName" @blur="onBlur('firstName')" />
              <InputTextCore v-model="form.lastName" class="landing-field" label="Apellido" required name="lastName" autocomplete="family-name"
                placeholder="Vargas" :invalid="!!errors.lastName" :message-error="errors.lastName" @blur="onBlur('lastName')" />
            </div>

            <InputTextCore v-model="form.email" class="landing-field" label="Correo electrónico" required name="email" type="email" autocomplete="email"
              placeholder="diego@ejemplo.com" :invalid="!!errors.email" :message-error="errors.email" @blur="onBlur('email')" />

            <!-- Phone + Profession -->
            <div class="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
              <InputPhoneCore v-model="form.phone" class="landing-field" name="phone" label="Celular" hint-label="opcional" :invalid="!!errors.phone" :message-error="errors.phone" @blur="onBlur('phone')" />
              <InputTextCore v-model="form.profession" class="landing-field" label="Profesión" hint-label="opcional" name="profession"
                placeholder="Arquitecto / Ing. Civil" :invalid="!!errors.profession" :message-error="errors.profession" @blur="onBlur('profession')" />
            </div>

            <!-- Program select -->
            <div>
              <LabelCore text="Programa de interés" hint="opcional" />
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
              <TextAreaCore
                v-model="form.message"
                class="landing-field"
                label="Mensaje"
                required
                name="message"
                :rows="4"
                placeholder="Cuéntanos sobre tu meta profesional…"
                :invalid="!!errors.message"
                :message-error="errors.message"
                @blur="onBlur('message')"
              />
              <p class="font-mono text-[0.625rem] text-secondary-400 text-right mt-1">{{ form.message.length }}/2000</p>
            </div>

            <!-- Consent -->
            <div>
              <label class="flex items-start gap-2.5 font-body text-[0.781rem] text-secondary-600 leading-relaxed cursor-pointer">
                <Checkbox v-model="form.consent" binary input-id="consent" :invalid="!!errors.consent" class="mt-0.5 shrink-0" />
                Acepto recibir información sobre programas, becas y novedades de Fractal Studio.
              </label>
              <MessageCore v-if="errors.consent" :text="errors.consent" severity="error" variant="simple" />
            </div>

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
        <FaqItem
          v-for="(faq, i) in faqs"
          :key="faq.id"
          :question="faq.question"
          :answer="faq.answer"
          :open="openFaq === i"
          @toggle="toggleFaq(i)"
        />
      </div>
    </section>
  </LandingLayout>
</template>
