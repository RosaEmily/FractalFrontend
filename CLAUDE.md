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

## Pantallas de estado (400–504)

`src/modules/error/` tiene las **14** del diseño, generadas desde
`constants/codes.ts` — las rutas se derivan de ahí, así que un código nuevo solo
se agrega en un sitio.

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
npx vue-tsc -b --force --noEmit | grep -c "error TS"   # baseline: 89
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

~22 archivos sin commitear en `feat/dashboard-and-reports`, incluidos
`src/modules/classroom/` y `src/modules/checkout/` enteros.

Hay deuda mapeada contra el diseño en las 4 zonas (admin y aula son las más
grandes). El detalle está en la memoria del proyecto.

**Cerrado en sep 2026:** los 6 listados que mostraban ids en vez de nombres
(Certificados, Evaluaciones, Notas, Notas finales, Sesiones, Transacciones), el
menú filtrado por rol, Configuración SEO, la vista previa en los 7 módulos de
Sitio web, el campo imagen en Cursos/Líneas/Programas, "Destacado" editable y el
buscador del aula para los 3 roles.

**Pendiente conocido**: grilla de captura de notas (hoy es un formulario por
nota), dashboard por rol, pantalla de asistencia de Clases (⚠️ **decisión de
negocio abierta**: `join_time`/`leave_time`/`participation_score` siguen sin
confirmar), tab Notificaciones del perfil, LinkedIn y CV de instructores.

⚠️ **La campana del aula es solo del alumno a propósito**: no existe endpoint de
avisos para docente ni coordinación.
