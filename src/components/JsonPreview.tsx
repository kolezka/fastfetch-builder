import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
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

const extensions = [json(), darkTheme, EditorView.lineWrapping]

export function JsonPreview() {
  const globalSettings = useConfigStore((s) => s.globalSettings)
  const modules = useConfigStore((s) => s.modules)

  const jsonc = useMemo(
    () => generateJsonc(globalSettings, modules),
    [globalSettings, modules],
  )

  return (
    <aside className="flex flex-col overflow-hidden border-l border-border">
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
