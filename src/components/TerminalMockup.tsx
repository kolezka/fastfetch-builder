import { useMemo } from 'react'
import { useConfigStore } from '@/store/configStore'
import { MODULE_DEFINITIONS } from '@/lib/moduleDefinitions'
import type { AnsiColor, ModuleInstance, ModuleType } from '@/lib/moduleDefinitions'

const PLACEHOLDER_VALUES: Partial<Record<ModuleType, string>> = {
  title: 'user@archlinux',
  separator: '──────────────',
  break: '',
  os: 'Arch Linux x86_64',
  host: 'ASUS ROG Strix G15',
  kernel: '6.7.4-arch1-1',
  uptime: '2 hours, 15 mins',
  shell: 'zsh 5.9',
  terminal: 'kitty',
  wm: 'Hyprland',
  de: 'GNOME 45.3',
  packages: '1247 (pacman)',
  processes: '284',
  users: 'user - login (pts/0)',
  theme: 'Adwaita [GTK3]',
  icons: 'Papirus [GTK3]',
  font: 'JetBrains Mono (11pt)',
  cursor: 'Bibata-Modern-Ice',
  cpu: 'AMD Ryzen 7 5800X (16) @ 3.80 GHz',
  gpu: 'NVIDIA GeForce RTX 3070',
  memory: '4.21 GiB / 15.55 GiB (27%)',
  swap: '0 B / 8.00 GiB (0%)',
  disk: '128.42 GiB / 465.76 GiB (28%)',
  physicaldisk: 'Samsung SSD 970 EVO 500GB',
  display: '2560x1440 @ 144Hz',
  brightness: '75%',
  battery: '87% [Charging]',
  poweradapter: '65W USB-C',
  sound: 'PipeWire (built-in speakers)',
  localip: '192.168.1.42',
  wifi: 'HomeNetwork (802.11ac)',
  dns: '1.1.1.1, 8.8.8.8',
  bluetooth: 'Intel AX200 (enabled)',
  opengl: '4.6 (Core Profile)',
  vulkan: '1.3.275 (NVIDIA)',
  bios: 'American Megatrends v2.17',
  board: 'ASUS ROG Strix B550-F',
  chassis: 'Desktop',
  player: 'Spotify',
  media: 'Artist - Song Title',
  datetime: '2024-03-15 14:23:07',
  locale: 'en_US.UTF-8',
  colors: '● ● ● ● ● ● ● ●',
  custom: 'custom value',
  cpuusage: '12%',
}

const ANSI_COLOR_MAP: Record<AnsiColor, string> = {
  black: '#1a1a2e',
  red: '#ff4466',
  green: '#00cc88',
  yellow: '#f0c040',
  blue: '#4488ff',
  magenta: '#cc66ff',
  cyan: '#00d4ff',
  white: '#e0e0e8',
  brightBlack: '#666680',
  brightRed: '#ff6688',
  brightGreen: '#44ddaa',
  brightYellow: '#ffdd66',
  brightBlue: '#66aaff',
  brightMagenta: '#dd88ff',
  brightCyan: '#44eeff',
  brightWhite: '#ffffff',
}

const ASCII_LOGO = [
  '      /\\      ',
  '     /  \\     ',
  '    /\\   \\    ',
  '   /      \\   ',
  '  /   ,,   \\  ',
  ' /   |  |  -\\ ',
  '/_-\'\'    \'\'---\\',
]

const NO_KEY_TYPES = new Set<ModuleType>(['title', 'separator', 'colors', 'break'])

interface LineInfo {
  readonly isKeyValue: boolean
  readonly key: string
  readonly separator: string
  readonly value: string
  readonly keyColorCss: string
}

function getModuleLine(
  module: ModuleInstance,
  separator: string,
  displayColor: AnsiColor,
  brightColor: boolean,
): LineInfo {
  const def = MODULE_DEFINITIONS[module.type]
  const value = PLACEHOLDER_VALUES[module.type] ?? ''

  if (NO_KEY_TYPES.has(module.type)) {
    return { isKeyValue: false, key: '', separator: '', value, keyColorCss: '' }
  }

  const key = module.options.key ?? def.label

  const moduleKeyColor = module.options.keyColor
  const resolvedColor = moduleKeyColor ?? (brightColor ? toBright(displayColor) : displayColor)
  const keyColorCss = ANSI_COLOR_MAP[resolvedColor] ?? ANSI_COLOR_MAP.cyan

  return { isKeyValue: true, key, separator, value, keyColorCss }
}

function toBright(color: AnsiColor): AnsiColor {
  if (color.startsWith('bright')) return color
  const brightKey = `bright${color.charAt(0).toUpperCase()}${color.slice(1)}` as AnsiColor
  return brightKey in ANSI_COLOR_MAP ? brightKey : color
}

export function TerminalMockup() {
  const globalSettings = useConfigStore((s) => s.globalSettings)
  const modules = useConfigStore((s) => s.modules)

  const lines = useMemo(() => {
    const separator = globalSettings.display.separator ?? ': '
    const displayColor = globalSettings.display.color ?? 'cyan'
    const brightColor = globalSettings.display.brightColor ?? true
    return modules.map((m) => getModuleLine(m, separator, displayColor, brightColor))
  }, [modules, globalSettings.display.separator, globalSettings.display.color, globalSettings.display.brightColor])

  const maxLogoWidth = ASCII_LOGO.reduce((max, line) => Math.max(max, line.length), 0)

  return (
    <div className="rounded-lg border border-border bg-bg-surface overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-bg-base px-3 py-2">
        <span className="inline-block h-3 w-3 rounded-full bg-danger" />
        <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
        <span className="inline-block h-3 w-3 rounded-full bg-success" />
        <span className="ml-2 font-mono text-xs text-text-muted">fastfetch</span>
      </div>
      <div className="overflow-x-auto bg-bg-code p-4">
        <pre className="font-mono text-xs leading-5 text-text-primary">
          {Array.from({ length: Math.max(ASCII_LOGO.length, lines.length) }).map((_, i) => {
            const logoLine = ASCII_LOGO[i] ?? ''
            const line = lines[i]
            const paddedLogo = logoLine.padEnd(maxLogoWidth + 2)

            return (
              <div key={i}>
                <span className="text-accent">{paddedLogo}</span>
                {line?.isKeyValue ? (
                  <>
                    <span style={{ color: line.keyColorCss }} className="font-bold">
                      {line.key}
                    </span>
                    <span className="text-text-muted">{line.separator}</span>
                    <span>{line.value}</span>
                  </>
                ) : (
                  <span>{line?.value ?? ''}</span>
                )}
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
}
