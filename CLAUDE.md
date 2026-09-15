# FractalFrontend — contexto para Claude Code

Front completo de **Fractal Studio** (academia de formación técnica BIM/CAD,
Perú): web pública, compra, backoffice y aula virtual. Su API es
`../fractal-api`.

**Stack:** Vue 3 + TypeScript + Vite 7 · PrimeVue 4 · Pinia · Vue Router 4 ·
Axios · vee-validate + Zod · Tailwind CSS 4 · Day.js · js-cookie.

## Cinco módulos raíz

| Módulo | Ruta | Qué es |
|---|---|---|
| `landing` | `/` | Web pública: home, programas, detalle, instructores, contacto |
| `auth` | `/login`, `/aula/login` | Dos puertas, **un solo componente** parametrizado por `meta.loginVariant` |
| `admin` | `/admin` | Backoffice, 29 módulos |
| `classroom` | `/aula` | Aula virtual, 21 pantallas en 3 roles |
| `checkout` | `/checkout` | Carrito y compra, 7 pantallas |

> **`/checkout` es zona de AULA**, no de panel: quien compra es el alumno y los
> endpoints piden `authorize:STUDENT`. Está en `CLASSROOM_PREFIXES` de
> `shared/utils/session.ts`.

## Patrón de capas (admin y módulos CRUD)

`dto → model → adapter → repository → service → pages → router → menu`

- **Extiende `BaseRepository`** solo lo que es CRUD sobre una entidad.
- **Sin `BaseRepository`** las agregaciones de solo lectura (Dashboard,
  Reportes, casi todo el aula y el checkout).
- **Sin adapter** cuando la API ya devuelve datos planos con los agregados
  calculados; **con adapter** cuando hay que normalizar (MySQL serializa los
  decimales como string).

Componentes genéricos: `SectionList` (ya incluye updated_at, status y acciones)
y `CrudForm`.

En `admin/components/ui/` viven los primitivos del diseño:
`adm-pagination` (paginación con números + elipsis, la usa `GripUi`),
`bulk-bar` (acciones masivas flotantes, la monta `SectionList`),
`form-skeleton` (esqueleto de los formularios de edición),
`role-chips`, `table-skeleton`, `avatar-cell`, `status-pill`,
`mode-toggle` (conmutador Individual/Masivo de las altas),
`bulk-course-card` y `bulk-form-shell` (el marco de los formularios masivos).

⚠️ **El modo masivo NO usa `CrudForm`**: ese componente está atado a un `schema`
de vee-validate fijo, y en un alta masiva el número de filas nace al elegir el
select padre. Por eso existe `bulk-form-shell`, que replica el marco sin el
motor de validación — lo que se valida por fila lo impone el servidor.

Reglas de negocio compartidas: `admin/constants/documents.ts` (DNI/CE/Pasaporte
+ móvil PE, espejo de `Shared/Constant/Document.php` en la API) y
`admin/utils/document-schema.ts`.

## Sesión — dos zonas independientes

Cookie de sesión **HttpOnly por zona** que emite el backend; el JS no la toca.
Más una cookie de perfil por zona: `app_user_admin` / `app_user_aula`.

Cada petición declara su zona en **`X-Fractal-Zone`**, que pone un interceptor
en `shared/helpers/axios/api-fractal.ts` usando `zoneFromPath(location.pathname)`.

> La zona sale del **path**, no de la cookie ni del rol. Pedir `/admin/...`
> pregunta siempre por la sesión del panel, exista o no la del aula.

Panel y aula pueden estar abiertos a la vez. `hasSession(zone)`,
`clearSession(zone)` y `getUserRoles(zone)` siempre reciben la zona.

## Trampas del entorno — todas verificadas, todas costaron tiempo

- **Las props booleanas ausentes llegan como `false`, no `undefined`.** Todo
  `prop?: boolean` que deba ser `true` por defecto necesita `withDefaults`; sin
  eso `prop !== false` es falso y el elemento no se renderiza **nunca**.
- **Las clases fraccionarias de Tailwind no siempre existen**: `gap-4.5`,
  `mb-5.5`, `size-52.5` **no generan CSS**. Usar valor arbitrario
  (`gap-[1.125rem]`). El build pasa igual: solo se ve en el CSS compilado.
- **Los tokens de radio pisan la escala nativa de Tailwind**: `rounded-lg` es
  **18px**, no 8px; `rounded-xl` es **28px**.
- **primeicons NO está instalado**: `pi pi-*` no renderiza nada. Usar `@mdi/js` +
  `HeroCore` con `:path`.
