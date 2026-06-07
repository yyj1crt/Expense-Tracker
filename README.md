# Expense Tracker Monorepo

This repository contains a full-stack Expense Tracker with a Node.js/Express backend and a React + Vite frontend.

## Structure

- `server/` — Express backend with TypeScript and Prisma ORM
- `client/` — React + Vite frontend with Tailwind CSS

## Server setup

1. Open `server/`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your PostgreSQL connection string and `JWT_SECRET`.
5. Generate Prisma client and push schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
6. Run the backend in development:
   ```bash
   npm run dev
   ```

## Client setup

1. Open `client/`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## Environment variables

The backend uses the following variables in `server/.env.example`:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV`

The client can use `VITE_API_BASE_URL` to override the API base URL.

## Testing

### Server

Run TypeScript type-checking and build:
```bash
cd server
npm run typecheck
npm run build
```

### Client

Unit and integration tests:
```bash
cd client
npm run test
```

End-to-end tests with Playwright:
```bash
cd client
npm run e2e
```

## Notes

- The server is configured with `helmet`, `cors`, request rate limiting, and Swagger docs at `/api-docs`.
- The client uses Tailwind CSS with a professional dark sidebar and white content layout.
- Prisma schema is configured for `User` and `Expense` models.
