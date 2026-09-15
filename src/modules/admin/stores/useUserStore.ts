import { parseValidUrl } from "@/shared/utils/valid";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user-store", () => {
  // ================================
  // 🔹 STATE
  // ================================
  const firstName = ref("Sandro Daniel "); // Nombre del usuario
  const lastName = ref("Quispe Salinas"); // Apellido del usuario
  const role = ref("Role"); // Rol del usuario (ej: admin, editor, etc.)
  const email = ref(""); // Correo del usuario
  const photo = ref<string | null>(null); // Foto de perfil, por defecto null

  // ================================
  // 🔸 GETTERS
  // ================================
  const fullName = computed(() =>
    `${firstName.value} ${lastName.value}`.trim()
  );

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
    email?: string;
    photo?: string | null;
  }) => {
    if (data.firstName !== undefined) firstName.value = data.firstName;
    if (data.lastName !== undefined) lastName.value = data.lastName;
    if (data.role !== undefined) role.value = data.role;
    if (data.email !== undefined) email.value = data.email;
    if (data.photo !== undefined) photo.value = parseValidUrl(data.photo);
  };

  return {
    // state
    firstName,
    lastName,
    role,
    email,
    photo,

    // getters
    fullName,

    // actions
    setUserData,
  };
});
