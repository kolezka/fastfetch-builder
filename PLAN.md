# Fastfetch Builder — Implementation Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React App (App.tsx)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ GlobalSettings│  │  ModuleList  │  │    JsonPreview        │  │
│  │   Panel       │  │  (DnD zone)  │  │    (CodeMirror)       │  │
│  │              │  │  ┌──────────┐ │  │                       │  │
│  │  logo        │  │  │ModuleCard│ │  │  Read-only JSONC      │  │
│  │  display     │  │  │ModuleCard│ │  │  with syntax highlight│  │
│  │  separator   │  │  │ModuleCard│ │  │                       │  │
│  │              │  │  └──────────┘ │  │  [Copy] [Download]    │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                       │              │
│         └─────────┬───────┘                       │              │
│                   ▼                               │              │
│          ┌────────────────┐                       │              │
│          │  Zustand Store  │───────────────────────┘              │
│          │  (configStore)  │                                      │
│          │                │──► localStorage (auto-save)          │
│          └───────┬────────┘                                      │
│                  │                                               │
│                  ▼                                               │
│          ┌────────────────┐                                      │
│          │ generateJsonc() │                                      │
│          │  (pure function)│                                      │
│          └────────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Data flow:**

1. User interacts with **GlobalSettings** or **ModuleList** → dispatches Zustand actions
2. Zustand store holds canonical state (global settings + ordered module list)
3. `generateJsonc()` is a pure function: `(globalSettings, modules) → string`
4. **JsonPreview** subscribes to store, calls `generateJsonc()` on every change
5. Auto-save middleware persists store to `localStorage` on every mutation
6. On load, store hydrates from `localStorage` (or falls back to a default preset)

**Drag-and-drop flow:**

1. **ModulePalette** contains all available module types as draggable items
2. User drags a module type from palette → drops into **ModuleList**
3. `onDragEnd` handler creates a new module instance (with `uuid`) and inserts at drop position
4. Within **ModuleList**, items are sortable via `@dnd-kit/sortable`
5. Each **ModuleCard** expands inline to show type-specific options

## Component Dependency Graph

```
App.tsx
├── Header.tsx
│   └── PresetLoader.tsx
├── GlobalSettings.tsx
├── ModuleList.tsx
│   ├── ModulePalette.tsx (draggable source)
│   └── ModuleCard.tsx (sortable items)
├── JsonPreview.tsx
└── TerminalMockup.tsx (bonus)

Shared dependencies:
├── store/configStore.ts (consumed by all components)
├── lib/moduleDefinitions.ts (consumed by ModulePalette, ModuleCard, generateJsonc)
├── lib/presets.ts (consumed by PresetLoader, configStore)
└── lib/generateJsonc.ts (consumed by JsonPreview, TerminalMockup)
```

## State Shape

```typescript
// ─── Module System ───

type AnsiColor =
  | "black" | "red" | "green" | "yellow" | "blue"
  | "magenta" | "cyan" | "white"
  | "brightBlack" | "brightRed" | "brightGreen" | "brightYellow"
  | "brightBlue" | "brightMagenta" | "brightCyan" | "brightWhite";

type ModuleType =
  | "title" | "separator" | "os" | "kernel" | "uptime"
  | "shell" | "terminal" | "wm" | "packages"
  | "cpu" | "gpu" | "memory" | "swap" | "disk"
  | "display" | "brightness" | "battery" | "poweradapter"
  | "localip" | "wifi" | "colors" | "custom" | "cpuusage";

// Per-type option shapes
interface CpuOptions {
  showPeCoreCount?: boolean;
  temp?: boolean;
  freqNdig?: 0 | 1 | 2 | 3;
}

interface GpuOptions {
  temp?: boolean;
  driverVersion?: boolean;
}

interface MemoryOptions {
  format?: string;
}

interface SwapOptions {
  format?: string;
}

interface DiskOptions {
  folders?: string;
  format?: string;
}

interface DisplayOptions {
  compactType?: "none" | "original" | "scaled" | "original-with-scaled-resolution";
}

interface LocalipOptions {
  showIpv6?: boolean;
  compact?: boolean;
}

interface BatteryOptions {
  format?: string;
}

interface CpuUsageOptions {
  waitTime?: number;
}

interface TitleOptions {
  format?: string;
}

interface CustomOptions {
  format?: string;
}

// Discriminated union would be ideal but complex; use a flat options bag instead
interface ModuleOptions {
  // Common to all
  key?: string;
  keyColor?: AnsiColor;
  // Type-specific (only relevant fields populated)
  showPeCoreCount?: boolean;
  temp?: boolean;
  freqNdig?: 0 | 1 | 2 | 3;
  driverVersion?: boolean;
  format?: string;
  folders?: string;
  compactType?: "none" | "original" | "scaled" | "original-with-scaled-resolution";
  showIpv6?: boolean;
  compact?: boolean;
  waitTime?: number;
}

interface ModuleInstance {
  id: string;          // uuid — unique per instance
  type: ModuleType;
  options: ModuleOptions;
}

// ─── Global Settings ───

type LogoSource = "none" | string; // built-in name or "none"

interface LogoSettings {
  source: LogoSource;
  type?: "auto" | "builtin" | "small";
  color?: AnsiColor[];
  padding?: { top?: number; left?: number; right?: number };
}

interface DisplaySettings {
  separator?: string;    // e.g. " - ", ": "
  color?: AnsiColor;
  brightColor?: boolean;
  showErrors?: boolean;
  keyWidth?: number;
}

interface GlobalSettings {
  logo: LogoSettings;
  display: DisplaySettings;
}

// ─── Store ───

interface ConfigState {
  // Data
  globalSettings: GlobalSettings;
  modules: ModuleInstance[];

  // Actions — Global Settings
  setLogoSource: (source: LogoSource) => void;
  setLogoType: (type: LogoSettings["type"]) => void;
  setLogoPadding: (padding: LogoSettings["padding"]) => void;
  setDisplaySeparator: (sep: string) => void;
  setDisplayColor: (color: AnsiColor) => void;
  setDisplayKeyWidth: (width: number) => void;

  // Actions — Modules
  addModule: (type: ModuleType, index?: number) => void;
  removeModule: (id: string) => void;
  updateModuleOptions: (id: string, options: Partial<ModuleOptions>) => void;
  reorderModules: (activeId: string, overId: string) => void;
  duplicateModule: (id: string) => void;

  // Actions — Bulk
  loadPreset: (preset: PresetConfig) => void;
  resetToDefault: () => void;
}

// ─── Presets ───

interface PresetConfig {
  name: string;
  description: string;
  globalSettings: GlobalSettings;
  modules: Array<{ type: ModuleType; options?: ModuleOptions }>;
}
```

