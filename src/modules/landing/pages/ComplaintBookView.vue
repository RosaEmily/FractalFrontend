<script setup lang="ts">
/**
 * Libro de Reclamaciones virtual: hoja de reclamación pública.
 *
 * Los datos del proveedor (razón social, RUC, domicilio) salen de Sitio web →
 * Pie de página. La hoja se guarda en la API, que devuelve el código y la fecha
 * límite de respuesta, y envía la constancia por correo.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { Checkbox, InputMask, InputNumber, RadioButton } from 'primevue'
import { z } from 'zod'
import LandingLayout from '../layouts/LandingLayout.vue'
import { InputTextCore, SelectCore, TextAreaCore } from '@/shared/components'
import LabelCore from '@/shared/components/core/label/index.vue'
import MessageCore from '@/shared/components/core/message/index.vue'
import { safeRequest } from '@/shared/utils/request'
import { DOCUMENT_TYPE_OPTIONS } from '@/modules/admin/constants/options'
import { getDocumentRule } from '@/modules/admin/constants/documents'
import { useSiteContact } from '../composables/useSiteContact'
import { offerService } from '../services/offer.service'
import { offerFiltersService } from '../services/offer-filters.service'
import { complaintService } from '../services/complaint.service'
import type { ComplaintReceiptDTO, ComplaintType, ContractedType } from '../dto/complaint.dto'

const { footer } = useSiteContact()

/* ───────── Formulario ───────── */
const blank = () => ({
  type: 'claim' as ComplaintType,
  firstName: '',
  lastName: '',
  documentType: 'DNI',
  documentNumber: '',
  email: '',
  phone: '',
  address: '',
  isMinor: false,
  guardianName: '',
  guardianDocument: '',
  contractedType: 'service' as ContractedType,
  offerId: null as number | null,
  goodDescription: '',
  amount: null as number | null,
  currencyId: null as number | null,
  detail: '',
  consumerRequest: '',
  consent: false,
})
const form = ref(blank())
/* Señuelo anti-bots: un visitante real nunca lo ve, así que nunca lo llena. */
const website = ref('')

const sending = ref(false)
const sendError = ref<string | null>(null)
const receipt = ref<ComplaintReceiptDTO | null>(null)
const submitted = ref(false)

const TYPES: { value: ComplaintType; title: string; text: string }[] = [
  { value: 'claim', title: 'Reclamo', text: 'Disconformidad con el producto o servicio contratado.' },
  { value: 'complaint', title: 'Queja', text: 'Malestar o descontento por la atención, sin pedido concreto.' },
]
const CONTRACTED: { value: ContractedType; title: string }[] = [
  { value: 'service', title: 'Servicio' },
  { value: 'product', title: 'Producto' },
]

