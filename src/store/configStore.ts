import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  AnsiColor,
  ChafaSettings,
  DisplayBarSettings,
  DisplayColorSettings,
  DisplayDurationSettings,
  DisplayFractionSettings,
  DisplayFreqSettings,
  DisplayKeySettings,
  DisplayPercentSettings,
  DisplaySettings,
  DisplaySizeSettings,
  DisplayTempSettings,
  GeneralSettings,
  GlobalSettings,
  LogoPosition,
  LogoSettings,
  LogoSource,
  LogoType,
  ModuleInstance,
  ModuleOptions,
  ModuleType,
  PresetConfig,
} from '@/lib/moduleDefinitions'
import { PRESETS } from '@/lib/presets'

export interface ConfigState {
  globalSettings: GlobalSettings
  modules: ModuleInstance[]

  // Legacy individual setters (kept for backward compat)
  setLogoSource: (source: LogoSource) => void
  setLogoType: (type: LogoSettings['type']) => void
  setLogoPadding: (padding: LogoSettings['padding']) => void
  setDisplaySeparator: (sep: string) => void
  setDisplayColor: (color: AnsiColor) => void
  setDisplayBrightColor: (bright: boolean) => void
  setDisplayKeyWidth: (width: number) => void

  // Generic section updaters for all settings
  updateLogo: (patch: Partial<LogoSettings>) => void
  updateDisplay: (patch: Partial<DisplaySettings>) => void
  updateGeneral: (patch: Partial<GeneralSettings>) => void
  updateDisplayColor: (patch: Partial<DisplayColorSettings>) => void
  updateDisplayKey: (patch: Partial<DisplayKeySettings>) => void
  updateDisplaySize: (patch: Partial<DisplaySizeSettings>) => void
  updateDisplayTemp: (patch: Partial<DisplayTempSettings>) => void
  updateDisplayBar: (patch: Partial<DisplayBarSettings>) => void
  updateDisplayPercent: (patch: Partial<DisplayPercentSettings>) => void
  updateDisplayFreq: (patch: Partial<DisplayFreqSettings>) => void
  updateDisplayDuration: (patch: Partial<DisplayDurationSettings>) => void
  updateDisplayFraction: (patch: Partial<DisplayFractionSettings>) => void
  updateLogoChafa: (patch: Partial<ChafaSettings>) => void

  addModule: (type: ModuleType, index?: number) => void
  removeModule: (id: string) => void
  updateModuleOptions: (id: string, options: Partial<ModuleOptions>) => void
  setModules: (modules: ModuleInstance[]) => void
  reorderModules: (activeId: string, overId: string) => void
  moveModule: (id: string, direction: 'up' | 'down') => void
  duplicateModule: (id: string) => void

  loadPreset: (preset: PresetConfig) => void
  resetToDefault: () => void
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  logo: {
    source: 'none',
    type: 'auto',
    padding: { top: 0, left: 0, right: 0 },
    position: 'left',
    printRemaining: true,
    preserveAspectRatio: false,
    recache: false,
  },
  display: {
    separator: ': ',
    color: 'cyan',
    brightColor: true,
    keyWidth: 0,
    showErrors: false,
    stat: false,
    pipe: false,
    disableLinewrap: true,
    hideCursor: true,
    noBuffer: false,
    key: { width: 0, type: 'string', paddingLeft: 0 },
    size: { binaryPrefix: 'iec', maxPrefix: 'YB', ndigits: 2 },
    temp: { unit: 'D', ndigits: 1 },
    bar: { char: { elapsed: '■', total: '-' }, width: 10 },
    percent: { ndigits: 0, width: 0 },
    freq: { ndigits: 2 },
    duration: { abbreviation: false },
    fraction: { ndigits: 2 },
  },
  general: {
    thread: true,
    escapeBedrock: true,
    dsForceDrm: false,
    detectVersion: true,
    processingTimeout: 5000,
    wmiTimeout: 5000,
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
      globalSettings: structuredClone(DEFAULT_GLOBAL_SETTINGS),
      modules: [],

      // Legacy setters
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

      // Generic section updaters
      updateLogo: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            logo: { ...state.globalSettings.logo, ...patch },
          },
        })),

      updateDisplay: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: { ...state.globalSettings.display, ...patch },
          },
        })),

      updateGeneral: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            general: { ...state.globalSettings.general, ...patch },
          },
        })),

      updateDisplayColor: (patch) =>
        set((state) => {
          const current = state.globalSettings.display.color
          const currentObj: DisplayColorSettings = typeof current === 'object' && current !== null && !Array.isArray(current)
            ? current as DisplayColorSettings
            : {}
          return {
            globalSettings: {
              ...state.globalSettings,
              display: {
                ...state.globalSettings.display,
                color: { ...currentObj, ...patch } as unknown as AnsiColor,
              },
            },
          }
        }),

      updateDisplayKey: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              key: { ...state.globalSettings.display.key, ...patch },
            },
          },
        })),

      updateDisplaySize: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              size: { ...state.globalSettings.display.size, ...patch },
            },
          },
        })),

      updateDisplayTemp: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              temp: { ...state.globalSettings.display.temp, ...patch },
            },
          },
        })),

      updateDisplayBar: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              bar: { ...state.globalSettings.display.bar, ...patch },
            },
          },
        })),

      updateDisplayPercent: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              percent: { ...state.globalSettings.display.percent, ...patch },
            },
          },
        })),

      updateDisplayFreq: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              freq: { ...state.globalSettings.display.freq, ...patch },
            },
          },
        })),

      updateDisplayDuration: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              duration: { ...state.globalSettings.display.duration, ...patch },
            },
          },
        })),

      updateDisplayFraction: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            display: {
              ...state.globalSettings.display,
              fraction: { ...state.globalSettings.display.fraction, ...patch },
            },
          },
        })),

      updateLogoChafa: (patch) =>
        set((state) => ({
          globalSettings: {
            ...state.globalSettings,
            logo: {
              ...state.globalSettings.logo,
              chafa: { ...state.globalSettings.logo.chafa, ...patch },
            },
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

      setModules: (modules) =>
        set({ modules }),

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

      moveModule: (id, direction) =>
        set((state) => {
          const index = state.modules.findIndex((m) => m.id === id)
          if (index === -1) return state
          const targetIndex = direction === 'up' ? index - 1 : index + 1
          if (targetIndex < 0 || targetIndex >= state.modules.length) return state
          const modules = [...state.modules]
          const [moved] = modules.splice(index, 1)
          if (moved) {
            modules.splice(targetIndex, 0, moved)
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
      onRehydrateStorage: () => (state) => {
        if (state && state.modules.length === 0) {
          const neofetch = PRESETS[0]
          if (neofetch) {
            state.loadPreset(neofetch as PresetConfig)
          }
        }
      },
    },
  ),
)

export type { AnsiColor, DisplaySettings, GeneralSettings, GlobalSettings, LogoSettings, LogoSource, ModuleInstance, ModuleOptions, ModuleType, PresetConfig }
