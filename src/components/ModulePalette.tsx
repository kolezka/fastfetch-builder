import { useDraggable } from '@dnd-kit/core'
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

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: {
      type: definition.type,
      fromPalette: true,
    },
  })

  const handleClick = () => {
    addModule(definition.type)
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-md border border-border bg-bg-surface px-2 py-1.5 font-mono text-xs text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <span>{definition.icon}</span>
      <span>{definition.label}</span>
    </button>
  )
}

export function ModulePalette() {
  const groups = groupByCategory()

  return (
    <div className="space-y-4">
      <h3 className="font-mono text-xs font-semibold text-accent">Add Modules</h3>
      {CATEGORY_ORDER.map((category) => {
        const items = groups[category]
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
      })}
    </div>
  )
}
