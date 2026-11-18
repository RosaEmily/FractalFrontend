---
paths:
  - "src/**"
---

# Convenciones y reglas de desarrollo

## TypeScript y componentes

- Todos los componentes usan `<script setup lang="ts">`
- Alias `@` → `src/` en imports
- No usar `any` explícito — usar los tipos de `interface/` o generics
- Props con `defineProps<Interface>()` y defaults con `withDefaults`

## Naming

| Elemento | Convención |
|---|---|
| Componentes Vue | PascalCase (`RoleList.vue`) |
| Composables | camelCase con prefijo `use` (`useFormFields`) |
| Stores | camelCase con prefijo `use` + Store (`useToastStore`) |
| Servicios | camelCase + sufijo Service (instancia default export) |
| Repositorios | camelCase + sufijo Repository (instancia default export) |
| Tipos/Interfaces | PascalCase |
| DTOs | `EntityDTO`, `EntityBodyDTO`, `EntityCreateBodyDTO` |
| Modelos | `Entity`, `EntityRepositoryTypes` |
| Adapters | `EntityAdapter` (objeto, no clase) |
| Nombres de permisos/roles | `MAYUSCULAS_CON_GUION_BAJO` |

## Validaciones Zod

Shortcuts disponibles en `src/shared/utils/zod/shortcuts.ts`:

```ts
lettersOnly           // Solo letras
lettersSpaces         // Solo letras y espacios
numbersOnly           // Solo números
numbersSpaces         // Solo números y espacios
lettersNumbers        // Letras y números
lettersNumbersSpaces  // Letras, números y espacios
lettersUppercaseOnly  // Solo mayúsculas (incluyendo acentos)
lettersUppercaseAsciiOnly // Solo A-Z
noLeadingTrailingSpaces
singleSpacesOnly
alphanumericWithSymbols
latin1Safe
noEmojis
username / slug
emailSimple / phoneSimple
passwordBasic
questionFormat(requireStart?)
noDuplicates(items, options?)
httpsUrl
```

Composición con `withRefinements()`:
```ts
import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { lettersSpaces } from "@/shared/utils/zod/shortcuts";

z.string().pipe(withRefinements(z.string(), lettersSpaces))
// o simplemente:
withRefinements(z.string().min(4), lettersSpaces)
```

### Paridad con el backend

El backend nunca debe ser más laxo que el esquema zod, y lo obligatorio debe coincidir. Antes de añadir o cambiar un campo, revisar el `FormRequest` correspondiente en `fractal-api` (`Domains/*/Http/Requests`) y mantener los mismos mínimos, máximos, formato y obligatoriedad:

- Notas: 0–999,99 (`SCORE_LIMIT`). Experiencia: 0–80. Edad: 18–70. Permisos/roles: 4–200, solo mayúsculas y `_`.
- Altas y ediciones de docente, estudiante y usuario exigen especialidad (mín. 2), biografía (mín. 3) y dirección (mín. 3); el backend los exige en alta y edición.
- El slug de etiqueta que se edita es el que se guarda.
- Un campo opcional en el formulario debe ser opcional (`nullable`) en el backend, no `required`.

## Formularios (reglas de campos)

| Campo | Reglas |
|---|---|
| `name` de permiso/rol | MAYUSCULAS_GUION_BAJO, regex `/^[A-Z](?:[A-Z_]*[A-Z])?$/`, min 4, max 200 |
| `description` | lettersSpaces, min 6, max 200 |

**v-keyfilter en campos name:**
```vue
v-keyfilter="/^[A-Za-z_]+$/"
```

**v-keyfilter en description:**
```vue
v-keyfilter.lettersSpaces
```

## HTTP y manejo de errores

- **En páginas/componentes CRUD**: usar `safeRequest()`. Los flujos persistentes como importación gestionan sus errores y cancelación en su composable; no duplicar alertas globales.
- **En services/repositories**: dejar propagar errores (sin catch)
- `showAlert: false` en `safeRequest` cuando se maneja el error manualmente
- Los errores de campo del backend se mapean automáticamente en `CrudForm` si `error.details` es un objeto con keys = nombres de campo

## Estructura de respuesta API esperada

```ts
// Respuesta estándar
{ success: boolean, data: T | null, error: ApiError }

// Paginada
{ success: boolean, data: { items: T[], meta: PaginationMeta }, error: ApiError }
```

La paginación espera `{ items, meta }` donde `meta.total` contiene el total de registros.

