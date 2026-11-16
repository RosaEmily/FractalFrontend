# Estado del proyecto — historial fechado

Bitácora de lo hecho y decidido por tanda (sep–oct 2026). **No se carga sola**: léelo cuando
preguntes por qué algo está como está o qué se hizo antes.

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

**27-sep-2026 — checkout, landing v4, pago y "Crear programa" (sin commitear).**
Detalle en la memoria del proyecto (`project_modulo_checkout.md`,
`project_landing_v4_auditoria_27sep.md`, `project_formulario_programas.md`).

- **Checkout = diseño `checkout/*.jsx` (Layout A, SIN `maxWidth`: el 980 es
  del Layout B).** Grid proporcional `1.6fr 1fr` (carrito) / `1.55fr 1fr`
  (pasos), padding de `ckResp` (18/32/64). Pantalla del alto de la ventana:
  cabecera y **footer fijos** (Cancelar compra · PAGO SEGURO · SSL · CTA del
  paso) y scroll SOLO en el `<main>`. Las CTAs salieron del cuerpo al footer
  (`CheckoutLayout` recibe `primary`/`@primary`). Con sesión de aula la barra
  quita "Cuenta" y la cabecera muestra avatar + nombre + correo; en móvil la
  barra es compacta con "PASO N DE M · …". Estado vacío `CkCartEmpty` centrado.
  La franja negra "CONEXIÓN SEGURA" no existe en el diseño: se quitó.
- **Pago**: la compra ahora queda `paid` (pasarela simulada en la API) y la
  confirmación dice "Pago confirmado"; un cobro `failed` va a Rechazado.
- **Landing v4 (tanda 1)**: fuera los datos inventados (cuotas ×6, "44h",
  "QUÉ APRENDERÁS", "Quedan pocos cupos", "15 JUL 2025", cifras fijas de
  Instructores, chip 'BIM'). **`landing/composables/useSiteContact()`** es la
  única fuente de contacto, redes, FAQs, libro de reclamaciones y WhatsApp
  (lee `landing/general`; `useGeneralStore.ensure()` = una sola petición). Sin
  número configurado, "Hablar con un asesor" cae a `/contact`. "Rutas" pinta
  ofertas `learning_path` con `ProgramOfferCard`. Menú móvil a pantalla
  completa y Patrocinadores 2/3/4 columnas.
- **Scroll interno también en la landing** (`LandingLayout`): el navbar queda
  fijo y la barra empieza debajo. ⚠️ El `scrollBehavior` del router sube la
  VENTANA, que ya no se mueve: el layout resetea su contenedor al cambiar de
  ruta, y los `sticky` descontaron la altura del navbar.
- **Material de la clase**: los archivos quedan "Por subir" (se pueden
  quitar) y se suben juntos con "Guardar N archivos".
- **"Crear programa" rediseñado** (`admin/crear-programa.jsx`): 4 pasos +
  resumen oscuro sticky; el INICIO DE CLASES es la única fecha — cursos en
  cascada (4 semanas por defecto, el siguiente el lunes posterior), matrícula
  deducida (21 días antes, "Cambiar"), nombre con cohorte y prefijo
  `SIGLAS-AÑO-SEMESTRE`. Horario con inicio · duración · fin enlazados. El body
  a la API no cambió. `CrudForm` ganó el modo **`bare`** (sin tarjeta ni pie;
  el slot recibe `submit` y `loading`).
- **Línea de carrera**: `CourseOrderList` ordena los cursos con ↑/↓ — el orden
  es la secuencia en que se habilitan.
