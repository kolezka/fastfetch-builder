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

/** Check if an object has any entries with meaningful (non-default-ish) values */
function hasContent(obj: Record<string, unknown> | undefined | null): boolean {
  if (!obj) return false
  return Object.entries(obj).some(([, v]) => v !== undefined && v !== null && v !== '')
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

  if (logo.width !== undefined && logo.width !== null && logo.width > 0) {
    logoEntries.push(`${indent(2)}"width": ${formatValue(logo.width, 2)}`)
  }

  if (logo.height !== undefined && logo.height !== null && logo.height > 0) {
    logoEntries.push(`${indent(2)}"height": ${formatValue(logo.height, 2)}`)
  }

  if (logo.position && logo.position !== 'left') {
    logoEntries.push(`${indent(2)}"position": ${formatValue(logo.position, 2)}`)
  }

  if (logo.printRemaining === false) {
    logoEntries.push(`${indent(2)}"printRemaining": false`)
  }

  if (logo.preserveAspectRatio === true) {
    logoEntries.push(`${indent(2)}"preserveAspectRatio": true`)
  }

  if (logo.recache === true) {
    logoEntries.push(`${indent(2)}"recache": true`)
  }

  if (logo.chafa && hasContent(logo.chafa as Record<string, unknown>)) {
    const chafaObj: Record<string, unknown> = {}
    if (logo.chafa.fgOnly === true) chafaObj.fgOnly = true
    if (logo.chafa.symbols) chafaObj.symbols = logo.chafa.symbols
    if (logo.chafa.canvasMode) chafaObj.canvasMode = logo.chafa.canvasMode
    if (logo.chafa.colorSpace) chafaObj.colorSpace = logo.chafa.colorSpace
    if (logo.chafa.ditherMode) chafaObj.ditherMode = logo.chafa.ditherMode
    if (Object.keys(chafaObj).length > 0) {
      logoEntries.push(`${indent(2)}"chafa": ${formatValue(chafaObj, 2)}`)
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

  // color can be a string (AnsiColor) or an object (DisplayColorSettings)
  if (display.color) {
    if (typeof display.color === 'string') {
      displayEntries.push(`${indent(2)}"color": ${formatValue(display.color, 2)}`)
    } else if (typeof display.color === 'object' && hasContent(display.color as Record<string, unknown>)) {
      displayEntries.push(`${indent(2)}"color": ${formatValue(display.color, 2)}`)
    }
  }

  if (display.brightColor !== undefined) {
    displayEntries.push(`${indent(2)}"brightColor": ${formatValue(display.brightColor, 2)}`)
  }
  if (display.keyWidth !== undefined && display.keyWidth > 0) {
    displayEntries.push(`${indent(2)}"keyWidth": ${formatValue(display.keyWidth, 2)}`)
  }
  if (display.showErrors === true) {
    displayEntries.push(`${indent(2)}"showErrors": true`)
  }
  if (display.stat === true) {
    displayEntries.push(`${indent(2)}"stat": true`)
  }
  if (display.pipe === true) {
    displayEntries.push(`${indent(2)}"pipe": true`)
  }
  if (display.disableLinewrap === false) {
    displayEntries.push(`${indent(2)}"disableLinewrap": false`)
  }
  if (display.hideCursor === false) {
    displayEntries.push(`${indent(2)}"hideCursor": false`)
  }
  if (display.noBuffer === true) {
    displayEntries.push(`${indent(2)}"noBuffer": true`)
  }

  // key sub-object
  if (display.key) {
    const keyObj: Record<string, unknown> = {}
    if (display.key.width !== undefined && display.key.width > 0) keyObj.width = display.key.width
    if (display.key.type && display.key.type !== 'string') keyObj.type = display.key.type
    if (display.key.paddingLeft !== undefined && display.key.paddingLeft > 0) keyObj.paddingLeft = display.key.paddingLeft
    if (Object.keys(keyObj).length > 0) {
      displayEntries.push(`${indent(2)}"key": ${formatValue(keyObj, 2)}`)
    }
  }

  // size sub-object
  if (display.size) {
    const sizeObj: Record<string, unknown> = {}
    if (display.size.binaryPrefix && display.size.binaryPrefix !== 'iec') sizeObj.binaryPrefix = display.size.binaryPrefix
    if (display.size.maxPrefix && display.size.maxPrefix !== 'YB') sizeObj.maxPrefix = display.size.maxPrefix
    if (display.size.ndigits !== undefined && display.size.ndigits !== 2) sizeObj.ndigits = display.size.ndigits
    if (Object.keys(sizeObj).length > 0) {
      displayEntries.push(`${indent(2)}"size": ${formatValue(sizeObj, 2)}`)
    }
  }

  // temp sub-object
  if (display.temp) {
    const tempObj: Record<string, unknown> = {}
    if (display.temp.unit && display.temp.unit !== 'D') tempObj.unit = display.temp.unit
    if (display.temp.ndigits !== undefined && display.temp.ndigits !== 1) tempObj.ndigits = display.temp.ndigits
    if (display.temp.color && hasContent(display.temp.color as Record<string, unknown>)) tempObj.color = display.temp.color
    if (display.temp.spaceBeforeUnit && display.temp.spaceBeforeUnit !== 'default') tempObj.spaceBeforeUnit = display.temp.spaceBeforeUnit
    if (Object.keys(tempObj).length > 0) {
      displayEntries.push(`${indent(2)}"temp": ${formatValue(tempObj, 2)}`)
    }
  }

  // bar sub-object
  if (display.bar) {
    const barObj: Record<string, unknown> = {}
    if (display.bar.char) {
      const charObj: Record<string, unknown> = {}
      if (display.bar.char.elapsed && display.bar.char.elapsed !== '■') charObj.elapsed = display.bar.char.elapsed
      if (display.bar.char.total && display.bar.char.total !== '-') charObj.total = display.bar.char.total
      if (Object.keys(charObj).length > 0) barObj.char = charObj
    }
    if (display.bar.border !== undefined) {
      if (display.bar.border === null) {
        barObj.border = null
      } else if (hasContent(display.bar.border as Record<string, unknown>)) {
        barObj.border = display.bar.border
      }
    }
    if (display.bar.color !== undefined) {
      if (display.bar.color === null) {
        barObj.color = null
      } else if (hasContent(display.bar.color as Record<string, unknown>)) {
        barObj.color = display.bar.color
      }
    }
    if (display.bar.width !== undefined && display.bar.width !== 10) barObj.width = display.bar.width
    if (Object.keys(barObj).length > 0) {
      displayEntries.push(`${indent(2)}"bar": ${formatValue(barObj, 2)}`)
    }
  }

  // percent sub-object
  if (display.percent) {
    const pctObj: Record<string, unknown> = {}
    if (display.percent.type !== undefined) pctObj.type = display.percent.type
    if (display.percent.ndigits !== undefined && display.percent.ndigits !== 0) pctObj.ndigits = display.percent.ndigits
    if (display.percent.color && hasContent(display.percent.color as Record<string, unknown>)) pctObj.color = display.percent.color
    if (display.percent.spaceBeforeUnit && display.percent.spaceBeforeUnit !== 'default') pctObj.spaceBeforeUnit = display.percent.spaceBeforeUnit
    if (display.percent.width !== undefined && display.percent.width > 0) pctObj.width = display.percent.width
    if (Object.keys(pctObj).length > 0) {
      displayEntries.push(`${indent(2)}"percent": ${formatValue(pctObj, 2)}`)
    }
  }

  // freq sub-object
  if (display.freq) {
    const freqObj: Record<string, unknown> = {}
    if (display.freq.ndigits !== undefined && display.freq.ndigits !== 2) freqObj.ndigits = display.freq.ndigits
    if (display.freq.spaceBeforeUnit && display.freq.spaceBeforeUnit !== 'default') freqObj.spaceBeforeUnit = display.freq.spaceBeforeUnit
    if (Object.keys(freqObj).length > 0) {
      displayEntries.push(`${indent(2)}"freq": ${formatValue(freqObj, 2)}`)
    }
  }

  // duration sub-object
  if (display.duration) {
    const durObj: Record<string, unknown> = {}
    if (display.duration.abbreviation === true) durObj.abbreviation = true
    if (display.duration.spaceBeforeUnit && display.duration.spaceBeforeUnit !== 'default') durObj.spaceBeforeUnit = display.duration.spaceBeforeUnit
    if (Object.keys(durObj).length > 0) {
      displayEntries.push(`${indent(2)}"duration": ${formatValue(durObj, 2)}`)
    }
  }

  // fraction sub-object
  if (display.fraction) {
    const fracObj: Record<string, unknown> = {}
    if (display.fraction.ndigits !== undefined && display.fraction.ndigits !== 2) fracObj.ndigits = display.fraction.ndigits
    if (display.fraction.trailingZeros && display.fraction.trailingZeros !== 'default') fracObj.trailingZeros = display.fraction.trailingZeros
    if (Object.keys(fracObj).length > 0) {
      displayEntries.push(`${indent(2)}"fraction": ${formatValue(fracObj, 2)}`)
    }
  }

  if (displayEntries.length > 0) {
    lines.push(`${indent(1)}"display": {`)
    lines.push(displayEntries.join(',\n'))
    lines.push(`${indent(1)}},`)
  }

  return lines
}

function formatGeneralSection(general: GlobalSettings['general']): string[] {
  const lines: string[] = []
  if (!general) return lines

  const entries: string[] = []

  if (general.thread === false) {
    entries.push(`${indent(2)}"thread": false`)
  }
  if (general.escapeBedrock === false) {
    entries.push(`${indent(2)}"escapeBedrock": false`)
  }
  if (general.playerName) {
    entries.push(`${indent(2)}"playerName": ${formatValue(general.playerName, 2)}`)
  }
  if (general.dsForceDrm === true) {
    entries.push(`${indent(2)}"dsForceDrm": true`)
  }
  if (general.wmiTimeout !== undefined && general.wmiTimeout !== 5000) {
    entries.push(`${indent(2)}"wmiTimeout": ${formatValue(general.wmiTimeout, 2)}`)
  }
  if (general.processingTimeout !== undefined && general.processingTimeout !== 5000) {
    entries.push(`${indent(2)}"processingTimeout": ${formatValue(general.processingTimeout, 2)}`)
  }
  if (general.preRun) {
    entries.push(`${indent(2)}"preRun": ${formatValue(general.preRun, 2)}`)
  }
  if (general.detectVersion === false) {
    entries.push(`${indent(2)}"detectVersion": false`)
  }

  if (entries.length > 0) {
    lines.push('')
    lines.push(`${indent(1)}// General`)
    lines.push(`${indent(1)}"general": {`)
    lines.push(entries.join(',\n'))
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
  lines.push(...formatGeneralSection(globalSettings.general))
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
