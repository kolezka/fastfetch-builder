import type { GlobalSettings, ModuleInstance, ModuleOptions } from '@/lib/moduleDefinitions'

function indent(level: number): string {
  return '    '.repeat(level)
}

function escapeString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

function formatValue(value: unknown, level: number): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return `"${escapeString(value)}"`

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((item) => `${indent(level + 1)}${formatValue(item, level + 1)}`)
    return `[\n${items.join(',\n')}\n${indent(level)}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(
      ([, v]) => v !== undefined && v !== null && v !== '',
    )
    if (entries.length === 0) return '{}'
    const lines = entries.map(
      ([k, v]) => `${indent(level + 1)}"${escapeString(k)}": ${formatValue(v, level + 1)}`,
    )
    return `{\n${lines.join(',\n')}\n${indent(level)}}`
  }

  return String(value)
}

function hasNonEmptyOptions(options: ModuleOptions): boolean {
  return Object.entries(options).some(([, value]) => {
    if (value === undefined || value === null || value === '') return false
    return true
  })
}

function formatModuleEntry(module: ModuleInstance, level: number): string {
  if (!hasNonEmptyOptions(module.options)) {
    return `${indent(level)}"${module.type}"`
  }

  const entries: string[] = [`${indent(level + 1)}"type": "${module.type}"`]

  for (const [key, value] of Object.entries(module.options)) {
    if (value === undefined || value === null || value === '') continue
    entries.push(`${indent(level + 1)}"${escapeString(key)}": ${formatValue(value, level + 1)}`)
  }

  return `${indent(level)}{\n${entries.join(',\n')}\n${indent(level)}}`
}

function formatLogoSection(logo: GlobalSettings['logo']): string[] {
  const lines: string[] = []

  if (logo.source === 'none') {
    return lines
  }

  lines.push(`${indent(1)}// Logo`)

  const logoEntries: string[] = []
  logoEntries.push(`${indent(2)}"source": ${formatValue(logo.source, 2)}`)

  if (logo.type && logo.type !== 'auto') {
    logoEntries.push(`${indent(2)}"type": ${formatValue(logo.type, 2)}`)
  }

  if (logo.color && logo.color.length > 0) {
    logoEntries.push(`${indent(2)}"color": ${formatValue(logo.color, 2)}`)
  }

  if (logo.padding) {
    const paddingEntries = Object.entries(logo.padding).filter(
      ([, v]) => v !== undefined && v !== null && v !== 0,
    )
    if (paddingEntries.length > 0) {
      logoEntries.push(`${indent(2)}"padding": ${formatValue(logo.padding, 2)}`)
    }
  }

  lines.push(`${indent(1)}"logo": {`)
  lines.push(logoEntries.join(',\n'))
  lines.push(`${indent(1)}},`)
  return lines
}

function formatDisplaySection(display: GlobalSettings['display']): string[] {
  const lines: string[] = []
  lines.push('')
  lines.push(`${indent(1)}// Display`)

  const displayEntries: string[] = []

  if (display.separator !== undefined && display.separator !== '') {
    displayEntries.push(`${indent(2)}"separator": ${formatValue(display.separator, 2)}`)
  }
  if (display.color) {
    displayEntries.push(`${indent(2)}"color": ${formatValue(display.color, 2)}`)
  }
  if (display.brightColor !== undefined) {
    displayEntries.push(`${indent(2)}"brightColor": ${formatValue(display.brightColor, 2)}`)
  }
  if (display.keyWidth !== undefined && display.keyWidth > 0) {
    displayEntries.push(`${indent(2)}"keyWidth": ${formatValue(display.keyWidth, 2)}`)
  }

  if (displayEntries.length > 0) {
    lines.push(`${indent(1)}"display": {`)
    lines.push(displayEntries.join(',\n'))
    lines.push(`${indent(1)}},`)
  }

  return lines
}

export function generateJsonc(globalSettings: GlobalSettings, modules: ModuleInstance[]): string {
  const lines: string[] = []

  lines.push('{')
  lines.push(`${indent(1)}"$schema": "https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json",`)
  lines.push('')

  lines.push(...formatLogoSection(globalSettings.logo))
  lines.push(...formatDisplaySection(globalSettings.display))

  lines.push('')
  lines.push(`${indent(1)}// Modules`)
  lines.push(`${indent(1)}"modules": [`)

  const moduleEntries = modules.map((m) => formatModuleEntry(m, 2))
  lines.push(moduleEntries.join(',\n'))

  lines.push(`${indent(1)}]`)
  lines.push('}')

  return lines.join('\n')
}
