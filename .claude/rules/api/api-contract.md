---
paths:
  - "src/**/repositories/**"
  - "src/**/services/**"
  - "src/**/adapters/**"
  - "src/**/dto/**"
  - "src/**/stores/**"
---

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
