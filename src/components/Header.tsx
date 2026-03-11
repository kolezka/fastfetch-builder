import { useState, type ReactNode } from 'react'

interface HeaderProps {
  presetSlot?: ReactNode
}

export function Header({ presetSlot }: HeaderProps) {
  const [copyFeedback, setCopyFeedback] = useState(false)

  const handleCopy = () => {
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 1500)
  }

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
          className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Download
        </button>
      </div>
    </header>
  )
}
