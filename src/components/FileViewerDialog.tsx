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

  const openInNewTab = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-lg flex-col gap-4 p-5 sm:p-6">
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
            disabled={!url || loading}
            onClick={() => void openInNewTab()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Open in new tab
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          The PDF will open in your browser&apos;s native PDF viewer in a new tab.
        </p>
      </DialogContent>
    </Dialog>
  );
}

