# Fastfetch Builder — Task Decomposition

## TASK-001 — Scaffold project + install dependencies

- **Agent**: setup-agent
- **Phase**: 1
- **Inputs**: none
- **Outputs**: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx` (placeholder), `src/styles/globals.css`
- **Depends on**: none
- **Acceptance criteria**:
  - `npm run dev` starts without errors
  - Tailwind classes render correctly (test with a `bg-red-500` div)
  - TypeScript compiles with zero errors
  - All dependencies installed: `react`, `react-dom`, `tailwindcss`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `zustand`, `framer-motion`, `@uiw/react-codemirror`, `@codemirror/lang-json`, `@codemirror/theme-one-dark`, `uuid`, `@types/uuid`
  - Google Fonts loaded in `index.html` (IBM Plex Sans 400/500/600, JetBrains Mono 400/500)
- **Notes**:
  - Use `npm create vite@latest . -- --template react-ts` (scaffold in current dir or temp dir then move)
  - Tailwind config must include custom colors: `background: '#0d0d0d'`, `surface: '#1a1a1f'`, `accent: '#00d4ff'`, `textPrimary: '#e0e0e8'`, `textMuted: '#666680'`
  - Tailwind config must map `fontFamily.sans` → `IBM Plex Sans` and `fontFamily.mono` → `JetBrains Mono`
  - `globals.css` must include Tailwind directives (`@tailwind base/components/utilities`) and set `body` bg to `#0d0d0d`, text to `#e0e0e8`
  - `index.html` title: "Fastfetch Config Builder"

---

## TASK-002 — Module type definitions + module definitions registry

- **Agent**: data-agent
- **Phase**: 1
- **Inputs**: PLAN.md state shape section
- **Outputs**: `src/lib/moduleDefinitions.ts`
- **Depends on**: TASK-001
- **Acceptance criteria**:
  - Exports `ModuleType` union type covering all 23 module types
  - Exports `AnsiColor` union type with all 16 ANSI colors
  - Exports `ModuleOptions` interface with all per-type option fields
  - Exports `ModuleDefinition` interface: `{ type, label, category, icon, optionFields, defaults }`
  - Exports `MODULE_DEFINITIONS: Record<ModuleType, ModuleDefinition>` with correct metadata for every module type
  - `optionFields` for each module type lists only the relevant fields (e.g., `cpu` → `['showPeCoreCount', 'temp', 'freqNdig']`)
  - Categories: `"info"`, `"hardware"`, `"network"`, `"display"`, `"other"`
  - Every module has `key` and `keyColor` in its `optionFields` (common to all)
  - TypeScript compiles with no errors
- **Notes**:
  - Module type → option field mapping (beyond common `key`/`keyColor`):
    - `cpu`: `showPeCoreCount` (bool), `temp` (bool), `freqNdig` (0-3)
    - `gpu`: `temp` (bool), `driverVersion` (bool)
    - `memory`: `format` (string)
    - `swap`: `format` (string)
    - `disk`: `folders` (string), `format` (string)
    - `display`: `compactType` (select: none/original/scaled/original-with-scaled-resolution)
    - `localip`: `showIpv6` (bool), `compact` (bool)
    - `battery`: `format` (string)
    - `cpuusage`: `waitTime` (number, ms)
    - `title`: `format` (string)
    - `custom`: `format` (string)
    - All others: only `key`/`keyColor`
  - Use descriptive labels: `"CPU"`, `"GPU"`, `"Local IP"`, `"CPU Usage"`, etc.
  - Icons: use single emoji or unicode char per module (e.g., `"🖥"` for os, `"⬆"` for uptime)

---

## TASK-003 — Zustand config store

