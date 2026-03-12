import { useState, useCallback } from 'react'
import { Reorder, AnimatePresence } from 'framer-motion'
import { useConfigStore } from '@/store/configStore'
import { ModulePalette } from '@/components/ModulePalette'
import { ModuleCard } from '@/components/ModuleCard'
import { PRESETS } from '@/lib/presets'
import type { PresetConfig } from '@/lib/moduleDefinitions'

export function ModuleList() {
  const modules = useConfigStore((s) => s.modules)
  const loadPreset = useConfigStore((s) => s.loadPreset)
  const resetToDefault = useConfigStore((s) => s.resetToDefault)
  const setModules = useConfigStore((s) => s.setModules)
  const [paletteCollapsed, setPaletteCollapsed] = useState(false)

  const handleClearAll = useCallback(() => {
    resetToDefault()
  }, [resetToDefault])

  const handleLoadPreset = useCallback(() => {
    const neofetch = PRESETS[0]
    if (neofetch) {
      loadPreset(neofetch as PresetConfig)
    }
  }, [loadPreset])

  return (
    <main className="flex h-full flex-col overflow-hidden p-4 gap-0">
      {/* Palette section - independent scroll with max-height */}
      <div className={`shrink-0 ${paletteCollapsed ? '' : 'max-h-[40%] overflow-y-auto'} pb-4`}>
        <ModulePalette
          collapsed={paletteCollapsed}
          onToggle={() => setPaletteCollapsed((prev) => !prev)}
        />
      </div>

      {/* Summary toolbar */}
      <div className="flex shrink-0 items-center justify-between border-t border-border py-3">
        <h3 className="font-mono text-xs font-semibold text-accent">
          Active Modules
          <span className="ml-2 rounded-full bg-bg-base px-2 py-0.5 text-text-muted">
            {modules.length}
          </span>
        </h3>

        {modules.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            title="Remove all modules"
            className="rounded-md px-2 py-1 font-mono text-xs text-danger transition-colors hover:bg-danger/10"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active modules section - independent scroll */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {modules.length === 0 ? (
          <div className="min-h-16 rounded-lg border border-dashed border-border p-2">
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="font-mono text-xs text-text-muted">
                No modules added yet
              </p>
              <p className="max-w-[240px] text-center font-mono text-[10px] leading-relaxed text-text-muted/70">
                Click modules above to build your fastfetch config
              </p>
              <button
                type="button"
                onClick={handleLoadPreset}
                className="mt-1 rounded-md border border-accent/30 px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:border-accent hover:bg-accent/10"
              >
                Load Default Preset
              </button>
            </div>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={modules}
            onReorder={setModules}
            className="space-y-2"
          >
            <AnimatePresence mode="popLayout">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isFirst={index === 0}
                  isLast={index === modules.length - 1}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </main>
  )
}
