import { useEffect, useState } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/catalog";
import { getFileUrl, type DocumentRow } from "@/lib/documents";

export function FileViewerDialog({
  doc,
  open,
  onOpenChange,
}: {
  doc: DocumentRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getFileUrl(doc.file_path)
      .then((signed) => {
        if (!cancelled) setUrl(signed);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not open this file. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, doc.file_path]);

  const download = async () => {
    try {
      const signed = await getFileUrl(doc.file_path, doc.file_name);
      const a = document.createElement("a");
      a.href = signed;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[96vw] max-w-5xl flex-col gap-3 p-4 sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="truncate text-base sm:text-lg">{doc.title}</DialogTitle>
          <p className="truncate text-xs text-muted-foreground">
            {doc.course} · Sem {doc.semester} · {doc.subject} · {categoryLabel(doc.category)}
          </p>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void download()}>
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!url}
            onClick={() => url && window.open(url, "_blank", "noopener")}
          >
            <ExternalLink className="h-4 w-4" /> Open in new tab
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-secondary">
          {loading || !url ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading preview…
              </span>
            </div>
          ) : (
            <iframe
              src={url}
              title={doc.title}
              className="h-full w-full border-0 bg-background"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
