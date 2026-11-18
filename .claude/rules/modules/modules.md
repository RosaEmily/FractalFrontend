---
paths:
  - "src/modules/**"
---

# Módulos existentes

Mapa del código local revisado el 18-nov-2026. La existencia de una pantalla no demuestra que todos los roles del diseño puedan usarla; contrastar sus guards con los middleware de la API.

## Acceso y administración

`auth` sirve `/login` y `/aula/login`. El login envía email, contraseña y `zone`; recibe roles, zona y caducidad, y después consulta el perfil mediante `auth/me`. La cookie HttpOnly se emite en servidor, sin token JSON.

El panel tiene base `/admin`, home `admin-home` y módulos en `src/modules/admin/modules/`:

| Grupo | Responsabilidad | API principal |
|---|---|---|
| home / reports | Indicadores, alertas, clases, cupos y reportes | `dashboard`, `reports` |
| catalog | Cursos, líneas de carrera y programas/cohortes | `academic/courses`, `academic/learning-paths`, `offers/offers` |
| people | Estudiantes, docentes e importaciones | `academic/students`, `academic/teachers`, `security/users`, `security/people-imports` |
| security | Usuarios, roles y permisos | `security` |
| enrollments | Matrículas y asistencias | `enrollments` |
| evaluations | Tipos, evaluaciones, notas y notas finales | `evaluations` |
| certification | Plantillas y registros de certificados | `certification` |
| payments | Métodos de pago y consulta de transacciones | `payments` |
| content | Banners, contactos, KPIs, páginas, footer, testimonios, formularios y configuración | `landing`, `testimonials` |
| jobs / system | Ofertas laborales, bitácora y sesiones globales | `support`, `system/sessions` |
| profile | Perfil, contraseña y sesiones propias | `auth` |

No usar un conteo fijo de pantallas para decidir cobertura. Los catálogos auxiliares del formulario no deben confundirse con CRUD navegables: consultar el router de cada módulo.

## Contratos del catálogo y personas

- Catálogo define qué se enseña; `offers` define la cohorte vendible, sus docentes, fechas, cupo y precio.
- Los recursos exponen valores de presentación y crudos (`price`/`price_raw`, `roles`/`role_ids`, `gender_name`/`gender`). El formulario usa los crudos.
- Una línea recibe `courses: [{ course_id, order }]`; transformar el array del multiselect en el servicio (`toCourseItems`).
- La oferta contiene cursos y horarios anidados. Mantener sus ids al editar para el upsert; una fila nueva omite el id.
- `teacher_id` y la PK de alumnos/docentes son `document_number` string. Su alta pasa por `security/users`, que crea usuario y ficha juntos; no por los stores incompletos de Academic.
- `DatePicketCore` declara el formato enviado: `YYYY-MM-DD HH:mm:ss` para fechas y `HH:mm:ss` para horarios. No asumir que `type=date` alcanza el input de un core que no declara esa prop.
- Las relaciones con pivots borrables necesitan excluir `deleted_at`; los roles de autenticación además excluyen roles/pivots inactivos.

## Importaciones de personas

`admin/components/ui/bulk-import.vue` comparte diseño y flujo para estudiantes/docentes. La lógica vive en `people/shared/import/`: lectura XLSX/CSV/TSV/pegado, worker, análisis, cliente, repositorio y servicio.

Hasta 1.000 registros/2 MB (XLSX descomprimido hasta 20 MB); primera hoja XLSX. La lectura y validación corren en worker y la vista previa mantiene 25 filas. El envío es síncrono: bloques de 50 filas válidas a `POST security/people-imports` (bcrypt coste 12 ≈ 0,14 s/fila, ~8 s por bloque); cada respuesta trae el resultado y la contraseña temporal por fila, que el worker conserva en memoria para el CSV. No hay cola ni persistencia: si se cierra la pantalla, las cuentas creadas permanecen pero el reporte se pierde (hay aviso `beforeunload`). Solo ADMIN.

## Landing

`landing/router/index.ts` define home, programas y detalle, instructores y detalle, contacto, páginas informativas por slug y libro de reclamaciones. El detalle público de programa existe en la API (`landing/offers/{offer}`).

`useGeneralStore` carga datos editoriales, contactos, redes, footer y páginas desde `landing/general`; no hay footer estático activo. El logo visual aún usa el asset del frontend en componentes: que el JSON contenga `logo` no prueba que sustituya ese asset.

Programas reciben `items/meta` y se adaptan a `offers` en UI. `price_raw` sirve para el carrito. Docentes destacados son la consulta por defecto; la pantalla completa puede pedir `favorites_only=0`. Testimonios públicos son los activos destacados de la BD. Contacto y reclamaciones envían a endpoints públicos con validación y límites del servidor.

`LandingImage` ofrece imagen, placeholder o contenido de fallback. Mantener carga diferida donde corresponda y respetar los tokens del tema.

## Aula y checkout

`classroom` tiene alumno, docente, cuenta, notificaciones y pantallas de coordinación. Alumno consulta cursos, líneas, agenda, clases, matrículas, materiales y certificados; docente administra asistencia, evaluaciones, notas y actas. Las consultas se resuelven con la identidad académica autenticada.

Los avisos se calculan desde las tablas y se guarda su lectura. La coordinación consume `dashboard` y `reports`, no una familia propia de endpoints Classroom. El cierre de acta sigue restringido a TEACHER en API.

Checkout usa la sesión del aula y compra para el STUDENT autenticado. La API vuelve a validar moneda/cupo/precio y bloquea la compra con 503 si `PAYMENTS_SIMULATE` está apagado: todavía no hay cobro real.

## Acceso pendiente de alinear

El padre del panel admite ADMIN/COORDINATOR/MANAGER, pero home pide ADMIN y muchos endpoints son ADMIN. Las rutas de coordinación están bajo `/aula`, aunque el login de esa zona solo admite STUDENT/TEACHER. No presentar la matriz del diseño como autorización implementada ni ampliar roles por inferencia.
