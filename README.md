# Expense Tracker Monorepo

A full-stack expense tracking application with a TypeScript Express backend and a React + Vite frontend.

## Overview

This project allows users to register, log in, and manage income and expense transactions. The backend exposes secure REST API endpoints, while the frontend provides a polished analytics dashboard, transaction management UI, and admin category controls.

## Screenshots

> Add screenshots here once available.

## Prerequisites

- Node.js 18 or newer
- PostgreSQL
- Git

## Setup

### Backend

```bash
cd server
npm install
cp .env.example .env
```

Update `server/.env` with your PostgreSQL credentials and a strong JWT secret.

Run Prisma migrations and seed data:

```bash
npm run db:migrate
npm run db:seed
```

Start the backend in development:

```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` by default.

## Available Scripts

### Server scripts (`server/package.json`)

- `npm run dev` — start backend with `nodemon` and `ts-node`
- `npm run build` — compile TypeScript
- `npm run start` — run the compiled server from `dist`
- `npm run test` — run Jest tests
- `npm run test:coverage` — run Jest with coverage
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:seed` — run database seed script
- `npm run db:studio` — launch Prisma Studio

### Client scripts (`client/package.json`)

- `npm run dev` — run Vite development server
- `npm run build` — build production assets
- `npm run preview` — preview built app
- `npm run test` — run Vitest unit and integration tests
- `npm run test:coverage` — run Vitest with coverage
- `npm run e2e` — run Playwright end-to-end tests

## API Documentation

Swagger UI is available at:

- `http://localhost:4000/api/docs`

It documents all API endpoints, request schemas, and response schemas.

## Testing

### Server

```bash
cd server
npm run test
npm run test:coverage
```

### Client

```bash
cd client
npm run test
```

### End-to-end

```bash
cd client
npm run test:e2e
```

## Project Structure

```
expense-tracker-website/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| Auth | JWT, bcrypt |
| Testing | Jest, Vitest, React Testing Library, Playwright |
| Docs | Swagger UI |

## Security Features

- Helmet hardening with CSP, HSTS, noSniff, frameguard, and XSS filtering
- CORS restricted to configured frontend origin
- Rate limiting on all API routes and auth endpoints
- Input sanitisation for `body`, `params`, and `query`
- Strong JWT token policy with 7-day expiration
- Password hashing using bcrypt with 12 salt rounds
- Role-based access control for admin-only category management
- Ownership enforcement for user transactions
- Prisma ORM parameterized queries for SQL injection protection

## Git Commit Convention

This project follows conventional commit messages such as:

- `feat: add user authentication`
- `fix: resolve transaction ownership bug`
- `chore: update dependencies`
- `docs: improve README`

