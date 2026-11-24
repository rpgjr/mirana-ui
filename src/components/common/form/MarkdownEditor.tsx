import { useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { LuBold, LuCode, LuHeading, LuItalic, LuLink, LuList, LuListChecks, LuListOrdered, LuQuote } from "react-icons/lu"

import { Markdown } from "./Markdown"
import { cn } from "@/utils/cn"

interface Props {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  autoFocus?: boolean
  /** Called on Cmd or Ctrl plus Enter. */
  onSubmit?: () => void
}

/** Write and Preview tabs with a formatting toolbar, like a GitHub comment box. The text stays plain markdown. */
export function MarkdownEditor({ id, value, onChange, placeholder, rows = 6, autoFocus, onSubmit }: Props) {
  const [tab, setTab] = useState<"write" | "preview">("write")
  const area = useRef<HTMLTextAreaElement>(null)

  /** Replaces the selection and puts the cursor (or selection) where the caller says, after React has re-rendered. */
  const edit = (next: string, from: number, to: number) => {
    onChange(next)
    requestAnimationFrame(() => {
      area.current?.focus()
      area.current?.setSelectionRange(from, to)
    })
  }

  const wrap = (before: string, after = before, fallback = "text") => {
    const el = area.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const chosen = value.slice(s, e) || fallback
    edit(value.slice(0, s) + before + chosen + after + value.slice(e), s + before.length, s + before.length + chosen.length)
  }

  const prefixLines = (make: (i: number) => string) => {
    const el = area.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const start = value.lastIndexOf("\n", s - 1) + 1
    const endNl = value.indexOf("\n", e)
    const end = endNl === -1 ? value.length : endNl
    const lines = value.slice(start, end).split("\n").map((l, i) => make(i) + l)
    const block = lines.join("\n")
    edit(value.slice(0, start) + block + value.slice(end), start, start + block.length)
  }

  const link = () => {
    const el = area.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const text = value.slice(s, e) || "text"
    const next = value.slice(0, s) + `[${text}](url)` + value.slice(e)
    edit(next, s + text.length + 3, s + text.length + 6)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return
    const k = e.key.toLowerCase()
    if (k === "b") { e.preventDefault(); wrap("**") }
    else if (k === "i") { e.preventDefault(); wrap("_") }
    else if (k === "k") { e.preventDefault(); link() }
    else if (k === "enter" && onSubmit) { e.preventDefault(); onSubmit() }
  }

  const tools: { label: string; icon: ReactNode; run: () => void }[] = [
    { label: "Heading", icon: <LuHeading />, run: () => prefixLines(() => "### ") },
    { label: "Bold", icon: <LuBold />, run: () => wrap("**") },
    { label: "Italic", icon: <LuItalic />, run: () => wrap("_") },
    { label: "Quote", icon: <LuQuote />, run: () => prefixLines(() => "> ") },
    { label: "Code", icon: <LuCode />, run: () => wrap("`", "`", "code") },
    { label: "Link", icon: <LuLink />, run: link },
    { label: "Numbered list", icon: <LuListOrdered />, run: () => prefixLines((i) => `${i + 1}. `) },
    { label: "Bulleted list", icon: <LuList />, run: () => prefixLines(() => "- ") },
    { label: "Task list", icon: <LuListChecks />, run: () => prefixLines(() => "- [ ] ") },
  ]

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-card focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-2">
        <div role="tablist" aria-label="Editor mode" className="flex">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("-mb-px border-b-2 border-transparent px-3 py-2 text-sm capitalize text-muted-foreground hover:text-foreground", tab === t && "border-foreground font-medium text-foreground")}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "write" && (
          <div className="flex items-center gap-0.5 py-1">
            {tools.map((t) => (
              <button
                key={t.label}
                type="button"
                title={t.label}
                aria-label={t.label}
                onClick={t.run}
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground [&_svg]:size-4"
              >
                {t.icon}
              </button>
            ))}
          </div>
        )}
      </div>
      {tab === "write" ? (
        <textarea
          ref={area}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={rows}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="block w-full resize-y bg-transparent px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted-foreground"
        />
      ) : (
        <div className="min-h-24 px-3 py-2.5" style={{ minHeight: `${rows * 1.5}rem` }}>
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted-foreground">Nothing to preview.</p>}
        </div>
      )}
    </div>
  )
}
