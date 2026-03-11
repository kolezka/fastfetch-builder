import { useMemo } from 'react'
import { useConfigStore } from '@/store/configStore'
import { MODULE_DEFINITIONS } from '@/lib/moduleDefinitions'
import type { ModuleInstance, ModuleType } from '@/lib/moduleDefinitions'

const PLACEHOLDER_VALUES: Partial<Record<ModuleType, string>> = {
  title: 'user@archlinux',
  separator: '──────────────',
  os: 'Arch Linux x86_64',
  kernel: '6.7.4-arch1-1',
  uptime: '2 hours, 15 mins',
  shell: 'zsh 5.9',
  terminal: 'kitty',
  wm: 'Hyprland',
  packages: '1247 (pacman)',
  cpu: 'AMD Ryzen 7 5800X (16) @ 3.80 GHz',
  gpu: 'NVIDIA GeForce RTX 3070',
  memory: '4.21 GiB / 15.55 GiB (27%)',
  swap: '0 B / 8.00 GiB (0%)',
  disk: '128.42 GiB / 465.76 GiB (28%)',
  display: '2560x1440 @ 144Hz',
  brightness: '75%',
  battery: '87% [Charging]',
  poweradapter: '65W USB-C',
  localip: '192.168.1.42',
  wifi: 'HomeNetwork (802.11ac)',
  colors: '● ● ● ● ● ● ● ●',
  custom: 'custom value',
  cpuusage: '12%',
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

function getModuleLine(module: ModuleInstance, separator: string): string {
  const def = MODULE_DEFINITIONS[module.type]
  const value = PLACEHOLDER_VALUES[module.type] ?? ''

  if (module.type === 'title' || module.type === 'separator' || module.type === 'colors') {
    return value
  }

  const key = module.options.key ?? def.label
  return `${key}${separator}${value}`
}

export function TerminalMockup() {
  const globalSettings = useConfigStore((s) => s.globalSettings)
  const modules = useConfigStore((s) => s.modules)

  const lines = useMemo(() => {
    const separator = globalSettings.display.separator ?? ': '
    return modules.map((m) => getModuleLine(m, separator))
  }, [modules, globalSettings.display.separator])

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
            const infoLine = lines[i] ?? ''
            const paddedLogo = logoLine.padEnd(maxLogoWidth + 2)

            return (
              <div key={i}>
                <span className="text-accent">{paddedLogo}</span>
                <span>{infoLine}</span>
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
}
