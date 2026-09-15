# FractalFrontend — Claude Code Context

Panel admin + landing pública para Fractal Studio (plataforma de formación técnica).

## Archivos de contexto

| Archivo | Contenido |
|---|---|
| [01-project.md](01-project.md) | Descripción, stack, comandos, CI/CD, variables de entorno |
| [02-architecture.md](02-architecture.md) | Estructura de directorios y capas del sistema |
| [03-patterns.md](03-patterns.md) | Patrón Repository→Service→Page, BaseRepository, adapters |
| [04-components.md](04-components.md) | Design system, GripUi, SectionList, CrudForm, Stores |
| [05-auth.md](05-auth.md) | Autenticación, guards de router, manejo de sesión |
| [06-modules.md](06-modules.md) | Módulos existentes: security (permisos y roles), landing |
| [07-conventions.md](07-conventions.md) | Reglas de código, naming, validaciones Zod, buenas prácticas |
| [08-new-module-guide.md](08-new-module-guide.md) | Guía paso a paso para agregar un nuevo módulo CRUD |

## TL;DR para agentes

- Stack: Vue 3 + TypeScript + Vite + PrimeVue 4 + Pinia + Zod
- Alias `@` → `src/`
- Base URL router: `/FractalFrontend/`
- Admin: patrón DTO→Adapter→Model→Repository→Service→Page estricto
- HTTP: `safeRequest` en páginas, servicios propagan errores
- Bulk delete: `POST /route/bulk-delete { ids[] }` | Status: `PATCH /route/actions/update-status { ids[], status }`
- No agregar columnas `updated_at`/`status`/`actions` en `SectionList` — ya las incluye
