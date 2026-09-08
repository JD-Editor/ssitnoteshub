import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  Download,
  FileText,
  Loader2,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import logo from "@/assets/ssit_logo.asset.json";
import { GlobalSearch } from "@/components/GlobalSearch";
import { getDocumentPlaceholders } from "@/lib/search-hints";
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
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPdf = !!doc && /\.pdf$/i.test(doc.file_name);

  useEffect(() => {
    if (!doc) return;
    if (!isPdf) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    let pdfDoc: { numPages: number; getPage: (n: number) => Promise<any>; destroy: () => void } | null =
      null;
    setStatus("loading");
    setPageCount(0);

    (async () => {
      try {
        const pdfjs: any = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const signedUrl = await getFileUrl(doc.file_path);
        const res = await fetch(signedUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.arrayBuffer();
        if (cancelled) return;

        pdfDoc = await pdfjs.getDocument({ data }).promise;
        if (cancelled || !pdfDoc) return;
        setPageCount(pdfDoc.numPages);
        setStatus("ready");

        const host = containerRef.current;
        if (!host) return;
        host.innerHTML = "";

        const scale = Math.min(2, (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1) * 1.4;

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          if (cancelled) return;
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className =
            "mx-auto mb-4 w-full max-w-4xl rounded-xl border border-border bg-white shadow-xl";
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          host.appendChild(canvas);
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      pdfDoc?.destroy?.();
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
      window.print();
    } catch {
      toast.error("Printing is not available for this file. Download it instead.");
    }
  };

  return createPortal(
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

        {status === "ready" && (
          <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 md:flex">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(60, z - 15))}
              title="Zoom out"
              className="p-1 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-11 text-center font-mono text-xs">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 15))}
              title="Zoom in"
              className="p-1 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="mx-1 h-4 w-px bg-white/20" />
            <span className="text-xs font-medium">
              {pageCount} {pageCount === 1 ? "page" : "pages"}
            </span>
          </div>
        )}

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
      <main className="flex-1 overflow-auto bg-secondary p-3 sm:p-6">
        {status === "loading" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading preview…</p>
          </div>
        )}

        <div
          ref={containerRef}
          className={status === "ready" ? "mx-auto origin-top transition-transform" : "hidden"}
          style={{ width: `${zoom}%` }}
        />

        {(status === "error" || status === "unsupported") && (
          <div className="flex h-full items-center justify-center">
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
                  You can still download the file.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onDownload(doc)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>
        )}
      </main>
    </div>,
    document.body,
  );
}
