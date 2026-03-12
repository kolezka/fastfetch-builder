import { useMemo } from 'react'
import { useConfigStore } from '@/store/configStore'
import { MODULE_DEFINITIONS } from '@/lib/moduleDefinitions'
import type { AnsiColor, DisplayColorSettings, GlobalSettings, ModuleInstance, ModuleType } from '@/lib/moduleDefinitions'

// ─── Placeholder values (full string + individual parts for format substitution) ──

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
  terminalfont: 'JetBrains Mono (11pt)',
  terminalsize: '120 columns x 40 rows',
  terminaltheme: '#f8f8f2 (fg) / #282a36 (bg)',
  wmtheme: 'Adwaita',
  wallpaper: '/usr/share/backgrounds/default.png',
  editor: 'neovim 0.9.5',
  lm: 'SDDM',
  initsystem: 'systemd 255',
  version: 'fastfetch 2.8.10',
  cpucache: 'L1: 512 KiB / L2: 4 MiB / L3: 32 MiB',
  physicalmemory: 'Samsung M471A2K43EB1 (DDR4, 3200 MT/s)',
  diskio: 'nvme0n1: 1.2 GiB/s read, 800 MiB/s write',
  monitor: 'LG 27GL850 (27", 2560x1440)',
  publicip: '203.0.113.42',
  netio: 'eth0: 125 MiB/s rx, 45 MiB/s tx',
  bluetoothradio: 'Intel AX200 (5.2)',
  weather: '22°C - Partly Cloudy',
  loadavg: '1.24, 0.87, 0.65',
  bootmgr: 'systemd-boot (UEFI)',
  tpm: '2.0',
  gamepad: 'Xbox Wireless Controller',
  camera: 'Integrated Camera (Chicony)',
  keyboard: 'AT Translated Set 2 keyboard',
  mouse: 'Logitech G502',
  zpool: 'tank: ONLINE, 2.1 TiB / 4.0 TiB',
  btrfs: 'root: 45.2 GiB / 256 GiB (2 devices)',
  command: 'command output',
  opencl: '3.0 (NVIDIA CUDA)',
}

