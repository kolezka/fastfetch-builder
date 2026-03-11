import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MODULE_DEFINITIONS } from '@/lib/moduleDefinitions'
import type { AnsiColor, ModuleInstance, ModuleOptionField } from '@/lib/moduleDefinitions'
import { useConfigStore } from '@/store/configStore'

const ANSI_COLORS: readonly AnsiColor[] = [
  'black', 'red', 'green', 'yellow', 'blue',
  'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
]

interface ModuleCardProps {
  module: ModuleInstance
}

interface OptionEditorProps {
  module: ModuleInstance
  field: ModuleOptionField
}

function OptionEditor({ module, field }: OptionEditorProps) {
  const updateModuleOptions = useConfigStore((s) => s.updateModuleOptions)

  const handleChange = (value: string | boolean | number) => {
    updateModuleOptions(module.id, { [field]: value })
  }

  const currentValue = module.options[field]

  switch (field) {
    case 'key':
    case 'format':
    case 'folders':
      return (
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-text-muted">{field}</span>
          <input
            type="text"
            value={(currentValue as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className="rounded-md border border-border bg-bg-base px-2 py-1 font-mono text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </label>
      )

    case 'keyColor':
      return (
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-text-muted">{field}</span>
          <select
            value={(currentValue as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            className="rounded-md border border-border bg-bg-base px-2 py-1 font-mono text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="">default</option>
            {ANSI_COLORS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      )

    case 'temp':
    case 'showPeCoreCount':
    case 'driverVersion':
    case 'showIpv6':
    case 'compact':
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(currentValue as boolean) ?? false}
            onChange={(e) => handleChange(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span className="font-mono text-xs text-text-muted">{field}</span>
        </label>
      )

    case 'freqNdig':
      return (
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-text-muted">{field}</span>
          <select
            value={String(currentValue ?? 2)}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="rounded-md border border-border bg-bg-base px-2 py-1 font-mono text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      )

    case 'compactType':
      return (
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-text-muted">{field}</span>
          <select
            value={(currentValue as string) ?? 'none'}
            onChange={(e) => handleChange(e.target.value)}
            className="rounded-md border border-border bg-bg-base px-2 py-1 font-mono text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="none">none</option>
            <option value="original">original</option>
            <option value="scaled">scaled</option>
            <option value="original-with-scaled-resolution">original-with-scaled-resolution</option>
          </select>
        </label>
      )

    case 'waitTime':
      return (
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-text-muted">{field}</span>
          <input
            type="number"
            value={(currentValue as number) ?? 0}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={0}
            className="rounded-md border border-border bg-bg-base px-2 py-1 font-mono text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </label>
      )

    default:
      return null
  }
}

export function ModuleCard({ module }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const removeModule = useConfigStore((s) => s.removeModule)
  const duplicateModule = useConfigStore((s) => s.duplicateModule)

  const definition = MODULE_DEFINITIONS[module.type]

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-border bg-bg-surface ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="cursor-grab touch-none text-text-muted hover:text-text-primary"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        <span className="text-sm">{definition.icon}</span>
        <span className="flex-1 font-mono text-sm text-text-primary">{definition.label}</span>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-bg-base hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {expanded ? '▲' : '▼'}
        </button>

        <button
          type="button"
          onClick={() => duplicateModule(module.id)}
          className="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-bg-base hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          title="Duplicate"
        >
          ⧉
        </button>

        <button
          type="button"
          onClick={() => removeModule(module.id)}
          className="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-bg-base hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          title="Remove"
        >
          ✕
        </button>
      </div>

      {expanded && definition.optionFields.length > 0 && (
        <div className="border-t border-border px-3 py-3 space-y-2">
          {definition.optionFields.map((field) => (
            <OptionEditor key={field} module={module} field={field} />
          ))}
        </div>
      )}
    </div>
  )
}
