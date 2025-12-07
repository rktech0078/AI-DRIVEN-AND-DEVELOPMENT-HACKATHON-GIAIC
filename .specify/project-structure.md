# Project Structure Map

## Root
- `.env.local`: Environment variables (Secrets).
- `next.config.mjs`: Next.js configuration.
- `package.json`: Dependencies.

## /app
- `layout.tsx`: Root layout (Values: Navbar, AuthProvider).
- `page.tsx`: Landing page.
- `/docs/`: Documentation routes.
  - `layout.tsx`: Docs-specific layout (Sidebar, TOC, EditButton).
  - `[[...mdxPath]]/`: MDX Catch-all route for content.
- `/api/`: Backend API routes.
  - `auth/[...all]/`: Better Auth endpoints.
  - `translate/`: AI Translation endpoint.

## /components
- `/auth/`: Authentication forms (`LoginForm`, `SignupForm`).
- `Sidebar.tsx`: Desktop sidebar.
- `MobileSidebar.tsx`: Mobile drawer.
- `TranslationButton.tsx`: AI Translation UI.
- `EditOnGithub.tsx`: Dynamic GitHub edit link.

## /lib
- `auth.ts`: Server-side Auth config.
- `auth-client.ts`: Client-side Auth hook/client.
- `utils.ts`: Helper functions (clsx/tailwind-merge).

## /contexts
- `AuthContext.tsx`: Wraps Better Auth session for global access.
- `SidebarContext.tsx`: Manages mobile sidebar state.
