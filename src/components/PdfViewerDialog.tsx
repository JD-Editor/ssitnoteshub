import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Printer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/ssit_logo.asset.json";
import { categoryLabel, formatDate, formatSize } from "@/lib/catalog";
import { getFileUrl, type DocumentRow } from "@/lib/documents";

type Status = "loading" | "ready" | "error" | "unsupported";

export function PdfViewerDialog({
  doc,
  bookmarked,
  onToggleBookmark,
  onDownload,
  onClose,
}: {
  doc: DocumentRow | null;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onDownload: (doc: DocumentRow) => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [url, setUrl] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const isPdf = !!doc && /\.pdf$/i.test(doc.file_name);

  useEffect(() => {
    if (!doc) return;
    if (!isPdf) {
      setStatus("unsupported");
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;
    setStatus("loading");
    setUrl(null);

    (async () => {
      try {
        // Fetch the PDF bytes through the signed URL, then serve them from a
        // same-origin blob URL — this is what lets Chrome render the preview
        // inline instead of showing "This page has been blocked by Chrome".
        const signedUrl = await getFileUrl(doc.file_path);
        const res = await fetch(signedUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setUrl(objectUrl);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc, isPdf]);

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  if (!doc) return null;

  const handlePrint = () => {
    try {
      frameRef.current?.contentWindow?.print();
    } catch {
      toast.error("Printing is not available for this file. Download it instead.");
    }
  };

  const openInNewTab = async () => {
    try {
      const signedUrl = await getFileUrl(doc.file_path);
      window.open(signedUrl, "_blank", "noopener");
    } catch {
      toast.error("Could not open this file. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${doc.title}`}
    >
      {/* Top toolbar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-primary-foreground/15 bg-primary px-4 py-3 text-primary-foreground shadow-lg">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={logo.url}
            alt="SSIT logo"
            className="h-9 w-9 shrink-0 rounded-full bg-white/90 object-contain"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold leading-tight sm:text-base">{doc.title}</h3>
            <p className="truncate text-xs text-primary-foreground/70">
              {doc.course} • Sem {doc.semester} • {doc.subject} •{" "}
              <span className="font-semibold text-accent-foreground">
                {categoryLabel(doc.category)}
              </span>{" "}
              • {formatSize(doc.size_bytes)} • {formatDate(doc.created_at)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleBookmark(doc.id)}
            title={bookmarked ? "Remove from Bookmarks" : "Bookmark PDF"}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              bookmarked
                ? "bg-accent text-accent-foreground"
                : "bg-white/10 text-primary-foreground hover:bg-white/20"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{bookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          <button
            type="button"
            onClick={() => void onDownload(doc)}
            title="Download PDF file"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={() => void openInNewTab()}
            title="Open in new tab"
            className="hidden rounded-full bg-white/10 p-2 text-primary-foreground transition-colors hover:bg-white/20 sm:inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
          </button>

          {isPdf && status === "ready" && (
            <button
              type="button"
              onClick={handlePrint}
              title="Print document"
              className="hidden rounded-full bg-white/10 p-2 text-primary-foreground transition-colors hover:bg-white/20 sm:inline-flex"
            >
              <Printer className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            title="Close viewer"
            className="rounded-full bg-white/10 p-2 text-primary-foreground transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Document area */}
      <main className="flex flex-1 items-stretch justify-center overflow-auto bg-secondary p-3 sm:p-6">
        {status === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading preview…</p>
          </div>
        )}

        {status === "ready" && url && (
          <iframe
            ref={frameRef}
            src={url}
            title={doc.title}
            className="h-full w-full max-w-6xl rounded-xl border border-border bg-white shadow-2xl"
          />
        )}

        {(status === "error" || status === "unsupported") && (
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-4 flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold text-foreground">
                  {status === "unsupported"
                    ? "Preview is only available for PDF files."
                    : "The preview could not be loaded."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You can still open the file directly in a new tab or download it.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => void openInNewTab()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
                </button>
                <button
                  type="button"
                  onClick={() => void onDownload(doc)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
