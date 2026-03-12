# CLAUDE.md

## Project

Fastfetch Config Builder — a visual web UI for building [fastfetch](https://github.com/fastfetch-cli/fastfetch) JSONC configurations.

## Commands

- `npm run dev` — start dev server (Vite, port 5173)
- `npm run build` — TypeScript type-check (`tsc -b`) then Vite production build
- `npm run typecheck` — TypeScript only (`tsc --noEmit`)
- `npm run test` — unit tests (Vitest)
- `npm run test:e2e` — end-to-end tests (Playwright)

## Before Committing / Pushing

**Always run `npm run build` before committing or pushing.** The build runs `tsc -b` (strict type-check) followed by `vite build`. If it fails, fix the errors before creating the commit. Do not skip this step.

Also run `npm run test` to ensure unit tests pass.

## Architecture

- **React 18 + TypeScript + Vite** — SPA, no server
- **Zustand** store (`src/store/configStore.ts`) — single source of truth, persisted to localStorage
- **Types** in `src/lib/moduleDefinitions.ts` — all fastfetch config types (Logo, Display, General, modules)
- **JSON generation** in `src/lib/generateJsonc.ts` — converts store state to fastfetch JSONC (only emits non-default values)
- **Components** in `src/components/` — GlobalSettings (sidebar), ModuleList/ModuleCard (center), JsonPreview + TerminalMockup (right panel)

## Key Patterns

- `GlobalSettings` uses collapsible `<Section>` components for each config area
- The store exposes both legacy individual setters (e.g. `setLogoSource`) and generic section updaters (e.g. `updateLogo`, `updateDisplay`, `updateGeneral`)
- `display.color` is a union type (`AnsiColor | DisplayColorSettings`) — use a type guard when passing to functions expecting `AnsiColor`
- The JSONC generator only serializes values that differ from fastfetch defaults to keep output clean

## Style

- Tailwind CSS for all styling, dark theme with custom CSS variables
- `font-mono text-xs` for form labels and inputs
- Consistent field components: `SelectField`, `TextField`, `NumberField`, `CheckboxField`
