import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiCertificateOutline,
  mdiFileDocumentOutline,
  mdiStarOutline,
} from "@mdi/js";

/** "Certificación" del diseño: el cierre del ciclo. */
export const MENU_CERTIFICATION: MenuItem[] = [
  {
    id: "certification",
    label: "Certificación",
    icon: mdiCertificateOutline,
    children: [
      {
        id: "certification.certificates",
        label: "Certificados",
        icon: mdiCertificateOutline,
        route: { name: "certificates.list" },
        module: "certificates",
      },
      {
        id: "certification.templates",
        label: "Plantillas",
        icon: mdiFileDocumentOutline,
        route: { name: "certificateTemplates.list" },
        module: "certificateTemplates",
      },
      {
        id: "certification.testimonials",
        label: "Testimonios",
        icon: mdiStarOutline,
        route: { name: "testimonials.list" },
        module: "certification/testimonials",
      },
    ],
  },
];