- **Agent**: store-agent
- **Phase**: 1
- **Inputs**: PLAN.md state shape, `src/lib/moduleDefinitions.ts` types
- **Outputs**: `src/store/configStore.ts`
- **Depends on**: TASK-002
- **Acceptance criteria**:
  - Exports `useConfigStore` Zustand hook
  - State shape matches PLAN.md `ConfigState` interface exactly
  - All actions implemented with immutable updates (no mutation):
    - `setLogoSource`, `setLogoType`, `setLogoPadding`
    - `setDisplaySeparator`, `setDisplayColor`, `setDisplayKeyWidth`
    - `addModule(type, index?)` — creates `ModuleInstance` with `uuid()` and default options from `MODULE_DEFINITIONS`
    - `removeModule(id)`
    - `updateModuleOptions(id, partialOptions)` — merges into existing options
    - `reorderModules(activeId, overId)` — swaps positions using `arrayMove` from `@dnd-kit/sortable`
    - `duplicateModule(id)` — clones module with new uuid, inserts after original
    - `loadPreset(preset)` — replaces entire state
    - `resetToDefault()` — loads default preset
  - Uses `persist` middleware with `localStorage` key `"fastfetch-config"`
  - Default state: neofetch-style preset (title, separator, os, kernel, uptime, packages, shell, terminal, cpu, gpu, memory, disk, colors)
  - TypeScript compiles with no errors
- **Notes**:
  - Import `arrayMove` from `@dnd-kit/sortable` for reorder logic
  - `addModule` must use `MODULE_DEFINITIONS[type].defaults` to populate initial options (empty object `{}`)
  - `persist` middleware: `{ name: 'fastfetch-config', version: 1 }`

---

## TASK-004 — JSONC generator function

- **Agent**: generator-agent
- **Phase**: 1
- **Inputs**: PLAN.md JSONC output rules, types from `moduleDefinitions.ts`
- **Outputs**: `src/lib/generateJsonc.ts`
- **Depends on**: TASK-002
- **Acceptance criteria**:
  - Exports `generateJsonc(globalSettings: GlobalSettings, modules: ModuleInstance[]): string`
  - Output includes `$schema` URL at top: `https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json`
  - Logo section: only includes non-default fields
  - Display section: only includes non-default fields
  - Module with no custom options (all values undefined/null/empty string) → emits as plain string `"cpu"`
  - Module with any option set → emits as object `{ "type": "cpu", "temp": true }`
  - `key` and `keyColor` are included in module objects when set
  - Omits keys with `undefined`, `null`, or `""` values from all objects
  - Output is valid JSONC (parseable by JSON parsers after stripping comments)
  - Output is pretty-printed with 4-space indentation
  - Includes section comments: `// Logo`, `// Display`, `// Modules`
  - If logo and display have no non-default values, omit those sections entirely
  - TypeScript compiles with no errors
- **Notes**:
  - Build the output string manually (not `JSON.stringify` + regex) to control comment placement
  - Helper: `isOptionEmpty(value: unknown): boolean` → true if undefined/null/empty string
  - Helper: `cleanObject(obj: Record<string, unknown>): Record<string, unknown>` → removes empty keys
  - The `modules` array is the heart of the output — get this formatting right

---

## TASK-005 — Preset definitions

- **Agent**: data-agent
- **Phase**: 1
- **Inputs**: PLAN.md PresetConfig interface
- **Outputs**: `src/lib/presets.ts`
- **Depends on**: TASK-002
- **Acceptance criteria**:
  - Exports `PresetConfig` interface (or re-exports from shared types)
  - Exports `PRESETS: PresetConfig[]` array with exactly 5 presets:
    1. **neofetch** — classic neofetch layout: title, separator, os, host, kernel, uptime, packages, shell, display, wm, theme, icons → mapped to closest fastfetch equivalents (title, separator, os, kernel, uptime, packages, shell, display, wm, colors)
    2. **minimal** — 4-5 modules: title, os, kernel, uptime, memory
    3. **hardware** — hardware-focused: title, separator, cpu (with temp), gpu (with temp+driver), memory, swap, disk, battery, display, brightness
    4. **developer** — dev-focused: title, separator, os, kernel, shell, terminal, packages, cpu, memory, disk, localip, wifi
    5. **paleofetch** — minimal paleofetch-style: title, separator, os, kernel, uptime, shell, memory, colors
  - Each preset has `name`, `description`, `globalSettings`, and `modules` array
  - `globalSettings` varies per preset (e.g., minimal has no logo padding, hardware has wider key width)
  - TypeScript compiles with no errors