/** Per-module placeholder parts for {1}, {2}, ... substitution in format strings */
const PLACEHOLDER_PARTS: Partial<Record<ModuleType, string[]>> = {
  title: ['user', 'archlinux', 'user@archlinux'],
  os: ['Arch Linux', 'Arch Linux', 'arch', '6.7.4', 'x86_64', ''],
  host: ['ASUS ROG Strix G15', 'ROG Strix', '1.0'],
  kernel: ['Linux', '6.7.4-arch1-1', '#1 SMP PREEMPT_DYNAMIC', 'x86_64'],
  uptime: ['0', '2', '15', '32'],
  shell: ['zsh', '5.9', '/usr/bin/zsh', '1234'],
  terminal: ['kitty', '0.31.0', '/usr/bin/kitty', '5678'],
  wm: ['Hyprland', '0.34.0', 'Wayland'],
  de: ['GNOME', '45.3'],
  packages: ['1247', '1120', '0', '127', '0', '0'],
  processes: ['284'],
  users: ['user', '2024-03-15 12:00', 'pts/0'],
  theme: ['Adwaita', '', '', ''],
  icons: ['Papirus', '', '', ''],
  font: ['JetBrains Mono (11pt)', '', '', ''],
  cursor: ['Bibata-Modern-Ice', '24'],
  cpu: ['AMD Ryzen 7 5800X', '8', '16', '3.80 GHz', '4.85 GHz'],
  gpu: ['NVIDIA', 'GeForce RTX 3070', '545.29.06', '42°C', '8192 MiB', '1024 MiB'],
  memory: ['4.21 GiB', '15.55 GiB', '27%'],
  swap: ['0 B', '8.00 GiB', '0%'],
  disk: ['128.42 GiB', '465.76 GiB', '28%', '235421', '/'],
  physicaldisk: ['Samsung SSD 970 EVO', '500 GB', 'SSD', 'S1234567'],
  display: ['2560', '1440', '144 Hz', '2560', '1440', 'DP-1', 'External'],
  brightness: ['75%', 'Built-in display'],
  battery: ['Samsung', 'BAT0', 'Li-ion', '87%', 'Charging', '31°C'],
  poweradapter: ['65W USB-C', '65', 'Lenovo'],
  sound: ['PipeWire', '75%', 'built-in speakers'],
  localip: ['192.168.1.42', 'eth0', 'aa:bb:cc:dd:ee:ff', '255.255.255.0'],
  wifi: ['HomeNetwork', 'Connected', 'WPA2', '-45 dBm', '866 Mbps', '866 Mbps'],
  dns: ['1.1.1.1'],
  bluetooth: ['Intel AX200', 'AA:BB:CC:DD:EE:FF', 'USB', '100%'],
  opengl: ['4.6', 'NVIDIA GeForce RTX 3070/PCIe/SSE2', 'NVIDIA Corporation', '4.60'],
  vulkan: ['1.3.275', '545.29.06', '1.3.5', 'NVIDIA GeForce RTX 3070'],
  bios: ['American Megatrends', '2.17', '03/15/2023'],
  board: ['ROG Strix B550-F', 'ASUSTeK', 'Rev 1.xx', 'SN123456'],
  chassis: ['Desktop', 'ASUS', '1.0', 'CH123456'],
  player: ['Spotify', 'https://spotify.com', 'org.mpris.MediaPlayer2.spotify'],
  media: ['Song Title', 'Artist', 'Album', '3', 'Pop'],
  datetime: ['2024', '03', '15', '14', '23', '07', 'Friday'],
  locale: ['en_US.UTF-8'],
  cpuusage: ['12%'],
  custom: ['custom value'],
  terminalfont: ['JetBrains Mono', '11pt'],
  terminalsize: ['40', '120'],
  terminaltheme: ['#f8f8f2', '#282a36', '#50fa7b'],
  wmtheme: ['Adwaita'],
  wallpaper: ['/usr/share/backgrounds/default.png'],
  editor: ['neovim', '0.9.5', '/usr/bin/nvim'],
  lm: ['SDDM', '0.20.0'],
  initsystem: ['systemd', '255'],
  version: ['2.8.10', 'fastfetch'],
  cpucache: ['512 KiB', '4 MiB', '32 MiB'],
  physicalmemory: ['16 GiB', 'DDR4', '3200 MT/s', 'DIMM A1'],
  diskio: ['nvme0n1', '1.2 GiB', '800 MiB', '1.2 GiB/s', '800 MiB/s'],
  monitor: ['LG 27GL850', '2560', '1440', '27'],
  publicip: ['203.0.113.42'],
  netio: ['eth0', '125 MiB', '45 MiB', '125 MiB/s', '45 MiB/s'],
  bluetoothradio: ['Intel AX200', 'AA:BB:CC:DD:EE:FF', '5.2'],
  weather: ['22°C', 'Partly Cloudy', '65%', '12 km/h'],
  loadavg: ['1.24', '0.87', '0.65'],
  bootmgr: ['systemd-boot', 'UEFI'],
  tpm: ['2.0'],
  gamepad: ['Xbox Wireless Controller', 'XB1234'],
  camera: ['Integrated Camera', 'Chicony', 'USB0'],
  keyboard: ['AT Translated Set 2 keyboard', 'Generic'],
  mouse: ['Logitech G502', 'Logitech'],
  zpool: ['tank', 'ONLINE', '2.1 TiB', '4.0 TiB'],
  btrfs: ['root', '45.2 GiB', '256 GiB', '2'],
  command: ['command output'],
  opencl: ['3.0', 'NVIDIA GeForce RTX 3070', 'NVIDIA Corporation'],
}

// ─── Color mapping ────────────────────────────────────────────────────

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

function resolveColorCss(color: string | undefined): string | undefined {
  if (!color) return undefined
  // Direct AnsiColor
  if (color in ANSI_COLOR_MAP) return ANSI_COLOR_MAP[color as AnsiColor]
  // Could be a raw CSS-ish color or ANSI code string; pass through
  return color
}

function toBright(color: AnsiColor): AnsiColor {
  if (color.startsWith('bright')) return color
  const brightKey = `bright${color.charAt(0).toUpperCase()}${color.slice(1)}` as AnsiColor
  return brightKey in ANSI_COLOR_MAP ? brightKey : color
}

// ─── Format string processing ─────────────────────────────────────────

/**
 * Apply a fastfetch format string to placeholder parts.
 * Replaces {1}, {2}, ... with the corresponding part.
 * If no format is set, returns the default placeholder value.
 */
function applyFormat(moduleType: ModuleType, format: string | undefined): string {
  if (!format) return PLACEHOLDER_VALUES[moduleType] ?? ''

  const parts = PLACEHOLDER_PARTS[moduleType]
  if (!parts) return format

  return format.replace(/\{(\d+)\}/g, (_match, idx) => {
    const i = parseInt(idx, 10) - 1
    return parts[i] ?? ''
  })
}

// ─── ASCII logo ───────────────────────────────────────────────────────

const ASCII_LOGO = [
  '      /\\      ',
  '     /  \\     ',
  '    /\\   \\    ',
  '   /      \\   ',
  '  /   ,,   \\  ',
  ' /   |  |  -\\ ',
  '/_-\'\'    \'\'---\\',
]

