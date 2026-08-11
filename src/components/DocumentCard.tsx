import { useState } from "react";
import { Bookmark, Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

  const open = async (mode: "view" | "download") => {
    setBusy(true);
    try {
      const url = await getFileUrl(doc.file_path, mode === "download" ? doc.file_name : undefined);
      if (mode === "view") {
        window.open(url, "_blank", "noopener");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.file_name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
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
          <FileText className="h-5 w-5" />
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
        <Button size="sm" disabled={busy} onClick={() => open("view")}>
          <Eye className="h-4 w-4" /> View
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => open("download")}>
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </article>
  );
}
