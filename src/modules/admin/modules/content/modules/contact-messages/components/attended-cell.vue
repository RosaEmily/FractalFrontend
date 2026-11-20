<script setup lang="ts">
/**
 * Estado de un mensaje (Nuevo / Atendido), que se cambia con un clic.
 *
 * Guarda su propio estado porque la fila que pinta la tabla no es reactiva
 * para esta celda: sin él, el cambio llegaría a la API pero el chip seguiría
 * mostrando el valor anterior hasta recargar.
 */
import { ref } from "vue";
import StatusPill from "@/modules/admin/components/ui/status-pill.vue";
import { safeRequest } from "@/shared/utils/request";
import { useUserStore } from "@/modules/admin/stores/useUserStore";
import contactMessageService from "../services/contact-message.service";

const props = defineProps<{ id: number; attended: boolean }>();

const isAttended = ref(props.attended);
const saving = ref(false);
// Marcar como atendido edita el mensaje: sin ese permiso el estado solo se lee.
const canUpdate = useUserStore().can("CONTACT_MESSAGES_UPDATE");

const toggle = async () => {
  if (saving.value || !canUpdate) return;
  const next = !isAttended.value;
  saving.value = true;
  const { error } = await safeRequest(() => contactMessageService.attended([props.id], next ? 1 : 0));
  saving.value = false;
  if (!error) isAttended.value = next;
};
</script>

<template>
  <button
    type="button"
    class="cursor-pointer disabled:opacity-60"
    :disabled="saving || !canUpdate"
    :title="isAttended ? 'Marcar como pendiente' : 'Marcar como atendido'"
    :aria-label="isAttended ? 'Atendido, marcar como pendiente' : 'Nuevo, marcar como atendido'"
    @click.stop="toggle"
  >
    <StatusPill
      :label="isAttended ? 'Atendido' : 'Nuevo'"
      :tone="isAttended ? 'success' : 'warning'"
    />
  </button>
</template>
