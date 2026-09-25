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

> ⚠️ **La sesión son DOS cookies y el guard solo puede leer UNA.** La HttpOnly
> es invisible para el JS (es lo que impide que un XSS robe el token), así que
> el guard usa `app_user_{zona}` como señal. Si esa falta pero el token sigue
> vivo —el login falló entre un paso y otro, o `max_sessions=1` rechazó el
> segundo— el usuario quedaba **encerrado fuera**: entraba, rebotaba al login,
> entraba otra vez. Desde sep 2026 el guard consulta `auth/me` **una vez por
> zona y carga de página** antes de rebotar, y rehace el perfil si el token
> sirve. ⚠️ `clearSession()` solo borra las cookies VISIBLES: para descartar una
> sesión de verdad hay que llamar al logout, o queda el token huérfano.

> La zona sale del **path**, no de la cookie ni del rol. Pedir `/admin/...`
> pregunta siempre por la sesión del panel, exista o no la del aula.

Panel y aula pueden estar abiertos a la vez. `hasSession(zone)`,
`clearSession(zone)` y `getUserRoles(zone)` siempre reciben la zona.

**El perfil del AULA vive en un `ref` de módulo (`classroomUser`,
`classroom/composables/useClassroomRole.ts`), no en un `computed` que lea la
cookie** — una cookie no es reactiva, así que un `computed` la lee una vez y
queda congelado hasta recargar. La cookie es solo la persistencia entre
recargas. `syncClassroomUser()` la relee (login nuevo, sesión recuperada por
el guard); `updateClassroomUser(patch)` la actualiza (se guardó el perfil): el
`ref` primero, para que la UI reaccione al instante, la cookie después con
`restoreSessionUser` (que CONSERVA la caducidad real de la sesión). Como es un
`ref` de módulo, toda llamada a `useClassroomRole()` en cualquier componente
—incluida la landing pública, que puede montarse antes o después de que el
aula exista— comparte la misma instancia y ve los mismos cambios.

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
- **Un prop NO declarado en el wrapper SÍ llega** (atributo fallthrough), y uno
  declarado y reenviado sin default NO. Son mecanismos distintos y es fácil
  confundirlos: `disabled` y `title` funcionan en `ButtonCore` aunque no estén
  en `ButtonCoreProps` (caen en `$attrs`), mientras que `autoZIndex` fallaba en
  `ModalCore` justamente **porque** estaba declarado y se reenviaba. La regla no
  es "todo prop ausente se pierde", sino **"un prop Boolean declarado y
  reenviado necesita su default"**. Verificado montando el componente en jsdom.
