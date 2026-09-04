import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";

/**
 * Preset Fractal — Aura con la paleta V3 (naranja protagonista) y los
 * grises cálidos del sistema. Sin esto PrimeVue usa el esmeralda por
 * defecto de Aura, que desentona con la base cream del diseño.
 */
const FractalPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{orange.50}",
      100: "{orange.100}",
      200: "{orange.200}",
      300: "{orange.300}",
      400: "{orange.400}",
      500: "{orange.500}",
      600: "{orange.600}",
      700: "{orange.700}",
      800: "{orange.800}",
      900: "{orange.900}",
      950: "{orange.950}",
    },
    colorScheme: {
      light: {
        primary: {
          color: "var(--color-primary-500)",
          contrastColor: "var(--color-surface-paper)",
          hoverColor: "var(--color-primary-600)",
          activeColor: "var(--color-primary-700)",
        },
        surface: {
          0:   "var(--color-surface-paper)",
          50:  "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
          950: "var(--color-secondary-950)",
        },
      },
    },
  },
  components: {
    // El diseño usa botones tipo píldora (ADM.rPill) y tipografía body
    button: {
      root: {
        borderRadius: "var(--radius-pill)",
        paddingX: "var(--spacing-btn-x)",
        sm: { paddingX: "var(--spacing-btn-x-sm)" },
        label: { fontWeight: "600" },
      },
    },
    // Tarjetas y tabla: radios del admin (más cerrados que los de V3)
    card: {
      root: {
        borderRadius: "var(--radius-adm-lg)",
        shadow: "var(--shadow-sm)",
      },
    },
    datatable: {
      headerCell: {
        background: "var(--color-admin-bg)",
        color: "var(--color-secondary-500)",
      },
      // El diseño usa el ink oscuro en el cuerpo de la tabla; sin esto
      // PrimeVue aplica su gris por defecto y el texto se ve deslavado.
      bodyCell: {
        color: "var(--color-secondary-900)",
        borderColor: "var(--color-line-soft)",
      },
    },
  },
});

export const CONFIG = {
  locale: {
    accept: "Aceptar",
    reject: "Cancelar",
    choose: "Elegir",
    upload: "Subir",
    cancel: "Cancelar",
    dayNames: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
    dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    dayNamesMin: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
    monthNames: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    monthNamesShort: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    today: "Hoy",
    weekHeader: "Sm",
    firstDayOfWeek: 1,
    dateFormat: "dd/mm/yy",
    emptyFilterMessage: "No se encontraron resultados",
    emptyMessage: "No hay opciones disponibles",
    startsWith: "Empieza con",
    contains: "Contiene",
    notContains: "No contiene",
    endsWith: "Termina con",
    equals: "Igual a",
    notEquals: "Distinto de",
    noFilter: "Sin filtro",
    lt: "Menor que",
    lte: "Menor o igual que",
    gt: "Mayor que",
    gte: "Mayor o igual que",
    dateIs: "Fecha igual",
    dateIsNot: "Fecha distinta",
    dateBefore: "Fecha antes",
    dateAfter: "Fecha después",
    clear: "Limpiar",
    apply: "Aplicar",
    matchAll: "Coincidir todo",
    matchAny: "Coincidir alguno",
  },
  theme: {
    preset: FractalPreset,
    options: {
      darkModeSelector: false,
      // cssLayer: {
      //     name: "primevue",
      //     order: "theme, base, primevue",
      // },
    },
  },
};
