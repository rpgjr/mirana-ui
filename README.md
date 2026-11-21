# mirana-ui

React 19, TypeScript, Vite, Tailwind 4, shadcn/ui, react-icons, TanStack Query, React Router.

## Run

```
npm install
npm run dev -- --port 5180
```

The dev server proxies `/api` to `http://localhost:8080` (the `mirana` API), so the browser sees one origin, same as production.

## Structure

- `src/index.css`: theme tokens. Light under `:root`, dark under `.dark`. Dark is the default.
- `src/lib/theme.tsx`: `ThemeProvider` (dark, light, system). `index.html` applies the saved theme before first paint.
- `src/lib/api.ts`: fetch wrapper with CSRF header and typed errors.
- `src/features/auth`: sign in, sign up, email OTP, new device OTP, forgot and reset password.
- `src/components/AppBackdrop.tsx`: dot grid and soft glows behind every page.

## Deploy (Vercel)

Root directory `mirana-ui`, framework Vite. In `vercel.json`, replace `YOUR-API` with the Render service host. Vercel forwards `/api/*` to Render so session cookies stay first-party.
