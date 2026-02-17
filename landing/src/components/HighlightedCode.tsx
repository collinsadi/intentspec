import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Language = 'json' | 'solidity'

type Props = {
  language: Language
  code: string
  className?: string
  wrapLongLines?: boolean
  /** When true, use same font size/line-height as the editor textarea so overlay aligns */
  editorMode?: boolean
}

export function HighlightedCode({ language, code, className = '', wrapLongLines = true, editorMode = false }: Props) {
  const fontSize = editorMode ? '0.875rem' : '0.75rem'
  const lineHeight = editorMode ? 1.5 : 1.5
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      customStyle={{
        margin: 0,
        padding: 0,
        background: 'transparent',
        fontSize,
        lineHeight,
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
      }}
      codeTagProps={{
        style: {
          fontFamily: 'var(--font-mono), ui-monospace, monospace',
          fontSize,
          lineHeight,
        },
      }}
      wrapLongLines={wrapLongLines}
      className={className}
      PreTag="div"
    >
      {code}
    </SyntaxHighlighter>
  )
}
