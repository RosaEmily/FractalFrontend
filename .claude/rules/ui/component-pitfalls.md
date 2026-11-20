---
paths:
  - "src/**/*.vue"
  - "src/**/*.ts"
---

# Trampas de componentes, PrimeVue y estado

Todas verificadas; cada una costó tiempo.

- **Las props booleanas ausentes llegan como `false`, no `undefined`.** Todo
  `prop?: boolean` que deba ser `true` por defecto necesita `withDefaults`; sin
  eso `prop !== false` es falso y el elemento no se renderiza **nunca**.

- **`auth/me` devuelve los roles como objetos** `{name, description}`; el
  `meAdapter` los normaliza a `string[]`.

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

- **`vue-tsc` NO detecta errores de MARCADO.** Dos `:class` en el mismo elemento
  ("Duplicate attribute") o una etiqueta sin cerrar ("Element is missing end
  tag") pasan el typecheck y **solo fallan en `vite build`**. Tras mover bloques
  de template, correr el build siempre.

- **`ButtonCore` con el texto en el slot por defecto sale CORTADO**: PrimeVue
  calcula el ancho del `label`. Para un enlace de navegación, un `<button>`
  propio es más simple.

- **`AvatarCell` YA pinta nombre y línea secundaria** (`name`, `secondary`,
  `photo` — no `src`). Envolverlo en un bloque propio duplica el nombre.

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


## Textos en español y futuro multilenguaje

- Los textos de PrimeVue (incluido el bloque `aria`: «Mostrar menú de filtros», «Ampliar imagen», etc.) están en `shared/constants/primevue.ts`; los mensajes por defecto de zod, en `shared/utils/zod/error-map.ts` (`z.setErrorMap` en `main.ts`). Los mensajes propios de cada esquema mandan sobre el mapa.
- No hay librería i18n: los textos son literales. Para soportar otro idioma hay tres puntos: ese mapa de zod, `CONFIG.locale` de PrimeVue y las descripciones de permisos/roles que vienen del backend (moverlas a archivos de idioma de Laravel).

## Chips de columna con «+N»

`grid/column/type/array.vue`: el «+N» abre un `Popover` de PrimeVue con el resto, con la clase `adm-popover` (fondo sólido, borde, radio y sombra del menú de usuario; el del tema deja ver la tabla). Lo usan todas las columnas array (permisos, etiquetas, cursos…).
