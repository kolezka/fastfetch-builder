import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  AnsiColor,
  DisplaySettings,
  GlobalSettings,
  LogoSettings,
  LogoSource,
  ModuleInstance,
  ModuleOptions,
  ModuleType,
  PresetConfig,
} from '@/lib/moduleDefinitions'

export interface ConfigState {
  globalSettings: GlobalSettings
  modules: ModuleInstance[]

  setLogoSource: (source: LogoSource) => void
  setLogoType: (type: LogoSettings['type']) => void
  setLogoPadding: (padding: LogoSettings['padding']) => void
  setDisplaySeparator: (sep: string) => void
  setDisplayColor: (color: AnsiColor) => void
  setDisplayBrightColor: (bright: boolean) => void
  setDisplayKeyWidth: (width: number) => void

  addModule: (type: ModuleType, index?: number) => void
  removeModule: (id: string) => void
  updateModuleOptions: (id: string, options: Partial<ModuleOptions>) => void
  reorderModules: (activeId: string, overId: string) => void
  duplicateModule: (id: string) => void

  loadPreset: (preset: PresetConfig) => void
  resetToDefault: () => void
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  logo: {
    source: 'none',
    type: 'auto',
    padding: { top: 0, left: 0, right: 0 },
  },
  display: {
    separator: ': ',
    color: 'cyan',
    brightColor: true,
    keyWidth: 0,
  },
}

function createModuleInstance(type: ModuleType, options?: ModuleOptions): ModuleInstance {
  return {
    id: uuidv4(),
    type,
    options: options ?? {},
  }
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      globalSettings: { ...DEFAULT_GLOBAL_SETTINGS },
      modules: [],

      setLogoSource: (source) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            logo: { ...state.globalSettings.logo, source },
          },
        })),

      setLogoType: (type) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            logo: { ...state.globalSettings.logo, type },
          },
        })),

      setLogoPadding: (padding) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            logo: { ...state.globalSettings.logo, padding },
          },
        })),

      setDisplaySeparator: (separator) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: { ...state.globalSettings.display, separator },
          },
        })),

      setDisplayColor: (color) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: { ...state.globalSettings.display, color },
          },
        })),

      setDisplayBrightColor: (brightColor) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: { ...state.globalSettings.display, brightColor },
          },
        })),

      setDisplayKeyWidth: (keyWidth) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: { ...state.globalSettings.display, keyWidth },
          },
        })),

      addModule: (type, index) =>
        set((state) => {
          const newModule = createModuleInstance(type)
          const modules = [...state.modules]
          if (index !== undefined && index >= 0 && index <= modules.length) {
            modules.splice(index, 0, newModule)
          } else {
            modules.push(newModule)
          }
          return { modules }
        }),

      removeModule: (id) =>
        set((state) => ({
          modules: state.modules.filter((m) => m.id !== id),
        })),

      updateModuleOptions: (id, options) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, options: { ...m.options, ...options } } : m,
          ),
        })),

      reorderModules: (activeId, overId) =>
        set((state) => {
          const oldIndex = state.modules.findIndex((m) => m.id === activeId)
          const newIndex = state.modules.findIndex((m) => m.id === overId)
          if (oldIndex === -1 || newIndex === -1) return state
          const modules = [...state.modules]
          const [moved] = modules.splice(oldIndex, 1)
          if (moved) {
            modules.splice(newIndex, 0, moved)
          }
          return { modules }
        }),

      duplicateModule: (id) =>
        set((state) => {
          const index = state.modules.findIndex((m) => m.id === id)
          if (index === -1) return state
          const original = state.modules[index]
          if (!original) return state
          const duplicate: ModuleInstance = {
            id: uuidv4(),
            type: original.type,
            options: { ...original.options },
          }
          const modules = [...state.modules]
          modules.splice(index + 1, 0, duplicate)
          return { modules }
        }),

      loadPreset: (preset) =>
        set({
          globalSettings: structuredClone(preset.globalSettings),
          modules: preset.modules.map((m) => createModuleInstance(m.type, m.options)),
        }),

      resetToDefault: () =>
        set({
          globalSettings: structuredClone(DEFAULT_GLOBAL_SETTINGS),
          modules: [],
        }),
    }),
    {
      name: 'fastfetch-config',
      partialize: (state) => ({
        globalSettings: state.globalSettings,
        modules: state.modules,
      }),
    },
  ),
)

export type { AnsiColor, DisplaySettings, GlobalSettings, LogoSettings, LogoSource, ModuleInstance, ModuleOptions, ModuleType, PresetConfig }
