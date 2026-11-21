import { onBeforeUnmount, ref, watch, type Ref } from "vue";

/**
 * URL temporal (`blob:`) de un archivo elegido, para previsualizarlo antes de
 * guardar. Revoca la anterior al cambiar y al salir, para no filtrar memoria.
 */
export function useObjectUrl(file: Ref<File | null>) {
  const url = ref<string | null>(null);

  const revoke = () => {
    if (url.value) URL.revokeObjectURL(url.value);
    url.value = null;
  };

  watch(
    file,
    (value) => {
      revoke();
      if (value) url.value = URL.createObjectURL(value);
    },
    { immediate: true },
  );

  onBeforeUnmount(revoke);
  return url;
}
