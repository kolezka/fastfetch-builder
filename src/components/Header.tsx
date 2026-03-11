import { useState, useCallback, useMemo, type ReactNode } from 'react'
import { useConfigStore } from '@/store/configStore'
import { generateJsonc } from '@/lib/generateJsonc'

interface HeaderProps {
  presetSlot?: ReactNode
}

export function Header({ presetSlot }: HeaderProps) {
  const [copyFeedback, setCopyFeedback] = useState(false)
  const globalSettings = useConfigStore((s) => s.globalSettings)
  const modules = useConfigStore((s) => s.modules)

  const jsonc = useMemo(
    () => generateJsonc(globalSettings, modules),
    [globalSettings, modules],
  )

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonc).then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 1500)
    })
  }, [jsonc])

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonc], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'config.jsonc'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, [jsonc])

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-bg-base px-4">
      <div className="flex items-center gap-4">
        <h1 className="font-mono text-lg font-semibold text-accent">
          fastfetch config builder
        </h1>
        {presetSlot}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-accent px-3 py-1.5 font-mono text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {copyFeedback ? 'Copied!' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Download
        </button>
      </div>
    </header>
  )
}
