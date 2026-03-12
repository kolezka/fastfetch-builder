import { describe, it, expect } from 'vitest'
import { generateJsonc } from './generateJsonc'
import type { GlobalSettings, ModuleInstance } from '@/lib/moduleDefinitions'

const DEFAULT_SETTINGS: GlobalSettings = {
  logo: { source: 'none', type: 'auto', padding: { top: 0, left: 0, right: 0 } },
  display: { separator: ': ', color: 'cyan', brightColor: true },
}

function makeModule(type: string, options = {}): ModuleInstance {
  return { id: `test-${type}`, type: type as ModuleInstance['type'], options }
}

describe('generateJsonc', () => {
  it('generates valid JSONC with schema reference', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [])
    expect(output).toContain('"$schema"')
    expect(output).toContain('fastfetch-cli')
  })

  it('includes modules section', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [])
    expect(output).toContain('"modules"')
  })

  it('renders simple module as string when no options', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [makeModule('os')])
    expect(output).toContain('"os"')
  })

  it('renders module with options as object', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [
      makeModule('cpu', { temp: true, key: 'Processor' }),
    ])
    expect(output).toContain('"type": "cpu"')
    expect(output).toContain('"temp": true')
    expect(output).toContain('"key": "Processor"')
  })

  it('filters out empty/undefined options', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [
      makeModule('os', { key: '', color: undefined }),
    ])
    // Should be rendered as simple string since all options are empty
    expect(output).toContain('"os"')
    expect(output).not.toContain('"type": "os"')
  })

  it('omits logo section when source is none', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [])
    expect(output).not.toContain('"logo"')
  })

  it('includes logo section when source is set', () => {
    const settings: GlobalSettings = {
      ...DEFAULT_SETTINGS,
      logo: { source: 'arch', type: 'builtin', padding: { top: 0, left: 0, right: 0 } },
    }
    const output = generateJsonc(settings, [])
    expect(output).toContain('"logo"')
    expect(output).toContain('"source": "arch"')
    expect(output).toContain('"type": "builtin"')
  })

  it('includes display section with non-default values', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [])
    expect(output).toContain('"display"')
    expect(output).toContain('"separator": ": "')
    expect(output).toContain('"color": "cyan"')
    expect(output).toContain('"brightColor": true')
  })

  it('includes keyWidth only when > 0', () => {
    const settings: GlobalSettings = {
      ...DEFAULT_SETTINGS,
      display: { ...DEFAULT_SETTINGS.display, keyWidth: 12 },
    }
    const output = generateJsonc(settings, [])
    expect(output).toContain('"keyWidth": 12')

    const output2 = generateJsonc(DEFAULT_SETTINGS, [])
    expect(output2).not.toContain('"keyWidth"')
  })

  it('renders multiple modules separated by commas', () => {
    const output = generateJsonc(DEFAULT_SETTINGS, [
      makeModule('os'),
      makeModule('kernel'),
      makeModule('cpu'),
    ])
    expect(output).toContain('"os"')
    expect(output).toContain('"kernel"')
    expect(output).toContain('"cpu"')
  })

  it('updates output when modules change (real-time preview test)', () => {
    const output1 = generateJsonc(DEFAULT_SETTINGS, [makeModule('os')])
    const output2 = generateJsonc(DEFAULT_SETTINGS, [makeModule('os'), makeModule('cpu')])
    expect(output1).not.toBe(output2)
    expect(output2).toContain('"cpu"')
  })

  it('updates output when global settings change', () => {
    const output1 = generateJsonc(DEFAULT_SETTINGS, [makeModule('os')])
    const settings2: GlobalSettings = {
      ...DEFAULT_SETTINGS,
      display: { ...DEFAULT_SETTINGS.display, color: 'green', separator: ' -> ' },
    }
    const output2 = generateJsonc(settings2, [makeModule('os')])
    expect(output1).not.toBe(output2)
    expect(output2).toContain('"color": "green"')
    expect(output2).toContain('"separator": " -> "')
  })
})
