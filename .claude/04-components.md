# Componentes — Design System y UI

## Design System propio (`shared/components/core/`)

Todos los componentes se exportan desde `src/shared/components/index.ts`:

| Export | Descripción |
|---|---|
| `ButtonCore` | Botón estándar (wrappea PrimeVue Button) |
| `InputTextCore` | Input de texto con label + error |
| `InputPasswordCore` | Input de contraseña con toggle |
| `TextAreaCore` | Textarea con label + error |
| `SelectCore` | Dropdown simple |
| `MultiselectCore` | Multiselect con búsqueda y carga desde servicio |
| `DatePicketCore` | Datepicker con soporte de rango y formatos Day.js |
| `CardCore` | Contenedor con slot de título |
| `ModalCore` | Modal base |
| `ToastCore` | Toast notifications (PrimeVue) |
| `TooltipCore` | Tooltip |
| `HeroCore` | Sección hero |
| `AvatarCore` | Avatar con texto/imagen |
| `ImageCore` | Imagen con fallback |
| `TagCore` | Chip/etiqueta |
| `ToolbarCore` | Toolbar con slots start/end |
| `ToggleCore` | Toggle switch |
| `SplitButtonCore` | Botón con menú desplegable |
| `LabelCore` | Label de formulario |
| `MessageCore` | Mensaje inline (error/info) |
| `HeaderCore` | Header de sección |
| `ConfirmationCore` | Modal de confirmación |

## Componentes UI compuestos (`shared/components/ui/`)

### GripUi — DataTable genérico

`src/shared/components/ui/grid/index.vue`

El DataTable del admin. **No usar PrimeVue DataTable directo** en páginas del admin.

**Props clave:**
```ts
{
  reload: (params) => Promise<DataPaginationMeta>  // función de carga lazy
  columns: GridUiColumnProps<T>[]                  // definición de columnas
  selectionMode?: 'single' | 'multiple'
  lazy?: boolean                                   // activar modo lazy
  rows?: number                                    // filas por defecto (10)
}
```

**Funcionamiento:**
- Carga inicial en `onMounted`
- Re-carga al cambiar filtros o sort (detecta cambios con `hasChanged`)
- Paginación externa con `Paginator` de PrimeVue
- Estado de filtros/sort persistido en `sessionStorage` (key: `dt-fractal`)
- Selección múltiple expuesta via `defineExpose({ rowsSelected })`
- Cancela requests duplicados automáticamente

**Definición de columna:**
```ts
const columns: GridUiColumnProps<Role>[] = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    showFilterMenu: true,
    filter: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  },
  {
    field: "permissions",
    header: "Permisos",
    filter: { value: null, matchMode: FilterMatchMode.IN },
    filterConfig: {
      component: "multiselect",
      multiselectProps: {
        filter: true,
        optionLabel: "name",
        optionValue: "id",
        service: () => permissionService.all(),
        autoLoad: true,
      },
    },
  },
];
```

**Tipos de columna** (`type`):
- `"date"` → formatea con Day.js
- `"state"` → muestra badge habilitado/deshabilitado
- `"array"` → renderiza lista
- `"actions"` → acciones por fila (edit, state, delete)

### SectionList — Listado CRUD genérico

`src/modules/admin/components/Section/list.vue`

**Wrappea GripUi con toolbar y acciones masivas.**

```vue
<SectionList
  :columns="columns"
  :services="{
    list: (params) => roleService.list(params),
    status: (ids, state) => roleService.status(ids, state ?? 1),
    delete: (ids) => roleService.delete(ids),
  }"
  title="Lista de Roles"
  module="security/roles"
/>
```

**Columnas que agrega automáticamente** (no declarar en `columns`):
- `updated_at` con filtro de rango de fechas (datepicker)
- `status` con filtro de select (Habilitado/Deshabilitado)
- `actions` con botones edit / toggle-state / delete por fila

**Prop `module`**: se usa para construir las rutas de edit (`/admin/{module}/edit/{id}`) y create (`/admin/{module}/create`).

**Acciones masivas en toolbar**: Habilitar, Deshabilitar, Eliminar (con confirmación).

### CrudForm — Formulario CRUD genérico

`src/modules/admin/components/Section/crud-form.vue`

```vue
<CrudForm
  title="Crear Rol"
  :schema="formSchema"
  :initialValues="initialValues"
  redirect="roles.list"
  :service="(body) => roleService.create(body)"
>
  <template #default="{ fields, errors }">
    <InputTextCore v-model="fields.name.value" ... />
  </template>
</CrudForm>
```

