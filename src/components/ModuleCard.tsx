import { useState } from 'react'
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion'
import { MODULE_DEFINITIONS, FORMAT_HINTS } from '@/lib/moduleDefinitions'
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
  isFirst: boolean
  isLast: boolean
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
    case 'shell':
    case 'separator': {
      const hint = field === 'format' ? FORMAT_HINTS[module.type] : undefined
      const placeholder = field === 'shell'
        ? 'e.g. echo Hello'
        : field === 'format' && hint
          ? `e.g. {1} - ${hint.split(',')[0]?.replace('{1} ', '') ?? ''}`
          : undefined
      return (
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs text-text-muted">{field}</span>
          <input
            type="text"
            value={(currentValue as string) ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="rounded-md border border-border bg-bg-base px-2 py-1 font-mono text-xs text-text-primary placeholder:text-text-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          {field === 'format' && hint && (
            <span className="font-mono text-[10px] leading-tight text-text-muted/70">{hint}</span>
          )}
        </label>
      )
    }

    case 'keyColor':
    case 'color':
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

export function ModuleCard({ module, isFirst, isLast }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const removeModule = useConfigStore((s) => s.removeModule)
  const duplicateModule = useConfigStore((s) => s.duplicateModule)
  const moveModule = useConfigStore((s) => s.moveModule)
  const dragControls = useDragControls()

  const definition = MODULE_DEFINITIONS[module.type]

  return (
    <Reorder.Item
      value={module}
      id={module.id}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      whileDrag={{
        boxShadow: '0 8px 32px rgba(0, 212, 255, 0.2), 0 0 0 1px #00d4ff',
        zIndex: 50,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="rounded-lg border border-border bg-bg-surface"
      style={{ position: 'relative' }}
    >
      <div className="flex items-center gap-1.5 px-2 py-2">
        {/* Drag handle - large touch target */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex cursor-grab touch-none items-center rounded p-2 text-text-muted transition-colors hover:bg-bg-base hover:text-accent active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
            <circle cx="4" cy="3" r="1.5" />
            <circle cx="10" cy="3" r="1.5" />
            <circle cx="4" cy="9" r="1.5" />
            <circle cx="10" cy="9" r="1.5" />
            <circle cx="4" cy="15" r="1.5" />
            <circle cx="10" cy="15" r="1.5" />
          </svg>
        </div>

        {/* Move up/down buttons */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => moveModule(module.id, 'up')}
            disabled={isFirst}
            title="Move up"
            className="flex h-4 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-bg-base hover:text-accent disabled:opacity-20"
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 0L10 6H0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => moveModule(module.id, 'down')}
            disabled={isLast}
            title="Move down"
            className="flex h-4 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-bg-base hover:text-accent disabled:opacity-20"
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
              <path d="M5 6L0 0h10z" />
            </svg>
          </button>
        </div>

        <span className="ml-1 text-sm">{definition.icon}</span>
        <span className="flex-1 font-mono text-sm text-text-primary">{definition.label}</span>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          title={expanded ? 'Collapse options' : 'Expand options'}
          className="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-bg-base hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {expanded ? '▲' : '▼'}
        </button>

        <button
          type="button"
          onClick={() => duplicateModule(module.id)}
          className="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-bg-base hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          title="Duplicate module"
        >
          ⧉
        </button>

        <button
          type="button"
          onClick={() => removeModule(module.id)}
          className="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-bg-base hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          title="Remove module"
        >
          ✕
        </button>
      </div>

      <AnimatePresence>
        {expanded && definition.optionFields.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-3 py-3 space-y-2">
              {definition.optionFields.map((field) => (
                <OptionEditor key={field} module={module} field={field} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  )
}
