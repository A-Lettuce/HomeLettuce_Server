# Tech Stack — Home Lettuce

Referencia para Claude Code y Claude Design. No usar tecnologías fuera de esta lista sin justificación explícita.

---

## Frontend

| Tecnología | Versión | Rol |
|---|---|---|
| Vite | v6 | Build tool y dev server. Output: `dist/` estático |
| React | v19 | UI declarativa basada en componentes |
| TypeScript | v5 | Tipado estático. Sin `any` implícito |
| Tailwind CSS | v4 | Utility-first styling. Sin CSS custom salvo variables de tema |
| shadcn/ui | latest | Componentes en `/components/ui/`. Basados en Radix UI |
| React Router | v7 | Routing cliente. URL como estado para filtros/vistas |
| TanStack Query | v5 | Server state: cache, loading, error. `staleTime: 30s` por defecto |
| Zustand | v5 | Client state global. Solo si Context resulta tedioso |

### Reglas de estado
- **Server state** (datos de la API) → TanStack Query exclusivamente
- **Client state local** (modales, toggles) → `useState` / `useReducer`
- **Client state global** (tema, usuario) → Context API o Zustand
- **No `localStorage`** para estado de aplicación
- **No estado hardcodeado** en componentes profundos

### Reglas de código
- Toda lógica de fechas y tiempo → funciones puras en `src/lib/time.ts`, nunca dentro de JSX
- Validación de responses de la API → `zod` en el boundary (`src/api/`)
- Shape estándar de hooks de datos: `{ data, isLoading, error }` (compatible con `useQuery`)
- Mock hooks en desarrollo deben respetar el mismo shape

---

## Utilidades

| Tecnología | Rol |
|---|---|
| `date-fns` | Manipulación de fechas. Tree-shakeable, sin efectos secundarios |
| `zod` | Validación de schemas en el boundary con la API de Go |

---

## Backend

| Tecnología | Rol |
|---|---|
| Go (stdlib) | HTTP server, file server para `dist/`, API REST |
| `go:embed` | Embebe `dist/` en el binario. Un solo archivo deployable |
| SQLite | Base de datos local. Un único archivo `.db` |
| `modernc.org/sqlite` | Driver SQLite puro Go, sin CGO. Compila a cualquier arquitectura |

### Reglas de backend
- Sin frameworks HTTP (Gin, Echo, etc.) salvo que la complejidad lo justifique
- Queries SQL directas con `database/sql`. Sin ORM
- API bajo `/api/v1/...`. El resto sirve `dist/`
- Autenticación delegada a Authentik vía OIDC/OAuth2

---

## Autenticación

| Tecnología | Rol |
|---|---|
| Authentik | Identity provider externo. Gestiona login, sesiones y MFA |
| OIDC / OAuth2 | Protocolo de integración entre Go y Authentik |

*Las capas de seguridad se definen en un chat separado del proyecto.*

---

## Infra y DevOps

| Tecnología | Rol |
|---|---|
| systemd | Servicio para el binario Go. Auto-restart y logs via `journalctl` |
| Caddy | Reverse proxy. HTTPS con certificado local (mkcert o self-signed) |
| Makefile | Comandos: `make build`, `make deploy`, `make logs` |
| Ubuntu Server | OS base del home server |

---

## Estructura de carpetas (frontend)

```
src/
├── api/           # Funciones fetch + schemas zod
├── components/
│   ├── ui/        # shadcn/ui (no editar directamente)
│   └── app/       # Componentes propios de la aplicación
├── hooks/         # Custom hooks (useQuery wrappers, etc.)
├── lib/
│   └── time.ts    # Toda la lógica de fechas y tiempo
├── pages/         # Una carpeta por ruta principal
├── store/         # Zustand stores (si aplica)
└── types/         # Tipos e interfaces compartidos
```

---

## Lo que deliberadamente NO está

- **Next.js / SSR** — innecesario en local, añade complejidad sin beneficio
- **Docker** — el binario Go con `go:embed` ya es autocontenido
- **Redux** — TanStack Query + Zustand cubren todos los casos
- **ORM** — `database/sql` directo es suficiente y más transparente para SQLite
- **`localStorage`** para estado — sin excepciones
- **CSS Modules / Styled Components** — Tailwind es suficiente

---

## Diseño

- Estilo: minimalista, iluminado, bordes redondeados, amigable
- Paleta: colores pastel claros (light mode por defecto)
- Dark/light mode: toggle en esquina superior derecha, implementado desde el inicio con Tailwind `dark:`
- Nombre de la app: **Home Lettuce**
- Tipografía: Inter o Geist (definir en configuración de Tailwind)
- Mobile-first: diseño responsive desde el inicio, breakpoints Tailwind estándar