- **Tokens con `-DEFAULT`**: la clase válida es `text-danger-DEFAULT`, no
  `text-danger` (esta no genera CSS).
- **Tailwind no detecta clases construidas en runtime**: los nombres van
  literales en un mapa, nunca interpolados.
- **`auth/me` devuelve los roles como objetos** `{name, description}`; el
  `meAdapter` los normaliza a `string[]`.
- **Nada de valores crudos** en `.vue`: colores, tamaños y radios siempre por
  token del `@theme` de `src/style.css`.
- Preferir `computed` a `watch`; `watch` solo para efectos secundarios reales.
- **El `module` de `SectionList` es el PATH REAL de la ruta, no la carpeta del
  módulo.** Con él se arman los enlaces de Crear y Editar; si no coincide con lo
  que monta el router, esos botones dan **404** y el listado se ve bien (el menú
  navega por NOMBRE de ruta, no por path). Pasó con Clases: la carpeta es
  `enrollments/` pero el router la monta bajo `academic`.
- **El `order` viaja LITERAL a MySQL.** El `field` de la columna es la clave del
  modelo (camelCase), así que toda columna `sortable: true` cuyo `field` no sea
  la columna real necesita `sortField: "created_at"`. Si el dato vive en otra
  tabla (`studentName` sale de `users`), **no marcarla ordenable**: la consulta
  falla con *Unknown column*.
- **El orden inicial se declara**: `<SectionList sort-field="created_at"
  :sort-order="-1" />` (`1` asc, `-1` desc). Sin eso la API devuelve lo que salga
  de la BD.
- **`CrudForm` tipa los campos como opcionales**: `fields.x?.value`, y en un
  `@toggle` hay que guardar la asignación
  (`fields.x && (fields.x.value = $event)`).
- **El esqueleto de carga vive en el slot `#empty` de `GripUi`.** PrimeVue reusa
  ese slot MIENTRAS carga, así que sin distinguir los dos casos la tabla afirma
  "No se encontraron registros" antes de que llegue la respuesta. Los anchos de
  las barras se derivan de las columnas reales: un esqueleto que no calza hace
  el salto más evidente, no menos. El shimmer es `.adm-skeleton` en `style.css`
  (no es utilidad de Tailwind: necesita `background-size: 200%` y animar
  `background-position`).
- **`SectionList` YA trae acciones masivas** (Habilitar / Deshabilitar /
  Eliminar) en el `SplitButton` de "Crear". El diseño las dibuja como barra
  flotante, pero existen: no reimplementarlas.
- **Un comentario `<!-- -->` entre los atributos de un componente rompe el
  template**: va antes de la etiqueta de apertura.
- **`SectionList` asume `id` como PK.** Un recurso con otra clave (instructores y
  estudiantes van por `document_number`) tiene que declararla:
  `:keys="{ identifier: 'document_number', status: 'status' }"`. Sin eso el
  enlace de editar sale `/edit/undefined` y el toggle de estado manda
  `[undefined]`.
- **La ruta de edición es `edit/:id`**, no `update/:id`: es la plantilla que
  `SectionList` genera para el botón de editar.
- **`BaseRepository` detecta `File` en el body y arma el multipart solo**
  (`shared/utils/form-data.ts`), con method spoofing en PUT. Un formulario con
  imagen solo tiene que poner el `File` en el body.
- **`CrudForm` no valida shapes anidados** (los cursos de un programa, por
  ejemplo): esa validación va en un helper propio, disparada en el submit.
- **Nada de `<input type="checkbox">`**: el diseño lo prohíbe. Usar
  `components/ui/toggle-check.vue`.
- **PrimeVue Select no se puede automatizar** desde Chrome headless: ni el clic
  en `.p-select-option` ni los eventos de teclado aplican el valor. Para
  verificar lógica que dependa de un select, llamar al módulo con `import()`
  dinámico (con el base `/FractalFrontend/src/...`).
- **Los `<label>` no envuelven a su input**, así que un script que rellene por
  `label.querySelector('input')` no funciona.
- **Un wrapper que reenvía props BOOLEANAS a PrimeVue debe declarar sus
  defaults.** `ModalCore` pasaba `:autoZIndex="props.autoZIndex"` sin
  `withDefaults`: llegaba `undefined`, Vue lo castea a `false` en un prop
  `Boolean` y el mask se quedaba sin z-index — los modales salían DEBAJO del
  header (`z-50`) y del `thead` sticky. Los defaults reales se sacan del
  paquete: `grep -A4 "autoZIndex" node_modules/primevue/dialog/index.mjs`.
