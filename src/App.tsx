import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Header } from '@/components/Header'
import { GlobalSettings } from '@/components/GlobalSettings'
import { ModuleList } from '@/components/ModuleList'
import { JsonPreview } from '@/components/JsonPreview'
import { TerminalMockup } from '@/components/TerminalMockup'
import { PresetLoader } from '@/components/PresetLoader'
import { useConfigStore } from '@/store/configStore'
import { MODULE_DEFINITIONS } from '@/lib/moduleDefinitions'
import type { ModuleType } from '@/lib/moduleDefinitions'

interface DragData {
  type: ModuleType
  fromPalette?: boolean
  instanceId?: string
}

export function App() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null)

  const addModule = useConfigStore((s) => s.addModule)
  const reorderModules = useConfigStore((s) => s.reorderModules)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
    setActiveDragData((event.active.data.current as DragData) ?? null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setActiveDragData(null)

      if (!over) return

      const activeData = active.data.current as DragData | undefined

      if (activeData?.fromPalette) {
        const overIndex = over.data.current?.sortable?.index as number | undefined
        addModule(activeData.type, overIndex ?? undefined)
      } else if (active.id !== over.id) {
        reorderModules(String(active.id), String(over.id))
      }
    },
    [addModule, reorderModules],
  )

  const dragLabel = activeDragData
    ? MODULE_DEFINITIONS[activeDragData.type]?.label ?? activeDragData.type
    : null

  return (
    <div className="flex h-screen flex-col bg-bg-base text-text-primary">
      <Header presetSlot={<PresetLoader />} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="grid flex-1 overflow-hidden"
          style={{ gridTemplateColumns: '280px 1fr 400px' }}
        >
          <GlobalSettings />
          <ModuleList />
          <div className="flex flex-col overflow-hidden">
            <JsonPreview />
            <div className="border-l border-border p-4">
              <TerminalMockup />
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId && dragLabel ? (
            <div className="rounded-lg border border-accent bg-bg-surface px-4 py-2 font-mono text-sm text-accent opacity-90 shadow-lg">
              {dragLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