## Parámetros de query que envía GripUi al backend

```ts
{
  limit: number,
  page: number,             // página desde 1; no offset
  order?: "field:asc|desc",
  filters?: {               // filtros serializados por primeToApiFilters()
    field: { value, matchMode }
  }
}
```

## SectionList — props module

`module` se usa para construir rutas de navegación:
- Crear: `router.replace('/admin/{module}/create')`
- Editar: `/admin/{module}/edit/{id}` (en columna actions)

Ejemplo: `module="security/roles"` → `/admin/security/roles/create`

## Estado en sesión del DataTable

El GripUi persiste filtros y orden en `sessionStorage` con key `dt-fractal`. Si hay problemas con filtros que persisten entre sesiones de desarrollo, limpiar el sessionStorage del navegador.

## Menú del admin

Cada ítem de menú en `constants/menu/` tiene:
```ts
{
  id: string;          // identificador único
  label: string;       // texto visible
  icon: string;        // path MDI (mdiCog, mdiShieldKeyOutline...)
  roles: string[];     // roles con acceso
  route?: RouteLocationRaw;  // ruta de navegación (si es hoja)
  module?: string;     // módulo (para activación de ítem activo)
  children?: MenuItem[];
}
```

## Reglas adicionales

- No usar PrimeVue DataTable directo en páginas admin — usar `GripUi` o `SectionList`
- No declarar columnas `updated_at`, `status`, `actions` en `SectionList` — se agregan automáticamente
- No importar desde `primevue/` directo en páginas — usar los componentes del design system (`shared/components/core/`)
- `BaseRepository.all()` siempre agrega `?paginate=false` internamente
- Los servicios son singletons (exportados como `export default new XService()`)

## Regla: nada de valores crudos en componentes

**Ningún color, tamaño, radio o espaciado se escribe literal en un `.vue`.** Todo valor reutilizable se declara con nombre en el bloque `@theme` de `src/style.css` y se usa por su clase.

| Prohibido | Correcto |
|---|---|
| `style="color: #e94e1b"` | `class="text-primary-500"` |
| `class="text-[0.844rem]"` | `class="text-adm-base"` |
| `class="bg-[#f5f0e5]"` | `class="bg-admin-bg"` |
| `class="rounded-[14px]"` | `class="rounded-adm-lg"` |
| `class="border-l-[1px]"` | `class="border-l"` |

**Por qué:** un hex repetido en 20 componentes es imposible de cambiar de forma consistente; con nombre, se cambia en un solo lugar. Además el nombre comunica intención (`danger`, `admin-pane`) donde el hex no dice nada.

**Si el valor no existe todavía:** agregarlo a `@theme` con un nombre semántico (por lo que *significa*, no por cómo se ve — `--color-danger-DEFAULT`, no `--color-rojo`) y un comentario de dónde se usa. Nunca inventar la clase arbitraria en el componente.

**Excepciones legítimas:** valores realmente únicos y no reutilizables (el `left: -4px` de un indicador concreto). Ante la duda, nombrarlo.

### Escalas disponibles

- **Color:** `primary-{50..900}`, `secondary-{50..950}`, `surface-{page,paper,soft,cream,sand}`, `admin-{bg,pane,row-hover}`, `danger-{DEFAULT,soft}`, `success-*`, `amber-*`, `info-*`, `line{,-soft,-strong}`, `control-{border,off}`
- **Tipografía admin:** `text-adm-{xs,sm,base,md,lg,xl,label}`
- **Radios:** `rounded-{sm,md,lg,xl,pill}` (V3) y `rounded-adm-{sm,md,lg,xl}` (admin, más cerrados)
- **Sombras:** `shadow-{sm,md,lg,accent}`
- **Fuentes:** `font-{display,body,mono}`

⚠️ Los tokens con sufijo `-DEFAULT` **exigen escribirlo**: `text-danger-DEFAULT` genera CSS, `text-danger` no.

### El preset de PrimeVue también usa los tokens

`src/shared/constants/primevue.ts` referencia las variables CSS (`var(--color-primary-500)`), no hex. Así el preset y las clases Tailwind comparten una única fuente de verdad: cambiar el token en `@theme` actualiza ambos.

### Deuda conocida

Existen valores arbitrarios heredados en landing. No tomar conteos históricos como medición vigente. Al modificar un estilo dentro del alcance solicitado, reutilizar tokens; no extender la tarea a una migración masiva no pedida.
