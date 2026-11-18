# FractalFrontend — contexto del repositorio

Fractal Studio: web pública, compra, administración y aula. Revisado contra el código local el 18-nov-2026; no implica que los cambios estén desplegados.

## Entradas y fuentes

- `README.md`: instalación, configuración, arquitectura, límites y pendientes.
- `.claude/rules/architecture/`: estructura, autenticación, patrones y convenciones.
- `.claude/rules/modules/modules.md`: áreas y contratos funcionales.
- `.claude/rules/project/project.md`: scripts, CI/CD y Vite.
- `.claude/rules/api/api-contract.md`: integración y formatos de respuesta.
- `.claude/rules/ui/`: diseño y componentes; conservar sus reglas específicas.

La documentación es parte versionada del repositorio y puede leerse desde cualquier asistente. El mecanismo `paths:` de estas reglas es propio de Claude Code; otros clientes deben consultar los archivos pertinentes. No sustituirla por rutas personales externas. `.claude/history.md` conserva antecedentes fechados, no instrucciones operativas actuales.

## Mapa funcional

`landing`, `auth`, `admin`, `classroom`, `checkout`, más `error` y layouts compartidos. Base `/FractalFrontend/`; inicio de administración `/admin`. El checkout usa sesión del aula.

Vue 3/TypeScript, Vite 7, Tailwind 4, PrimeVue 4, Pinia, Vue Router, Axios, vee-validate/Zod. CRUD por capas `DTO → adapter/modelo → repositorio → servicio → página`; agregaciones con repositorios propios. Usar `SectionList` y `CrudForm` donde encaja su contrato. Los modos masivos tienen componentes específicos; importar personas es un flujo persistente, no una serie de altas desde el navegador.

## Invariantes

- La sesión real es una cookie HttpOnly por zona. No JWT, no token guardado por JS y no fallback ADMIN.
- `api-fractal.ts` usa `VITE_API_FRACTAL_V2`, `withCredentials` y `X-Fractal-Zone`; el login envía `zone` en el cuerpo.
- El backend valida permisos y propiedad. Los guards/cookies del frontend solo controlan navegación y presentación.
- Paginación CRUD y ofertas: `items/meta`; el modelo de ofertas expone `offers` después del adapter.
- `price` es presentación; usar `price_raw`/su modelo normalizado al calcular. La compra vuelve a calcular en servidor.
- Los recursos `students`/`teachers` usan `document_number`; el alta crea el usuario y su perfil en Security.
- Importaciones: hasta 1.000 filas/2 MB en cliente, worker para lectura/validación, vista de 25 filas y envío síncrono en bloques de 50. Ver módulo antes de cambiar límites.
- Reutilizar tokens de `style.css`. El preset Aura seleccionado conserva tokens/CSS de los componentes utilizados.

## Verificación segura

Usar primero lectura del código y checks acotados. No borrar sesiones, limpiar datos, reiniciar contenedores ni cambiar contraseñas para facilitar una prueba. Para pruebas de navegador usar el dominio del proyecto y cuentas/fixtures aislados; no asumir que un fallo anterior del login sigue vigente.

Cuando esté autorizada la ejecución, `npm run test`, `npm run build` y el lint sin escritura sirven a alcances distintos. `npm run lint` lleva `--fix`. Última verificación de esta sesión: Vite compila y quedan 63 errores TypeScript previos; no declarar el build completo aprobado ni una baseline fija para futuras sesiones. No usar stash/reset/checkout para fabricar comparaciones.

## Límites conocidos

Consultar los pendientes del README: CI necesita alinear variable API y lockfile; el acceso de MANAGER/COORDINATOR no coincide completamente entre login, home, aula y API. El dominio permitido de Vite no demuestra privacidad del proxy.
