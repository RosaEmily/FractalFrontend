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

- **En páginas/componentes**: siempre usar `safeRequest()`, nunca try/catch suelto
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
  offset: number,           // página (número de página, no índice)
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