/* ───────── Validación ───────── */
const schema = z
  .object({
    firstName: z.string().trim().min(2, 'Escribe tu nombre').max(100, 'Máximo 100 caracteres'),
    lastName: z.string().trim().min(2, 'Escribe tu apellido').max(100, 'Máximo 100 caracteres'),
    documentType: z.string().min(1, 'Elige el tipo de documento'),
    documentNumber: z.string().trim().min(1, 'Escribe tu número de documento'),
    email: z.string().trim().min(1, 'Escribe tu correo').email('Escribe un correo válido').max(150, 'Máximo 150 caracteres'),
    phone: z.string().refine((v) => !v || /^9\d{2} \d{3} \d{3}$/.test(v), 'Escribe un celular de 9 dígitos que empiece con 9'),
    address: z.string().trim().min(5, 'Escribe tu domicilio').max(255, 'Máximo 255 caracteres'),
    isMinor: z.boolean(),
    guardianName: z.string().trim().max(200, 'Máximo 200 caracteres'),
    guardianDocument: z.string().trim().max(20, 'Máximo 20 caracteres'),
    goodDescription: z.string().trim().min(3, 'Describe el bien contratado').max(255, 'Máximo 255 caracteres'),
    amount: z.number().min(0, 'El monto no puede ser negativo').nullable(),
    currencyId: z.number().nullable(),
    detail: z.string().trim().min(20, 'Cuéntanos con más detalle (mínimo 20 caracteres)').max(3000, 'Máximo 3000 caracteres'),
    consumerRequest: z.string().trim().min(10, 'Indica qué solicitas (mínimo 10 caracteres)').max(2000, 'Máximo 2000 caracteres'),
    consent: z.boolean().refine((v) => v, 'Debes aceptar para que podamos atender tu reclamo'),
  })
  .superRefine((v, ctx) => {
    // El documento se valida según su tipo: DNI son 8 dígitos, CE y pasaporte tienen rango.
    const rule = getDocumentRule(v.documentType)
    const n = v.documentNumber.trim()
    if (n) {
      const len = rule.length
      const bad =
        (len && n.length !== len) ||
        (!len && rule.min && n.length < rule.min) ||
        (!len && rule.max && n.length > rule.max) ||
        (rule.numericOnly && !/^\d+$/.test(n))
      if (bad) ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: rule.hint })
    }
    if (v.isMinor) {
      if (!v.guardianName.trim()) ctx.addIssue({ code: 'custom', path: ['guardianName'], message: 'Escribe el nombre del padre, madre o tutor' })
      if (!v.guardianDocument.trim()) ctx.addIssue({ code: 'custom', path: ['guardianDocument'], message: 'Escribe su documento' })
    }
    if (v.amount != null && v.amount > 0 && !v.currencyId) {
      ctx.addIssue({ code: 'custom', path: ['currencyId'], message: 'Elige la moneda' })
    }
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
  errors.value = only ? { ...errors.value, [only]: found[only] } : found
  return result.success
}
function onBlur(field: FieldName) {
  touched.value[field] = true
  validate(field)
}
// Un campo que ya tuvo error se revalida al escribir, para que desaparezca al corregirlo.
watch(form, () => {
  for (const key of Object.keys({ ...errors.value, ...touched.value }) as FieldName[]) validate(key)
}, { deep: true })

// Cambiar el tipo de documento invalida el número ya escrito.
watch(() => form.value.documentType, () => {
  form.value.documentNumber = ''
  delete errors.value.documentNumber
})

const docRule = computed(() => getDocumentRule(form.value.documentType))

/* ───────── Opciones ───────── */
const offerOptions = ref<{ label: string; value: number }[]>([])
const currencyOptions = ref<{ label: string; value: number }[]>([])
onMounted(async () => {
  const [offers, filters] = await Promise.all([
    safeRequest(() => offerService.list({ limit: '50' }), { showAlert: false }),
    safeRequest(() => offerFiltersService.get(), { showAlert: false }),
  ])
  offerOptions.value = (offers.data?.offers ?? []).map((o) => ({ label: o.name, value: o.id }))
  currencyOptions.value = (filters.data?.currencies ?? []).map((c) => ({ label: `${c.symbol} · ${c.name}`, value: c.id }))
  if (currencyOptions.value.length === 1) form.value.currencyId = currencyOptions.value[0]!.value
})

// Elegir un programa propone su nombre como bien contratado, sin pisar lo que ya escribió.
watch(() => form.value.offerId, (id) => {
  const name = offerOptions.value.find((o) => o.value === id)?.label
  if (name && !form.value.goodDescription.trim()) form.value.goodDescription = name
})

