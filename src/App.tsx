import { Header } from '@/components/Header'
import { GlobalSettings } from '@/components/GlobalSettings'
import { ModuleList } from '@/components/ModuleList'
import { JsonPreview } from '@/components/JsonPreview'
import { TerminalMockup } from '@/components/TerminalMockup'
import { PresetLoader } from '@/components/PresetLoader'
import { useResizeHandle } from '@/hooks/useResizeHandle'

export function App() {
  const { width: rightPanelWidth, onMouseDown: onResizeMouseDown } = useResizeHandle({
    initialWidth: 400,
    minWidth: 280,
    maxWidth: 700,
    direction: 'right',
  })

  return (
    <div className="flex h-screen flex-col bg-bg-base text-text-primary">
      <Header presetSlot={<PresetLoader />} />

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed-width left sidebar */}
        <div className="w-[280px] shrink-0 overflow-hidden">
          <GlobalSettings />
        </div>

        {/* Flexible center panel */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <ModuleList />
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={onResizeMouseDown}
          className="group relative z-10 w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-accent"
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* Resizable right panel */}
        <div
          className="flex shrink-0 flex-col overflow-hidden"
          style={{ width: rightPanelWidth }}
        >
          <JsonPreview />
          <div className="shrink-0 overflow-auto border-l border-border p-4">
            <TerminalMockup />
          </div>
        </div>
      </div>
    </div>
  )
}
