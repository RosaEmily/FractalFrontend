import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiShimmer,
  mdiBriefcaseOutline,
  mdiStarOutline,
  mdiEmailOutline,
  mdiWeb,
  mdiImageMultipleOutline,
  mdiCardAccountPhoneOutline,
  mdiCogOutline,
  mdiFileDocumentOutline,
  mdiDockBottom,
  mdiMessageTextOutline,
  mdiBookOpenPageVariantOutline,
} from "@mdi/js";

export const MENU_CONTENT: MenuItem[] = [
  {
    id: "content",
    label: "Sitio web",
    icon: mdiShimmer,
    children: [
      // Banners primero: es lo primero que se ve en la landing.
      {
        id: "content.banners",
        label: "Banners",
        icon: mdiImageMultipleOutline,
        route: { name: "banners.list" },
        module: "banners",
      },
      {
        id: "content.sponsors",
        label: "Patrocinadores",
        icon: mdiBriefcaseOutline,
        route: { name: "sponsors.list" },
        module: "sponsors",
      },
      {
        id: "content.kpis",
        label: "KPIs",
        icon: mdiStarOutline,
        route: { name: "kpis.list" },
        module: "kpis",
      },
      {
        id: "content.faqs",
        label: "FAQs",
        icon: mdiEmailOutline,
        route: { name: "faqs.list" },
        module: "faqs",
      },
      {
        id: "content.social",
        label: "Redes sociales",
        icon: mdiWeb,
        route: { name: "socialNetworks.list" },
        module: "socialNetworks",
      },
      {
        id: "content.contacts",
        label: "Contactos",
        icon: mdiCardAccountPhoneOutline,
        route: { name: "contacts.list" },
        module: "contacts",
      },
      {
        id: "content.pages",
        label: "Páginas",
        icon: mdiFileDocumentOutline,
        route: { name: "pages.list" },
        module: "pages",
      },
      {
        id: "content.footer",
        label: "Pie de página",
        icon: mdiDockBottom,
        route: { name: "footer" },
        module: "footer",
      },
      {
        id: "content.contact-messages",
        label: "Mensajes de contacto",
        icon: mdiMessageTextOutline,
        route: { name: "contactMessages.list" },
        module: "contactMessages",
      },
      {
        id: "content.complaints",
        label: "Libro de reclamaciones",
        icon: mdiBookOpenPageVariantOutline,
        route: { name: "complaints.list" },
        module: "complaints",
      },
      {
        id: "content.site-config",
        label: "Configuración SEO",
        icon: mdiCogOutline,
        route: { name: "siteConfig" },
        module: "siteConfig",
      },
    ],
  },
];
