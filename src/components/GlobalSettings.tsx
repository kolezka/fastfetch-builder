import { useState } from 'react'
import { useConfigStore } from '@/store/configStore'
import type {
  AnsiColor,
  BinaryPrefix,
  ChafaCanvasMode,
  ChafaColorSpace,
  ChafaDitherMode,
  KeyType,
  LogoPosition,
  LogoType,
  SizeMaxPrefix,
  SpaceBeforeUnit,
  TempUnit,
  TrailingZeros,
} from '@/lib/moduleDefinitions'

const ANSI_COLORS: readonly AnsiColor[] = [
  'black', 'red', 'green', 'yellow', 'blue',
  'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
]

const LOGO_TYPES: readonly LogoType[] = [
  'auto', 'builtin', 'small', 'file', 'file-raw', 'data', 'data-raw',
  'sixel', 'kitty', 'kitty-direct', 'kitty-icat', 'iterm', 'chafa', 'raw', 'none',
]

const LOGO_POSITIONS: readonly LogoPosition[] = ['left', 'top', 'right']

const KEY_TYPES: readonly KeyType[] = ['none', 'string', 'icon', 'both', 'both-0', 'both-1', 'both-2', 'both-3', 'both-4']

const BINARY_PREFIXES: readonly BinaryPrefix[] = ['iec', 'si', 'jedec']

const SIZE_MAX_PREFIXES: readonly SizeMaxPrefix[] = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

const TEMP_UNITS: readonly TempUnit[] = ['C', 'F', 'K', 'D']

const SPACE_BEFORE_UNIT: readonly SpaceBeforeUnit[] = ['default', 'always', 'never']

const TRAILING_ZEROS: readonly TrailingZeros[] = ['default', 'always', 'never']

const CHAFA_CANVAS_MODES: readonly ChafaCanvasMode[] = [
  'TRUECOLOR', 'INDEXED_256', 'INDEXED_240', 'INDEXED_16', 'FGBG_BGFG', 'FGBG', 'INDEXED_8', 'INDEXED_16_8',
]

const CHAFA_COLOR_SPACES: readonly ChafaColorSpace[] = ['RGB', 'DIN99D']

const CHAFA_DITHER_MODES: readonly ChafaDitherMode[] = ['NONE', 'ORDERED', 'DIFFUSION']

// ─── Shared field components ──────────────────────────────────────────

interface SelectFieldProps {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-xs text-text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-bg-surface px-2 py-1.5 font-mono text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-xs text-text-muted">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-border bg-bg-surface px-2 py-1.5 font-mono text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </label>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-xs text-text-muted">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="rounded-md border border-border bg-bg-surface px-2 py-1.5 font-mono text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </label>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border text-accent focus:ring-accent"
      />
      <span className="font-mono text-xs text-text-muted">{label}</span>
    </label>
  )
}

// ─── Collapsible section ──────────────────────────────────────────────

interface SectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ title, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="mb-2 rounded-lg border border-border/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-bg-surface/50"
      >
        <h3 className="font-mono text-xs font-semibold text-accent">{title}</h3>
        <span className="font-mono text-xs text-text-muted">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="space-y-3 px-3 pb-3">{children}</div>}
    </section>
  )
}

// ─── Main component ───────────────────────────────────────────────────

