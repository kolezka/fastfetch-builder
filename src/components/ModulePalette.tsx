import { useState, useMemo } from 'react'
import { MODULE_DEFINITIONS } from '@/lib/moduleDefinitions'
import type { ModuleCategory, ModuleDefinition } from '@/lib/moduleDefinitions'
import { useConfigStore } from '@/store/configStore'

const CATEGORY_ORDER: readonly ModuleCategory[] = ['info', 'hardware', 'display', 'network', 'other']

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  info: 'Info',
  hardware: 'Hardware',
  display: 'Display',
  network: 'Network',
  other: 'Other',
}

function groupByCategory(): Record<ModuleCategory, ModuleDefinition[]> {
  const groups: Record<ModuleCategory, ModuleDefinition[]> = {
    info: [],
    hardware: [],
    display: [],
    network: [],
    other: [],
  }
  for (const def of Object.values(MODULE_DEFINITIONS)) {
    groups[def.category].push(def)
  }
  return groups
}

interface PaletteItemProps {
  definition: ModuleDefinition
}

function PaletteItem({ definition }: PaletteItemProps) {
  const addModule = useConfigStore((s) => s.addModule)

  return (
    <button
      type="button"
      onClick={() => addModule(definition.type)}
      title={`Add ${definition.label} module`}
      className="flex items-center gap-2 rounded-md border border-border bg-bg-surface px-2 py-1.5 font-mono text-xs text-text-primary transition-colors hover:border-accent hover:text-accent active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span>{definition.icon}</span>
      <span>{definition.label}</span>
    </button>
  )
}

interface ModulePaletteProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function ModulePalette({ collapsed, onToggle }: ModulePaletteProps) {
  const [search, setSearch] = useState('')
  const groups = groupByCategory()

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups
    const term = search.toLowerCase()
    const filtered: Record<ModuleCategory, ModuleDefinition[]> = {
      info: [],
      hardware: [],
      display: [],
      network: [],
      other: [],
    }
    for (const category of CATEGORY_ORDER) {
      filtered[category] = groups[category].filter(
        (def) =>
          def.label.toLowerCase().includes(term) ||
          def.type.toLowerCase().includes(term),
      )
    }
    return filtered
  }, [groups, search])

  const totalResults = CATEGORY_ORDER.reduce(
    (sum, cat) => sum + filteredGroups[cat].length,
    0,
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold text-accent">Add Modules</h3>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? 'Expand palette' : 'Collapse palette'}
            className="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-bg-base hover:text-text-primary"
          >
            {collapsed ? '▼' : '▲'}
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-md border border-border bg-bg-base px-2 py-1.5 font-mono text-xs text-text-primary placeholder:text-text-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />

          {search && totalResults === 0 ? (
            <p className="py-2 text-center font-mono text-xs text-text-muted">
              No modules match &quot;{search}&quot;
            </p>
          ) : (
            CATEGORY_ORDER.map((category) => {
              const items = filteredGroups[category]
              if (items.length === 0) return null
              return (
                <div key={category}>
                  <h4 className="mb-2 font-mono text-xs text-text-muted">{CATEGORY_LABELS[category]}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((def) => (
                      <PaletteItem key={def.type} definition={def} />
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </>
      )}
    </div>
  )
}
