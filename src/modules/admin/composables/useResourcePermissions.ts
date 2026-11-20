import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/useUserStore";
import { resourceForRoute } from "../constants/permissions";

/**
 * Qué puede hacer el usuario con el recurso de la pantalla actual: crear,
 * editar (incluye cambiar el estado) y eliminar. Se deduce del nombre de la
 * ruta (`roles.list` → `ROLES`), igual que el guard.
 *
 * Una pantalla cuyo nombre no corresponde a un recurso conocido no ofrece
 * ninguna acción: es preferible un botón de menos que uno que responde 403.
 *
 * ⚠️ Es UX. La API autoriza cada petición por su cuenta.
 */
export const useResourcePermissions = () => {
  const route = useRoute();
  const user = useUserStore();

  const allowed = (action: string) =>
    computed(() => {
      const resource = resourceForRoute(route.name);
      return resource ? user.can(`${resource}_${action}`) : false;
    });

  return {
    canCreate: allowed("CREATE"),
    canUpdate: allowed("UPDATE"),
    canDelete: allowed("DELETE"),
  };
};
