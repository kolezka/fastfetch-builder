import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { useConfigStore } from '@/store/configStore'
import { generateJsonc } from '@/lib/generateJsonc'

const darkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0a0a10',
      color: '#e0e0e8',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '13px',
    },
    '.cm-content': {
      caretColor: '#00d4ff',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#00d4ff',
    },
    '.cm-gutters': {
      backgroundColor: '#0a0a10',
      color: '#666680',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1a1a1f',
    },
    '.cm-activeLine': {
      backgroundColor: '#1a1a1f40',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: '#00d4ff20',
    },
  },
  { dark: true },
)

const syntaxColors = HighlightStyle.define([
  { tag: tags.propertyName, color: '#00d4ff' },
  { tag: tags.string, color: '#00cc88' },
  { tag: tags.number, color: '#f0c040' },
  { tag: tags.bool, color: '#cc66ff' },
  { tag: tags.null, color: '#cc66ff' },
  { tag: tags.keyword, color: '#cc66ff' },
  { tag: tags.punctuation, color: '#666680' },
  { tag: tags.brace, color: '#e0e0e8' },
  { tag: tags.squareBracket, color: '#e0e0e8' },
  { tag: tags.separator, color: '#666680' },
  { tag: tags.comment, color: '#666680', fontStyle: 'italic' },
])

const extensions = [
  json(),
  darkTheme,
  syntaxHighlighting(syntaxColors),
  EditorView.lineWrapping,
]

export function JsonPreview() {
  const globalSettings = useConfigStore((s) => s.globalSettings)
  const modules = useConfigStore((s) => s.modules)

  const jsonc = useMemo(
    () => generateJsonc(globalSettings, modules),
    [globalSettings, modules],
  )

  return (
    <aside className="flex h-full flex-col overflow-hidden lg:border-l lg:border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h2 className="font-mono text-xs font-medium text-text-muted uppercase tracking-wider">
          JSONC Preview
        </h2>
        <span className="rounded bg-bg-surface px-2 py-0.5 font-mono text-xs text-text-muted">
          read-only
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-bg-code">
        <CodeMirror
          value={jsonc}
          theme="none"
          extensions={extensions}
          editable={false}
          readOnly={true}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
          }}
        />
      </div>
    </aside>
  )
}
