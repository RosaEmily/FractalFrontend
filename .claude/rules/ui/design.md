---
paths:
  - "src/**/*.vue"
  - "src/style.css"
  - "tailwind.config.js"
---

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

> ⚠️ **La barra de scroll es GLOBAL** (`::-webkit-scrollbar` sin ancestro en
> `style.css`, incluida la de la ventana): el pulgar crema del aula se extendió
> a landing, checkout, login y panel (27-sep-2026, pedido de Sandro). El
> `background: transparent` del `-track` y las propiedades estándar para
> Firefox NO están en el diseño pero hacen falta: `scrollbar-width` /
> `scrollbar-color` van en `html` dentro de `@supports not
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
