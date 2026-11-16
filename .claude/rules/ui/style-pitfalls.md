---
paths:
  - "src/**/*.vue"
  - "src/**/*.css"
  - "tailwind.config.js"
---

# Trampas de estilos, Tailwind y maquetación

Todas verificadas; cada una costó tiempo.

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

- **Nada de valores crudos** en `.vue`: colores, tamaños y radios siempre por
  token del `@theme` de `src/style.css`.
- Preferir `computed` a `watch`; `watch` solo para efectos secundarios reales.

- **Para cambiar el FONDO de un `*Core`/`Aula*` que ya lo declara, no pasar la
  clase desde fuera.** `AulaCard` tiene `bg-surface-paper` en su `class`
  estático; una clase de fondo pasada por `$attrs` **compite en el CSS en vez de
  ganarle**. La tarjeta oscura del Inicio salía BLANCA con el texto blanco
  encima — invisible. Usar el elemento propio, como hace el diseño.

- **Las columnas necesitan ancho explícito.** El diseño lo fija
  (Acciones 150px, Estado 130px, selección 36px); sin él PrimeVue reparte el
  sobrante entre todas y Acciones se queda con 255px y los botones perdidos en
  el hueco. Ya está en `SectionList` y `GripUi` para las genéricas.

- **Las clases interpoladas en runtime no las ve Tailwind**
  (`adm-menu-item--${tone}`): esos estilos van en `style.css`, no como
  utilidades.

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

- **`backdrop-blur` (o `transform`/`filter`/`opacity<1`) en un ANCESTRO crea
  contexto de apilamiento.** Un panel hijo con `z-9999` que "no se superpone"
  pese al z-index enorme está encerrado en esa caja y compite solo dentro de
  ella, no contra el resto de la página. La corrección va en el ANCESTRO
  (`relative z-50`), no subiendo más el z-index del panel.
