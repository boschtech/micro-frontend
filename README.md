# Bosch Tech — Micro Frontend

A modern micro frontend for the Product & Order microservices, built with React 19, TypeScript, Vite, TanStack Query, and Tailwind CSS v4.

## Architecture

```
src/
├── api/              # Typed API clients (products, orders)
├── types/            # Shared TypeScript interfaces
├── shared/           # Layout, Navbar, reusable components
├── features/
│   ├── dashboard/    # Dashboard with health checks & stats
│   ├── products/     # Product CRUD (list, detail, create, edit, delete)
│   └── orders/       # Order management (list, create)
├── App.tsx           # Router + Layout
└── main.tsx          # Entry point with providers
```

Each feature module is self-contained with its own hooks, components, and API integrations — designed to be extractable as independent micro frontends.

## Prerequisites

- Node.js 20+
- product-service running on `http://localhost:8080`
- order-service running on `http://localhost:8081`

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check & production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with TypeScript |

## API Proxy

In development, Vite proxies API calls to the backend services:

- `/api/products/*` → `http://localhost:8080`
- `/api/orders/*` → `http://localhost:8081`

For production, configure environment variables or a reverse proxy:

```
VITE_PRODUCT_SERVICE_URL=https://products.example.com
VITE_ORDER_SERVICE_URL=https://orders.example.com
```

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5** — type safety
- **Vite 6** — build tooling & dev server
- **TanStack Query v5** — server-state management
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — utility-first styling
- **Vitest** + **Testing Library** — testing
- **ESLint 9** — linting
