import { useConfigStore } from '@/store/configStore'
import type { AnsiColor } from '@/lib/moduleDefinitions'

const ANSI_COLORS: readonly AnsiColor[] = [
  'black', 'red', 'green', 'yellow', 'blue',
  'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
]

const LOGO_TYPES = ['auto', 'builtin', 'small'] as const

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

export function GlobalSettings() {
  const globalSettings = useConfigStore((s) => s.globalSettings)
  const setLogoSource = useConfigStore((s) => s.setLogoSource)
  const setLogoType = useConfigStore((s) => s.setLogoType)
  const setLogoPadding = useConfigStore((s) => s.setLogoPadding)
  const setDisplaySeparator = useConfigStore((s) => s.setDisplaySeparator)
  const setDisplayColor = useConfigStore((s) => s.setDisplayColor)
  const setDisplayBrightColor = useConfigStore((s) => s.setDisplayBrightColor)
  const setDisplayKeyWidth = useConfigStore((s) => s.setDisplayKeyWidth)

  const colorOptions = ANSI_COLORS.map((c) => ({ value: c, label: c }))
  const logoTypeOptions = LOGO_TYPES.map((t) => ({ value: t, label: t }))

  return (
    <aside className="h-full overflow-y-auto border-r border-border p-4">
      <h2 className="mb-4 font-mono text-sm font-medium text-text-muted uppercase tracking-wider">
        Global Settings
      </h2>

      <section className="mb-6 space-y-3">
        <h3 className="font-mono text-xs font-semibold text-accent">Logo</h3>
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
          onChange={(v) => setLogoType(v as 'auto' | 'builtin' | 'small')}
        />
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Pad Top"
            value={globalSettings.logo.padding?.top ?? 0}
            onChange={(v) =>
              setLogoPadding({
                ...globalSettings.logo.padding,
                top: v,
              })
            }
            min={0}
          />
          <NumberField
            label="Pad Left"
            value={globalSettings.logo.padding?.left ?? 0}
            onChange={(v) =>
              setLogoPadding({
                ...globalSettings.logo.padding,
                left: v,
              })
            }
            min={0}
          />
          <NumberField
            label="Pad Right"
            value={globalSettings.logo.padding?.right ?? 0}
            onChange={(v) =>
              setLogoPadding({
                ...globalSettings.logo.padding,
                right: v,
              })
            }
            min={0}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-mono text-xs font-semibold text-accent">Display</h3>
        <TextField
          label="Separator"
          value={globalSettings.display.separator ?? ': '}
          onChange={setDisplaySeparator}
          placeholder=": "
        />
        <SelectField
          label="Color"
          value={globalSettings.display.color ?? 'cyan'}
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
      </section>
    </aside>
  )
}