// ─── Line generation ──────────────────────────────────────────────────

const NO_KEY_TYPES = new Set<ModuleType>(['title', 'separator', 'colors', 'break'])

/** Module icons for key.type icon/both modes */
const MODULE_ICONS: Partial<Record<ModuleType, string>> = Object.fromEntries(
  Object.entries(MODULE_DEFINITIONS).map(([type, def]) => [type, def.icon]),
)

interface LineInfo {
  readonly isKeyValue: boolean
  readonly isTitleLine: boolean
  readonly key: string
  readonly separator: string
  readonly value: string
  readonly keyColorCss: string
  readonly valueColorCss: string | undefined
  readonly separatorColorCss: string | undefined
}

interface ResolvedColors {
  displayColor: AnsiColor
  brightColor: boolean
  keysColorCss: string | undefined
  titleColorCss: string | undefined
  outputColorCss: string | undefined
  separatorColorCss: string | undefined
}

function resolveDisplayColors(display: GlobalSettings['display']): ResolvedColors {
  let displayColor: AnsiColor = 'cyan'
  let keysColorCss: string | undefined
  let titleColorCss: string | undefined
  let outputColorCss: string | undefined
  let separatorColorCss: string | undefined

  if (typeof display.color === 'string') {
    displayColor = display.color
  } else if (typeof display.color === 'object' && display.color !== null) {
    const colorObj = display.color as DisplayColorSettings
    keysColorCss = resolveColorCss(colorObj.keys)
    titleColorCss = resolveColorCss(colorObj.title)
    outputColorCss = resolveColorCss(colorObj.output)
    separatorColorCss = resolveColorCss(colorObj.separator)
  }

  return {
    displayColor,
    brightColor: display.brightColor ?? true,
    keysColorCss,
    titleColorCss,
    outputColorCss,
    separatorColorCss,
  }
}

function getModuleLine(
  module: ModuleInstance,
  globalSeparator: string,
  colors: ResolvedColors,
  keyType: string,
  keyWidth: number,
  keyPaddingLeft: number,
): LineInfo {
  const def = MODULE_DEFINITIONS[module.type]
  const value = applyFormat(module.type, module.options.format)

  const isTitleLine = module.type === 'title'

  if (NO_KEY_TYPES.has(module.type)) {
    // title line uses title color from display.color object
    const titleCss = isTitleLine
      ? (colors.titleColorCss ?? ANSI_COLOR_MAP[colors.brightColor ? toBright(colors.displayColor) : colors.displayColor])
      : undefined
    return {
      isKeyValue: false,
      isTitleLine,
      key: '',
      separator: '',
      value,
      keyColorCss: titleCss ?? '',
      valueColorCss: undefined,
      separatorColorCss: undefined,
    }
  }

  // ── Build key text ──
  const rawKey = module.options.key ?? def.label
  const icon = MODULE_ICONS[module.type] ?? ''
  let keyText: string
  switch (keyType) {
    case 'none':
      keyText = ''
      break
    case 'icon':
      keyText = icon
      break
    case 'both':
    case 'both-0':
      keyText = `${icon} ${rawKey}`
      break
    case 'both-1':
      keyText = `${rawKey} ${icon}`
      break
    case 'both-2':
      keyText = `${icon}${rawKey}`
      break
    case 'both-3':
      keyText = `${rawKey}${icon}`
      break
    case 'both-4':
      keyText = icon ? `${icon} ${rawKey}` : rawKey
      break
    default: // 'string'
      keyText = rawKey
      break
  }

  // Apply key padding left
  if (keyPaddingLeft > 0) {
    keyText = ' '.repeat(keyPaddingLeft) + keyText
  }

  // Apply key width alignment (pad to width)
  if (keyWidth > 0 && keyText.length < keyWidth) {
    keyText = keyText.padEnd(keyWidth)
  }

  // ── Resolve separator ──
  const separator = module.options.separator ?? globalSeparator

  // ── Resolve key color ──
  const moduleKeyColor = module.options.keyColor
  let keyColorCss: string
  if (moduleKeyColor) {
    keyColorCss = ANSI_COLOR_MAP[moduleKeyColor] ?? ANSI_COLOR_MAP.cyan
  } else if (colors.keysColorCss) {
    keyColorCss = colors.keysColorCss
  } else {
    const resolved = colors.brightColor ? toBright(colors.displayColor) : colors.displayColor
    keyColorCss = ANSI_COLOR_MAP[resolved] ?? ANSI_COLOR_MAP.cyan
  }

  // ── Resolve value color ──
  const moduleValueColor = module.options.color
  let valueColorCss: string | undefined
  if (moduleValueColor) {
    valueColorCss = ANSI_COLOR_MAP[moduleValueColor]
  } else if (colors.outputColorCss) {
    valueColorCss = colors.outputColorCss
  }

  return {
    isKeyValue: true,
    isTitleLine: false,
    key: keyText,
    separator,
    value,
    keyColorCss,
    valueColorCss,
    separatorColorCss: colors.separatorColorCss,
  }
}

