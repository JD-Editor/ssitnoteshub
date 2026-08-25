import { useState } from "react";
import { Bookmark, Download, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PdfViewerDialog } from "@/components/PdfViewerDialog";
import { categoryLabel, formatDate, formatSize } from "@/lib/catalog";
import { getFileUrl, type DocumentRow } from "@/lib/documents";

export function DocumentCard({
  doc,
  bookmarked,
  onToggleBookmark,
}: {
  doc: DocumentRow;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
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
    } finally {
      setBusy(false);
    }
  };

  const openInNewTab = async () => {
    setBusy(true);
    try {
      const url = await getFileUrl(doc.file_path);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("Could not open this file. Please try again.");
    } finally {
      setBusy(false);
    }
  };



  return (
    <article className="card-soft flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{doc.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{doc.file_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {doc.course} · Sem {doc.semester} · {doc.subject} · {categoryLabel(doc.category)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {formatSize(doc.size_bytes)} · {formatDate(doc.created_at)}
          </p>
          {doc.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{doc.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark this file"}
          onClick={() => onToggleBookmark(doc.id)}
          className={`shrink-0 rounded-full border border-border p-2 transition-colors ${
            bookmarked ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void openInNewTab()}>
          <Eye className="h-4 w-4" /> View
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void openInNewTab()}
        >
          <ExternalLink className="h-4 w-4" /> Open in new tab
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void download()}>
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </article>
  );
}



