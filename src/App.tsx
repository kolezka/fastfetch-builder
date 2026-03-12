import { useState } from 'react'
import { Header } from '@/components/Header'
import { GlobalSettings } from '@/components/GlobalSettings'
import { ModuleList } from '@/components/ModuleList'
import { JsonPreview } from '@/components/JsonPreview'
import { TerminalMockup } from '@/components/TerminalMockup'
import { PresetLoader } from '@/components/PresetLoader'
import { useResizeHandle } from '@/hooks/useResizeHandle'

type MobileTab = 'modules' | 'settings' | 'preview' | 'terminal'

const TAB_ITEMS: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'modules', label: 'Modules', icon: '▦' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'preview', label: 'JSON', icon: '{ }' },
  { id: 'terminal', label: 'Preview', icon: '▶' },
]

export function App() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('modules')
  const { width: rightPanelWidth, onMouseDown: onResizeMouseDown } = useResizeHandle({
    initialWidth: 400,
    minWidth: 280,
    maxWidth: 700,
    direction: 'right',
  })

  return (
    <div className="flex h-screen flex-col bg-bg-base text-text-primary">
      <Header presetSlot={<PresetLoader />} />

      {/* ── Desktop layout (lg+): 3-column ── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
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

      {/* ── Mobile layout (<lg): single panel + bottom tabs ── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        {/* Active panel */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === 'modules' && <ModuleList />}
          {mobileTab === 'settings' && <GlobalSettings />}
          {mobileTab === 'preview' && <JsonPreview />}
          {mobileTab === 'terminal' && (
            <div className="h-full overflow-auto p-4">
              <TerminalMockup />
            </div>
          )}
        </div>

        {/* Bottom tab bar */}
        <nav className="flex shrink-0 border-t border-border bg-bg-surface safe-bottom">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5 font-mono text-[10px] transition-colors ${
                mobileTab === tab.id
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
