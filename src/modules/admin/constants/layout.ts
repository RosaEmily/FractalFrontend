import type { MenuLayout } from "@/shared/interface/layout";
import {
  mdiAccountOutline,
  mdiLockOutline,
  mdiDevices,
  mdiLogoutVariant,
} from "@mdi/js";

export const MENU_LAYOUT: MenuLayout[] = [
  {
    label: "Mi perfil",
    hint: "Información personal",
    icon: mdiAccountOutline,
    to: "profile.show",
    redirect: true,
    name: "profile",
  },
  {
    label: "Cambiar contraseña",
    icon: mdiLockOutline,
    to: "profile.show",
    query: { tab: "security" },
    redirect: true,
    name: "profile.password",
  },
  {
    label: "Sesiones activas",
    icon: mdiDevices,
    to: "profile.show",
    query: { tab: "sessions" },
    redirect: true,
    name: "profile.sessions",
  },
  {
    label: "Cerrar sesión",
    icon: mdiLogoutVariant,
    name: "logout",
  },
];
