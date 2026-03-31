# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Install dependencies:** `npm install`
- **Start development server:** `npm run dev`
- **Build for production:** `npm run build`
- **Type-check:** `npm run type-check`
- **Lint code:** `npm run lint` (runs ESLint and oxlint)
- **Format code:** `npm run format` (uses Prettier)
- **Run all unit tests:** `npm run test:unit`
- **Run a specific unit test:** `npm run test:unit <path-to-test-file>`
- **Run E2E tests:** `npm run test:e2e` (uses Playwright)
- **Run E2E tests in debug mode:** `npm run test:e2e -- --debug`

## Code Architecture

- **Framework:** Vue 3 using the Composition API and `<script setup>` syntax.
- **Build Tool:** Vite.
- **State Management:** Pinia (stores are located in `src/stores/`).
- **Routing:** Vue Router (configuration in `src/router/`, page components in `src/views/`).
- **Styling:** Uses as much from `material/web` as possible.
- **API Communication:** The project uses `openapi-fetch` for interacting with the backend API.
- **Testing:**
  - Unit tests are written using Vitest.
  - End-to-end tests are written using Playwright (`e2e/` directory).
- **Tooling:** Uses `vue-tsc` for type-checking `.vue` files alongside TypeScript.

## Architecture

- **Auth** The App has to implement role based access controll
- **Roles** The usable roles are ["Admin", "CoAdmin", "Team", "Parent"]