export function GlobalSettings() {
  const globalSettings = useConfigStore((s) => s.globalSettings)

  // Legacy setters
  const setLogoSource = useConfigStore((s) => s.setLogoSource)
  const setLogoType = useConfigStore((s) => s.setLogoType)
  const setLogoPadding = useConfigStore((s) => s.setLogoPadding)
  const setDisplaySeparator = useConfigStore((s) => s.setDisplaySeparator)
  const setDisplayColor = useConfigStore((s) => s.setDisplayColor)
  const setDisplayBrightColor = useConfigStore((s) => s.setDisplayBrightColor)
  const setDisplayKeyWidth = useConfigStore((s) => s.setDisplayKeyWidth)

  // New generic updaters
  const updateLogo = useConfigStore((s) => s.updateLogo)
  const updateDisplay = useConfigStore((s) => s.updateDisplay)
  const updateGeneral = useConfigStore((s) => s.updateGeneral)
  const updateDisplayKey = useConfigStore((s) => s.updateDisplayKey)
  const updateDisplaySize = useConfigStore((s) => s.updateDisplaySize)
  const updateDisplayTemp = useConfigStore((s) => s.updateDisplayTemp)
  const updateDisplayBar = useConfigStore((s) => s.updateDisplayBar)
  const updateDisplayPercent = useConfigStore((s) => s.updateDisplayPercent)
  const updateDisplayFreq = useConfigStore((s) => s.updateDisplayFreq)
  const updateDisplayDuration = useConfigStore((s) => s.updateDisplayDuration)
  const updateDisplayFraction = useConfigStore((s) => s.updateDisplayFraction)
  const updateLogoChafa = useConfigStore((s) => s.updateLogoChafa)

  const colorOptions = ANSI_COLORS.map((c) => ({ value: c, label: c }))
  const logoTypeOptions = LOGO_TYPES.map((t) => ({ value: t, label: t }))
  const logoPositionOptions = LOGO_POSITIONS.map((p) => ({ value: p, label: p }))
  const keyTypeOptions = KEY_TYPES.map((t) => ({ value: t, label: t }))
  const binaryPrefixOptions = BINARY_PREFIXES.map((p) => ({ value: p, label: p }))
  const sizeMaxPrefixOptions = SIZE_MAX_PREFIXES.map((p) => ({ value: p, label: p }))
  const tempUnitOptions = TEMP_UNITS.map((u) => ({ value: u, label: u === 'D' ? 'D (auto)' : `${u} (${u === 'C' ? 'Celsius' : u === 'F' ? 'Fahrenheit' : 'Kelvin'})` }))
  const spaceBeforeUnitOptions = SPACE_BEFORE_UNIT.map((s) => ({ value: s, label: s }))
  const trailingZerosOptions = TRAILING_ZEROS.map((t) => ({ value: t, label: t }))
  const chafaCanvasModeOptions = CHAFA_CANVAS_MODES.map((m) => ({ value: m, label: m }))
  const chafaColorSpaceOptions = CHAFA_COLOR_SPACES.map((s) => ({ value: s, label: s }))
  const chafaDitherModeOptions = CHAFA_DITHER_MODES.map((m) => ({ value: m, label: m }))

  return (
    <aside className="h-full overflow-y-auto border-r border-border p-3 sm:p-4 lg:border-r">
      <h2 className="mb-4 font-mono text-sm font-medium text-text-muted uppercase tracking-wider">
        Global Settings
      </h2>

      {/* ── Logo ─────────────────────────────────────── */}
      <Section title="Logo" defaultOpen>
        <TextField
          label="Source"
          value={globalSettings.logo.source}
          onChange={setLogoSource}
          placeholder="none, distro name, or path"
        />
        <SelectField
          label="Type"
          value={globalSettings.logo.type ?? 'auto'}
          options={logoTypeOptions}
          onChange={(v) => setLogoType(v as LogoType)}
        />
        <SelectField
          label="Position"
          value={globalSettings.logo.position ?? 'left'}
          options={logoPositionOptions}
          onChange={(v) => updateLogo({ position: v as LogoPosition })}
        />
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Pad Top"
            value={globalSettings.logo.padding?.top ?? 0}
            onChange={(v) =>
              setLogoPadding({ ...globalSettings.logo.padding, top: v })
            }
            min={0}
          />
          <NumberField
            label="Pad Left"
            value={globalSettings.logo.padding?.left ?? 0}
            onChange={(v) =>
              setLogoPadding({ ...globalSettings.logo.padding, left: v })
            }
            min={0}
          />
          <NumberField
            label="Pad Right"
            value={globalSettings.logo.padding?.right ?? 0}
            onChange={(v) =>
              setLogoPadding({ ...globalSettings.logo.padding, right: v })
            }
            min={0}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Width"
            value={globalSettings.logo.width ?? 0}
            onChange={(v) => updateLogo({ width: v || null })}
            min={0}
          />
          <NumberField
            label="Height"
            value={globalSettings.logo.height ?? 0}
            onChange={(v) => updateLogo({ height: v || null })}
            min={0}
          />
        </div>
        <CheckboxField
          label="Print Remaining"
          checked={globalSettings.logo.printRemaining ?? true}
          onChange={(v) => updateLogo({ printRemaining: v })}
        />
        <CheckboxField
          label="Preserve Aspect Ratio"
          checked={globalSettings.logo.preserveAspectRatio ?? false}
          onChange={(v) => updateLogo({ preserveAspectRatio: v })}
        />
        <CheckboxField
          label="Recache"
          checked={globalSettings.logo.recache ?? false}
          onChange={(v) => updateLogo({ recache: v })}
        />
      </Section>

      {/* ── Logo › Chafa ─────────────────────────────── */}
      <Section title="Logo › Chafa">
        <p className="font-mono text-xs text-text-muted/70 italic">
          Chafa rendering options (only used when logo type is &quot;chafa&quot;)
        </p>
        <CheckboxField
          label="FG Only"
          checked={globalSettings.logo.chafa?.fgOnly ?? false}
          onChange={(v) => updateLogoChafa({ fgOnly: v })}
        />
        <TextField
          label="Symbols"
          value={globalSettings.logo.chafa?.symbols ?? ''}
          onChange={(v) => updateLogoChafa({ symbols: v })}
          placeholder="e.g. block+border+space"
        />
        <SelectField
          label="Canvas Mode"
          value={globalSettings.logo.chafa?.canvasMode ?? 'TRUECOLOR'}
          options={chafaCanvasModeOptions}
          onChange={(v) => updateLogoChafa({ canvasMode: v as ChafaCanvasMode })}
        />
        <SelectField
          label="Color Space"
          value={globalSettings.logo.chafa?.colorSpace ?? 'RGB'}
          options={chafaColorSpaceOptions}
          onChange={(v) => updateLogoChafa({ colorSpace: v as ChafaColorSpace })}
        />
        <SelectField
          label="Dither Mode"
          value={globalSettings.logo.chafa?.ditherMode ?? 'NONE'}
          options={chafaDitherModeOptions}
          onChange={(v) => updateLogoChafa({ ditherMode: v as ChafaDitherMode })}
        />
      </Section>

      {/* ── Display (core) ───────────────────────────── */}
      <Section title="Display" defaultOpen>
        <TextField
          label="Separator"
          value={globalSettings.display.separator ?? ': '}
          onChange={setDisplaySeparator}
          placeholder=": "
        />
        <SelectField
          label="Color"
          value={typeof globalSettings.display.color === 'string' ? globalSettings.display.color : 'cyan'}
          options={colorOptions}
          onChange={(v) => setDisplayColor(v as AnsiColor)}
        />
        <CheckboxField
          label="Bright Color"
          checked={globalSettings.display.brightColor ?? false}
          onChange={setDisplayBrightColor}
        />
        <NumberField
          label="Key Width"
          value={globalSettings.display.keyWidth ?? 0}
          onChange={setDisplayKeyWidth}
          min={0}
          max={50}
        />
        <CheckboxField
          label="Show Errors"
          checked={globalSettings.display.showErrors ?? false}
          onChange={(v) => updateDisplay({ showErrors: v })}
        />
        <CheckboxField
          label="Stat (show timing)"
          checked={globalSettings.display.stat ?? false}
          onChange={(v) => updateDisplay({ stat: v })}
        />
        <CheckboxField
          label="Pipe (disable colors)"
          checked={globalSettings.display.pipe ?? false}
          onChange={(v) => updateDisplay({ pipe: v })}
        />
        <CheckboxField
          label="Disable Linewrap"
          checked={globalSettings.display.disableLinewrap ?? true}
          onChange={(v) => updateDisplay({ disableLinewrap: v })}
        />
        <CheckboxField
          label="Hide Cursor"
          checked={globalSettings.display.hideCursor ?? true}
          onChange={(v) => updateDisplay({ hideCursor: v })}
        />
        <CheckboxField
          label="No Buffer"
          checked={globalSettings.display.noBuffer ?? false}
          onChange={(v) => updateDisplay({ noBuffer: v })}
        />
      </Section>

      {/* ── Display › Key ────────────────────────────── */}
      <Section title="Display › Key">
        <NumberField
          label="Width"
          value={globalSettings.display.key?.width ?? 0}
          onChange={(v) => updateDisplayKey({ width: v })}
          min={0}
        />
        <SelectField
          label="Type"
          value={globalSettings.display.key?.type ?? 'string'}
          options={keyTypeOptions}
          onChange={(v) => updateDisplayKey({ type: v as KeyType })}
        />
        <NumberField
          label="Padding Left"
          value={globalSettings.display.key?.paddingLeft ?? 0}
          onChange={(v) => updateDisplayKey({ paddingLeft: v })}
          min={0}
        />
      </Section>

      {/* ── Display › Size ───────────────────────────── */}
      <Section title="Display › Size">
        <SelectField
          label="Binary Prefix"
          value={globalSettings.display.size?.binaryPrefix ?? 'iec'}
          options={binaryPrefixOptions}
          onChange={(v) => updateDisplaySize({ binaryPrefix: v as BinaryPrefix })}
        />
        <SelectField
          label="Max Prefix"
          value={globalSettings.display.size?.maxPrefix ?? 'YB'}
          options={sizeMaxPrefixOptions}
          onChange={(v) => updateDisplaySize({ maxPrefix: v as SizeMaxPrefix })}
        />
        <NumberField
          label="Decimal Places"
          value={globalSettings.display.size?.ndigits ?? 2}
          onChange={(v) => updateDisplaySize({ ndigits: v })}
          min={0}
          max={9}
        />
      </Section>

      {/* ── Display › Temperature ────────────────────── */}
      <Section title="Display › Temperature">
        <SelectField
          label="Unit"
          value={globalSettings.display.temp?.unit ?? 'D'}
          options={tempUnitOptions}
          onChange={(v) => updateDisplayTemp({ unit: v as TempUnit })}
        />
        <NumberField
          label="Decimal Places"
          value={globalSettings.display.temp?.ndigits ?? 1}
          onChange={(v) => updateDisplayTemp({ ndigits: v })}
          min={0}
          max={9}
        />
        <SelectField
          label="Space Before Unit"
          value={globalSettings.display.temp?.spaceBeforeUnit ?? 'default'}
          options={spaceBeforeUnitOptions}
          onChange={(v) => updateDisplayTemp({ spaceBeforeUnit: v as SpaceBeforeUnit })}
        />
      </Section>

      {/* ── Display › Bar ────────────────────────────── */}
      <Section title="Display › Bar">
        <TextField
          label="Elapsed Char"
          value={globalSettings.display.bar?.char?.elapsed ?? '■'}
          onChange={(v) =>
            updateDisplayBar({
              char: { ...globalSettings.display.bar?.char, elapsed: v },
            })
          }
        />
        <TextField
          label="Total Char"
          value={globalSettings.display.bar?.char?.total ?? '-'}
          onChange={(v) =>
            updateDisplayBar({
              char: { ...globalSettings.display.bar?.char, total: v },
            })
          }
        />
        <NumberField
          label="Width"
          value={globalSettings.display.bar?.width ?? 10}
          onChange={(v) => updateDisplayBar({ width: v })}
          min={1}
        />
      </Section>

      {/* ── Display › Percent ────────────────────────── */}
      <Section title="Display › Percent">
        <NumberField
          label="Type"
          value={globalSettings.display.percent?.type ?? 0}
          onChange={(v) => updateDisplayPercent({ type: v })}
          min={0}
        />
        <NumberField
          label="Decimal Places"
          value={globalSettings.display.percent?.ndigits ?? 0}
          onChange={(v) => updateDisplayPercent({ ndigits: v })}
          min={0}
          max={9}
        />
        <SelectField
          label="Space Before Unit"
          value={globalSettings.display.percent?.spaceBeforeUnit ?? 'default'}
          options={spaceBeforeUnitOptions}
          onChange={(v) => updateDisplayPercent({ spaceBeforeUnit: v as SpaceBeforeUnit })}
        />
        <NumberField
          label="Width"
          value={globalSettings.display.percent?.width ?? 0}
          onChange={(v) => updateDisplayPercent({ width: v })}
          min={0}
        />
      </Section>

      {/* ── Display › Frequency ──────────────────────── */}
      <Section title="Display › Frequency">
        <NumberField
          label="Decimal Places"
          value={globalSettings.display.freq?.ndigits ?? 2}
          onChange={(v) => updateDisplayFreq({ ndigits: v })}
          min={0}
          max={9}
        />
        <SelectField
          label="Space Before Unit"
          value={globalSettings.display.freq?.spaceBeforeUnit ?? 'default'}
          options={spaceBeforeUnitOptions}
          onChange={(v) => updateDisplayFreq({ spaceBeforeUnit: v as SpaceBeforeUnit })}
        />
      </Section>

      {/* ── Display › Duration ───────────────────────── */}
      <Section title="Display › Duration">
        <CheckboxField
          label="Abbreviation (1h 2m)"
          checked={globalSettings.display.duration?.abbreviation ?? false}
          onChange={(v) => updateDisplayDuration({ abbreviation: v })}
        />
        <SelectField
          label="Space Before Unit"
          value={globalSettings.display.duration?.spaceBeforeUnit ?? 'default'}
          options={spaceBeforeUnitOptions}
          onChange={(v) => updateDisplayDuration({ spaceBeforeUnit: v as SpaceBeforeUnit })}
        />
      </Section>

      {/* ── Display › Fraction ───────────────────────── */}
      <Section title="Display › Fraction">
        <NumberField
          label="Decimal Places"
          value={globalSettings.display.fraction?.ndigits ?? 2}
          onChange={(v) => updateDisplayFraction({ ndigits: v })}
          min={0}
          max={9}
        />
        <SelectField
          label="Trailing Zeros"
          value={globalSettings.display.fraction?.trailingZeros ?? 'default'}
          options={trailingZerosOptions}
          onChange={(v) => updateDisplayFraction({ trailingZeros: v as TrailingZeros })}
        />
      </Section>

      {/* ── General ──────────────────────────────────── */}
      <Section title="General">
        <CheckboxField
          label="Thread (parallel HTTP)"
          checked={globalSettings.general?.thread ?? true}
          onChange={(v) => updateGeneral({ thread: v })}
        />
        <CheckboxField
          label="Detect Version"
          checked={globalSettings.general?.detectVersion ?? true}
          onChange={(v) => updateGeneral({ detectVersion: v })}
        />
        <CheckboxField
          label="Escape Bedrock"
          checked={globalSettings.general?.escapeBedrock ?? true}
          onChange={(v) => updateGeneral({ escapeBedrock: v })}
        />
        <CheckboxField
          label="DS Force DRM"
          checked={globalSettings.general?.dsForceDrm ?? false}
          onChange={(v) => updateGeneral({ dsForceDrm: v })}
        />
        <TextField
          label="Player Name"
          value={globalSettings.general?.playerName ?? ''}
          onChange={(v) => updateGeneral({ playerName: v })}
          placeholder="e.g. spotify, vlc"
        />
        <TextField
          label="Pre-Run Command"
          value={globalSettings.general?.preRun ?? ''}
          onChange={(v) => updateGeneral({ preRun: v })}
          placeholder="Command to run before logo"
        />
        <NumberField
          label="Processing Timeout (ms)"
          value={globalSettings.general?.processingTimeout ?? 5000}
          onChange={(v) => updateGeneral({ processingTimeout: v })}
          min={0}
        />
        <NumberField
          label="WMI Timeout (ms)"
          value={globalSettings.general?.wmiTimeout ?? 5000}
          onChange={(v) => updateGeneral({ wmiTimeout: v })}
          min={0}
        />
      </Section>
    </aside>
  )
}
