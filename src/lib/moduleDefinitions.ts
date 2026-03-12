export type AnsiColor =
  | 'black' | 'red' | 'green' | 'yellow' | 'blue'
  | 'magenta' | 'cyan' | 'white'
  | 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow'
  | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite'

export type ModuleType =
  | 'title' | 'separator' | 'break' | 'os' | 'host' | 'kernel' | 'uptime'
  | 'shell' | 'terminal' | 'terminalfont' | 'terminalsize' | 'terminaltheme'
  | 'wm' | 'wmtheme' | 'de' | 'packages' | 'processes' | 'users'
  | 'theme' | 'icons' | 'font' | 'cursor' | 'wallpaper'
  | 'editor' | 'lm' | 'initsystem' | 'version'
  | 'cpu' | 'cpucache' | 'cpuusage' | 'gpu' | 'memory' | 'physicalmemory'
  | 'swap' | 'disk' | 'physicaldisk' | 'diskio'
  | 'display' | 'monitor' | 'brightness' | 'battery' | 'poweradapter'
  | 'localip' | 'publicip' | 'wifi' | 'dns' | 'bluetooth' | 'bluetoothradio' | 'netio'
  | 'sound' | 'player' | 'media' | 'datetime' | 'locale' | 'weather' | 'loadavg'
  | 'opengl' | 'opencl' | 'vulkan' | 'bios' | 'board' | 'chassis' | 'bootmgr' | 'tpm'
  | 'gamepad' | 'camera' | 'keyboard' | 'mouse'
  | 'zpool' | 'btrfs'
  | 'colors' | 'custom' | 'command'