- **Un slot reenviado sin `v-if="$slots.x"` le dice a PrimeVue que existe** y
  pinta el contenido vacío. Va guardado, como el `#container` de `ModalCore`.
  Mismo caso en `SplitButtonCore` (`item`, `icon`, `dropdownicon`).
- **`SelectCore` envuelve al Select en un `<div>`**: una clase pasada al
  componente cae en el WRAPPER. Para estilar el control:
  `.mi-clase .p-select { }`, nunca `.mi-clase.p-select { }`.
- **El `dateFormat` de PrimeVue solo entiende tokens de FECHA** (`d`, `m`, `y`);
  la hora la añade él según `showTime`/`hourFormat`. Pasarle un formato con
  `HH:mm` lo imprime literal (`05/09/2026 HH:09 14:03`). Lo recorta
  `dayjsToPrime`.
- **`selectionMode="range"` usa UN solo reloj para los dos extremos**: no sirve
  para "abre a las 08:00 y cierra a las 18:00". Las horas van en campos
  `time-only` aparte.
- **Las columnas necesitan ancho explícito.** El diseño lo fija
  (Acciones 150px, Estado 130px, selección 36px); sin él PrimeVue reparte el
  sobrante entre todas y Acciones se queda con 255px y los botones perdidos en
  el hueco. Ya está en `SectionList` y `GripUi` para las genéricas.
- **Las clases interpoladas en runtime no las ve Tailwind**
  (`adm-menu-item--${tone}`): esos estilos van en `style.css`, no como
  utilidades.
- **`git check-ignore -v <archivo>` ANTES de depurar CSS que "no aplica"**:
  Tailwind v4 respeta `.gitignore` al escanear. Una regla `logs` sin barra
  escondió el módulo de Bitácora entero — sus clases exclusivas no generaban
  CSS y git tampoco lo versionaba.

## Pantallas de estado (400–504)

`src/modules/error/` tiene las **14** del diseño, generadas desde
`constants/codes.ts` — las rutas se derivan de ahí, así que un código nuevo solo
se agrega en un sitio. Traen `BlueprintGrid`, `ErrorFigure`, el número gigante
de fondo y el id de referencia `FRA-` en los errores de servidor.

⚠️ **Viven en el PR #36**: en `feat/dashboard-and-reports` todavía está el
módulo heredado de Joinnus (ilustración de binoculares). El diseño re-extraído
del 14-sep NO las cambió, así que no hay nada que rehacer — solo mergear.

`handleHttpError(status)` en `shared/utils/session.ts` lleva a la pantalla
completa **solo** en `[429, 500, 502, 503, 504]`. Un 422 o un 409 **no** sacan
al usuario de donde está: esos los muestra el formulario junto al campo que
falló.

## Sistema visual

Tokens V3 (landing/aula/checkout) y ADM (admin) en el bloque `@theme` de
`src/style.css`. **`tailwind.config.js` está vacío y así debe quedar** (Tailwind
4). Los 23 colores V3 y los 5 ADM coinciden hex a hex con el diseño.

El preset de PrimeVue (`shared/constants/primevue.ts`) es `FractalPreset` sobre
Aura: es el punto de entrada para cualquier ajuste visual global.

Fuente de verdad del diseño: `../Design/fractal/project/diseño fractal/*.jsx`.

## Cómo verificar

```bash
npx vue-tsc -b --force --noEmit | grep -c "error TS"   # baseline: 87
npx vite build
```

- **ESLint está roto** en el repo desde antes (falla al cargar su config).
- Front local: `local.fractal.com/FractalFrontend/`
- **Sí se puede verificar en navegador**: Chrome headless por CDP
  (`google-chrome --headless=new --remote-debugging-port=9222 ...`). Es la única
  forma de ver cookies HttpOnly y de cazar bugs de render.
- ⚠️ **El login del AULA no se puede automatizar rellenando el formulario**: el
  submit no dispara la petición. La salida es autenticar por `fetch` desde la
  página (`credentials: 'include'`, con **`zone` en el BODY**) y sembrar a mano
  la cookie de perfil `app_user_aula` antes de navegar a `/aula/...`.
  Los botones se llaman distinto en cada puerta: "Acceder al panel" y **"Entrar
  al aula"**.
- ⚠️ **`max_sessions` es 1**: cada intento consume el cupo y el siguiente login
  falla con `MAX_SESSIONS_EXCEEDED` aunque las credenciales estén bien. Limpiar
  `sessions` antes de cada corrida y **restaurar todo lo que se toque**
  (contraseñas, `max_sessions`, filas sembradas).
