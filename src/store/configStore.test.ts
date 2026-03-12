import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore } from './configStore'
import { PRESETS } from '@/lib/presets'
import type { PresetConfig } from '@/lib/moduleDefinitions'

function getStore() {
  return useConfigStore.getState()
}

describe('configStore', () => {
  beforeEach(() => {
    // Reset to clean state before each test
    getStore().resetToDefault()
  })

  describe('addModule', () => {
    it('adds a module to the end by default', () => {
      getStore().addModule('os')
      const modules = getStore().modules
      expect(modules).toHaveLength(1)
      expect(modules[0]!.type).toBe('os')
      expect(modules[0]!.id).toBeTruthy()
    })

    it('adds a module at a specific index', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      getStore().addModule('kernel', 1) // insert between os and cpu
      const types = getStore().modules.map((m) => m.type)
      expect(types).toEqual(['os', 'kernel', 'cpu'])
    })

    it('assigns unique IDs to each module', () => {
      getStore().addModule('os')
      getStore().addModule('os')
      const [a, b] = getStore().modules
      expect(a!.id).not.toBe(b!.id)
    })
  })

  describe('removeModule', () => {
    it('removes a module by ID', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      const idToRemove = getStore().modules[0]!.id
      getStore().removeModule(idToRemove)
      expect(getStore().modules).toHaveLength(1)
      expect(getStore().modules[0]!.type).toBe('cpu')
    })

    it('does nothing when ID not found', () => {
      getStore().addModule('os')
      getStore().removeModule('nonexistent')
      expect(getStore().modules).toHaveLength(1)
    })
  })

  describe('moveModule', () => {
    it('moves a module up', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      getStore().addModule('gpu')
      const cpuId = getStore().modules[1]!.id
      getStore().moveModule(cpuId, 'up')
      expect(getStore().modules.map((m) => m.type)).toEqual(['cpu', 'os', 'gpu'])
    })

    it('moves a module down', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      getStore().addModule('gpu')
      const cpuId = getStore().modules[1]!.id
      getStore().moveModule(cpuId, 'down')
      expect(getStore().modules.map((m) => m.type)).toEqual(['os', 'gpu', 'cpu'])
    })

    it('does not move first module up', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      const firstId = getStore().modules[0]!.id
      getStore().moveModule(firstId, 'up')
      expect(getStore().modules.map((m) => m.type)).toEqual(['os', 'cpu'])
    })

    it('does not move last module down', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      const lastId = getStore().modules[1]!.id
      getStore().moveModule(lastId, 'down')
      expect(getStore().modules.map((m) => m.type)).toEqual(['os', 'cpu'])
    })
  })

  describe('duplicateModule', () => {
    it('duplicates a module right after it', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      const osId = getStore().modules[0]!.id
      getStore().duplicateModule(osId)
      const modules = getStore().modules
      expect(modules).toHaveLength(3)
      expect(modules[0]!.type).toBe('os')
      expect(modules[1]!.type).toBe('os')
      expect(modules[2]!.type).toBe('cpu')
      // different IDs
      expect(modules[0]!.id).not.toBe(modules[1]!.id)
    })

    it('copies options when duplicating', () => {
      getStore().addModule('cpu')
      getStore().updateModuleOptions(getStore().modules[0]!.id, { temp: true, key: 'Processor' })
      getStore().duplicateModule(getStore().modules[0]!.id)
      const dup = getStore().modules[1]!
      expect(dup.options.temp).toBe(true)
      expect(dup.options.key).toBe('Processor')
    })
  })

  describe('updateModuleOptions', () => {
    it('updates options with partial merge', () => {
      getStore().addModule('cpu')
      const id = getStore().modules[0]!.id
      getStore().updateModuleOptions(id, { temp: true })
      getStore().updateModuleOptions(id, { key: 'Processor' })
      const opts = getStore().modules[0]!.options
      expect(opts.temp).toBe(true)
      expect(opts.key).toBe('Processor')
    })
  })

  describe('reorderModules', () => {
    it('reorders modules by swapping positions', () => {
      getStore().addModule('os')
      getStore().addModule('cpu')
      getStore().addModule('gpu')
      const osId = getStore().modules[0]!.id
      const gpuId = getStore().modules[2]!.id
      getStore().reorderModules(osId, gpuId)
      expect(getStore().modules.map((m) => m.type)).toEqual(['cpu', 'gpu', 'os'])
    })
  })

  describe('global settings', () => {
    it('sets logo source', () => {
      getStore().setLogoSource('arch')
      expect(getStore().globalSettings.logo.source).toBe('arch')
    })

    it('sets logo type', () => {
      getStore().setLogoType('small')
      expect(getStore().globalSettings.logo.type).toBe('small')
    })

    it('sets logo padding', () => {
      getStore().setLogoPadding({ top: 2, left: 3, right: 1 })
      expect(getStore().globalSettings.logo.padding).toEqual({ top: 2, left: 3, right: 1 })
    })

    it('sets display separator', () => {
      getStore().setDisplaySeparator(' -> ')
      expect(getStore().globalSettings.display.separator).toBe(' -> ')
    })

    it('sets display color', () => {
      getStore().setDisplayColor('green')
      expect(getStore().globalSettings.display.color).toBe('green')
    })

    it('sets display brightColor', () => {
      getStore().setDisplayBrightColor(false)
      expect(getStore().globalSettings.display.brightColor).toBe(false)
    })

    it('sets display keyWidth', () => {
      getStore().setDisplayKeyWidth(12)
      expect(getStore().globalSettings.display.keyWidth).toBe(12)
    })
  })

  describe('loadPreset', () => {
    it('loads a preset replacing all state', () => {
      getStore().addModule('os')
      const neofetch = PRESETS[0] as PresetConfig
      getStore().loadPreset(neofetch)
      expect(getStore().modules).toHaveLength(neofetch.modules.length)
      expect(getStore().modules.map((m) => m.type)).toEqual(neofetch.modules.map((m) => m.type))
      expect(getStore().globalSettings.display.color).toBe(neofetch.globalSettings.display.color)
    })

    it('preserves module options from preset', () => {
      const hardware = PRESETS[2] as PresetConfig
      getStore().loadPreset(hardware)
      const cpuModule = getStore().modules.find((m) => m.type === 'cpu')
      expect(cpuModule?.options.temp).toBe(true)
      expect(cpuModule?.options.showPeCoreCount).toBe(true)
    })

    it('loads each preset without errors', () => {
      for (const preset of PRESETS) {
        getStore().loadPreset(preset as PresetConfig)
        expect(getStore().modules.length).toBeGreaterThan(0)
        expect(getStore().globalSettings.display.color).toBeTruthy()
      }
    })
  })

  describe('resetToDefault', () => {
    it('clears modules and resets settings', () => {
      getStore().addModule('os')
      getStore().setDisplayColor('red')
      getStore().resetToDefault()
      expect(getStore().modules).toHaveLength(0)
      expect(getStore().globalSettings.display.color).toBe('cyan')
      expect(getStore().globalSettings.logo.source).toBe('none')
    })
  })
})
