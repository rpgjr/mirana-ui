import { useId, useMemo, useState, type ReactNode } from "react";
import { LuCheck, LuChevronDown, LuSearch, LuX } from "react-icons/lu";

import { usePopover } from "@/hooks/usePopover";
import { cn } from "@/utils/cn";

export interface MultiOption {
  value: string;
  /** Shown instead of the value when set. */
  label?: string;
  /** A dot, avatar or other mark shown before the label. */
  icon?: ReactNode;
  hint?: string;
  disabled?: boolean;
}

interface Props {
  options: MultiOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  max?: number;
  id?: string;
  className?: string;
  searchPlaceholder?: string;
  /** Opens the list in the page flow instead of floating, for use inside a scrolling panel. */
  inline?: boolean;
  /** Leaves out the chips under the button, for compact bars. */
  hideChips?: boolean;
  /** Text on the button when something is chosen. */
  summary?: (count: number) => string;
  /** Draws a chosen value as a chip. The default is a plain grey chip. */
  renderChip?: (value: string, label: string) => ReactNode;
}

/** Dropdown with a checkbox per option and a search box. The list floats over the page, so opening it never makes the layout longer. */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  max,
  id,
  className,
  searchPlaceholder = "Search repositories",
  inline,
  hideChips,
  summary,
  renderChip,
}: Props) {
  const { open, setOpen, up, root } = usePopover(300);
  const [query, setQuery] = useState("");
  const listId = useId();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q))
      : options;
  }, [options, query]);

  const full = max !== undefined && value.length >= max;
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div ref={root} className="relative">
        <button
          type="button"
          id={id}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-input/30 px-3 text-sm outline-none transition-colors hover:bg-input/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            className={cn("truncate", !value.length && "text-muted-foreground")}
          >
            {value.length
              ? summary
                ? summary(value.length)
                : `${value.length} selected`
              : placeholder}
          </span>
          <LuChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div
            id={listId}
            className={cn(
              "pop-in overflow-hidden rounded-lg border border-border bg-popover shadow-xl shadow-black/40",
              !inline && "absolute z-50 w-full min-w-56",
              !inline &&
                (up
                  ? "bottom-full mb-1 [transform-origin:bottom_left]"
                  : "top-full mt-1 [transform-origin:top_left]"),
              inline && "[transform-origin:top_left]",
            )}
          >
            <label className="flex items-center gap-2 border-b border-border px-3">
              <LuSearch
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <ul className="thin-scroll max-h-52 overflow-y-auto py-1">
              {shown.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  No match.
                </li>
              )}
              {shown.map((o) => {
                const checked = value.includes(o.value);
                const blocked = o.disabled || (full && !checked);
                return (
                  <li key={o.value}>
                    <label
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors",
                        blocked
                          ? "opacity-50"
                          : "cursor-pointer hover:bg-secondary",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={blocked}
                        onChange={() => toggle(o.value)}
                        className="peer sr-only"
                      />
                      <span className="grid size-4 shrink-0 place-items-center rounded border border-input transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50">
                        {checked && (
                          <LuCheck
                            className="size-3 text-primary-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      {o.icon}
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm",
                          !o.label && "font-mono text-xs",
                        )}
                      >
                        {o.label ?? o.value}
                      </span>
                      {o.hint && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {o.hint}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {!hideChips && value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <li key={v} className="inline-flex items-center gap-1">
              {renderChip ? (
                renderChip(v, labelOf(v))
              ) : (
                <span className="inline-flex items-center rounded-md border border-input bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {labelOf(v)}
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove ${labelOf(v)}`}
                onClick={() => toggle(v)}
                className="text-muted-foreground hover:text-destructive"
              >
                <LuX className="size-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
