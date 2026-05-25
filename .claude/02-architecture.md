# Arquitectura — Estructura del Proyecto

## Mapa de directorios

```
src/
├── main.ts                      # Bootstrap: Pinia, Router, PrimeVue, directives
├── App.vue                      # Root component con ToastCore + ConfirmationCore + SessionModal
├── router/
│   └── index.ts                 # Router global + guards de auth/roles
│
├── shared/                      # Código transversal (no pertenece a ningún módulo)
│   ├── components/
│   │   ├── core/                # Primitivos del design system
│   │   │   ├── buttons/, card/, modal/, toast/, input/, select/...
│   │   │   └── index.ts         # Exports: ButtonCore, CardCore, InputTextCore...
│   │   ├── ui/                  # Compuestos de mayor nivel
│   │   │   ├── grid/            # GripUi (DataTable con lazy + filtros)
│   │   │   ├── modal/           # AlertModal, ConfirmationModal
│   │   │   └── content-wrapper/ # Layout wrapper con slots
│   │   ├── index.ts             # Re-export de core + ui
│   │   └── type.ts              # GridUiColumnProps, GridUiTableExpose...
│   ├── composables/
│   │   ├── useFormFields.ts     # Integración vee-validate + Zod
│   │   └── useClickOutside.ts
│   ├── config/
│   │   ├── env.config.ts        # Variables de entorno tipadas
│   │   └── cookie.config.ts     # Opciones de cookies (sameSite, secure...)
│   ├── constants/
│   │   ├── primevue.ts          # CONFIG para PrimeVue (theme, ripple...)
│   │   └── zod.ts               # STRING_REGEX (lettersOnly, slug, email...)
│   ├── errors/
│   │   ├── business.error.ts    # BusinessError (code + errors)
│   │   └── request.error.ts     # RequestError (httpCode + details)
│   ├── helpers/axios/
│   │   ├── base.ts              # ApiRequest: clase HTTP con AbortController
│   │   └── api-fractal.ts       # Instancia con baseURL v2 + interceptor Bearer
│   ├── icons/                   # SVGs como componentes Vue (AlertCircle, CheckCircle...)
│   ├── interface/               # Tipos globales
│   │   ├── api-response.ts      # ApiResponse<T>, PaginationMeta, DataPaginationMeta<T>
│   │   ├── request.ts           # SafeRequest<T>, SafeRequestError
│   │   └── toast.ts, layout.ts, format.ts...
│   ├── plugins/directives/
│   │   ├── keyfilter/           # v-keyfilter (regex o modificadores)
│   │   └── trim/                # v-trim (auto-trim en blur)
│   ├── stores/
│   │   ├── useToastStore.ts     # Notificaciones PrimeVue toast
│   │   ├── useAlertStore.ts     # Modal de error/alerta global
│   │   ├── useConfirmStore.ts   # Modal de confirmación
│   │   ├── useLoadingStore.ts   # Estado de carga global
│   │   └── useSessionStore.ts   # Modal sesión expirada + retry
│   └── utils/
│       ├── request.ts           # safeRequest() — wrapper sin throw
│       ├── format.ts            # Formatos de fecha, moneda...
│       ├── zod/
│       │   ├── shortcuts.ts     # lettersSpaces, slug, passwordBasic...
│       │   ├── validators.ts    # regexValidator, validateHttpsUrl...
│       │   └── withRefinements.ts # Componer refinements de Zod
│       ├── clone.ts, meta.ts, safe-json.ts, valid.ts
│
├── modules/
│   ├── auth/                    # Módulo de autenticación
│   │   ├── pages/AuthPage.vue   # Login form
│   │   ├── services/, repositories/, adapters/, dto/, models/, router/
│   ├── admin/                   # Panel backoffice
│   │   ├── layouts/main.vue     # Layout con NavVertical (sidebar)
│   │   ├── components/
│   │   │   ├── NavVertical/     # Sidebar con menú jerárquico colapsable
│   │   │   └── Section/
│   │   │       ├── list.vue     # Listado CRUD genérico
│   │   │       └── crud-form.vue # Formulario CRUD genérico
│   │   ├── constants/menu/      # Definición de ítems del menú lateral
│   │   ├── dto/, models/, adapters/ → auth del admin
│   │   ├── interface/
│   │   │   ├── base-repository.ts  # Tipos genéricos del patrón
│   │   │   └── nav-vertical.ts     # MenuItem type
│   │   ├── repositories/
│   │   │   ├── base.repository.ts  # BaseRepository<T> abstracto
│   │   │   └── auth.repository.ts
│   │   ├── services/
│   │   │   ├── base.service.ts     # BaseService<TRepo, T> abstracto
│   │   │   └── auth.service.ts
│   │   ├── stores/useUserStore.ts  # Datos del usuario autenticado
│   │   └── modules/
│   │       ├── home/               # Dashboard home
│   │       └── security/           # Módulo de seguridad
│   │           ├── modules/
│   │           │   ├── permissions/ # CRUD Permisos (dto/model/adapter/repo/service/pages/router)
│   │           │   └── roles/       # CRUD Roles (misma estructura)
│   │           └── router/index.ts
│   ├── components/              # Componentes globales (alert modal, session modal)
│   ├── error/                   # Páginas 403, 404
│   ├── layouts/main.vue         # Layout raíz (envuelve admin con meta.auth)
│   └── landing/                 # Módulo de la landing pública
│       ├── dto/                 # general.dto, teacher.dto, offer.dto, footer.dto
│       ├── models/              # general.model, teacher.model, offer.model, footer.model
│       ├── adapters/            # general.adapter, teacher.adapter, offer.adapter, footer.adapter
│       ├── repositories/        # general/teacher/offer/footer.repository
│       ├── services/            # general/teacher/offer/footer.service
│       ├── stores/              # useGeneralStore, useOfferStore, useFooterStore
│       ├── composables/         # useCountUp, useIntersectionObserver, useToast, format
│       ├── components/          # Secciones: Banner, Kpis, Courses, Teachers, Partners...
│       │   └── programs/        # ProgramCard, ProgramFilters, ProgramFilterDrawer
│       ├── pages/               # HomeView, ProgramsView, InstructorsView, ContactView
│       ├── layouts/             # LandingLayout.vue
│       └── router/index.ts
```

## Rutas completas

```
/                                   → Landing Home (pública)
/programs                           → Programas (pública)
/instructors                        → Instructores (pública)
/contact                            → Contacto (pública)
/login                              → Auth (guestOnly)
/admin                              → Requiere auth
/admin/home                         → Dashboard
/admin/security/permissions         → Lista permisos
/admin/security/permissions/create  → Crear permiso
/admin/security/permissions/edit/:id → Editar permiso
/admin/security/roles               → Lista roles
/admin/security/roles/create        → Crear rol
/admin/security/roles/edit/:id      → Editar rol
/error/403                          → Acceso denegado
```
