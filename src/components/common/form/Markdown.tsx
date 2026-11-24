import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/utils/cn"

/** Renders markdown. Raw HTML is never rendered, links open in a new tab, and only https images load. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("markdown text-sm", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {c}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" && src.startsWith("https://") ? (
              <img src={src} alt={alt ?? ""} loading="lazy" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-muted-foreground">[image not shown: only https images load]</span>
            ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
