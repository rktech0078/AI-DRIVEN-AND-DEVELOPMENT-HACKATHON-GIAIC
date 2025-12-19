# Naming Conventions

This file mirrors the naming conventions from `.specify/naming-conventions.md` and is the canonical spec for project naming rules.

## Files & Directories
- **Component Files**: `PascalCase.tsx` (e.g., `TranslationButton.tsx`).
- **Utility Files**: `camelCase.ts` (e.g., `utils.ts`).
- **Route Directories**: `kebab-case` (e.g., `api/auth/`).
- **Docs Directories**: `kebab-case` or `section-N` (e.g., `section-1`).

## Code
- **React Components**: `PascalCase` (e.g., `function LoginForm() {}`).
- **Variables/Functions**: `camelCase` (e.g., `const isLoading = true`).
- **Types/Interfaces**: `PascalCase` (e.g., `interface UserProps`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`).

## Database
- **Tables**: `snake_case` (standard Postgres) OR `camelCase` (Better Auth default). 
  - *Current Project uses `camelCase` for Better Auth compatibility (e.g., "emailVerified").*
- **Columns**: `camelCase` (e.g., `createdAt`, `softwareBackground`).

## Git
- **Commit Messages**: Conventional Commits (e.g., `feat: add login form`, `fix: sidebar layout`).

> Note: This file is intended to be the spec-owned copy of naming rules. Update here when conventions change and reference it from `.specify` if needed.
