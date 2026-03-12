import { useState, useRef, useEffect, useCallback } from 'react'
import { PRESETS } from '@/lib/presets'
import { useConfigStore } from '@/store/configStore'
import type { PresetConfig } from '@/lib/moduleDefinitions'

export function PresetLoader() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadPreset = useConfigStore((s) => s.loadPreset)

  const handleSelect = useCallback(
    (preset: PresetConfig) => {
      loadPreset(preset)
      setOpen(false)
    },
    [loadPreset],
  )

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-md border border-border bg-bg-surface px-3 py-1.5 font-mono text-xs text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Presets ▾
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-bg-surface py-1 sm:w-64 max-h-[70vh] overflow-y-auto">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelect(preset as PresetConfig)}
              className="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-accent/10"
            >
              <span className="font-mono text-sm font-medium text-accent">
                {preset.name}
              </span>
              <span className="font-mono text-xs text-text-muted">
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