// ─── Component ────────────────────────────────────────────────────────

export function TerminalMockup() {
  const globalSettings = useConfigStore((s) => s.globalSettings)
  const modules = useConfigStore((s) => s.modules)

  const colors = useMemo(() => resolveDisplayColors(globalSettings.display), [globalSettings.display])

  const keyType = globalSettings.display.key?.type ?? 'string'
  // key.width takes priority, fall back to legacy keyWidth
  const keyWidth = globalSettings.display.key?.width ?? globalSettings.display.keyWidth ?? 0
  const keyPaddingLeft = globalSettings.display.key?.paddingLeft ?? 0

  const lines = useMemo(() => {
    const separator = globalSettings.display.separator ?? ': '
    return modules.map((m) =>
      getModuleLine(m, separator, colors, keyType, keyWidth, keyPaddingLeft),
    )
  }, [modules, globalSettings.display.separator, colors, keyType, keyWidth, keyPaddingLeft])

  const logoPosition = globalSettings.logo.position ?? 'left'
  const showLogo = globalSettings.logo.source !== 'none'
  const maxLogoWidth = ASCII_LOGO.reduce((max, line) => Math.max(max, line.length), 0)

  const logoPadTop = globalSettings.logo.padding?.top ?? 0
  const logoPadLeft = globalSettings.logo.padding?.left ?? 0
  const logoPadRight = globalSettings.logo.padding?.right ?? 0

  const paddedLogo = showLogo
    ? [
        ...Array.from({ length: logoPadTop }, () => ''),
        ...ASCII_LOGO.map((l) => ' '.repeat(logoPadLeft) + l + ' '.repeat(logoPadRight)),
      ]
    : []
  const paddedLogoWidth = showLogo ? maxLogoWidth + logoPadLeft + logoPadRight + 2 : 0

  // Render a single info line
  const renderLine = (line: LineInfo | undefined, i: number) => {
    if (!line) return <span key={`line-${i}`} />
    if (!line.isKeyValue) {
      if (line.isTitleLine) {
        return (
          <span key={`line-${i}`} style={{ color: line.keyColorCss }} className="font-bold">
            {line.value}
          </span>
        )
      }
      return <span key={`line-${i}`}>{line.value}</span>
    }
    return (
      <span key={`line-${i}`}>
        <span style={{ color: line.keyColorCss }} className="font-bold">
          {line.key}
        </span>
        <span style={line.separatorColorCss ? { color: line.separatorColorCss } : undefined} className={line.separatorColorCss ? undefined : 'text-text-muted'}>
          {line.separator}
        </span>
        <span style={line.valueColorCss ? { color: line.valueColorCss } : undefined}>
          {line.value}
        </span>
      </span>
    )
  }

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
          {logoPosition === 'top' && showLogo && (
            <>
              {paddedLogo.map((logoLine, i) => (
                <div key={`logo-${i}`}>
                  <span className="text-accent">{logoLine}</span>
                </div>
              ))}
            </>
          )}

          {logoPosition === 'top' || !showLogo ? (
            /* Lines only (logo on top or no logo) */
            lines.map((line, i) => (
              <div key={i}>{renderLine(line, i)}</div>
            ))
          ) : logoPosition === 'right' ? (
            /* Lines on left, logo on right */
            Array.from({ length: Math.max(paddedLogo.length, lines.length) }).map((_, i) => {
              const line = lines[i]
              const logoLine = paddedLogo[i] ?? ''
              return (
                <div key={i}>
                  {renderLine(line, i)}
                  {showLogo && (
                    <span className="text-accent">{'  '}{logoLine}</span>
                  )}
                </div>
              )
            })
          ) : (
            /* Default: logo on left */
            Array.from({ length: Math.max(paddedLogo.length, lines.length) }).map((_, i) => {
              const logoLine = paddedLogo[i] ?? ''
              const padded = showLogo ? logoLine.padEnd(paddedLogoWidth) : ''
              const line = lines[i]
              return (
                <div key={i}>
                  {showLogo && <span className="text-accent">{padded}</span>}
                  {renderLine(line, i)}
                </div>
              )
            })
          )}
        </pre>
      </div>
    </div>
  )
}
