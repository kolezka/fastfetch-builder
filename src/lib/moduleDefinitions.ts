export type AnsiColor =
  | 'black' | 'red' | 'green' | 'yellow' | 'blue'
  | 'magenta' | 'cyan' | 'white'
  | 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow'
  | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite'

export type ModuleType =
  | 'title' | 'separator' | 'os' | 'kernel' | 'uptime'
  | 'shell' | 'terminal' | 'wm' | 'packages'
  | 'cpu' | 'gpu' | 'memory' | 'swap' | 'disk'
  | 'display' | 'brightness' | 'battery' | 'poweradapter'
  | 'localip' | 'wifi' | 'colors' | 'custom' | 'cpuusage'

export interface ModuleOptions {
  key?: string
  keyColor?: AnsiColor
  showPeCoreCount?: boolean
  temp?: boolean
  freqNdig?: 0 | 1 | 2 | 3
  driverVersion?: boolean
  format?: string
  folders?: string
  compactType?: 'none' | 'original' | 'scaled' | 'original-with-scaled-resolution'
  showIpv6?: boolean
  compact?: boolean
  waitTime?: number
}

export type ModuleOptionField = keyof ModuleOptions

export type ModuleCategory = 'info' | 'hardware' | 'network' | 'display' | 'other'

export interface ModuleDefinition {
  type: ModuleType
  label: string
  category: ModuleCategory
  icon: string
  optionFields: readonly ModuleOptionField[]
  defaults: ModuleOptions
}

export interface ModuleInstance {
  id: string
  type: ModuleType
  options: ModuleOptions
}

export type LogoSource = 'none' | string

export interface LogoSettings {
  source: LogoSource
  type?: 'auto' | 'builtin' | 'small'
  color?: AnsiColor[]
  padding?: { top?: number; left?: number; right?: number }
}

export interface DisplaySettings {
  separator?: string
  color?: AnsiColor
  brightColor?: boolean
  showErrors?: boolean
  keyWidth?: number
}

export interface GlobalSettings {
  logo: LogoSettings
  display: DisplaySettings
}

export interface PresetConfig {
  name: string
  description: string
  globalSettings: GlobalSettings
  modules: Array<{ type: ModuleType; options?: ModuleOptions }>
}

const COMMON_FIELDS: readonly ModuleOptionField[] = ['key', 'keyColor'] as const

function defineModule(
  type: ModuleType,
  label: string,
  category: ModuleCategory,
  icon: string,
  extraFields: readonly ModuleOptionField[] = [],
  defaults: ModuleOptions = {},
): ModuleDefinition {
  return {
    type,
    label,
    category,
    icon,
    optionFields: [...COMMON_FIELDS, ...extraFields],
    defaults,
  }
}

export const MODULE_DEFINITIONS: Record<ModuleType, ModuleDefinition> = {
  title: defineModule('title', 'Title', 'info', '👤'),
  separator: defineModule('separator', 'Separator', 'info', '➖'),
  os: defineModule('os', 'OS', 'info', '💻'),
  kernel: defineModule('kernel', 'Kernel', 'info', '🧬'),
  uptime: defineModule('uptime', 'Uptime', 'info', '⏱️'),
  shell: defineModule('shell', 'Shell', 'info', '🐚'),
  terminal: defineModule('terminal', 'Terminal', 'info', '📟'),
  wm: defineModule('wm', 'Window Manager', 'info', '🪟'),
  packages: defineModule('packages', 'Packages', 'info', '📦'),

  cpu: defineModule('cpu', 'CPU', 'hardware', '🔲', ['temp', 'showPeCoreCount', 'freqNdig'], { freqNdig: 2 }),
  gpu: defineModule('gpu', 'GPU', 'hardware', '🎮', ['temp', 'driverVersion']),
  memory: defineModule('memory', 'Memory', 'hardware', '🧠'),
  swap: defineModule('swap', 'Swap', 'hardware', '💾'),
  disk: defineModule('disk', 'Disk', 'hardware', '💿', ['folders']),
  cpuusage: defineModule('cpuusage', 'CPU Usage', 'hardware', '📊'),
  battery: defineModule('battery', 'Battery', 'hardware', '🔋'),
  poweradapter: defineModule('poweradapter', 'Power Adapter', 'hardware', '🔌'),

  display: defineModule('display', 'Display', 'display', '🖥️', ['compactType'], { compactType: 'none' }),
  brightness: defineModule('brightness', 'Brightness', 'display', '☀️'),

  localip: defineModule('localip', 'Local IP', 'network', '🌐', ['showIpv6', 'compact']),
  wifi: defineModule('wifi', 'WiFi', 'network', '📶'),

  colors: defineModule('colors', 'Colors', 'other', '🎨'),
  custom: defineModule('custom', 'Custom', 'other', '✏️', ['format']),
} as const