- **Notes**:
  - Presets should produce realistic fastfetch configs
  - Module entries in presets: `{ type: "cpu", options: { temp: true } }` or `{ type: "os" }` (no options)

---

## TASK-006 — App shell + 3-column layout

- **Agent**: ui-agent
- **Phase**: 2
- **Inputs**: PLAN.md layout diagram
- **Outputs**: `src/App.tsx`
- **Depends on**: TASK-001, TASK-003
- **Acceptance criteria**:
  - 3-column CSS Grid layout: `grid-cols-[280px_1fr_1fr]` (or similar responsive breakpoints)
  - Full viewport height (`h-screen`) with `overflow-hidden` on body
  - Each column scrolls independently (`overflow-y-auto`)
  - Imports and renders: `Header`, `GlobalSettings`, `ModuleList`, `JsonPreview`
  - Wraps `ModuleList` area with `DndContext` and `DragOverlay`
  - Background color `#0d0d0d`, font IBM Plex Sans applied globally
  - Header spans full width above the 3 columns
  - TypeScript compiles, layout renders correctly
- **Notes**:
  - DndContext setup: `sensors` (PointerSensor with 8px activation distance), `collisionDetection` (closestCenter)
  - `onDragStart` → set `activeDragId` state
  - `onDragEnd` → handle palette-to-list or list reorder
  - `DragOverlay` renders a ghost `ModuleCard` when dragging

---

## TASK-007 — Header component

