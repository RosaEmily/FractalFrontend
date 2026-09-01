import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import { mdiCertificateOutline, mdiFileDocumentOutline } from "@mdi/js";

/** "Certificación" del diseño: el cierre del ciclo. */
export const MENU_CERTIFICATION: MenuItem[] = [
  {
    id: "certification",
    label: "Certificación",
    icon: mdiCertificateOutline,
    roles: ["ADMIN"],
    children: [
      {
        id: "certification.certificates",
        label: "Certificados",
        icon: mdiCertificateOutline,
        roles: ["ADMIN"],
        route: { name: "certificates.list" },
        module: "certificates",
      },
      {
        id: "certification.templates",
        label: "Plantillas",
        icon: mdiFileDocumentOutline,
        roles: ["ADMIN"],
        route: { name: "certificateTemplates.list" },
        module: "certificateTemplates",
      },
    ],
  },
];