/* ───────── Envío ───────── */
async function submit() {
  if (sending.value) return
  if (!validate()) {
    document.querySelector<HTMLElement>('form [aria-invalid="true"], form .p-invalid')?.focus()
    return
  }
  sending.value = true
  sendError.value = null

  const f = form.value
  const { data, error } = await safeRequest(
    () => complaintService.send({
      type: f.type,
      first_name: f.firstName.trim(),
      last_name: f.lastName.trim(),
      document_type: f.documentType,
      document_number: f.documentNumber.trim(),
      email: f.email.trim(),
      // La API guarda el móvil de 9 dígitos, sin prefijo ni espacios (igual que los usuarios).
      phone: f.phone ? f.phone.replace(/\s/g, '') : null,
      address: f.address.trim(),
      is_minor: f.isMinor,
      guardian_name: f.isMinor ? f.guardianName.trim() : null,
      guardian_document: f.isMinor ? f.guardianDocument.trim() : null,
      contracted_type: f.contractedType,
      offer_id: f.offerId,
      good_description: f.goodDescription.trim(),
      amount_claimed: f.amount && f.amount > 0 ? f.amount : null,
      currency_id: f.amount && f.amount > 0 ? f.currencyId : null,
      detail: f.detail.trim(),
      consumer_request: f.consumerRequest.trim(),
      consent: f.consent,
      website: website.value,
    }),
    { showAlert: false },
  )
  sending.value = false

  if (error) {
    const details = error.details && !Array.isArray(error.details)
      ? Object.values(error.details as Record<string, string[]>)[0]?.[0]
      : null
    sendError.value = details ?? error.message ?? 'No pudimos registrar tu hoja. Inténtalo de nuevo.'
    return
  }
  receipt.value = data
  submitted.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function reset() {
  form.value = blank()
  errors.value = {}
  touched.value = {}
  sendError.value = null
  receipt.value = null
  submitted.value = false
}

const formatDate = (iso?: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : ''

const legalName = computed(() => footer.value?.legalName ?? 'FRACTAL STUDIO S.A.C.')
const ruc = computed(() => footer.value?.ruc ?? null)
const legalAddress = computed(() => footer.value?.legalAddress ?? null)

const STEPS = [
  { n: '01', title: 'Completa la hoja', text: 'Cuéntanos qué pasó y qué solución esperas.' },
  { n: '02', title: 'Recibe tu constancia', text: 'Te enviamos un código y una copia a tu correo.' },
  { n: '03', title: 'Te respondemos', text: 'Dentro de 15 días hábiles, por el mismo correo.' },
]
</script>

<template>
  <LandingLayout>
    <section class="bg-surface-page px-6 md:px-16 py-16 md:py-24 relative overflow-hidden">
      <div class="absolute -right-50 -top-1/5 w-150 h-150 rounded-full bg-accent-soft opacity-40 pointer-events-none" />

      <div class="relative grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
        <!-- Izquierda: contexto y datos del proveedor -->
        <div>
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">LIBRO DE RECLAMACIONES · PERÚ</p>
          <h1 class="font-display font-bold text-[clamp(44px,5.5vw,68px)] leading-[0.98] tracking-tight text-secondary-900 text-balance">
            Tu opinión<br><span class="text-primary-500">nos importa</span>.
          </h1>
          <p class="font-body text-[1.0625rem] text-secondary-500 leading-relaxed mt-3 mb-8 max-w-lg text-pretty">
            Si algo no salió como esperabas, regístralo aquí. Cada hoja recibe un código y una respuesta por escrito.
          </p>

          <ol class="flex flex-col gap-3 mb-8">
            <li v-for="s in STEPS" :key="s.n" class="flex gap-4 bg-surface-paper border border-line rounded-lg p-4">
              <span class="font-mono text-[0.75rem] font-semibold text-primary-500 pt-0.5">{{ s.n }}</span>
              <div>
                <p class="font-display font-bold text-[1rem] text-secondary-900 leading-tight">{{ s.title }}</p>
                <p class="font-body text-[0.8125rem] text-secondary-500 mt-0.5">{{ s.text }}</p>
              </div>
            </li>
          </ol>

          <div class="bg-surface-cream border border-line rounded-lg p-5">
            <p class="font-mono text-[0.594rem] tracking-widest uppercase text-secondary-400 mb-2.5">PROVEEDOR</p>
            <p class="font-display font-bold text-[1rem] text-secondary-900">{{ legalName }}</p>
            <p v-if="ruc" class="font-body text-[0.8125rem] text-secondary-500 mt-1">RUC {{ ruc }}</p>
            <p v-if="legalAddress" class="font-body text-[0.8125rem] text-secondary-500">{{ legalAddress }}</p>
          </div>
        </div>

        <!-- Derecha: hoja -->
        <div class="bg-surface-paper border border-line rounded-lg p-6 md:p-10">
          <!-- Constancia -->
          <div v-if="submitted" class="flex flex-col items-center text-center gap-4 py-8">
            <div class="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17L4 12"/></svg>
            </div>
            <p class="font-display font-bold text-[1.375rem] text-secondary-900">Hoja registrada</p>
            <template v-if="receipt">
              <div class="bg-surface-page border border-line rounded-lg px-8 py-4">
                <p class="font-mono text-[0.594rem] tracking-widest uppercase text-secondary-400 mb-1">TU CÓDIGO</p>
                <p class="font-mono text-[1.5rem] font-semibold text-primary-500 tracking-wide">{{ receipt.code }}</p>
              </div>
              <p class="font-body text-[0.9375rem] text-secondary-500 max-w-md">
                Te enviamos una copia a tu correo. Te responderemos a más tardar el
                <strong class="text-secondary-900">{{ formatDate(receipt.due_at) }}</strong>.
              </p>
            </template>
            <p v-else class="font-body text-[0.9375rem] text-secondary-500">Te enviaremos una copia a tu correo.</p>
            <button class="font-mono text-[0.75rem] text-primary-500 uppercase tracking-widest hover:underline mt-2" @click="reset">
              Registrar otra hoja
            </button>
          </div>

          <form v-else novalidate class="flex flex-col gap-8" @submit.prevent="submit">
            <div class="flex justify-between items-center pb-5 border-b border-line">
              <span class="font-display text-[1.375rem] font-bold text-secondary-900 tracking-tight">Hoja de reclamación</span>
              <span class="font-mono text-[0.6875rem] text-secondary-400 uppercase tracking-widest">{{ new Date().toLocaleDateString('es-PE') }}</span>
            </div>

            <!-- Señuelo anti-bots -->
            <div class="sr-only" aria-hidden="true">
              <label>No llenar este campo<input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" /></label>
            </div>

            <!-- 1. Tipo -->
            <fieldset class="flex flex-col gap-3">
              <legend class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3">1 · ¿QUÉ QUIERES REGISTRAR?</legend>
              <div class="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <label
                  v-for="t in TYPES"
                  :key="t.value"
                  class="flex gap-3 items-start border rounded-lg p-4 cursor-pointer transition-colors"
                  :class="form.type === t.value ? 'border-primary-500 bg-accent-soft/40' : 'border-line bg-surface-page hover:border-primary-500/40'"
                >
                  <RadioButton v-model="form.type" :value="t.value" name="type" class="mt-0.5 shrink-0" />
                  <span>
                    <span class="block font-display font-bold text-[1rem] text-secondary-900">{{ t.title }}</span>
                    <span class="block font-body text-[0.75rem] text-secondary-500 leading-snug mt-0.5">{{ t.text }}</span>
                  </span>
                </label>
              </div>
            </fieldset>

            <!-- 2. Consumidor -->
            <fieldset class="flex flex-col gap-3.5">
              <legend class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3">2 · TUS DATOS</legend>
              <div class="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
                <InputTextCore v-model="form.firstName" class="landing-field" label="Nombre" required name="firstName" autocomplete="given-name"
                  :invalid="!!errors.firstName" :message-error="errors.firstName" @blur="onBlur('firstName')" />
                <InputTextCore v-model="form.lastName" class="landing-field" label="Apellido" required name="lastName" autocomplete="family-name"
                  :invalid="!!errors.lastName" :message-error="errors.lastName" @blur="onBlur('lastName')" />
              </div>

              <div class="grid grid-cols-1 xs:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3.5">
                <SelectCore v-model="form.documentType" class="landing-field" label="Tipo de documento" required
                  :options="DOCUMENT_TYPE_OPTIONS" option-label="label" option-value="value" />
                <div class="landing-field">
                  <LabelCore text="Número de documento" html-for="documentNumber" required />
                  <InputMask
                    v-if="docRule.mask"
                    id="documentNumber"
                    v-model="form.documentNumber"
                    :mask="docRule.mask"
                    placeholder="12345678"
                    inputmode="numeric"
                    class="w-full"
                    :invalid="!!errors.documentNumber"
                    @blur="onBlur('documentNumber')"
                  />
                  <InputTextCore
                    v-else
                    v-model="form.documentNumber"
                    :max-length="docRule.max"
                    :invalid="!!errors.documentNumber"
                    @blur="onBlur('documentNumber')"
                  />
                  <MessageCore v-if="errors.documentNumber" :text="errors.documentNumber" severity="error" variant="simple" />
                </div>
              </div>

              <InputTextCore v-model="form.email" class="landing-field" label="Correo electrónico" required name="email" type="email" autocomplete="email"
                placeholder="tu@correo.com" :invalid="!!errors.email" :message-error="errors.email" @blur="onBlur('email')" />

              <div class="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
                <div class="landing-field">
                  <LabelCore text="Celular" html-for="phone" hint="opcional" />
                  <div class="flex">
                    <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-line bg-surface-cream font-mono text-[0.8125rem] text-secondary-500">+51</span>
                    <InputMask id="phone" v-model="form.phone" mask="999 999 999" placeholder="999 999 999" inputmode="tel"
                      autocomplete="tel-national" class="landing-mask" :invalid="!!errors.phone" @blur="onBlur('phone')" />
                  </div>
                  <MessageCore v-if="errors.phone" :text="errors.phone" severity="error" variant="simple" />
                </div>
                <InputTextCore v-model="form.address" class="landing-field" label="Domicilio" required name="address" autocomplete="street-address"
                  placeholder="Av. / Calle, distrito" :invalid="!!errors.address" :message-error="errors.address" @blur="onBlur('address')" />
              </div>

              <label class="flex items-center gap-2.5 font-body text-[0.8125rem] text-secondary-600 cursor-pointer w-fit">
                <Checkbox v-model="form.isMinor" binary input-id="isMinor" />
                Soy menor de edad (la hoja la presenta mi padre, madre o tutor)
              </label>
              <div v-if="form.isMinor" class="grid grid-cols-1 xs:grid-cols-2 gap-3.5 bg-surface-page border border-line rounded-lg p-4">
                <InputTextCore v-model="form.guardianName" class="landing-field" label="Padre, madre o tutor" required
                  :invalid="!!errors.guardianName" :message-error="errors.guardianName" @blur="onBlur('guardianName')" />
                <InputTextCore v-model="form.guardianDocument" class="landing-field" label="Su documento" required
                  :invalid="!!errors.guardianDocument" :message-error="errors.guardianDocument" @blur="onBlur('guardianDocument')" />
              </div>
            </fieldset>

            <!-- 3. Bien contratado -->
            <fieldset class="flex flex-col gap-3.5">
              <legend class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3">3 · BIEN CONTRATADO</legend>

              <div class="flex gap-2" role="radiogroup" aria-label="Tipo de bien contratado">
                <label
                  v-for="c in CONTRACTED"
                  :key="c.value"
                  class="flex-1 flex items-center justify-center gap-2 border rounded-full px-4 py-2.5 cursor-pointer font-body text-[0.875rem] font-medium transition-colors"
                  :class="form.contractedType === c.value ? 'border-primary-500 bg-accent-soft/40 text-secondary-900' : 'border-line bg-surface-page text-secondary-600 hover:border-primary-500/40'"
                >
                  <RadioButton v-model="form.contractedType" :value="c.value" name="contractedType" />
                  {{ c.title }}
                </label>
              </div>

              <div>
                <LabelCore text="Programa" hint="opcional" />
                <SelectCore v-model="form.offerId" class="landing-field" :options="offerOptions" option-label="label" option-value="value"
                  placeholder="— Selecciona el programa —" show-clear filter />
              </div>

              <InputTextCore v-model="form.goodDescription" class="landing-field" label="Descripción" required name="goodDescription"
                placeholder="Ej. Curso AutoCAD 2D y 3D" :invalid="!!errors.goodDescription" :message-error="errors.goodDescription" @blur="onBlur('goodDescription')" />

              <div class="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
                <div class="landing-field">
                  <LabelCore text="Monto reclamado" html-for="amount" hint="opcional" />
                  <InputNumber v-model="form.amount" input-id="amount" :min="0" :min-fraction-digits="2" :max-fraction-digits="2"
                    locale="es-PE" placeholder="0.00" fluid :invalid="!!errors.amount" @blur="onBlur('amount')" />
                  <MessageCore v-if="errors.amount" :text="errors.amount" severity="error" variant="simple" />
                </div>
                <SelectCore v-model="form.currencyId" class="landing-field" label="Moneda" :options="currencyOptions" option-label="label" option-value="value"
                  placeholder="— Moneda —" :invalid="!!errors.currencyId" :message-error="errors.currencyId" />
              </div>
            </fieldset>

            <!-- 4. Detalle -->
            <fieldset class="flex flex-col gap-3.5">
              <legend class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3">4 · DETALLE</legend>
              <div>
                <TextAreaCore v-model="form.detail" class="landing-field" label="¿Qué ocurrió?" required name="detail" :rows="5"
                  placeholder="Describe los hechos con fechas y datos que ayuden a revisar tu caso."
                  :invalid="!!errors.detail" :message-error="errors.detail" @blur="onBlur('detail')" />
                <p class="font-mono text-[0.625rem] text-secondary-400 text-right mt-1">{{ form.detail.length }}/3000</p>
              </div>
              <div>
                <TextAreaCore v-model="form.consumerRequest" class="landing-field" label="¿Qué solicitas?" required name="consumerRequest" :rows="3"
                  placeholder="Ej. Devolución del pago, reprogramación de la clase..."
                  :invalid="!!errors.consumerRequest" :message-error="errors.consumerRequest" @blur="onBlur('consumerRequest')" />
                <p class="font-mono text-[0.625rem] text-secondary-400 text-right mt-1">{{ form.consumerRequest.length }}/2000</p>
              </div>
            </fieldset>

            <!-- Consentimiento + envío -->
            <div class="flex flex-col gap-4">
              <div>
                <label class="flex items-start gap-2.5 font-body text-[0.781rem] text-secondary-600 leading-relaxed cursor-pointer">
                  <Checkbox v-model="form.consent" binary input-id="consent" :invalid="!!errors.consent" class="mt-0.5 shrink-0" />
                  Declaro que los datos son ciertos y autorizo su uso para atender esta hoja de reclamación.
                </label>
                <MessageCore v-if="errors.consent" :text="errors.consent" severity="error" variant="simple" />
              </div>

              <p v-if="sendError" role="alert" class="font-body text-[0.8125rem] text-danger-DEFAULT">{{ sendError }}</p>

              <button
                type="submit"
                :disabled="sending"
                class="w-full flex items-center justify-between px-6 py-4 bg-primary-500 text-white font-body text-[0.9375rem] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait"
              >
                {{ sending ? 'Registrando…' : 'Registrar hoja de reclamación' }}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8H13M9 4L13 8L9 12"/></svg>
              </button>

              <p class="font-body text-[0.719rem] text-secondary-400 text-center">
                La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante INDECOPI.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  </LandingLayout>
</template>