- Tras editar, el dev server puede servir módulos cacheados:
  `rm -rf node_modules/.vite` en el contenedor + `docker restart
  fractal-front_frontend`. Una recarga con `ignoreCache` NO alcanza.

## Estado

**El trabajo está en 4 PRs encadenados** (sep 2026), no suelto en el working
tree: `#35` sesión por zona → `#36` aula + checkout → `#37` alineación con el
diseño → `#38` esqueleto de carga + formulario de usuario. Cada uno sale del
anterior: mergear en orden.

⚠️ **Las 14 pantallas de estado (400–504) viven en el PR #36.** En
`feat/dashboard-and-reports` sigue el módulo `error/` heredado de Joinnus (la
ilustración de binoculares): si ves esa 404, es que ese PR aún no está mergeado
— no hay nada que construir.

Hay deuda mapeada contra el diseño en las 4 zonas (admin y aula son las más
grandes). El detalle está en la memoria del proyecto.

**Cerrado en sep 2026:** los 6 listados que mostraban ids en vez de nombres
(Certificados, Evaluaciones, Notas, Notas finales, Sesiones, Transacciones), el
menú filtrado por rol, Configuración SEO, la vista previa en los 7 módulos de
Sitio web, el campo imagen en Cursos/Líneas/Programas, "Destacado" editable, el
buscador del aula para los 3 roles, el **esqueleto de carga** de los listados y
el formulario de usuario (género y roles ya se precargan al editar).

**Cerrado el 14-sep (esta tanda):**

- **Menú lateral que no desplegaba** — `item.show` mutaba una constante no
  reactiva y `filterByRoles` devolvía copias. El estado vive en un
  `ref<Set>` del nav.
- **Modales por DEBAJO del header y de las tablas** — `ModalCore` reenviaba
  `autoZIndex` sin default y Vue castea `undefined → false` en props Boolean.
- **Paginación rota de raíz** — mandaba `offset` (la API lee `page`) y el guard
  de refetch bloqueaba paginar Y recargar tras borrar/habilitar.
- **`AdmBulkBar`** (barra flotante de acciones masivas) y el menú "Crear" con
  iconos de color, cabecera "N SELECCIONADOS" y disabled sin selección.
- **`AdmPagination` propia** con números de página + elipsis, reemplaza al
  `Paginator` de PrimeVue en `GripUi`.
- **Esqueleto en las 25 páginas de edición** (6 `edit.vue` + 19 `update.vue`).
- **Avatar** que no mostraba fotos `.webp` (decidía por extensión, ahora por URL).
- **Validación de documentos** DNI/CE/Pasaporte por tipo y móvil peruano,
  compartida con la API.
- **Formulario de Programas**: matrícula como rango (±60 días), horas de
  apertura/cierre aparte, imagen heredada por URL, validación en vivo.
- **`max_sessions`** ya se edita desde Usuarios (select 1–4); requirió tocar la
  API en 3 capas.

⚠️ **Regla: SIEMPRE componentes PrimeVue** (los `*Core` de `shared/components`),
nunca `<select>`/`<input>` nativos: el preset `FractalPreset` solo aplica a los
componentes de PrimeVue. El diseño dibuja HTML nativo porque es un prototipo
JSX — se copia su ASPECTO, no su marcado. **Deuda**: quedan 4 `<select>` en el
aula (`classroom/pages/teacher/*`) y 3 + varios `<input>` en la landing.

**`AvatarCell` cae a iniciales si la foto falla** (`@error`): una URL de S3
caída dejaba el icono de imagen rota, que se ve peor que no tener foto.

**Pendiente conocido** (auditoría completa vs el diseño re-extraído del 14-sep
en la memoria del proyecto): pantalla de **asistencia por clase** y el listado
de Clases sin Programa/Curso/Hora/Estado; **crear/editar matrícula** (hoy es
solo lectura); **LinkedIn y CV** de instructores y su columna "Dicta ahora";
**dashboard por rol** (el diseño define 4 layouts, se sirve solo el de ADMIN);
tab Notificaciones y 2FA del Perfil; grilla de captura de notas.

⚠️ **`AdmFilterBar`**: el diseño agregó filtros en barra sobre la tabla; hoy
viven en los menús de columna de PrimeVue. Decisión tomada de **no migrarlo
todavía** (afecta a los 31 listados y al contrato de `primeToApiFilters`).

⚠️ **La selección clickeable la piden solo 3 módulos** del diseño (usuarios,
cursos, programas). En tags, contenido y evaluaciones el propio diseño sigue con
checkboxes estáticos: no generalizarla.

⚠️ **La campana del aula es solo del alumno a propósito**: no existe endpoint de
avisos para docente ni coordinación.
