<script setup lang="ts">
import { computed, ref } from "vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import ImageField from "./image-field.vue";
import userService from "@/modules/admin/modules/security/modules/users/services/user.service";

/**
 * Foto de un instructor o estudiante.
 *
 * ⚠️ **La foto vive en `users`, no en el perfil.** `academic/teachers` y
 * `academic/students` solo escriben su propia tabla y ni siquiera aceptan
 * `photo_url`, así que la subida va por `security/users/{user_id}` — que admite
 * el envío parcial (todos sus campos son `sometimes`).
 *
 * Por eso se guarda **al elegir el archivo** y no al enviar el formulario: son
 * dos peticiones a endpoints distintos, y encadenarlas dejaría al usuario sin
 * saber cuál de las dos falló.
 */
const props = defineProps<{
  userId: number | null;
  current: string | null;
  fullName: string;
}>();

const emit = defineEmits<{ (e: "uploaded", url: string | null): void }>();

const toast = useToastStore();
const saving = ref(false);
const preview = ref<string | null>(null);

const initials = computed(() =>
  props.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join(""),
);

const onSelect = async (file: File) => {
  if (!props.userId || saving.value) return;

  saving.value = true;
  const { data, error } = await safeRequest(
    () => userService.update(props.userId as number, { photo_url: file } as never),
    { showAlert: false },
  );
  saving.value = false;

  if (!data) {
    toast.showToastError({ detail: error?.message ?? "No pudimos guardar la foto." });
    return;
  }

  const url = (data as unknown as { photo_url?: string | null }).photo_url ?? null;
  preview.value = url;
  emit("uploaded", url);
  toast.showToastSuccess({ detail: "Foto actualizada correctamente." });
};
</script>

<template>
  <ImageField
    label="Foto de perfil"
    variant="avatar"
    :current="preview ?? current"
    :fallback-text="initials"
    :max-kb="2048"
    accept="image/jpeg,image/png"
    :hint="
      saving
        ? 'Guardando la foto…'
        : 'JPG o PNG, hasta 2 MB. Se guarda al elegirla.'
    "
    @select="onSelect"
  />
</template>
