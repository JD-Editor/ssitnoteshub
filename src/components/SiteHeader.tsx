import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import logo from "@/assets/ssit_logo.asset.json";
import { UploadDialog } from "@/components/UploadDialog";

export function SiteHeader() {
  const qc = useQueryClient();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={logo.url}
            alt="Shree Swaminarayan Institute of Technology logo"
            className="h-11 w-11 shrink-0 rounded-full object-contain"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight text-foreground sm:text-base">
              SSIT Notes Hub
            </span>
            <span className="block truncate text-[11px] text-muted-foreground sm:text-xs">
              Shree Swaminarayan Institute of Technology, Gandhinagar
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <UploadDialog
            label="Upload File"
            onUploaded={() => void qc.invalidateQueries({ queryKey: ["documents"] })}
          />
          <Link
            to="/bookmarks"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Bookmarks</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
