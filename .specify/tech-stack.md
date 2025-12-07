# Technology Stack & Dependencies

## Core Framework
- **Next.js 14+**: App Router for routing and layouts (`app/` dir).
- **React**: Functional components with Hooks.
- **TypeScript**: Strict type checking.

## Documentation Engine
- **Nextra 4**: Latest version using App Router.
- **MDX**: Content written in `.mdx` files in `app/docs/`.

## Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Headless primitives for accessible components (Dialog, Dropdown, etc.).
- **Lucide React**: Icon set.

## Authentication (Better Auth)
- **Library**: `better-auth` for secure, type-safe authentication.
- **Client**: `lib/auth-client.ts` (`createAuthClient`).
- **Server**: `lib/auth.ts` (`betterAuth` config).
- **Database Adapter**: PostgreSQL adapter via `pg`.
- **Custom Schema**: Extended user table with `username`, `softwareBackground`, `hardwareBackground`.

## Database (Supabase)
- **Provider**: Supabase Managed PostgreSQL.
- **Connection**: Connection pooling (IPv4) for reliability.
- **Schema**: `user`, `session`, `account`, `verification` tables managed by Better Auth.

## State Management
- **Context API**: `SidebarContext` for UI state, `AuthContext` for user session.

## Deploy & CI/CD
- **Vercel**: Optimized for Next.js.