- **Para cambiar el FONDO de un `*Core`/`Aula*` que ya lo declara, no pasar la
  clase desde fuera.** `AulaCard` tiene `bg-surface-paper` en su `class`
  estático; una clase de fondo pasada por `$attrs` **compite en el CSS en vez de
  ganarle**. La tarjeta oscura del Inicio salía BLANCA con el texto blanco
  encima — invisible. Usar el elemento propio, como hace el diseño.
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
- **`vue-tsc` NO detecta errores de MARCADO.** Dos `:class` en el mismo elemento
  ("Duplicate attribute") o una etiqueta sin cerrar ("Element is missing end
  tag") pasan el typecheck y **solo fallan en `vite build`**. Tras mover bloques
  de template, correr el build siempre.
- **Una clase fraccionaria inventada no existe**: `py-3.25` no genera CSS (sí
  `py-3.5`). Verificar en el CSS compilado con el selector ESCAPADO
  (`.py-\.5`), no con un grep del nombre plano — un grep mal escapado da falsos
  negativos.
- **`v-if` en un `<th>`/`<td>` RECOLOCA la tabla.** Cuando una columna solo
  aplica en cierto estado, el `v-if` va en el CONTENIDO de la celda: así el
  grid mantiene sus columnas y la tabla no cambia de forma.
- **`overflow-hidden` rompe `position: sticky`.** Una tarjeta con esquinas
  redondeadas que recorta su contenido no puede llevar dentro una barra
  flotante: va fuera.
- **Una celda `sticky` necesita fondo propio**, y tiene que ser el de SU fila:
  con `bg-surface-paper` en una cabecera crema se ve un parche blanco.
- **`ButtonCore` con el texto en el slot por defecto sale CORTADO**: PrimeVue
  calcula el ancho del `label`. Para un enlace de navegación, un `<button>`
  propio es más simple.
- **`AvatarCell` YA pinta nombre y línea secundaria** (`name`, `secondary`,
  `photo` — no `src`). Envolverlo en un bloque propio duplica el nombre.
- **Una tabla con `min-w-*` dentro de un GRID o un FLEX necesita `min-w-0` en su
  contenedor.** Una columna `1fr` tiene `min-width:auto`, así que el mínimo del
  hijo **ensancha la columna** en vez de hacer scroll dentro: se desborda la
  página entera. Pasó en Sesiones, con el detalle y el material cortados.
- **Un `v-if` intermedio ROMPE la cadena `v-if`/`v-else`.** En la grilla de
  notas, la barra flotante de selección lleva su propio `v-if` entre la tabla y
  sus `v-else-if`, así que el estado vacío encadenaba con la BARRA: salía
  "Sin alumnos matriculados" debajo de una tabla llena. Si entre el `v-if` y su
  `v-else` hay otro condicional, usar **condiciones explícitas**.
- **Un `absolute` no escapa de un `overflow-x-auto`.** Un popover dentro de una
  tabla con scroll sale cortado y además ensancha el scroll. La salida es una
  **fila propia** (`<tr>` + `colspan`), que ocupa el ancho real. Y esa fila va
  **dentro del `v-for`**: se envuelven las dos filas en un `<template v-for>`, o
  las variables del bucle no existen en la segunda.
- **`justify-between` con TRES hijos reparte entre los tres.** La cabecera del
  detalle de sesión dejaba el botón flotando en el centro y la pill pegada al
  borde: acción y estado van agrupados en su propio contenedor.
- **Dos columnas de un grid igualan altura por defecto, y eso suele ser lo
  correcto.** `items-start` las deja crecer por separado — útil cuando una
  tarjeta no debe estirarse, pero rompe la simetría cuando el diseño las quiere
  parejas. Me pasó en las dos direcciones en el Inicio del docente.
- **Cuando el diseño usa un contenedor con `gap`, replicar el contenedor.**
  Márgenes sueltos por hijo (`mb-*`) dan un resultado distinto y se olvidan en
  alguno.
- **`git check-ignore -v <archivo>` ANTES de depurar CSS que "no aplica"**:
  Tailwind v4 respeta `.gitignore` al escanear. Una regla `logs` sin barra
  escondió el módulo de Bitácora entero — sus clases exclusivas no generaban
  CSS y git tampoco lo versionaba.
- **`@focus` pasado a un `*Core` NUNCA se dispara.** `InputTextCore` (y varios
  `*Core`) envuelven al de PrimeVue en un `<div>`: el `@focus` cae en ese div
  por fallthrough, y **`focus` no burbujea** — se dispara en el `<input>` y ahí
  muere. Usar **`@focusin` en el CONTENEDOR**, que es el mismo evento pero SÍ
  burbujea. No falla ruidosamente: `vue-tsc` y el build pasan, el handler
  existe y solo se nota probándolo. Vale igual para `@blur` → `@focusout`.
- **La `key` de un `<RouterView>` va con `route.path`, NUNCA `fullPath`.**
  `fullPath` incluye la query string; si una pantalla guarda su pestaña activa
  ahí (`?tab=sessions`), cada clic cambia la key y Vue **destruye y recrea la
  página entera** — el estado cargado (perfil, contador) desaparece hasta que
  la petición vuelve a responder. Lo que la key debe distinguir es navegar a
  OTRA pantalla (ya cubierto por el path/params); la query es estado DENTRO de
  la misma pantalla.
- **Una cookie NO es reactiva dentro de un `computed`.** `Cookies.get()` se
  evalúa una vez; el valor queda congelado hasta recargar la página aunque la
  cookie cambie después. Un dato de cookie que se muestre y pueda cambiar en la
  misma carga de página va en un **`ref` de MÓDULO** que la cookie solo
  persiste (patrón `classroomUser` en `useClassroomRole.ts`): quien lo escribe
  dispara la actualización de todo lo que lo muestre, sin que cada pantalla
  tenga que acordarse de avisar. Si el dato solo se lee al montar (el rol que
  usa el guard), un `ref` sembrado una vez basta y no hace falta esto.
- **Un contador cuyo dato TODAVÍA no se pidió no muestra `"(0)"`.** Es una
  AFIRMACIÓN falsa, no un "cargando" — mismo patrón que el `#empty` de
  `GripUi` ya anotado abajo. Si el valor inicial de un `ref` puede confundirse
  con un dato real (`0`, `[]`, `""`), inicializarlo en `null` y ramificar la
  etiqueta/el estado vacío sobre `=== null` en vez del falsy directo.
- **`backdrop-blur` (o `transform`/`filter`/`opacity<1`) en un ANCESTRO crea
  contexto de apilamiento.** Un panel hijo con `z-9999` que "no se superpone"
  pese al z-index enorme está encerrado en esa caja y compite solo dentro de
  ella, no contra el resto de la página. La corrección va en el ANCESTRO
  (`relative z-50`), no subiendo más el z-index del panel.

## Datos de la API: lo que se muestra vs lo que se calcula

> ⚠️ **El listado público (`landing/offers`) devuelve `price` FORMATEADO**
> (`"$ 199.99"`), porque el Resource lo mapea a `price_format`. Hacer
> `Number(offer.price)` sobre eso da **`NaN`** — el carrito entero mostraba
> `S/ NaN`. Usar **`price_raw`** para calcular y `price` solo para mostrar. Es
> el mismo patrón `_raw` del panel.

> ⚠️ **`JSON.stringify(NaN)` produce `null`.** Un carrito guardado en
> `localStorage` con un precio roto se relee como `price: null` → `S/ 0.00`,
> y **sobrevive al despliegue que arregló el cálculo**. Por eso
> `useCartStore.refreshStaleItems()` vuelve a pedir los ítems cuyo precio no sea
> un número finito y positivo.

> ⚠️ **El listado público devuelve `offers`, NO `items`**, a diferencia del otro
> listado paginado del proyecto. Confundirlos compila igual y deja la sección
> vacía.

> ⚠️ **La landing solo pinta lo que tiene tabla detrás** (diseño v4). Se quitaron
> syllabus, FAQs de curso, testimonios, beneficios y "TOTAL DE HORAS": eran
> constantes del mockup. Antes de agregar un dato, comprobar que exista columna.

## Contrato con la API — patrones que se repiten

> ⚠️ **Un servicio que devuelve `boolean` sobre un POST que responde un OBJETO
> está tirando datos.** Pasó tres veces: `saveEvaluations`, `saveGrades` y
> `setPassingScore` devolvían `success` y la pantalla lanzaba un GET extra para
> releer lo que el POST ya había mandado. Antes de escribir `await load()` tras
> guardar, mirar qué devuelve el controlador.
>
> ⚠️ Pero el GET **sí** hace falta cuando el POST responde otra cosa:
> `closeActa` devuelve un resumen del cierre, `uploadMaterial` solo `{id}`.

> ⚠️ **Un `DEFAULT_*` que sustituye a un valor que el backend conoce es señal de
> endpoint incompleto.** `passing_score` no venía en el cuadro ni en el
> gradebook, y el front asumía un 13 fijo que mentía en cuanto el grupo definía
> el suyo. Se arregla la API, no el default.

> ⚠️ **Al crear filas nuevas, refrescar desde la RESPUESTA.** El servidor asigna
> los `id`; si la UI sigue mandando `id: null`, el upsert borra la fila y crea
> otra — la evaluación pierde su identidad y las notas quedan colgando de un
> `course_evaluation_id` eliminado.

> ⚠️ **`toFormData` recorre los objetos, no los serializa.** Un array de objetos
> con `JSON.stringify` llega como texto y Laravel no ve `courses.0.course_id`:
> responde "es obligatorio" con los datos delante. Solo pasa **con archivo**
> (sin `File` el body va como JSON normal).

> ⚠️ **Para validar subidas, `extensions:` y NUNCA `mimes:`.** `mimes` compara el
> MIME real del contenido: un `.docx` es un ZIP por dentro y `.rvt` no tiene MIME
> conocido, así que eran **imposibles** de subir.

> ⚠️ **Los filtros por relación no caben en el filtro genérico.** `class_sessions`
> no tiene `offer_id` (va por `schedule → offer_course`): se sobrescribe
> `index()` y se pasa la query a `filterSortAndPaginate($params, $query)`.

> ⚠️ **Toda relación que lea un Resource necesita `defaultWith()`**, o cada fila
> del listado dispara sus consultas (N+1). Y el `select` del eager loading debe
> incluir la CLAVE de la relación: sin `offer_courses.teacher_id`, `teacher`
> llegaba siempre nulo.

## Pantallas de estado (400–504)

`src/modules/error/` tiene las **14** del diseño, generadas desde
`constants/codes.ts` — las rutas se derivan de ahí, así que un código nuevo solo
se agrega en un sitio. Traen `BlueprintGrid`, `ErrorFigure`, el número gigante
de fondo y el id de referencia `FRA-` en los errores de servidor.

Reemplazan al módulo `error/` heredado de Joinnus (la ilustración de
binoculares). Ya están en `dev-v2`.

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

### Trabajar con el diseño — reglas que costaron varias rondas

> ⚠️ **El diseño reparte con CSS GRID; traducirlo a `<table>` da otro
> resultado.** `AulaRow` es `display:grid` con `gap:14` y `padding:13px 18px`, y
> sus columnas llevan ancho fijo salvo UNA con `minmax(200px,1fr)` — esa es la
> que absorbe el sobrante. Una tabla hace lo contrario: reparte el ancho libre
> entre las columnas SIN ancho, así que las fijas se ensanchan y la que debía
> crecer queda vacía. El síntoma (columnas apelotonadas, una vacía) parece un
> problema de anchos y es de mecanismo. **Replicar el grid**, no parchear con
> `w-full`. Pasó en la grilla de notas y en "Próximas clases".

> ⚠️ **Pedir una CAPTURA del diseño renderizado cuando algo no cuadra tras leer
> el `.jsx`.** Un ternario anidado entre 200 líneas de estilos inline se lee al
> revés con facilidad. En Actas, la imagen mostró en un vistazo que cuando el
> acta SÍ se puede cerrar no hay lista de requisitos, sino un aviso con el botón
> dentro — algo que el JSX escondía en un `paso === 'revisar' ?`.

> ⚠️ **Antes de "corregir" algo que no ves en la captura, comprobar que el
> diseño no lo tenga**: las capturas llegan recortadas. Estuve a punto de quitar
> la nota al pie de Sesiones, que sí está (jsx:337).

> ⚠️ **Una captura con los textos viejos suele ser la CACHÉ del dev server**, no
> un cambio que no se aplicó. Antes de reescribir nada: `grep` del texto nuevo
> en el archivo, y si está, limpiar
> (`docker exec fractal-front_frontend rm -rf /app/node_modules/.vite` +
> `docker restart fractal-front_frontend`).

> ⚠️ **En `modules/classroom/**` NUNCA `admin-bg`.** El aula es V3
> (`surface-page` = `#FAF6EE`), el panel es ADM (`admin-bg` = `#F5F0E5`). Nueve
> archivos del aula usaban el token del panel y el fondo salía distinto al
> diseño. El diseño usa `V3.bg` tanto para el fondo de página como para las
> cabeceras de tabla: no son tokens distintos.

> ⚠️ **Un comentario que justifica algo "según el diseño" envejece mal.**
> `finals.vue` decía que sus pestañas eran las del diseño y `AulaTabs` no
> aparece **ni una vez** en `teacher.jsx`. Tras cada re-extracción, verificar
> los comentarios que lo invocan, no solo el código.

> ⚠️ **Comprobar el TIMESTAMP del bundle del diseño antes de comparar.** El
> diseño se re-extrae sin aviso (`teacher.jsx` pasó de 69 a 78 KB entre el
> 19 y el 20-sep): `ls -la --time-style=+"%d-%b %H:%M"
> Design/.../aula/*.jsx`. Trabajar contra una versión vieja produce
> correcciones que ya no coinciden con lo que el usuario ve.

> ⚠️ **Los identificadores de tabla/columna son anotación técnica AUNQUE vayan
> dentro de una frase**, no solo cuando son una etiqueta suelta en mayúsculas.
> `final_grades.closed_by` intercalado en una oración del pie del acta se
> copió por error creyendo que era contenido — la regla de "se borra, no se
> traduce" aplica igual. La única excepción real es una pantalla que
> EXPLICA de qué registro sale cada fila (los avisos sí muestran
> `CLASS_SESSIONS` bajo cada uno, a propósito): ahí es contenido, no ruido.

> ⚠️ **Una lista con cabecera de fondo va con `<AulaCard pad="none"
> class="self-start">`**, nunca `pad="sm"` + márgenes negativos para simular
> el sangrado: `pad="none"` es la única variante con `overflow-hidden`, y sin
> él la cabecera se sale por el radio y corta la esquina. `self-start` evita
> que la tarjeta se estire al alto de su fila en un grid. Al pasar a
> `pad="none"` las filas pierden el padding del contenedor — subirlas a
> `px-4` para alinear con la cabecera. Y la fila ACTIVA de una lista de este
> tipo va SIN radio (`AulaRow` pinta una franja a ancho completo, no una
> píldora).

> ⚠️ **Las variantes de `V3Button` que PrimeVue no cubre viven como clase en
> `style.css`**: `.v3-btn-soft` (relleno tenue del acento, texto
> `primary-600`) y `.v3-btn-secondary` (transparente, borde/texto en el INK
> principal, se invierte al hover). **Ninguna es `outlined` de PrimeVue**, que
> da gris con borde gris — mirar siempre qué `variant` usa el `.jsx` antes de
> poner `outlined` o `severity="secondary"` en el aula.

> ⚠️ **`AulaNotice` pinta TRES colores, no uno**: el `-DEFAULT` de un tono
> (ej. `amber-DEFAULT`) es para un icono o una píldora — como texto de un
> párrafo se lee lavado. El título usa el tono OSCURO (`amber-deep`), el
> cuerpo usa `secondary-500` (gris de texto normal, no el tono), y el borde va
> OPACO (`amber-line`), no `-DEFAULT` con alfa (vira a gris sobre el crema del
> aula).

> ⚠️ **La barra de scroll del aula (`.aula *::-webkit-scrollbar*`) vive en
> `style.css`**, anclada a la clase `.aula` en el raíz de
> `classroom/layouts/main.vue` — el admin conserva la nativa. El
> `background: transparent` del `-track` y las propiedades estándar para
> Firefox NO están en el diseño pero hacen falta: `scrollbar-width` /
> `scrollbar-color` van dentro de `@supports not
> selector(::-webkit-scrollbar)`, porque Chrome les da prioridad sobre el
> pseudo-elemento y sueltas anulan el pulgar redondeado del diseño.

- **Abrir el `.jsx` ANTES de construir la pantalla**, no después. Reproducir el
  comportamiento sin leerlo deja diferencias que el usuario ve de inmediato.
- ⚠️ **Los textos se COPIAN literales**: `eyebrow`, `title`, `sub`, títulos y
  subs de estados vacíos, y los títulos de los avisos. Parafrasearlos pierde el
  negocio que explican ("Un grupo es la apertura de un programa con fechas,
  cupo y precio propios" enseña algo; "Ocupación de los grupos" no).
  El diseño define **DOS `sub` por pantalla**: uno para el estado vacío y otro
  para el estado con datos.
- ⚠️ **Excepción**: las anotaciones técnicas en mayúsculas
  (`COURSE_EVALUATIONS.MAX_SCORE`, `SESSION_MATERIALS`) son notas del mockup
  para quien construye. **Se borran**, no se traducen.
- ⚠️ **Antes de anotar algo como "decisión deliberada frente al diseño",
  releer el `.jsx`.** Marqué el cuadro de evaluación como "sin modo
  lectura/edición" y el diseño **sí lo tenía** (lápiz → ✚/💾): un `editing ?`
  dentro del JSX es fácil de saltarse leyendo en diagonal.
- **El patrón de guardado del aula**: NINGUNA pantalla tiene botón suelto. Se
  guarda con el ✓ del bloque que se edita, y ese icono **se sustituye por un
  spinner** mientras responde el servicio (`AulaSpinner`) — un ✓ apagado no
  distingue "nada que guardar" de "guardando".
- **Antes de dar una pantalla por alineada**, comparar también: anchos de
  columna EN ORDEN, tonos de pill, padding de celda (`13px 18px`) y si la
  cabecera lleva fondo.

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

**Los 5 PRs se mergearon** (15-sep-2026): sesión por zona, aula + checkout,
alineación con el diseño, esqueleto de carga, y modo masivo + landing v4 +
huecos de aula/checkout. **Rama base: `dev-v2`**; el trabajo nuevo ya no va
encadenado.

**19-sep-2026 — rediseño del aula del docente (sin commitear).**
`teacher.jsx` se re-extrajo (59→69 KB) y se auditaron las 6 pantallas: 35
hallazgos. Detalle en la memoria
(`FractalFrontend/project_docente_rediseno_15sep2026_v2.md`). Lo grueso:

- **Selector de curso** = `AulaCourseSwitch` del diseño: agrupa por cohorte y
  **atenúa** el curso no elegible con su motivo, en vez de ocultarlo.
- **Asistencia: marcar ES guardar.** Había un botón "Guardar asistencia" que el
  diseño no tiene y que dejaba la lista marcada **sin persistir** — cambiar de
  sesión perdía todo. Ahora guarda al marcar y **revierte si el servidor falla**.
- **Grilla de notas y "Próximas clases" pasaron de `<table>` a GRID** (ver las
  reglas del diseño más arriba).
- **API nueva**: `accumulated` y `attendance_percent` en el acta,
  `teacherAttendanceByCourse` para el stat "Asistencia promedio". El promedio se
  calcula sobre las **marcas crudas**, no promediando porcentajes.
- **La escala de notas sale de BD** (`course_evaluations.max_score`), no del
  texto fijo "0 a 20": es configurable y con escalas mezcladas se nombran todas.
- **El login de la landing va al AULA**, no al panel — `/login` es el backoffice
  y rechazaba al alumno con un falso "credenciales incorrectas". El 401 también
  vuelve a la puerta de su zona.

⬜ **Abierto**: el alta manual de sesión (botón `+`) sigue **bloqueada por la
API** — no hay endpoint para que el docente cree sesiones y una clase "fuera del
horario regular" necesita un `schedule_id` que el diseño no define. El icono se
deja visible en gris con el motivo.

Hay deuda mapeada contra el diseño en las 4 zonas (admin y aula son las más
grandes). El detalle está en la memoria del proyecto.

**Cerrado en sep 2026:** los 6 listados que mostraban ids en vez de nombres
(Certificados, Evaluaciones, Notas, Notas finales, Sesiones, Transacciones), el
menú filtrado por rol, Configuración SEO, la vista previa en los 7 módulos de
Sitio web, el campo imagen en Cursos/Líneas/Programas, "Destacado" editable, el
buscador del aula para los 3 roles, el **esqueleto de carga** de los listados y
el formulario de usuario (género y roles ya se precargan al editar).

**Cerrado el 15-sep (2ª tanda, diseño re-extraído 18:20):**

- **Multi-rol del aula**: el rol activo es una ELECCIÓN (pantalla "¿Cómo quieres
  entrar?" + "Cambiar de vista"), no una precedencia calculada.
- **Docente**: selección múltiple con barra flotante en Sesiones y en Notas,
  edición por fila, celdas "sin rendir" bloqueadas, modo lectura/edición del
  cuadro, `AulaTabs` en Actas y `AulaSpinner` en los 4 iconos de guardado.
- **Migración PrimeVue completa** (18 archivos) y **`AulaPill` alineada** al
  diseño (mono/uppercase, sin borde) — afecta a las 21 pantallas del aula.
- **API**: `evaluation-types` para el docente, `passing_score` en cuadro y
  gradebook, `hasOwnPassingScore`, `maxScoreOf`, `offers` en matrículas,
  `offer_name`/`teacher_name`, filtro `offer_id` en clases.
- **Admin**: columna Programa en Matrículas y en Clases, vista de sesiones
  agrupadas por curso dentro de Programas, y `StatusPill` con tono `accent`.
- **Bugs de fondo**: `toFormData` con objetos anidados, `mimes:` → `extensions:`,
  `ButtonCore` imponiendo `w-full`, dedup de `ApiRequest` sin query params,
  doble GET de `materials`, y el bucle de login del docente.

**Cerrado el 15-sep:**

- **Modo masivo** en Clases, Evaluaciones, Notas y Certificados (4 pantallas
  nuevas + `mode-toggle`, `bulk-course-card`, `bulk-form-shell`).
- **Landing v4**: fuera syllabus, FAQs, beneficios, testimonios, objetivos,
  calendario y "TOTAL DE HORAS" — nada de eso tiene tabla. El docente pasó a
  leer `teacher_detail`.
- **Sesión a medias**: el guard recupera el perfil con `auth/me` en vez de
  rebotar al login con el token vivo.
- **`S/ NaN` y `S/ 0.00` del carrito**: `price` venía formateado y
  `JSON.stringify(NaN)` deja `null` en `localStorage`.
- **Columna Acciones centrada**, id de matrícula en el listado, filtro por
  entidad en Bitácora, y el formulario de Programas igual al crear y al editar.
- **Huecos del aula y el checkout**: vista Mes del cronograma, página
  `/aula/notificaciones`, comentario del docente por nota, upsell del carrito y
  el bloque "¿Qué sigue?".

**Cerrado el 14-sep:**

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
JSX — se copia su ASPECTO, no su marcado. ✅ **Deuda CERRADA (15-sep)**: se
migraron los 18 archivos con HTML nativo. Solo quedan 3 `<input type="file">`
ocultos (`image-field`, `photo-upload`, `session-materials`), que son el
disparador del diálogo del SO, no un control visible.

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

**19 al 24-sep-2026 — tercera tanda sobre el rediseño del docente, ahora
multirol (sin commitear).** El diseño se re-extrajo otra vez (`teacher.jsx`
78 KB) y varias correcciones que nacieron "solo del docente" se generalizaron
a los tres roles. Detalle completo en la memoria del proyecto
(`FractalFrontend/project_docente_rediseno_15sep2026_v2.md`,
`project_perfil_aula_diseno.md`). Lo grueso:

- ✅ **Notificaciones para los TRES roles** (antes solo alumno). API nueva:
  `classroom/teacher/notifications[/read]` y `dashboard/notifications[/read]`
  para coordinación (no tiene endpoints propios en Classroom). Se derivan de
  las tablas igual que las del alumno, nunca se persisten — `notifications`
  solo guarda `read_at`. El mapa de a-dónde-lleva-cada-aviso y de iconos vive
  en `classroom/utils/notification-route.ts`, compartido por la campana y la
  página completa (antes duplicado y desincronizado).
- ✅ **"Mi cuenta" y el buscador, para los TRES roles.** La página de cuenta
  pasó de `pages/student/account.vue` a `pages/account.vue`; sus 8 campos por
  rol viven en `components/aula-profile.vue` (2 columnas, 3 tabs, contraseña
  en MODAL — no reusa `PersonalInfo` del admin, que es otra pantalla con otro
  DTO). El buscador ganó una página a pantalla completa
  (`pages/search.vue`) para móvil, y `SearchBox` el prop `compact`.
- ✅ **La foto de perfil SÍ se sube**: selector + arrastrar-y-soltar, con
  validación de peso (900 KB, más estricta que la API) Y dimensiones
  (200×200px mínimo — el texto ya lo prometía pero nadie lo comprobaba). El
  rechazo se muestra EN LA TARJETA (no un toast), diciendo qué mide/pesa el
  archivo. Desde el 20-sep, la foto tiene su propio modo edición (Editar →
  Guardar/Cancelar), separado del de los datos.
- ✅ **El navbar de la landing detecta la sesión del aula** (antes era
  estático): con `hasSession("classroom")` muestra "Mi aula" + chip de
  avatar/nombre en vez de "Iniciar sesión"/"Postular ahora". ⚠️ "Mi aula" NO
  usa `{ name: "classroom-home" }` a secas — esa ruta es la home del ALUMNO
  (`roles: ["STUDENT"]`) y un docente que hiciera clic ahí sería rechazado por
  el guard, que le BORRARÍA la sesión. Se resuelve con
  `CLASSROOM_ROLE_HOME[activeRole]`, el mismo cálculo que usa el guard. El
  chip de avatar es un atajo aparte a `classroom-account` (el perfil), no un
  segundo link al home. El logo del sidebar del aula ahora también lleva de
  vuelta a la landing (`{ name: "home" }`).
- **Grilla de notas y "Próximas clases"** confirmadas en GRID, no `<table>`
  (ver la regla del diseño más arriba) tras dos rondas más de auditoría contra
  el diseño renderizado.
- **Escala de notas y suma de pesos** vienen de BD, nunca fijas en el texto:
  `course_evaluations.max_score` puede no ser 20, y "Cumple" sobre una suma de
  0% en el ACTA (a diferencia del listado de cursos, donde 0% es el estado
  inicial válido) es contradictorio — corregido solo ahí.
- **El aula usaba el token de color del PANEL** (`admin-bg` #F5F0E5) en vez
  del suyo (`surface-page`/`V3.bg` #FAF6EE) en 9 archivos — confirmado
  comparando píxeles de la captura del diseño. Regla: en
  `modules/classroom/**` nunca `admin-bg`.

El alta manual de sesión (botón `+` del docente) **sigue abierta** — ver la
nota de la tanda anterior.
