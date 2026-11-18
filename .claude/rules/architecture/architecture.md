---
paths:
  - "src/**"
---

# Arquitectura del frontend

Fuentes: `src/main.ts`, `src/App.vue`, routers de módulos y cliente de API. Estado contrastado el 18-nov-2026.

## Estructura

| Ruta | Responsabilidad |
|---|---|
| `src/main.ts` | Pinia, Router, PrimeVue, servicios/directivas y callbacks de sesión/errores |
| `src/App.vue` | Router view y `ToastAlert` de la aplicación |
| `src/router/index.ts` | Composición de rutas, metadatos y guards |
| `src/shared/components/core/` | Primitivos del design system |
| `src/shared/components/ui/` | Grid, modales y otros compuestos |
| `src/shared/helpers/axios/` | `ApiRequest`, errores/cancelación y cliente con cookies por zona |
| `src/shared/utils/` | Sesión, validación, CSV, markdown, formato y helpers |
| `src/shared/constants/primevue*.ts` | Preset Fractal y selección de tokens Aura por componente |
| `src/style.css` | Tokens y estilos globales |
| `src/modules/layouts/main.vue` | Router view, ToastCore, ConfirmationCore y AlertComponent del shell compartido |
| `src/modules/admin/` | Shell, componentes CRUD, capas base y módulos del panel |
| `src/modules/landing/` | Catálogo y páginas públicas, contenido/contacts desde API |
| `src/modules/auth/` | Un formulario con variante por zona |
| `src/modules/classroom/` | Páginas/servicios de alumno, docente y coordinación |
| `src/modules/checkout/` | Carrito, validación y compra del alumno |
| `src/modules/error/` | Estados HTTP y catch-all |

Los archivos de sesión/modal heredados existen, pero no son prueba de que estén montados. Ver `App.vue`, layouts y callbacks antes de describir su comportamiento.

## Capas y datos

Página → servicio → repositorio → API. El repositorio aplica adapters DTO → modelo cuando el contrato necesita normalización. `BaseRepository`/`BaseService` son para entidades CRUD; Dashboard, reportes, checkout y aula tienen contratos de agregación/flujo propios.

`SectionList` incluye columnas y acciones comunes. `CrudForm` integra vee-validate/Zod para formularios de shape fijo. Las altas masivas académicas utilizan shells propios; `bulk-import.vue` importa personas mediante Web Worker, repositorio/servicio y jobs del servidor.

Landing: `useGeneralStore` comparte contenido editorial y `useOfferStore` la consulta de ofertas. Footer y contacto derivan de general mediante sus composables/adapters actuales; no existe un footer estático activo como fuente principal.

## Navegación y carga

Base: `/FractalFrontend/`; `/admin` es el inicio real. Ver cada `router/index.ts` para inventario completo. Hay rutas públicas de detalle, páginas informativas y reclamaciones, además de auth/admin/aula/checkout/error.

Las páginas se importan dinámicamente. El router carga helpers de recuperación y rol de aula cuando se necesitan; el lector XLSX se carga desde el worker al abrir un XLSX. No mover código administrativo pesado al arranque de la web pública. El preset reducido debe conservar los tokens y CSS de Aura de cada componente utilizado.

## Contratos que no deben confundirse

- `ApiResponse` es el sobre de red; servicios suelen devolver su `data`.
- Listados CRUD y `landing/offers`: `items/meta`. En el modelo de landing, el adapter llama `offers` a los items.
- Grid CRUD: `page` desde 1; importación: `offset` de fila y páginas fijas de 25; no reutilizar una semántica para la otra.
- Precio formateado para mostrar y precio crudo para cálculo son campos distintos. La compra recalcula del lado del servidor.
- Menú/guard/roles del perfil son presentación y navegación; la API valida autorización y propiedad.

Consultar `auth.md`, `patterns.md`, `conventions.md` y el README para detalle y pendientes. No asumir que el prototipo, un mock, una carpeta o una ruta registrada representa una integración operativa en producción.
