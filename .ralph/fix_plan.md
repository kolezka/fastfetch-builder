# Fastfetch Config Builder — Task Plan

> Ralph reads this file each iteration to find the next task.
> Mark tasks `[x]` only after `npm run build` passes and code is committed.
> Do NOT reorder tasks — dependencies are encoded in the order.

---

## Phase 1: Foundation

- [x] **TASK-001** — Scaffold project + install dependencies <!-- done: Vite+React18+TS strict, Tailwind dark theme, Google Fonts, all deps, @/ alias, build passes -->
  - Outputs: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/globals.css`
  - Acceptance: `npm run dev` starts without errors; all deps installed with custom Tailwind theme and Google Fonts

- [x] **TASK-002** — Module type definitions + module definitions registry <!-- done: 23 modules with categories/icons/optionFields/defaults, all shared types exported -->
  - Outputs: `src/lib/moduleDefinitions.ts`
  - Acceptance: Exports `ModuleType`, `AnsiColor`, `ModuleOptions`, `ModuleDefinition`, and `MODULE_DEFINITIONS` with all 23 module types; compiles clean

- [x] **TASK-003** — Zustand config store <!-- done: Full ConfigState, immutable actions, persist middleware, structuredClone for presets -->
  - Outputs: `src/store/configStore.ts`
  - Acceptance: Exports `useConfigStore` with full `ConfigState` interface; all actions immutable; `persist` middleware with localStorage key `"fastfetch-config"`

- [x] **TASK-004** — JSONC generator function <!-- done: Pure function, string vs object modules, section comments, 4-space indent, proper escaping -->
  - Outputs: `src/lib/generateJsonc.ts`
  - Acceptance: Pure function `generateJsonc(globalSettings, modules) → string`; correct string vs object module output; section comments; 4-space indent

- [x] **TASK-005** — Preset definitions <!-- done: 5 presets with globalSettings + modules, Hardware uses module-specific options -->
  - Outputs: `src/lib/presets.ts`
  - Acceptance: Exports `PRESETS` array with 5 presets (neofetch, minimal, hardware, developer, paleofetch); each with `name`, `description`, `globalSettings`, `modules`

---

## Phase 2: Core UI

- [x] **TASK-006** — App shell + 3-column layout <!-- done: Grid 280px/1fr/400px, DndContext+PointerSensor+closestCenter, DragOverlay with label -->
  - Outputs: `src/App.tsx`
  - Acceptance: 3-column CSS Grid; full viewport height; DndContext with sensors and DragOverlay; renders Header, GlobalSettings, ModuleList, JsonPreview

- [x] **TASK-007** — Header component <!-- done: Title+preset slot+Copy(with feedback)+Download, sticky h-14, ghost/solid variants -->
  - Outputs: `src/components/Header.tsx`
  - Acceptance: Title in accent/mono; preset slot placeholder; Copy/Download buttons (no-op initially); sticky full-width h-14

- [x] **TASK-008** — GlobalSettings panel <!-- done: Logo (source/type/padding) + Display (separator/color/bright/keyWidth), all wired to store -->
  - Outputs: `src/components/GlobalSettings.tsx`
  - Acceptance: Logo section (source, type, padding) and Display section (separator, color, bright, keyWidth); all inputs dispatch store actions

- [x] **TASK-009** — ModulePalette component <!-- done: 23 types grouped by category, useDraggable + click-to-add, fromPalette data -->
  - Outputs: `src/components/ModulePalette.tsx`
  - Acceptance: All 23 module types grouped by category; each is `useDraggable`; click-to-add works; draggable data payload includes `fromPalette: true`

- [x] **TASK-010** — ModuleCard component <!-- done: useSortable, drag handle, expand/collapse, OptionEditor for all field types, delete/duplicate -->
  - Outputs: `src/components/ModuleCard.tsx`
  - Acceptance: Expandable card with type-specific options form; delete/duplicate buttons; `useSortable` integration; drag handle

- [x] **TASK-011** — ModuleList component (DnD sortable container) <!-- done: SortableContext, ModulePalette+ModuleCards, empty state, drop zone highlight -->
  - Outputs: `src/components/ModuleList.tsx`
  - Acceptance: `SortableContext` with `verticalListSortingStrategy`; renders ModulePalette + ModuleCards; empty state message; droppable for palette items

---

## Phase 3: Preview & Export

- [x] **TASK-012** — JsonPreview component (CodeMirror) <!-- done: CodeMirror read-only, dark theme, JSON highlighting, live store subscription -->
  - Outputs: `src/components/JsonPreview.tsx`
  - Acceptance: CodeMirror in read-only mode with custom dark theme; subscribes to store; calls `generateJsonc()` on every change; JetBrains Mono font

- [x] **TASK-013** — Copy + Download actions <!-- done: clipboard.writeText + Blob download, both from store JSONC -->
  - Outputs: Updates to `src/components/Header.tsx`
  - Acceptance: Copy uses `navigator.clipboard.writeText()`; Download creates Blob + triggers `.jsonc` download; both read current JSONC from store

---

## Phase 4: Presets & UX Polish

- [x] **TASK-014** — PresetLoader component <!-- done: Dropdown with 5 presets, loadPreset on select, outside-click close, wired to Header -->
  - Outputs: `src/components/PresetLoader.tsx`
  - Acceptance: Custom dropdown with 5 presets; selecting calls `loadPreset()`; styled with surface bg and accent highlights; closes on outside click

- [x] **TASK-015** — Framer Motion animations <!-- done: motion.div enter/exit on cards, AnimatePresence in list, expand/collapse height animation -->
  - Outputs: Updates to `src/components/ModuleCard.tsx`, `src/components/ModuleList.tsx`
  - Acceptance: Enter/exit animations on ModuleCard; `AnimatePresence` in list; smooth expand/collapse; drag overlay scale effect

- [x] **TASK-016** — localStorage persistence verification <!-- done: onRehydrateStorage loads Neofetch preset on first visit, persist handles all changes -->
  - Outputs: Bug fixes to `src/store/configStore.ts` if needed
  - Acceptance: Config persists across reloads; all state changes persist; clearing localStorage falls back to default preset; no hydration errors

---

## Phase 5: Bonus

- [x] **TASK-017** — TerminalMockup component <!-- done: Chrome dots, ASCII Arch logo, placeholder values for all 23 types, store separator -->
  - Outputs: `src/components/TerminalMockup.tsx`
  - Acceptance: Fake terminal with chrome dots; ASCII logo left side; simulated module output right side; realistic placeholder values

- [x] **TASK-018** — Final integration + polish <!-- done: TerminalMockup integrated, all components render, DnD works, 0 TS errors -->
  - Outputs: Updates across multiple files
  - Acceptance: All components render together; DnD works end-to-end; live preview updates; no TS errors; no console errors; works on 1280px+ screens

---

## Progress

- Total tasks: 18
- Completed: 18 / 18
- Current phase: COMPLETE
