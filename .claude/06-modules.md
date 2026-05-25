# Módulos existentes

## Auth

**Ruta:** `/login` (meta: `guestOnly`)
**Archivos:**
- `src/modules/auth/pages/AuthPage.vue` — formulario de login
- `src/modules/auth/services/auth.service.ts`
- `src/modules/auth/repositories/auth.repository.ts`

**Endpoint:** `POST /auth/login` con `{ email, password }`
**Respuesta:** `{ token: string, expires_at: string }`

---

## Admin — Security

### Permissions (Permisos)

**Rutas:**
```
/admin/security/permissions          → permissions.list
/admin/security/permissions/create   → permissions.create
/admin/security/permissions/edit/:id → permissions.edit
```

**Estructura:**
```
modules/security/modules/permissions/
├── dto/permission.dto.ts      → PermissionDTO, PermissionCreateBodyDTO
├── models/permission.model.ts → Permission, PermissionRepositoryTypes
├── adapters/permission.adapter.ts
├── repositories/permission.repository.ts  → ruta: "security/permissions"
├── services/permission.service.ts
└── pages/
    ├── list.vue    → SectionList con columnas name + description
    ├── create.vue  → CrudForm con InputText + TextArea
    └── edit.vue    → CrudForm con carga via edit(id)
```

**Modelo Permission:**
```ts
interface Permission {
  id: number;
  name: string;        // MAYUSCULAS_GUION_BAJO, regex /^[A-Z](?:[A-Z_]*[A-Z])?$/
  description: string; // solo letras y espacios
  status: number;      // 0 | 1
  created_at: Date;
  updated_at: Date;
}
```

---

### Roles

**Rutas:**
```
/admin/security/roles          → roles.list
/admin/security/roles/create   → roles.create
/admin/security/roles/edit/:id → roles.update
```

**Estructura:**
```
modules/security/modules/roles/
├── dto/role.dto.ts      → RoleDTO, RoleBodyDTO
├── models/role.model.ts → Role, RoleRepositoryTypes
├── adapters/role.adapter.ts
├── repositories/role.repository.ts  → ruta: "security/roles"
├── services/role.service.ts
└── pages/
    ├── list.vue    → SectionList con columnas name + description + permissions (multiselect)
    ├── create.vue  → CrudForm con InputText + TextArea + MultiselectCore (permisos)
    └── update.vue  → CrudForm con carga via edit(id)
```

**Modelo Role:**
```ts
interface Role {
  id: number;
  name: string;           // MAYUSCULAS_GUION_BAJO
  description: string;
  status: number;         // 0 | 1
  created_at: Date;
  updated_at: Date;
  permissions: string[];  // nombres de permisos asociados
  permissionIds: number[]; // IDs para formulario
}
```

**Característica especial:** El filtro de columna `permissions` usa `multiselect` con `autoLoad` cargando desde `permissionService.all()`.

---

## Admin — Home

**Ruta:** `/admin/home` → `admin-home`
**Archivos:** `src/modules/admin/modules/home/pages/index.vue`

Dashboard básico. Actualmente minimal, sin widgets de datos.

---

## Landing (pública)

**Rutas públicas:** `/`, `/programs`, `/instructors`, `/contact`

**Estructura:** `src/modules/landing/` — módulo autónomo con las mismas capas que el admin.

```
modules/landing/
├── dto/
│   ├── general.dto.ts     → GeneralDTO (logo, banner, kpis, partners)
│   ├── teacher.dto.ts     → TeacherDTO, (sin id — API no lo devuelve)
│   ├── offer.dto.ts       → OfferDTO, OfferListDTO (usa DataPaginationMeta<OfferDTO>)
│   └── footer.dto.ts      → FooterDTO (desde JSON estático)
├── models/
│   ├── general.model.ts   → General, Banner, Kpi, Partner
│   ├── teacher.model.ts   → Teacher (añade phrase), TeacherList
│   ├── offer.model.ts     → Offer, OfferList, OfferFilterState (usa PaginationMeta de shared)
│   └── footer.model.ts    → Footer, ContactItem, ItemHref, SocialNetwork
├── adapters/
│   ├── general.adapter.ts → GeneralAdapter.one()
│   ├── teacher.adapter.ts → TeacherAdapter.one(dto, index?) / .many(dto[])
│   ├── offer.adapter.ts   → OfferAdapter.one(dto) / .many(dto[], meta)
│   └── footer.adapter.ts  → FooterAdapter.one()
├── repositories/
│   ├── general.repository.ts  → GET landing/general
│   ├── teacher.repository.ts  → GET landing/teachers → TeacherDTO[]
│   ├── offer.repository.ts    → GET landing/offers → DataPaginationMeta<OfferDTO>
│   └── footer.repository.ts   → lee footer.json (síncrono)
├── services/
│   ├── general.service.ts
│   ├── teacher.service.ts
│   ├── offer.service.ts
│   └── footer.service.ts
├── stores/
│   ├── useGeneralStore.ts  → compartido: banner, kpis, partners
│   ├── useOfferStore.ts    → compartido: paginación, filtros
│   └── useFooterStore.ts   → compartido: footer estático
├── composables/
│   ├── useCountUp.ts             → animación numérica para KPIs
│   ├── useIntersectionObserver.ts → trigger al entrar en viewport
│   ├── useToast.ts
│   └── format.ts
├── components/
│   ├── BannerSection.vue, KpisSection.vue, CoursesSection.vue
│   ├── TeachersSection.vue, PartnersSection.vue, ReviewsSection.vue
│   ├── RoutesSection.vue, ContactSection.vue, NavbarHeader.vue, FooterSection.vue
│   └── programs/
│       ├── ProgramCard.vue, ProgramFilters.vue, ProgramFilterDrawer.vue
├── pages/
│   ├── HomeView.vue        → carga general + offers(limit=4) + teachers directo (sin store)
│   ├── ProgramsView.vue    → paginación + filtros via useOfferStore
│   ├── InstructorsView.vue
│   └── ContactView.vue
├── layouts/LandingLayout.vue
└── router/index.ts
```

**Reglas del módulo landing:**
- `teachers` no tiene store — se carga directo desde el service en HomeView (un solo consumidor)
- `OfferListDTO` = `DataPaginationMeta<OfferDTO>` (usa el tipo de `shared/interface/api-response`)
- `PaginationMeta` de offer viene de `shared/interface/api-response`, no se duplica
- La API de teachers devuelve `TeacherDTO[]` directamente (sin wrapper), sin campo `id`
- La API de offers devuelve `{ data: { items: [], meta: {} } }` — campo `items`, no `offers`
- Footer cargado desde `assets/config/footer.json` (estático, síncrono)

**Assets:**
- `assets/banner/placeholder.jpg` (desktop y mobile)
- `assets/course/placeholder.jpg`
- `assets/teacher/placeholder.jpg`
- `assets/review/reviewer1-3.jpg`
- `assets/config/footer.json` — configuración estática del footer
- `src/mocks/programs-mockoon.json` — datos mock para programas
