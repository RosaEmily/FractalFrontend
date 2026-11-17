<script setup lang="ts">
/**
 * Hoja de reclamación completa y su respuesta.
 *
 * Lo que escribió el consumidor es de solo lectura (es un registro legal). Lo
 * único que se hace acá es pasar la hoja a "en proceso" o responderla; la
 * respuesta se envía por correo al consumidor y la hoja ya no se vuelve a tocar.
 */
import { computed, ref, watch } from "vue";
import { ButtonCore, ModalCore, TextAreaCore } from "@/shared/components";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import complaintService from "../services/complaint.service";
import { COMPLAINT_STATE_LABEL, COMPLAINT_STATE_TONE } from "../constants/complaint.constant";
import type { Complaint } from "../models/complaint.model";

const props = defineProps<{ complaint: Complaint | null; loading?: boolean }>();
const emit = defineEmits<{ saved: [] }>();
const visible = defineModel<boolean>({ default: false });

const toast = useToastStore();
const response = ref("");
const saving = ref(false);
const error = ref<string | null>(null);

// Cada hoja que se abre parte limpia.
watch(() => props.complaint?.id, () => {
  response.value = "";
  error.value = null;
});

const isAnswered = computed(() => props.complaint?.state === "answered");

const rows = computed(() => {
  const c = props.complaint;
  if (!c) return [];
  return [
    { label: "Consumidor", value: c.fullName },
    { label: "Documento", value: `${c.documentType} ${c.documentNumber}` },
    { label: "Correo", value: c.email },
    { label: "Celular", value: c.phone },
    { label: "Domicilio", value: c.address },
    {
      label: "Menor de edad",
      value: c.isMinor ? `Sí · ${c.guardianName ?? ""} (${c.guardianDocument ?? ""})` : null,
    },
    { label: "Bien contratado", value: `${c.contractedLabel} · ${c.goodDescription}` },
    { label: "Monto reclamado", value: c.amount ? Number(c.amount).toFixed(2) : null },
    { label: "Recibido", value: c.createdAt },
    { label: "Responder antes del", value: c.dueAtLabel },
  ].filter((row) => !!row.value);
});

const send = async (state: "in_progress" | "answered") => {
  const c = props.complaint;
  if (!c || saving.value) return;

  const text = response.value.trim();
  if (state === "answered" && text.length < 10) {
    error.value = "Escribe la respuesta para el consumidor (mínimo 10 caracteres).";
    return;
  }

  error.value = null;
  saving.value = true;
  const { error: apiError } = await safeRequest(() =>
    complaintService.respond(c.id, state === "answered" ? { state, response: text } : { state }),
  );
  saving.value = false;
  if (apiError) return;

  toast.showToastSuccess({
    detail: state === "answered" ? "Respuesta enviada al consumidor." : "La hoja pasó a en proceso.",
  });
  visible.value = false;
  emit("saved");
};
</script>

<template>
  <ModalCore
    v-model="visible"
    header="Hoja de reclamación"
    modal
    dismissable-mask
    :style="{ width: '44rem', maxWidth: '95vw' }"
  >
    <p v-if="loading" class="text-adm-sm text-secondary-400">Cargando…</p>

    <div v-else-if="complaint" class="flex flex-col gap-5">
      <div class="flex flex-wrap items-center gap-3">
        <span class="font-mono text-adm-md font-semibold text-secondary-900">{{ complaint.code }}</span>
        <StatusPill :label="complaint.typeLabel" tone="accent" />
        <StatusPill :label="COMPLAINT_STATE_LABEL[complaint.state]" :tone="COMPLAINT_STATE_TONE[complaint.state]" />
        <StatusPill v-if="complaint.isOverdue" label="Vencido" tone="danger" />
      </div>

      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <div v-for="row in rows" :key="row.label" class="min-w-0">
          <dt class="text-adm-xs uppercase tracking-wider text-secondary-400">{{ row.label }}</dt>
          <dd class="text-adm-base text-secondary-900 break-words">{{ row.value }}</dd>
        </div>
      </dl>

      <div class="border-t border-line pt-4 space-y-4">
        <div>
          <p class="text-adm-xs uppercase tracking-wider text-secondary-400 mb-1">Detalle</p>
          <p class="text-adm-base text-secondary-900 whitespace-pre-line">{{ complaint.detail }}</p>
        </div>
        <div>
          <p class="text-adm-xs uppercase tracking-wider text-secondary-400 mb-1">Lo que solicita</p>
          <p class="text-adm-base text-secondary-900 whitespace-pre-line">{{ complaint.consumerRequest }}</p>
        </div>
      </div>

      <!-- Respondida: solo lectura -->
      <div v-if="isAnswered" class="border-t border-line pt-4">
        <p class="text-adm-xs uppercase tracking-wider text-secondary-400 mb-1">
          Respuesta enviada · {{ complaint.respondedAt }}
        </p>
        <p class="text-adm-base text-secondary-900 whitespace-pre-line bg-admin-bg rounded-adm-md p-3">
          {{ complaint.response }}
        </p>
      </div>

      <!-- Pendiente o en proceso: responder -->
      <div v-else class="border-t border-line pt-4 space-y-3">
        <TextAreaCore
          v-model="response"
          label="Respuesta al consumidor"
          :rows="5"
          placeholder="Se envía por correo al consumidor y la hoja queda cerrada."
          :invalid="!!error"
          :message-error="error ?? undefined"
        />
        <div class="flex flex-wrap justify-end gap-2">
          <ButtonCore
            v-if="complaint.state === 'pending'"
            class="!w-auto"
            severity="secondary"
            outlined
            label="Marcar en proceso"
            :loading="saving"
            @click="send('in_progress')"
          />
          <ButtonCore class="!w-auto" label="Enviar respuesta" :loading="saving" @click="send('answered')" />
        </div>
      </div>
    </div>
  </ModalCore>
</template>
