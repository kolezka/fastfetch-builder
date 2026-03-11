import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence } from 'framer-motion'
import { useConfigStore } from '@/store/configStore'
import { ModulePalette } from '@/components/ModulePalette'
import { ModuleCard } from '@/components/ModuleCard'

export function ModuleList() {
  const modules = useConfigStore((s) => s.modules)

  const { setNodeRef, isOver } = useDroppable({
    id: 'module-list-droppable',
  })

  const moduleIds = modules.map((m) => m.id)

  return (
    <main className="flex flex-col gap-6 overflow-y-auto p-4">
      <ModulePalette />

      <div>
        <h3 className="mb-3 font-mono text-xs font-semibold text-accent">Active Modules</h3>

        <div
          ref={setNodeRef}
          className={`min-h-16 rounded-lg border border-dashed p-2 transition-colors ${
            isOver ? 'border-accent bg-accent/5' : 'border-border'
          }`}
        >
          {modules.length === 0 ? (
            <p className="py-8 text-center font-mono text-xs text-text-muted">
              Drag modules here or click to add
            </p>
          ) : (
            <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                <div className="space-y-2">
                  {modules.map((module) => (
                    <ModuleCard key={module.id} module={module} />
                  ))}
                </div>
              </AnimatePresence>
            </SortableContext>
          )}
        </div>
      </div>
    </main>
  )
}