export interface ModuleOptions {
  key?: string
  keyColor?: AnsiColor
  color?: AnsiColor
  separator?: string
  showPeCoreCount?: boolean
  temp?: boolean
  freqNdig?: 0 | 1 | 2 | 3
  driverVersion?: boolean
  format?: string
  shell?: string
  folders?: string
  compactType?: 'none' | 'original' | 'scaled' | 'original-with-scaled-resolution'
  showIpv6?: boolean
  compact?: boolean
  waitTime?: number
  timeout?: number
  text?: string
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

export type LogoType = 'auto' | 'builtin' | 'small' | 'file' | 'file-raw' | 'data' | 'data-raw' | 'sixel' | 'kitty' | 'kitty-direct' | 'kitty-icat' | 'iterm' | 'chafa' | 'raw' | 'none'

export type LogoPosition = 'left' | 'top' | 'right'

export type ChafaCanvasMode = 'TRUECOLOR' | 'INDEXED_256' | 'INDEXED_240' | 'INDEXED_16' | 'FGBG_BGFG' | 'FGBG' | 'INDEXED_8' | 'INDEXED_16_8'

export type ChafaColorSpace = 'RGB' | 'DIN99D'

export type ChafaDitherMode = 'NONE' | 'ORDERED' | 'DIFFUSION'

export interface ChafaSettings {
  fgOnly?: boolean
  symbols?: string
  canvasMode?: ChafaCanvasMode
  colorSpace?: ChafaColorSpace
  ditherMode?: ChafaDitherMode
}

export interface LogoSettings {
  source: LogoSource
  type?: LogoType
  color?: AnsiColor[]
  padding?: { top?: number; left?: number; right?: number }
  width?: number | null
  height?: number | null
  printRemaining?: boolean
  preserveAspectRatio?: boolean
  recache?: boolean
  position?: LogoPosition
  chafa?: ChafaSettings
}

export type KeyType = 'none' | 'string' | 'icon' | 'both' | 'both-0' | 'both-1' | 'both-2' | 'both-3' | 'both-4'

export type BinaryPrefix = 'iec' | 'si' | 'jedec'

export type SizeMaxPrefix = 'B' | 'kB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB'

export type TempUnit = 'C' | 'F' | 'K' | 'D'

export type SpaceBeforeUnit = 'default' | 'always' | 'never'

export type TrailingZeros = 'default' | 'always' | 'never'

export interface DisplayColorSettings {
  keys?: string
  title?: string
  output?: string
  separator?: string
}

export interface DisplayKeySettings {
  width?: number
  type?: KeyType
  paddingLeft?: number
}

export interface DisplaySizeSettings {
  binaryPrefix?: BinaryPrefix
  maxPrefix?: SizeMaxPrefix
  ndigits?: number
}

export interface DisplayTempSettings {
  unit?: TempUnit
  ndigits?: number
  color?: { green?: string; yellow?: string; red?: string }
  spaceBeforeUnit?: SpaceBeforeUnit
}

export interface DisplayBarSettings {
  char?: { elapsed?: string; total?: string }
  border?: { left?: string; right?: string } | null
  color?: { elapsed?: string; total?: string; border?: string } | null
  width?: number
}

export interface DisplayPercentSettings {
  type?: number
  ndigits?: number
  color?: { green?: string; yellow?: string; red?: string }
  spaceBeforeUnit?: SpaceBeforeUnit
  width?: number
}

export interface DisplayFreqSettings {
  ndigits?: number
  spaceBeforeUnit?: SpaceBeforeUnit
}

export interface DisplayDurationSettings {
  abbreviation?: boolean
  spaceBeforeUnit?: SpaceBeforeUnit
}

export interface DisplayFractionSettings {
  ndigits?: number
  trailingZeros?: TrailingZeros
}

export interface DisplaySettings {
  separator?: string
  color?: AnsiColor | DisplayColorSettings
  brightColor?: boolean
  showErrors?: boolean
  keyWidth?: number
  stat?: boolean
  pipe?: boolean
  disableLinewrap?: boolean
  hideCursor?: boolean
  noBuffer?: boolean
  key?: DisplayKeySettings
  size?: DisplaySizeSettings
  temp?: DisplayTempSettings
  bar?: DisplayBarSettings
  percent?: DisplayPercentSettings
  freq?: DisplayFreqSettings
  duration?: DisplayDurationSettings
  fraction?: DisplayFractionSettings
}

export interface GeneralSettings {
  thread?: boolean
  escapeBedrock?: boolean
  playerName?: string
  dsForceDrm?: boolean
  wmiTimeout?: number
  processingTimeout?: number
  preRun?: string
  detectVersion?: boolean
}

export interface GlobalSettings {
  logo: LogoSettings
  display: DisplaySettings
  general?: GeneralSettings
}

export interface PresetConfig {
  name: string
  description: string
  globalSettings: GlobalSettings
  modules: Array<{ type: ModuleType; options?: ModuleOptions }>
}

const COMMON_FIELDS: readonly ModuleOptionField[] = ['key', 'keyColor', 'color', 'separator', 'format'] as const

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
  break: defineModule('break', 'Break', 'info', '↵'),
  os: defineModule('os', 'OS', 'info', '💻'),
  host: defineModule('host', 'Host', 'info', '🏠'),
  kernel: defineModule('kernel', 'Kernel', 'info', '🧬'),
  uptime: defineModule('uptime', 'Uptime', 'info', '⏱️'),
  shell: defineModule('shell', 'Shell', 'info', '🐚'),
  terminal: defineModule('terminal', 'Terminal', 'info', '📟'),
  terminalfont: defineModule('terminalfont', 'Terminal Font', 'info', '🔡'),
  terminalsize: defineModule('terminalsize', 'Terminal Size', 'info', '📐'),
  terminaltheme: defineModule('terminaltheme', 'Terminal Theme', 'info', '🎨'),
  wm: defineModule('wm', 'Window Manager', 'info', '🪟'),
  wmtheme: defineModule('wmtheme', 'WM Theme', 'info', '🎭'),
  de: defineModule('de', 'Desktop Environment', 'info', '🖥️'),
  packages: defineModule('packages', 'Packages', 'info', '📦'),
  processes: defineModule('processes', 'Processes', 'info', '⚙️'),
  users: defineModule('users', 'Users', 'info', '👥'),
  theme: defineModule('theme', 'Theme', 'info', '🎭'),
  icons: defineModule('icons', 'Icons', 'info', '🖼️'),
  font: defineModule('font', 'Font', 'info', '🔤'),
  cursor: defineModule('cursor', 'Cursor', 'info', '🖱️'),
  wallpaper: defineModule('wallpaper', 'Wallpaper', 'info', '🖼️'),
  editor: defineModule('editor', 'Editor', 'info', '📝'),
  lm: defineModule('lm', 'Login Manager', 'info', '🔐'),
  initsystem: defineModule('initsystem', 'Init System', 'info', '🚀'),
  version: defineModule('version', 'Fastfetch Version', 'info', '📋'),

