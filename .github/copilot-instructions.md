The goal of this file is to give AI coding agents the focused, repository-specific context they need to be immediately productive working in this Vite + Next + React + TypeScript frontend project.

Key points (read before editing or generating code)
- Project type: Vite + React + TypeScript with Next.js packages present; app is built around `src/` and Vite tooling (`vite`, `vite build`, `vite preview`). See `package.json` scripts.
- Entry points: `src/main.tsx` and `src/App.tsx` for the Vite app; there is also an app directory (`src/app/`) with Next-like layout/page files used for demo structure.
- API client: `src/lib/api.ts` contains the shared ApiClient and `ApiError` class — prefer using `ApiClient.get/post/put/delete/upload` for server interactions. Token is stored via `ApiClient.setToken()` and persisted in `localStorage`.
- Components: UI components live under `src/components/` grouped by feature (e.g. `Auth`, `JourneyBuilder`, `LiveStreaming`). Use these folders as the canonical place for feature changes.

Developer workflows (most used commands)
- Start dev server: `npm run dev` (uses `vite`) — live reload and HMR available.
- Build for production: `npm run build` (uses `vite build`).
- Preview production build: `npm run preview` (runs `vite preview --port 5190 --host 0.0.0.0`).
- Lint: `npm run lint` (runs `eslint .`).
- Export utilities: `npm run export:full|source|production` run `ts-node` scripts under `src/scripts/export-project.ts` to create zips/export packages.

Conventions and patterns you must follow
- TypeScript types: shared types live in `src/types/` and `src/core/entities`. Use existing types where possible and add new ones there.
- API responses: Most endpoints expect/return the `ApiResponse<T>` shape defined in `src/lib/api.ts`. When generating request code, adhere to this shape and handle `ApiError` for non-2xx responses.
- State & providers: App-level providers are under `src/components/Providers/` (notably `AuthProvider.tsx` and `SocketProvider.tsx`). Use or extend these rather than creating new global singletons.
- Hooks: Feature-specific hooks live in `src/hooks/` (e.g., `useAuth.ts`, `useLiveStream.ts`). Prefer adding logic in hooks rather than directly in components to keep components thin.
- Styling: Tailwind + PostCSS are used. Global CSS files: `src/index.css`, `src/app/globals.css`. Use Tailwind classes for UI styling; avoid adding raw CSS unless necessary.

Integration points & external dependencies to be aware of
- Environment config: API URL is read from `import.meta.env.VITE_API_URL` or `process.env.NEXT_PUBLIC_API_URL` inside `src/lib/api.ts`.
- Socket.io: `socket.io-client` is used by `src/components/Providers/SocketProvider.tsx` and live features under `LiveStreaming` and `LiveSessions`.
- Next.js package present: `next` is in dependencies but application runs via Vite. Do not convert to Next routing unless explicitly requested — the repo mixes Next-style app/layout files for micro-demo only.

Files that show canonical examples (use these as templates)
- `src/lib/api.ts` — centralized API client, token handling, `ApiError` and response shape.
- `src/components/Auth/AuthProvider.tsx` and `src/hooks/useAuth.ts` — authentication flow and token storage patterns.
- `src/components/Providers/SocketProvider.tsx` — socket initialization and lifecycle management.
- `src/scripts/export-project.ts` — CLI-style script examples for TypeScript scripting patterns used in the repo.

When editing code, prefer small, focused changes
- Keep public APIs stable: adding new optional fields to types is ok; changing shapes returned by `ApiClient` is high-impact — avoid unless you update all call sites.
- Update tests or add a tiny smoke-check when changing cross-cutting behavior (auth token handling, ApiClient baseURL, socket lifecycle).

Examples (copy/paste ready)
- Use `ApiClient` to make a GET:

  const res = await ApiClient.get<MyType>(`/my-endpoint`);
  // res.data has the payload; catch ApiError for failures

- Persist token via provider/hook pattern (see `AuthProvider.tsx` and `useAuth.ts`)

Edge cases discovered in the codebase
- Mixed Next/Vite files: There are Next-style files under `src/app/` but the build uses Vite. Do not assume Next server/runtime behavior (server components, special file conventions) are active.
- API error shapes: server may return `{ message, errors }` or non-JSON on network failures — handle `ApiError` and network error `status === 0` as implemented in `src/lib/api.ts`.

If you need to run tests or build locally
- Use Node + npm matching the project (check `package-lock.json`). On Windows PowerShell: `npm run dev` or `npm run build`.

What not to change without explicit confirmation
- Global layout and provider wiring (`src/app/layout.tsx`, `src/components/Providers/*`). These affect many features.
- The `ApiResponse`/`ApiError` contract in `src/lib/api.ts` unless you update all call sites.

Next steps for humans reviewing AI output
- Verify the dev server runs and the pages you modified render with no console errors.
- Confirm any added environment variables are documented in the repo README or `.env`.

If anything above is unclear or a file has changed since this instruction was created, ask the human maintainer for the intended architecture (especially whether Next routing should be considered canonical).
