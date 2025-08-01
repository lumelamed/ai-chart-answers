
# Mini Nivii

App fullstack para consulta de datos en lenguaje natural sobre un CSV, usando FastAPI, React, OpenAI y Docker Compose.

## Estructura
- **backend/**: FastAPI, Clean Architecture, OpenAI, SQLAlchemy, SQLite.
- **frontend/**: React, Vite, Tailwind, shadcn/ui, Recharts, TypeScript.
- **db/**: Volumen para SQLite.

## Uso rápido

1. Copia tu archivo CSV en `db/` o súbelo desde el frontend.
2. Crea un archivo `.env` en `backend/` con tu clave de OpenAI:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Levanta todo con Docker Compose:
   ```sh
   docker-compose up --build
   ```
4. Accede a:
   - Backend: http://localhost:8000/docs
   - Frontend: http://localhost:5173

## Tests

- Backend: `docker-compose run backend pytest`
- Frontend: `docker-compose run frontend npm test`

## Escalabilidad

- **Usuarios**: Añadir autenticación (JWT), rate limiting, workers asíncronos.
- **Datos grandes**: Migrar a PostgreSQL, paginación, caché, colas de tareas.

## Clean Architecture

- `domain/`: Entidades y lógica pura.
- `application/`: Casos de uso.
- `infrastructure/`: Adaptadores (DB, OpenAI).
- `webapi/`: FastAPI endpoints.

## Frontend

- Usa Vite, React, TypeScript, Tailwind, shadcn/ui y Recharts.
- Para agregar componentes UI de shadcn:
  ```sh
  npx shadcn-ui@latest add input button select table alert
  ```

## Notas
- El backend crea la base de datos SQLite automáticamente.
- El frontend soporta preguntas en lenguaje natural y visualización flexible.
- Los tests usan Vitest y React Testing Library.