  cpu: defineModule('cpu', 'CPU', 'hardware', '🔲', ['temp', 'showPeCoreCount', 'freqNdig'], { freqNdig: 2 }),
  cpucache: defineModule('cpucache', 'CPU Cache', 'hardware', '💠'),
  cpuusage: defineModule('cpuusage', 'CPU Usage', 'hardware', '📊'),
  gpu: defineModule('gpu', 'GPU', 'hardware', '🎮', ['temp', 'driverVersion']),
  memory: defineModule('memory', 'Memory', 'hardware', '🧠'),
  physicalmemory: defineModule('physicalmemory', 'Physical Memory', 'hardware', '🔩'),
  swap: defineModule('swap', 'Swap', 'hardware', '💾'),
  disk: defineModule('disk', 'Disk', 'hardware', '💿', ['folders']),
  physicaldisk: defineModule('physicaldisk', 'Physical Disk', 'hardware', '💽'),
  diskio: defineModule('diskio', 'Disk I/O', 'hardware', '📀'),
  battery: defineModule('battery', 'Battery', 'hardware', '🔋'),
  poweradapter: defineModule('poweradapter', 'Power Adapter', 'hardware', '🔌'),
  sound: defineModule('sound', 'Sound', 'hardware', '🔊'),

  display: defineModule('display', 'Display', 'display', '🖥️', ['compactType'], { compactType: 'none' }),
  monitor: defineModule('monitor', 'Monitor', 'display', '🖥️'),
  brightness: defineModule('brightness', 'Brightness', 'display', '☀️'),
  opengl: defineModule('opengl', 'OpenGL', 'display', '🔺'),
  opencl: defineModule('opencl', 'OpenCL', 'display', '🔷'),
  vulkan: defineModule('vulkan', 'Vulkan', 'display', '🌋'),

  localip: defineModule('localip', 'Local IP', 'network', '🌐', ['showIpv6', 'compact']),
  publicip: defineModule('publicip', 'Public IP', 'network', '🌍', ['timeout'], { timeout: 1000 }),
  wifi: defineModule('wifi', 'WiFi', 'network', '📶'),
  dns: defineModule('dns', 'DNS', 'network', '🔎'),
  bluetooth: defineModule('bluetooth', 'Bluetooth', 'network', '📡'),
  bluetoothradio: defineModule('bluetoothradio', 'Bluetooth Radio', 'network', '📻'),
  netio: defineModule('netio', 'Network I/O', 'network', '📊'),

  bios: defineModule('bios', 'BIOS', 'other', '🧩'),
  board: defineModule('board', 'Motherboard', 'other', '🔧'),
  chassis: defineModule('chassis', 'Chassis', 'other', '📐'),
  player: defineModule('player', 'Media Player', 'other', '▶️'),
  media: defineModule('media', 'Media', 'other', '🎵'),
  datetime: defineModule('datetime', 'Date & Time', 'other', '📅'),
  locale: defineModule('locale', 'Locale', 'other', '🌍'),
  weather: defineModule('weather', 'Weather', 'other', '🌤️', ['timeout'], { timeout: 1000 }),
  loadavg: defineModule('loadavg', 'Load Average', 'other', '📈'),
  bootmgr: defineModule('bootmgr', 'Boot Manager', 'other', '🔄'),
  tpm: defineModule('tpm', 'TPM', 'other', '🔏'),
  gamepad: defineModule('gamepad', 'Gamepad', 'other', '🎮'),
  camera: defineModule('camera', 'Camera', 'other', '📷'),
  keyboard: defineModule('keyboard', 'Keyboard', 'other', '⌨️'),
  mouse: defineModule('mouse', 'Mouse', 'other', '🖱️'),
  zpool: defineModule('zpool', 'ZFS Pool', 'other', '🗄️'),
  btrfs: defineModule('btrfs', 'Btrfs', 'other', '🌲'),
  colors: defineModule('colors', 'Colors', 'other', '🎨'),
  custom: defineModule('custom', 'Custom', 'other', '✏️', ['shell']),
  command: defineModule('command', 'Command', 'other', '💬', ['text', 'timeout']),
} as const

