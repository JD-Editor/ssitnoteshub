import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Download,
  Eye,
  Mic,
  Minus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PdfViewerDialog } from "@/components/PdfViewerDialog";
import { categoryLabel } from "@/lib/catalog";
import { COURSES } from "@/lib/catalog";
import { fetchDocuments, getFileUrl, type DocumentRow } from "@/lib/documents";
import { SYLLABUS, getSections } from "@/lib/syllabus";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  results?: DocumentRow[];
};

const QUICK = [
  "Find my notes",
  "Show Semester 3 subjects",
  "Find PYQs",
  "Find practicals",
  "Help me study",
  "Explain a topic",
];

const WELCOME =
  "Hi! 👋 I'm SSIT AI Assistant.\n\nI can help you find notes, subjects, PYQs, practicals, and study resources from SSIT Notes Hub. Ask me anything!";

const uid = () => Math.random().toString(36).slice(2);

function scoreDoc(doc: DocumentRow, terms: string[]) {
  const hay = [
    doc.title,
    doc.file_name,
    doc.subject,
    doc.course,
    `sem ${doc.semester}`,
    `semester ${doc.semester}`,
    categoryLabel(doc.category),
    doc.description ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return terms.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
}

function searchDocs(docs: DocumentRow[], query: string) {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (!terms.length) return [];
  return docs
    .map((d) => ({ d, s: scoreDoc(d, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.d);
}

function buildContext(docs: DocumentRow[], matches: DocumentRow[]) {
  const courses = COURSES.map((c) => `${c.id} (${c.full}, ${c.semesters} semesters)`).join("; ");
  const syllabus = Object.entries(SYLLABUS)
    .flatMap(([course, sems]) =>
      Object.entries(sems).map(([sem, subjects]) => {
        const list = subjects
          .map(
            (s) =>
              `${s.name}${s.short ? ` (${s.short})` : ""}: ${
                getSections(s)
                  .map((x) => x.label)
                  .join(" | ") || "no units listed"
              }`,
          )
          .join("\n    ");
        return `${course} Semester ${sem}:\n    ${list}`;
      }),
    )
    .join("\n");
  const docLines = (matches.length ? matches : docs.slice(0, 12))
    .map(
      (d) =>
        `- "${d.title}" (${d.file_name}) — ${d.course}, Sem ${d.semester}, ${d.subject}, ${categoryLabel(d.category)}`,
    )
    .join("\n");
  return [
    `Courses: ${courses}`,
    `Total uploaded files on the site: ${docs.length}`,
    `Syllabus:\n${syllabus}`,
    `Matching / recent uploaded files:\n${docLines || "(none uploaded yet)"}`,
    "Navigation: Home shows courses; each course lists semesters; each semester lists subjects; each subject page has unit textbook PDFs, Practicals and PYQ sections (Summer 2026, Winter 2025). Bookmarks page lists saved files. Upload File button is in the header.",
  ].join("\n\n");
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [viewDoc, setViewDoc] = useState<DocumentRow | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: docs = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetchDocuments(),
    enabled: open,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const hasChat = messages.length > 0;

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { id: uid(), role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const matches = searchDocs(docs, text);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          context: buildContext(docs, matches),
        }),
      });
      if (!res.ok) {
        const status = res.status;
        const msg =
          status === 429
            ? "Too many requests right now — please try again in a moment."
            : status === 402
              ? "The AI assistant is out of credits. Please contact the site owner."
              : "Sorry, I couldn't answer that right now. Please try again.";
        setMessages([...next, { id: uid(), role: "assistant", content: msg }]);
        return;
      }
      const data = (await res.json()) as { reply?: string };
      setMessages([
        ...next,
        {
          id: uid(),
          role: "assistant",
          content: data.reply || "Sorry, I couldn't answer that right now.",
          results: matches,
        },
      ]);
    } catch {
      setMessages([
        ...next,
        { id: uid(), role: "assistant", content: "Network problem — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const download = async (doc: DocumentRow) => {
    try {
      const url = await getFileUrl(doc.file_path, doc.file_name);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("Could not download this file. Please try again.");
    }
  };

  const startVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const Rec = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Rec) {
      toast.info("Voice input isn't supported in this browser — you can still type.");
      return;
    }
    try {
      const rec = new Rec();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.onresult = (e: any) => {
        const said = e.results?.[0]?.[0]?.transcript ?? "";
        if (said) void send(said);
      };
      rec.onerror = () => {
        setListening(false);
        toast.info("Microphone isn't available — you can still type your question.");
      };
      rec.onend = () => setListening(false);
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
      toast.info("Microphone isn't available — you can still type your question.");
    }
  };

  const panel = useMemo(
    () => (
      <div className="glass-card fixed bottom-24 right-4 z-50 flex max-h-[min(70vh,560px)] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-3xl duration-200 animate-in fade-in slide-in-from-bottom-4 sm:right-6">
        <div className="flex items-center gap-2 border-b border-border/60 bg-primary px-4 py-3 text-primary-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-foreground/15">
            <Bot className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">SSIT AI Assistant</p>
            <p className="truncate text-[11px] opacity-80">Notes, PYQs & study help</p>
          </div>
          {hasChat ? (
            <button
              type="button"
              aria-label="Clear conversation"
              onClick={() => setMessages([])}
              className="rounded-full p-1.5 transition-colors hover:bg-primary-foreground/15"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Minimize chat"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 transition-colors hover:bg-primary-foreground/15"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => {
              setOpen(false);
              setMessages([]);
            }}
            className="rounded-full p-1.5 transition-colors hover:bg-primary-foreground/15"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background/70 px-3 py-3">
          <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-sm text-foreground shadow-sm">
            {WELCOME}
          </div>

          {!hasChat ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void send(q)}
                  className="chip transition-transform hover:scale-[1.03]"
                >
                  <Sparkles className="h-3 w-3" /> {q}
                </button>
              ))}
            </div>
          ) : null}

          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
              <div className="max-w-[85%] space-y-2">
                <div
                  className={`whitespace-pre-line rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-card text-foreground"
                  }`}
                >
                  {m.content}
                </div>
                {m.results?.length ? (
                  <div className="space-y-2">
                    {m.results.map((d) => (
                      <div key={d.id} className="rounded-2xl border border-border bg-card p-2.5">
                        <p className="truncate text-xs font-semibold text-foreground">{d.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {d.course} · Sem {d.semester} · {d.subject} · {categoryLabel(d.category)}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setViewDoc(d)}>
                            <Eye className="h-3 w-3" /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => void download(d)}
                          >
                            <Download className="h-3 w-3" /> Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {loading ? (
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-card px-3 py-2.5 shadow-sm">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t border-border/60 bg-card px-3 py-2.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
          />
          <button
            type="button"
            aria-label="Speak your question"
            onClick={startVoice}
            className={`shrink-0 rounded-full border border-border p-2 transition-colors ${
              listening ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="submit"
            aria-label="Send message"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-full bg-primary p-2 text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, input, loading, listening, hasChat, docs],
  );

  return (
    <>
      {open ? panel : null}
      <button
        type="button"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-6px_oklch(0.42_0.15_21/0.65)] transition-transform duration-200 hover:scale-110 sm:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
      {viewDoc ? (
        <PdfViewerDialog doc={viewDoc} open onOpenChange={(v) => !v && setViewDoc(null)} />
      ) : null}
    </>
  );
}
