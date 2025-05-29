---
mode: agent
description: Generate an offline-first React + TS PWA deployable to GitHub Pages
tools: [workspaceTerminal, githubRepo, codebase, terminalLastCommand]
---

## Inputs (ask once if missing)
- appIdea  – PWA description  
- repoName – defaults ${workspaceFolderBasename}  
- githubUser – GitHub user  

## Workflow
1. **Plan** – create / update `TODO.md` (phases; done / doing / next).
2. **Scaffold** –  
   ```bash
   npm create vite@latest . -- --template react-ts
   npm i react-router-dom@7 idb qrcode
   npm i -D vite-plugin-pwa tailwindcss@4 postcss canvas gh-pages
   ```

3. **Configure**
   * `vite.config.ts`
     * `base`, `scope`, `start_url`: `/${repoName}/`
     * `registerType:'prompt'`, `navigateFallback` same path
   * Tailwind v4 – `@import "tailwindcss";` in `src/index.css`; update `tailwind.config.js`, `postcss.config.js`.
   * `package.json` scripts: `dev`, `build` (with `generate-icons.js`), `deploy` (gh-pages), `homepage` URL.
   
4. **Architecture** – folders: `components/`, `context/` (definition ≠ provider), `hooks/`, `pages/`, `utils/`, `types/`.

5. **Offline & Sync**

   * IndexedDB wrapper (`utils/storage.ts`)
   * Background-sync queue (`utils/syncQueue.ts`)
   * Explicit SW registration at `/${repoName}/sw.js`.
   
6. **Extras**

   * Canvas-based `generate-icons.js` for 192 / 512 icons.
   * QR utility (`utils/qrcode.ts`).
   
7. **CI/CD**

   * `.github/workflows/deploy.yml` – `actions/*@latest`, branch-matched trigger.
   * `public/.nojekyll`.
   
8. **Checks**

   * `npm run dev` clean; PWA installs/offline; `npm run build && npm run dev` ok.
   * GitHub Pages live at `https://${githubUser}.github.io/${repoName}/`.
   * No SW/manifest conflicts when multiple PWAs (unique `id` & `scope`).
   
9. **Audit (PWA)**  
   * devDep: `@lhci/cli`  
   * `lighthouserc.js` – `onlyCategories:['pwa']`, assert `categories:pwa >=1`.  
   * GH Action step (`treosh/lighthouse-ci-action@v12`) runs after build; fails if PWA score <100 and attaches report URL.

**Success = ** fully offline PWA, zero console errors, automatic Pages deployment.
