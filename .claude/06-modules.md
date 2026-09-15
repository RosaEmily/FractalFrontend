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
│   ├── ui/
│   │   ├── LandingImage.vue  → imagen con fallback (ver detalle abajo)
│   │   └── ... (LandingBadge, LandingButton, LandingCard, LandingEyebrow, LandingSectionHeader, LandingStars)
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
- Copyright y año en FooterSection usan `new Date().getFullYear()` — nunca hardcodear el año
- KpisSection usa `new Date().getFullYear()` para el label de métricas

**Assets:**
- `assets/banner/placeholder.jpg` (desktop y mobile)
- `assets/course/placeholder.jpg`
- `assets/teacher/placeholder.jpg`
- `assets/review/reviewer1-3.jpg`
- `assets/config/footer.json` — configuración estática del footer
- `src/mocks/programs-mockoon.json` — datos mock para programas

---

### `GET /landing/general` — campos y mapeo

El endpoint retorna: `banner[]`, `kpis[]`, `partners[]`, `contact[]`, `social_networks[]`, `complaints_book`.

**Mapeos en `GeneralAdapter.one()`:**

| Campo DTO | Campo Model | Nota |
|---|---|---|
| `kpi.description` | `kpi.label` | |
| `kpi.number` | `kpi.value` | |
| `kpi.format` (ej. `"+{n}%"`) | `kpi.suffix` (ej. `"+%"`) | Se extrae con `.replace('{n}', '').trim()` |
| `partner.image` | `partner.image_url` | Backend manda `image`, model usa `image_url` |
| `partner.name` | `partner.image_alt` | El alt es el name del partner |

**Pendiente de conectar** (el backend los manda, el frontend no los consume aún):
- `contact[]` — ContactView lo tiene hardcodeado
- `social_networks[]` — FooterSection lo tiene hardcodeado
- `complaints_book` — FooterSection lo tiene hardcodeado
- `logo` — frontend usa `@/assets/fractal.png` directamente, ignora este campo

---

### `PartnersSection` — dos bloques independientes

- **Grid superior** (sponsors): lista hardcodeada de empresas con diseño texto + diamante de color. Itera sobre `partners` del backend mostrando `partner.name` con `SPONSOR_COLORS[i % 4]`.
- **Marquee inferior** (acreditaciones): usa imágenes del backend — `partner.image_url` con `alt=partner.name`. Se triplica para efecto infinito (`v-for="loop in 3"`).
- La grid se adapta al número de partners: 5 partners → `grid-cols-3` (3+2), 4 → `grid-cols-4`, etc. Controlado por `colWidth` computed.

---

### `LandingImage` — componente de imagen con fallback

`src/modules/landing/components/ui/LandingImage.vue`

Maneja tres casos automáticamente:
1. `src` válida → muestra `<img>`. Si falla `@error` → activa fallback
2. `fallbackSrc` → imagen estática de placeholder
3. slot default → contenido personalizado (ej. iniciales del teacher)

```vue
<!-- Con placeholder estático -->
<LandingImage
  :src="offer.image_url"
  :alt="offer.name"
  :fallback-src="placeholder"
  img-class="w-full h-full object-cover"
/>

<!-- Con slot de iniciales -->
<LandingImage :src="teacher.photo_url" :alt="nombre" img-class="...">
  <span class="...">{{ initials(teacher) }}</span>
</LandingImage>
```

**Props:** `src?`, `alt?`, `fallbackSrc?`, `fallbackText?`, `imgClass?`, `fallbackClass?`

Usar en cualquier componente del landing que muestre imágenes. Actualmente usado en `TeachersSection` y `ProgramCard`.

---

## Admin — Catálogo

### Cursos (`courses`)

**Rutas:**
```
/admin/catalog/courses          → courses.list
/admin/catalog/courses/create   → courses.create
/admin/catalog/courses/edit/:id → courses.update
```

**Endpoint:** `academic/courses` (la ruta API no coincide con la del front — el módulo se llama `catalog` en el menú pero vive en el dominio `academic` de la API).

**Estructura:** `src/modules/admin/modules/catalog/modules/courses/` con el patrón estándar (dto/models/adapters/repositories/services/pages/router).

**Modelo `Course`:** `price` (string formateado, para listar) y `priceRaw` (number, para el form) son campos distintos — ver nota de contrato abajo. También `tags` (nombres) y `tagIds` (para el multiselect).

### Módulos de apoyo (solo lectura)

`catalog/modules/currencies` y `catalog/modules/tags` existen para alimentar los selects del formulario de cursos. Tienen repository + service pero **no tienen páginas ni rutas** — no son CRUDs navegables todavía.

### Cambios que este módulo requirió en la API

Tres ajustes en `fractal-api`, todos **aditivos** (no rompen consumidores existentes):

