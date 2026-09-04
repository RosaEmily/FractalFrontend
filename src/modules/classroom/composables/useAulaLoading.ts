import { ref, watch, type Ref } from "vue";

/**
 * Carga por pestaña.
 *
 * En el diseño cada pestaña pide su propio servicio, así que cambiar de tab
 * vuelve a mostrar el esqueleto. Acá eso es real: `run` ejecuta la petición y
 * `loading` refleja su estado, en vez de simular un retardo.
 *
 * Se separa del `loading` de la pantalla porque son dos cosas distintas: la
 * primera carga reemplaza todo, y el cambio de pestaña solo su contenido.
 */
export function useTabLoading<T extends string | number>(initial: T) {
  const tab = ref(initial) as Ref<T>;
  const loading = ref(false);

  /**
   * Corre la carga de la pestaña activa.
   *
   * Se guarda cuál era la pestaña al empezar: si el usuario cambia de tab
   * mientras la petición está en vuelo, la respuesta vieja no debe apagar el
   * esqueleto de la nueva ni pintar datos que ya no corresponden.
   */
  const run = async (loader: (tab: T) => Promise<void>) => {
    const requested = tab.value;
    loading.value = true;

    try {
      await loader(requested);
    } finally {
      if (tab.value === requested) {
        loading.value = false;
      }
    }
  };

  /** Vuelve a cargar cada vez que cambia la pestaña. */
  const onTabChange = (loader: (tab: T) => Promise<void>) => {
    watch(tab, () => run(loader));
  };

  return { tab, loading, run, onTabChange };
}
