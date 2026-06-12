# Radiant Hospital Training Institute

Public Next.js website for Radiant Hospital Training Institute with retained authentication/login API support.

## Current Scope

- Public website at `/`
- Login page at `/login`
- Authentication API routes at `/api/auth/login` and `/api/auth/logout`
- Postgres-backed login/session logic retained
- Admin and student portal pages removed

Successful login now redirects back to the public website.

## Run With Docker

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:3010
```

Postgres is exposed on:

```text
localhost:5435
```

## Services

- `app`: Next.js website and API routes
- `db`: Postgres database

## Notes

The database seed files are still available under `docker/postgres/init` for login/session data and website/application storage. Portal UI routes have been removed from the app.