- **Agent**: ui-agent
- **Phase**: 2
- **Inputs**: PLAN.md layout, design system colors
- **Outputs**: `src/components/Header.tsx`
- **Depends on**: TASK-001
- **Acceptance criteria**:
  - Displays title "FASTFETCH CONFIG BUILDER" in accent color (#00d4ff), mono font
  - Contains slot/area for PresetLoader dropdown (placeholder `<div>` for now)
  - Contains [Copy] and [Download] action buttons (wired later, can be no-ops initially)
  - Buttons styled: surface background, accent border/text on hover, rounded
  - Fixed at top, full width, `h-14` or similar
  - Responsive: title truncates or shrinks on narrow screens
  - TypeScript compiles, component renders
- **Notes**:
  - Copy/Download callbacks will be passed as props or use store — decide at implementation time
  - Keep component simple, no state of its own

---

## TASK-008 — GlobalSettings panel

- **Agent**: ui-agent
- **Phase**: 2
- **Inputs**: Store `GlobalSettings` shape, design system
- **Outputs**: `src/components/GlobalSettings.tsx`
- **Depends on**: TASK-003
- **Acceptance criteria**:
  - Reads `globalSettings` from `useConfigStore`
  - **Logo section**:
    - Source input (text field or select with common logo names: none, auto, linux, arch, ubuntu, fedora, debian, macos, windows, etc.)
    - Type select: auto, builtin, small
    - Padding inputs: top, left, right (number inputs)
  - **Display section**:
    - Separator input (text field, default `: `)
    - Color select (dropdown of AnsiColor values)
    - Bright color toggle (checkbox/switch)
    - Key width input (number)
  - All inputs dispatch corresponding store actions on change
  - Styled with surface background (#1a1a1f), accent highlights, proper spacing
  - Section headers with muted text labels
  - TypeScript compiles, all inputs functional
- **Notes**:
  - Use controlled inputs bound to store state
  - AnsiColor dropdown should show color name + small color swatch/preview

---

## TASK-009 — ModulePalette component

- **Agent**: ui-agent
- **Phase**: 2
- **Inputs**: `MODULE_DEFINITIONS`, dnd-kit `useDraggable`
- **Outputs**: `src/components/ModulePalette.tsx`
- **Depends on**: TASK-002, TASK-006
- **Acceptance criteria**:
  - Renders all 23 module types from `MODULE_DEFINITIONS` grouped by category
  - Each module type is a draggable chip/button using `useDraggable` from `@dnd-kit/core`
  - Draggable `data` payload: `{ type: moduleType, fromPalette: true }`
  - Category headers: "Info", "Hardware", "Network", "Display", "Other"
  - Chip style: small, surface bg, rounded-full, icon + label, accent border on hover
  - Clicking a chip (not just dragging) also adds the module to the list (via `addModule`)
  - Scrollable if content overflows
  - TypeScript compiles, chips render and are draggable
- **Notes**:
  - Palette sits above or inside the ModuleList column
  - Each chip needs a unique draggable ID like `palette-${moduleType}`

---

## TASK-010 — ModuleCard component

- **Agent**: ui-agent
- **Phase**: 2
- **Inputs**: `ModuleInstance`, `MODULE_DEFINITIONS`, design system
- **Outputs**: `src/components/ModuleCard.tsx`
- **Depends on**: TASK-002, TASK-003
- **Acceptance criteria**:
  - Receives `moduleInstance: ModuleInstance` as prop
  - Displays module type label, icon, and drag handle
  - Expandable: click to toggle inline options form
  - Options form renders correct fields based on `MODULE_DEFINITIONS[type].optionFields`:
    - Boolean fields → toggle switch
    - String fields → text input
    - Number fields → number input (with min/max where relevant)
    - Select fields (e.g., `compactType`) → dropdown
    - `keyColor` → AnsiColor dropdown
  - Delete button (trash icon) → calls `removeModule(id)`
  - Duplicate button → calls `duplicateModule(id)`
  - All option changes dispatch `updateModuleOptions(id, { field: value })`
  - Uses `useSortable` from `@dnd-kit/sortable` for drag handle + transform
  - Styled: surface bg, rounded, subtle border, accent highlights on drag
  - Drag handle: grip dots icon on the left
  - TypeScript compiles, card renders with working options
- **Notes**:
  - Expansion state is local (`useState`), not in store
  - Use `CSS.Transform.toString(transform)` for sortable transform
  - `transition` from `useSortable` for smooth animation

---

## TASK-011 — ModuleList component (DnD sortable container)

- **Agent**: ui-agent
- **Phase**: 2
- **Inputs**: Store modules array, `ModuleCard`, `ModulePalette`, dnd-kit
- **Outputs**: `src/components/ModuleList.tsx`
- **Depends on**: TASK-009, TASK-010, TASK-003
- **Acceptance criteria**:
  - Reads `modules` from `useConfigStore`
  - Wraps module cards in `SortableContext` with `verticalListSortingStrategy`
  - Items array: `modules.map(m => m.id)`
  - Renders `ModulePalette` at the top (or as a collapsible section)
  - Renders a `ModuleCard` for each module instance
  - Shows empty state message when no modules: "Drag modules from above or click to add"
  - Droppable area accepts drops from palette
  - Scrollable column with proper padding
  - TypeScript compiles, drag-and-drop works end-to-end
- **Notes**:
  - The actual DndContext is in App.tsx — this component just provides SortableContext
  - Use `useDroppable` for the list container to accept palette drops

---

## TASK-012 — JsonPreview component (CodeMirror)

- **Agent**: ui-agent
- **Phase**: 3
- **Inputs**: `generateJsonc`, store, CodeMirror packages
- **Outputs**: `src/components/JsonPreview.tsx`
- **Depends on**: TASK-004, TASK-003
- **Acceptance criteria**:
  - Subscribes to store (`globalSettings` + `modules`)
  - Calls `generateJsonc()` on every state change to produce JSONC string
  - Renders CodeMirror editor in read-only mode with:
    - `@codemirror/lang-json` extension
    - Custom dark theme matching design system (bg #0d0d0d, text #e0e0e8, accents)
    - Line numbers enabled
    - JetBrains Mono font
    - Word wrap enabled
  - Exposes `getJsoncString()` for Copy/Download (or store selector)
  - Full height of its column, scrollable
  - TypeScript compiles, preview updates live as modules change
- **Notes**:
  - Use `useMemo` to memoize the generated JSONC string
  - CodeMirror theme: create custom theme with `createTheme` from `@uiw/react-codemirror`
  - Extensions array: `[json(), customTheme, EditorView.lineWrapping]`

---

## TASK-013 — Copy + Download actions

- **Agent**: ui-agent
- **Phase**: 3
- **Inputs**: JSONC string from preview/store
- **Outputs**: Updates to `src/components/Header.tsx` (wire up buttons)
- **Depends on**: TASK-007, TASK-012
- **Acceptance criteria**:
  - **Copy button**: Uses `navigator.clipboard.writeText()` to copy JSONC string
  - Shows brief "Copied!" feedback (tooltip or button text change, 2s timeout)
  - **Download button**: Creates a Blob, generates object URL, triggers download as `config.jsonc`
  - Both buttons read current JSONC from `generateJsonc(store.globalSettings, store.modules)`
  - Buttons are accessible (aria-labels, keyboard focusable)
  - TypeScript compiles, both actions work
- **Notes**:
  - Consider a small utility or hook: `useJsoncOutput()` that returns the current JSONC string
  - Clipboard API requires HTTPS or localhost — works fine in dev

---

## TASK-014 — PresetLoader component

- **Agent**: ui-agent
- **Phase**: 4
- **Inputs**: `PRESETS` from presets.ts, store `loadPreset` action
- **Outputs**: `src/components/PresetLoader.tsx`
- **Depends on**: TASK-005, TASK-003
- **Acceptance criteria**:
  - Renders a dropdown/select with all 5 preset names
  - Shows preset description on hover or as subtitle
  - Selecting a preset calls `loadPreset(selectedPreset)`
  - Includes a confirmation if current config has unsaved custom changes (optional, nice-to-have)
  - Styled: surface bg dropdown, accent highlight on selected item
  - Dropdown closes on selection or outside click
  - TypeScript compiles, preset loading works end-to-end
- **Notes**:
  - Use a custom dropdown (not native `<select>`) for consistent styling
  - Dropdown should be positioned relative to the header button

---

## TASK-015 — Framer Motion animations

- **Agent**: polish-agent
- **Phase**: 4
- **Inputs**: `ModuleCard.tsx`, `ModuleList.tsx`, framer-motion
- **Outputs**: Updates to `src/components/ModuleCard.tsx`, `src/components/ModuleList.tsx`
- **Depends on**: TASK-010, TASK-011
- **Acceptance criteria**:
  - `ModuleCard` enter animation: fade in + slide from left (opacity 0→1, x -20→0)
  - `ModuleCard` exit animation: fade out + slide right (opacity 1→0, x 0→20)
  - Module list uses `AnimatePresence` for enter/exit animations
  - Options expand/collapse animates height smoothly (`layout` prop or `animate` height)
  - Drag overlay card has subtle scale-up effect (scale 1.02) and elevated shadow
  - Animations are snappy (200-300ms duration, ease-out)
  - No layout thrashing or janky transitions
  - TypeScript compiles, animations play correctly
- **Notes**:
  - Use `motion.div` wrapper for ModuleCard
  - `AnimatePresence` with `mode="popLayout"` for smooth reorder
  - Be careful with `layoutId` — each card's `layoutId` = module `id`

---

## TASK-016 — localStorage persistence verification

- **Agent**: qa-agent
- **Phase**: 4
- **Inputs**: Full app
- **Outputs**: Bug fixes to `src/store/configStore.ts` if needed
- **Depends on**: TASK-003, TASK-006
- **Acceptance criteria**:
  - Config persists across page reloads
  - Adding/removing/reordering modules persists
  - Global settings changes persist
  - Loading a preset persists
  - Clearing localStorage and reloading falls back to default preset
  - No stale state or hydration mismatch errors in console
  - Store version migration works if schema changes (basic `migrate` function)
- **Notes**:
  - Test by: make changes → reload → verify state matches
  - Check for SSR hydration issues (shouldn't be any with Vite SPA, but verify)

---

## TASK-017 — TerminalMockup component (bonus)

- **Agent**: ui-agent
- **Phase**: 5
- **Inputs**: Store modules, design system
- **Outputs**: `src/components/TerminalMockup.tsx`
- **Depends on**: TASK-003, TASK-002
- **Acceptance criteria**:
  - Renders a fake terminal window with:
    - Terminal chrome: title bar with colored dots (red/yellow/green), window title "fastfetch"
    - Dark background matching design (#0d0d0d or slightly lighter)
    - Monospace font (JetBrains Mono)
  - Left side: ASCII art logo (simple tux penguin or generic logo, hardcoded)
  - Right side: simulated output based on current modules
    - Each module renders as `Key        : Value` with appropriate spacing
    - Key text in accent color, value in primary text color
    - Values are realistic placeholders (e.g., CPU → "Intel i7-12700K (20) @ 5.0 GHz")
    - Separator module renders as a dashed line
    - Title module renders as `user@hostname`
    - Colors module renders as ANSI color blocks (█ characters)
  - Scrollable if content overflows
  - TypeScript compiles, mockup renders
- **Notes**:
  - This is a visual approximation, NOT a real terminal emulator
  - Hardcode ~15 placeholder values for common modules
  - Use `<pre>` or `whitespace-pre` for alignment

---

## TASK-018 — Final integration + polish

- **Agent**: integration-agent
- **Phase**: 5
- **Inputs**: All components
- **Outputs**: Updates across multiple files
- **Depends on**: TASK-006 through TASK-017
- **Acceptance criteria**:
  - All components render together without errors
  - DnD works: drag from palette → add to list, reorder within list
  - Global settings changes reflect in JSONC preview immediately
  - Module option changes reflect in JSONC preview immediately
  - Preset loading replaces all state and updates preview
  - Copy and download produce valid JSONC
  - No TypeScript errors (`npx tsc --noEmit` passes)
  - No console errors or warnings
  - Visual polish: consistent spacing, no overflow issues, smooth scrolling
  - Responsive: works on 1280px+ screens (no mobile required)
  - Page title and favicon set
- **Notes**:
  - This is the final QA pass
  - Fix any integration bugs discovered
  - Ensure all imports are correct and no circular dependencies exist

---

## Dependency Graph

```
TASK-001 (scaffold)
├── TASK-002 (module definitions)
│   ├── TASK-003 (store) ──────────┐
│   │   ├── TASK-006 (app shell) ──┤
│   │   │   ├── TASK-011 (module list) ←── TASK-009 (palette) + TASK-010 (card)
│   │   │   └── TASK-016 (persistence QA)
│   │   ├── TASK-008 (global settings)
│   │   ├── TASK-012 (json preview) ←── TASK-004 (generator)
│   │   │   └── TASK-013 (copy/download) ←── TASK-007 (header)
│   │   ├── TASK-014 (preset loader) ←── TASK-005 (presets)
│   │   └── TASK-017 (terminal mockup)
│   ├── TASK-004 (generator)
│   ├── TASK-005 (presets)
│   ├── TASK-009 (palette)
│   └── TASK-010 (card)
├── TASK-007 (header)
└── TASK-015 (animations) ←── TASK-010 + TASK-011

TASK-018 (integration) ←── ALL
```

## Critical Path

```
TASK-001 → TASK-002 → TASK-003 → TASK-006 → TASK-011 → TASK-015 → TASK-018
```

This is the longest dependency chain (7 tasks). Phases 1-2 are sequential on this path; Phase 3-4 tasks can run in parallel once their dependencies are met.

## Parallelization Opportunities

After TASK-002 completes, these can run in parallel:
- **TASK-003** (store) + **TASK-004** (generator) + **TASK-005** (presets)

After TASK-003 completes, these can run in parallel:
- **TASK-008** (global settings) + **TASK-009** (palette) + **TASK-010** (card) + **TASK-012** (json preview)

After TASK-011 completes:
- **TASK-015** (animations) + **TASK-016** (persistence QA) + **TASK-017** (terminal mockup)
