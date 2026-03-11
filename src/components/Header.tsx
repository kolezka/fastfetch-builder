export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-bg-base px-4">
      <h1 className="font-mono text-lg font-semibold text-accent">
        fastfetch config builder
      </h1>
      <div className="flex items-center gap-3">
        {/* PresetLoader slot — TASK-014 */}
        {/* Copy/Download buttons — TASK-013 */}
      </div>
    </header>
  )
}