1. `CourseResource` — se agregaron `price_raw` (numérico) y `tag_ids`. El campo `price` seguía devolviendo el string formateado (`"$ 149.99"`), inservible para un formulario de edición.
2. `CurrencyResource` — se agregó `symbol`, que no se exponía y es necesario para etiquetar la moneda en el select.

Si al construir otro módulo el formulario necesita un valor crudo que el Resource formatea, este es el patrón: agregar el campo `_raw` en vez de cambiar el existente.

### InputNumberCore

Se creó `src/shared/components/core/input/number/` porque no existía un core para campos numéricos (el precio se estaba forzando con `InputTextCore` + keyfilter, que bloquea decimales). Envuelve `InputNumber` de PrimeVue con el mismo contrato que los demás core (label, messageError, messagesInfo).

### Líneas de carrera (`learning-paths`)

**Rutas:**
```
/admin/catalog/learning-paths          → learningPaths.list
/admin/catalog/learning-paths/create   → learningPaths.create
/admin/catalog/learning-paths/edit/:id → learningPaths.update
```

**Endpoint:** `academic/learning-paths`.

**La transformación del body.** La API espera `courses: [{ course_id, order }]`, pero `MultiselectCore` trabaja con `number[]`. El service exporta `toCourseItems(ids)` que mapea el array plano asignando `order` por posición (el primero seleccionado es el primer curso de la ruta). Las páginas envuelven el submit:

```ts
const onSubmit = (body) => learningPathService.create({
  ...body,
  courses: toCourseItems(body.courses as number[]),
} as never);
```

Es el patrón a seguir cuando el shape del formulario no coincide con el del endpoint: transformar en el service, no en el componente.

**Cambios en la API que requirió:** `LearningPathResource` ganó `price_raw`, `currency_id` y `course_items` (array con `course_id`, `name`, `order`) — el campo `courses` original solo traía nombres, inservible para reconstruir el formulario.

**Bug corregido en la API — pivots soft-deleted.** Todos los pivots (`learning_path_courses`, `course_tags`, `user_roles`, `role_permissions`) usan soft delete, pero las relaciones `belongsToMany` no filtraban `deleted_at`: las filas borradas seguían apareciendo (cursos duplicados en una ruta, tags fantasma en un curso).

Se agregó `->whereNull('<pivot>.deleted_at')` a las **8 relaciones** de `LearningPath`, `Course`, `Tag`, `Role`, `User` y `Permission`. `Role::permissions()` ya lo tenía — ese era el patrón correcto a replicar.

⚠️ **Al crear una relación `belongsToMany` nueva sobre un pivot con `SoftDeletes`, incluir siempre el `whereNull`.** Eloquent no lo hace solo aunque el modelo pivot use el trait.

### Programas (`offers`)

**Rutas:**
```
/admin/catalog/offers          → offers.list
/admin/catalog/offers/create   → offers.create
/admin/catalog/offers/edit/:id → offers.update
```

**Endpoint:** `offers/offers`.

Un programa es la **cohorte vendible**: instancia programada de un curso o de una línea de carrera. Es donde se asignan docente, fechas y horarios — no en Cursos.

**`OfferCoursesField`** (`components/`) es el editor anidado: por cada curso, su docente, fechas y N horarios semanales. `CrudForm` no puede manejar este shape, así que el array vive en un `ref` aparte y se inyecta en el submit:

```ts
const onSubmit = (body) => offerService.create({
  ...body,
  courses: toCourseItems(courseItems.value),
} as never);
```

**Upsert al editar.** La API acepta `id` opcional en `courses[n]` y en `courses[n].schedules[m]`: con `id` actualiza el registro, sin `id` lo crea. `toCourseItems()` conserva los ids que vinieron del `edit()` y omite la clave en los nuevos. Verificado contra `UpdateRequest` con un caso mixto (curso existente + curso nuevo).

**Fechas y horas.** Usar `DatePicketCore`, no `InputTextCore` con `type="date"`: el core no declara `type` como prop y el atributo caería en el `<div>` raíz, no en el input. `dayjsFormatValue` define el formato que se envía — `YYYY-MM-DD HH:mm:ss` para fechas de matrícula y `HH:mm:ss` (con `time-only`) para horarios, que es lo que exige `date_format:H:i:s`.

**Docentes.** `offer_courses.teacher_id` referencia `teachers.document_number` (string), **no un id numérico**. El módulo de apoyo `catalog/modules/teachers` expone `documentNumber` y `fullName` para el select.

**Cambios en la API:** `OfferResource` ganó `price_raw`, `currency_id`, `prefix`, `type`, `learning_path_id`, `image_url` y `course_items` (con ids de offer_course y de schedules). El campo `courses` original se mantuvo intacto porque lo consume la landing.