## Key Implementation Decisions

### 1. Module as string vs object in JSONC output

Fastfetch accepts two forms in the `modules` array:
- `"cpu"` — plain string when using all defaults
- `{ "type": "cpu", "temp": true }` — object when any option is set

**Decision:** `generateJsonc()` checks each module's `options` object. If every value is `undefined`, `null`, or `""`, emit as a plain string. Otherwise emit as an object with only truthy/non-default keys. This matches fastfetch's own convention and keeps output clean.

### 2. dnd-kit integration with Zustand

**Decision:** Use two interaction zones within a single `DndContext`:
- **ModulePalette** items use `useDraggable` (source-only, not sortable)
- **ModuleList** items use `useSortable` (reorderable)
- `onDragEnd` checks: if `active` came from palette → `addModule(type, index)`. If `active` came from list → `reorderModules(activeId, overId)`.
- `DragOverlay` renders a ghost card for visual feedback.
- Collision detection: `closestCenter` strategy for forgiving drops.

### 3. CodeMirror configuration

**Decision:** Use `@uiw/react-codemirror` with:
- `@codemirror/lang-json` for syntax highlighting (JSONC is close enough to JSON for highlighting)
- Read-only mode (`editable: false`, `readOnly: true`)
- Custom dark theme matching our color palette (#0d0d0d bg, #00d4ff accents)
- Line numbers enabled for reference

### 4. Auto-save strategy

**Decision:** Zustand `persist` middleware with `localStorage`. Debounce is unnecessary because Zustand's persist middleware batches synchronous updates. On first load, if no saved state exists, load the "neofetch" preset as default.

### 5. JSONC generation as a pure function

**Decision:** `generateJsonc()` is a standalone pure function (not a store method). It takes `(globalSettings, modules)` and returns a string. This keeps it testable and avoids circular dependencies. It manually builds the string (not `JSON.stringify`) to inject section comments like `// Modules`.

### 6. Module definitions as static data

**Decision:** `moduleDefinitions.ts` exports a `Record<ModuleType, ModuleDefinition>` containing:
- Display name, icon/emoji, category
- Which option fields are relevant for this type
- Default values for each option
- This is the single source of truth for what options each module type supports.

### 7. Fonts

**Decision:** Load IBM Plex Sans (weights 400, 500, 600) and JetBrains Mono (400, 500) from Google Fonts via `<link>` tags in `index.html`. No `@font-face` complexity. Tailwind config maps them to `font-sans` and `font-mono`.

## Phase Breakdown

### Phase 1: Foundation (scaffolding + store + generator)

**Goal:** Working dev server with store, type definitions, and JSONC generation.

- Scaffold Vite + React + TypeScript project
- Install all dependencies
- Configure Tailwind with custom dark theme tokens
- Set up Google Fonts in `index.html`
- Define all TypeScript interfaces in the store
- Implement `moduleDefinitions.ts` (static module metadata)
- Implement `configStore.ts` with Zustand + persist middleware
- Implement `generateJsonc.ts` pure function
- Define `presets.ts` data

### Phase 2: Core UI (ModuleList + ModuleCard + GlobalSettings)

**Goal:** Functional 3-column layout with drag-and-drop module management.

- Build `App.tsx` shell with 3-column grid layout
- Build `Header.tsx` with title and action buttons
- Build `GlobalSettings.tsx` panel (logo source, display options)
- Build `ModulePalette.tsx` (available modules to drag)
- Build `ModuleCard.tsx` (individual module with inline options)
- Build `ModuleList.tsx` with dnd-kit sortable integration
- Wire up DndContext in App.tsx

### Phase 3: Preview & Export (JsonPreview + Copy + Download)

**Goal:** Live JSONC preview with copy/download.

- Build `JsonPreview.tsx` with CodeMirror (read-only, themed)
- Implement copy-to-clipboard action
- Implement download-as-file action
- Wire preview to store subscription

### Phase 4: Presets & UX Polish (PresetLoader + animations + localStorage)

**Goal:** Preset loading, animations, and persistence.

- Build `PresetLoader.tsx` dropdown in header
- Add Framer Motion animations to ModuleCard (enter/exit/reorder)
- Verify localStorage persistence works end-to-end
- Add keyboard shortcuts (Ctrl+C to copy, etc.)
- Polish responsive behavior and scrolling

### Phase 5: Bonus (TerminalMockup)

**Goal:** ASCII-art terminal preview showing approximate fastfetch output.

- Build `TerminalMockup.tsx` with fake terminal chrome
- Render approximate ASCII output based on current modules
- Add toggle to switch between JSONC preview and terminal mockup