**Props:**
- `schema`: ZodSchema — validación del formulario
- `initialValues`: valores iniciales (null para campos vacíos)
- `service`: función que recibe el payload y devuelve Promise
- `redirect`: nombre de ruta para cancelar y para redirigir tras éxito
- `redirectOnSuccess?`: ruta alternativa tras éxito
- `submitLabel?` / `cancelLabel?`: texto de botones

**Manejo de errores del backend**: si el error tiene `details` con keys de campos, los mapea a errores de campo individuales con `setFieldError`.

## Stores globales

### useToastStore

```ts
const toast = useToastStore();
toast.showToastSuccess({ detail: "Guardado" });
toast.showToastError({ detail: "Error al guardar" });
toast.showToastWarning({ summary: "Advertencia", detail: "Selecciona registros" });
toast.showToastInfo({ detail: "Info" });
```

### useConfirmStore

```ts
const confirm = useConfirmStore();
confirm.confirmDelete({
  message: "¿Eliminar los registros seleccionados?",
  accept: () => executeDelete(),
});
```

### useAlertStore

Se activa automáticamente desde `safeRequest` cuando `showAlert = true` (default).

### useSessionStore

Maneja el modal de sesión expirada. `openSessionModal(retryFn?)` muestra el modal. `retryLastRequest()` reintenta la última call.

## Directives personalizados

### v-keyfilter

Permite solo ciertas teclas en un input:

```vue
<InputTextCore v-keyfilter="/^[A-Za-z_]+$/" />     <!-- regex -->
<InputTextCore v-keyfilter.lettersSpaces />          <!-- modificador -->
<InputTextCore v-keyfilter.numbersOnly />
```

Modificadores disponibles: `lettersOnly`, `lettersSpaces`, `numbersOnly`, `lettersNumbers`, `lettersNumbersSpaces`.

### v-trim

Auto-trim en blur del input:

```vue
<InputTextCore v-trim />
```

## MultiselectCore con carga desde servicio

```vue
<MultiselectCore
  v-model="fields.permissions.value"
  label="Permisos"
  optionLabel="name"
  optionValue="id"
  :service="() => permissionService.all()"
  autoLoad
  filter
/>
```

`autoLoad`: carga automáticamente al montar. `filter`: búsqueda interna.

## Sistema visual — tokens y preset de PrimeVue

El diseño (`Design/diseño fractal/`) define **dos capas**: `V3` (base compartida con la landing) y `ADM` (el admin redefine superficies y radios — *"admin UI shouldn't feel warm marketing"*).

**Dónde van los tokens:** en el bloque `@theme` de `src/style.css`. Es Tailwind 4 — `tailwind.config.js` está vacío a propósito y debe quedarse así.

| Token admin | Clase | Valor |
|---|---|---|
| fondo de página | `bg-admin-bg` | `#f5f0e5` |
| fondo del sidebar | `bg-admin-pane` | `#efe9db` |
| error / eliminar / logout | `text-danger-DEFAULT` | `#d43a2f` |
| fondo de error | `bg-danger-soft` | `#fce3e1` |
| radios del admin | `rounded-adm-{sm,md,lg,xl}` | `6/10/14/20px` |

⚠️ Los tokens con sufijo `-DEFAULT` **exigen escribirlo en la clase**: `text-danger-DEFAULT` funciona, `text-danger` no genera CSS.

Micro-interacciones disponibles (definidas en `style.css`): `.adm-row` (hover de fila), `.adm-nav-item` (hover de navegación), `.adm-icon-btn`, `.animate-adm-fade`.

### El preset de PrimeVue manda sobre las clases

`src/shared/constants/primevue.ts` exporta `FractalPreset` — `definePreset(Aura, {...})` con `primary` en el naranja `#e94e1b` y la escala `surface` en los grises cálidos de V3.

Esto importa: antes se usaba **Aura sin personalizar**, cuyo primary esmeralda y superficies frías teñían todos los componentes (tablas, botones, inputs, modales) sin importar qué clases Tailwind se pusieran encima. **Para cualquier ajuste visual global, empezar por el preset**; las clases sueltas no alcanzan.

Overrides por componente que ya viven ahí: botón tipo píldora, radio de `Card` y color de cabecera de `DataTable`.
