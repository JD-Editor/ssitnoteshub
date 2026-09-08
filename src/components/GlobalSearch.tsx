import { useEffect, useRef, useState } from "react";
import { Search, Clock, X } from "lucide-react";
import { QUICK_SUGGESTIONS } from "@/lib/search-hints";

const RECENT_KEY = "ssit-recent-searches";

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(term: string) {
  const value = term.trim();
  if (!value || typeof window === "undefined") return;
  const next = [value, ...readRecent().filter((r) => r.toLowerCase() !== value.toLowerCase())].slice(
    0,
    5,
  );
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function GlobalSearch({
  value,
  onChange,
  placeholders,
  onSubmit,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholders: string[];
  onSubmit?: (value: string) => void;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex(0);
    if (placeholders.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % placeholders.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [placeholders]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const commit = (term: string) => {
    onChange(term);
    saveRecentSearch(term);
    setRecent(readRecent());
    setOpen(false);
    onSubmit?.(term);
  };

  const showDropdown = open && !value.trim();

  return (
    <div ref={wrapRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(value);
        }}
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholders[index] ?? placeholders[0]}
          aria-label="Search the site"
          className="h-13 w-full rounded-full border-0 bg-card py-3.5 pl-11 pr-11 text-base text-foreground shadow-xl outline-none ring-0 transition-shadow placeholder:text-muted-foreground focus:shadow-2xl"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="glass-card absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl p-2 text-left">
          {recent.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Recent searches
              </p>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(r)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{r}</span>
                </button>
              ))}
            </>
          )}
          <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Quick suggestions
          </p>
          {QUICK_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(s)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