export const FORMAT_HINTS: Partial<Record<ModuleType, string>> = {
  title: '{1} user name, {2} host name, {3} user@host',
  os: '{1} name, {2} pretty name, {3} id, {4} version, {5} arch, {6} codename',
  host: '{1} product name, {2} product family, {3} product version',
  kernel: '{1} sysname, {2} release, {3} version, {4} arch',
  uptime: '{1} days, {2} hours, {3} mins, {4} secs',
  shell: '{1} name, {2} version, {3} path, {4} pid',
  terminal: '{1} name, {2} version, {3} path, {4} pid',
  terminalfont: '{1} name, {2} size',
  terminalsize: '{1} rows, {2} columns',
  terminaltheme: '{1} fg, {2} bg, {3} cursor',
  wm: '{1} name, {2} version, {3} protocol',
  wmtheme: '{1} theme name',
  de: '{1} name, {2} version',
  packages: '{1} total, {2} pacman, {3} dpkg, {4} brew, {5} snap, {6} flatpak',
  processes: '{1} count',
  users: '{1} name, {2} login time, {3} tty',
  theme: '{1} theme1, {2} theme2, {3} theme3, {4} theme4',
  icons: '{1} icons1, {2} icons2, {3} icons3, {4} icons4',
  font: '{1} font1, {2} font2, {3} font3, {4} font4',
  cursor: '{1} name, {2} size',
  wallpaper: '{1} path',
  editor: '{1} name, {2} version, {3} path',
  lm: '{1} name, {2} version',
  initsystem: '{1} name, {2} version',
  version: '{1} version, {2} name',
  cpu: '{1} name, {2} cores (physical), {3} cores (logical), {4} freq (base), {5} freq (max)',
  gpu: '{1} vendor, {2} name, {3} driver, {4} temp, {5} VRAM total, {6} VRAM used',
  memory: '{1} used, {2} total, {3} percentage',
  swap: '{1} used, {2} total, {3} percentage',
  disk: '{1} used, {2} total, {3} percentage, {4} files, {5} mount point',
  physicalmemory: '{1} amount, {2} type, {3} speed, {4} locator',
  physicaldisk: '{1} name, {2} size, {3} type, {4} serial',
  diskio: '{1} name, {2} read, {3} write, {4} readSpeed, {5} writeSpeed',
  cpucache: '{1} L1 size, {2} L2 size, {3} L3 size',
  cpuusage: '{1} avg percentage',
  battery: '{1} manufacturer, {2} model, {3} tech, {4} capacity, {5} status, {6} temp',
  poweradapter: '{1} name, {2} watts, {3} manufacturer',
  sound: '{1} name, {2} volume, {3} identifier',
  monitor: '{1} name, {2} width, {3} height, {4} size (inches)',
  display: '{1} width, {2} height, {3} refresh rate, {4} scaled width, {5} scaled height, {6} name, {7} type',
  brightness: '{1} percentage, {2} name',
  localip: '{1} ip, {2} iface, {3} mac, {4} subnet',
  publicip: '{1} ip',
  wifi: '{1} ssid, {2} status, {3} security, {4} signal, {5} rx, {6} tx',
  dns: '{1} nameserver',
  bluetooth: '{1} name, {2} address, {3} type, {4} battery',
  bluetoothradio: '{1} name, {2} address, {3} lmpVersion',
  netio: '{1} interface, {2} rx, {3} tx, {4} rxSpeed, {5} txSpeed',
  opengl: '{1} version, {2} renderer, {3} vendor, {4} slv',
  opencl: '{1} version, {2} device, {3} vendor',
  vulkan: '{1} api version, {2} driver, {3} conformance, {4} device',
  bios: '{1} vendor, {2} version, {3} date',
  board: '{1} name, {2} vendor, {3} version, {4} serial',
  chassis: '{1} type, {2} vendor, {3} version, {4} serial',
  player: '{1} name, {2} url, {3} identity',
  media: '{1} title, {2} artist, {3} album, {4} track, {5} genre',
  datetime: '{1} year, {2} month, {3} day, {4} hour, {5} minute, {6} second, {7} weekday',
  locale: '{1} locale',
  weather: '{1} temp, {2} condition, {3} humidity, {4} wind',
  loadavg: '{1} 1m, {2} 5m, {3} 15m',
  bootmgr: '{1} name, {2} firmware',
  tpm: '{1} version',
  gamepad: '{1} name, {2} serial',
  camera: '{1} name, {2} vendor, {3} id',
  keyboard: '{1} name, {2} vendor',
  mouse: '{1} name, {2} vendor',
  zpool: '{1} name, {2} state, {3} used, {4} total',
  btrfs: '{1} name, {2} used, {3} total, {4} devices',
  custom: '{1} shell output (requires shell option)',
  command: '{1} output',
}
