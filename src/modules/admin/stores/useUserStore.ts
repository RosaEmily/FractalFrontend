import { parseValidUrl } from "@/shared/utils/valid";
import { hasPermission } from "@/shared/utils/permissions";
import { getSessionPermissions } from "@/shared/utils/session";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user-store", () => {
  // ================================
  // 🔹 STATE
  // ================================
  const firstName = ref("Sandro Daniel "); // Nombre del usuario
  const lastName = ref("Quispe Salinas"); // Apellido del usuario
  /*
   * Rol principal, el que se muestra en la UI. Vacío hasta que llega el perfil:
   * antes decía "Role" y ese texto en inglés se veía en la cabecera mientras
   * cargaba (el `v-if` del chip ya lo oculta si no hay valor).
   */
  const role = ref("");
  /** Descripción del rol principal ("Administrador del sistema"): lo que entiende quien no conoce el código. */
  const roleDescription = ref("");
  /** Todos los roles del usuario: el menú se filtra con la lista completa. */
  const roles = ref<string[]>([]);
  /**
   * Permisos del panel (`["*"]` para ADMIN). Solo decide qué se muestra: la API
   * autoriza cada petición por su cuenta.
   */
  const permissions = ref<string[]>(getSessionPermissions("admin") ?? []);
  const email = ref(""); // Correo del usuario
  const photo = ref<string | null>(null); // Foto de perfil, por defecto null

  // ================================
  // 🔸 GETTERS
  // ================================
  const fullName = computed(() =>
    `${firstName.value} ${lastName.value}`.trim()
  );

  /** ¿Tiene alguno de los permisos pedidos? Sin permiso pedido, sí. */
  const can = (required?: string | readonly string[] | null): boolean =>
    hasPermission(permissions.value, required);

  // ================================
  // 🔹 ACTIONS
  // ================================
  /**
   * Asigna datos parciales al usuario
   */
  const setUserData = (data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    roleDescription?: string;
    roles?: string[];
    permissions?: string[];
    email?: string;
    photo?: string | null;
  }) => {
    if (data.firstName !== undefined) firstName.value = data.firstName;
    if (data.lastName !== undefined) lastName.value = data.lastName;
    if (data.role !== undefined) role.value = data.role;
    if (data.roleDescription !== undefined) roleDescription.value = data.roleDescription;
    if (data.roles !== undefined) roles.value = data.roles;
    if (data.permissions !== undefined) permissions.value = data.permissions;
    if (data.email !== undefined) email.value = data.email;
    if (data.photo !== undefined) photo.value = parseValidUrl(data.photo);
  };

  return {
    // state
    firstName,
    lastName,
    role,
    roleDescription,
    roles,
    permissions,
    email,
    photo,

    // getters
    fullName,
    can,

    // actions
    setUserData,
  };
});
