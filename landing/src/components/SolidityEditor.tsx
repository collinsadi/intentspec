import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { solidity } from '@replit/codemirror-lang-solidity'
import { EditorView } from '@codemirror/view'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

/** Greenish palette for Solidity – teal/mint to match landing accent */
const greenishHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#5eead4' },
  { tag: tags.controlKeyword, color: '#5eead4' },
  { tag: [tags.atom, tags.bool], color: '#86efac' },
  { tag: tags.number, color: '#5eead4' },
  { tag: tags.string, color: '#86efac' },
  { tag: tags.operator, color: '#6ee7b7' },
  { tag: [tags.variableName, tags.special(tags.variableName)], color: '#bbf7d0' },
  { tag: tags.definition(tags.variableName), color: '#34d399' },
  { tag: [tags.typeName, tags.className], color: '#2dd4bf' },
  { tag: tags.propertyName, color: '#a7f3d0' },
  { tag: tags.function(tags.variableName), color: '#34d399' },
  { tag: tags.comment, color: '#6b7280' },
  { tag: tags.meta, color: '#6b7280' },
  { tag: tags.invalid, color: '#f87171' },
])

/** Dark theme: transparent bg, green cursor, selection */
const minimalDarkTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent' },
  '&.cm-editor': { backgroundColor: 'transparent' },
  '.cm-content': { backgroundColor: 'transparent' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-accent, #22c55e)' },
  '.cm-selectionBackground, ::selection': { backgroundColor: 'rgba(255,255,255,0.1)' },
}, { dark: true })

/** Font size and family to match landing */
const editorStyle = EditorView.contentAttributes.of({
  style: 'font-size: 0.875rem; line-height: 1.5; font-family: var(--font-mono), ui-monospace, monospace;',
})

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
  height?: string
}

export function SolidityEditor({ value, onChange, className = '', height = '100%' }: Props) {
  const extensions = useMemo(
    () => [
      solidity,
      minimalDarkTheme,
      editorStyle,
      syntaxHighlighting(greenishHighlightStyle),
    ],
    []
  )
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      height={height}
      className={className}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        highlightSelectionMatches: false,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: false,
        indentOnInput: true,
      }}
      placeholder="Paste Solidity with @custom:agent-* tags..."
    />
  )
}
