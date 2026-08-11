import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentCard } from "@/components/DocumentCard";
import { fetchDocuments } from "@/lib/documents";
import { useBookmarks } from "@/lib/bookmarks";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "My Bookmarks | SSIT Notes Hub" },
      {
        name: "description",
        content: "Your saved PDFs — notes, PYQs and practicals bookmarked on this device.",
      },
      { property: "og:title", content: "My Bookmarks | SSIT Notes Hub" },
      { property: "og:description", content: "Quick access to the PDFs you saved on this device." },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const { ids, isBookmarked, toggle } = useBookmarks();
  const { data: docs = [] } = useQuery({ queryKey: ["documents"], queryFn: () => fetchDocuments() });
  const saved = docs.filter((d) => ids.includes(d.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/" className="text-sm font-medium text-primary">
          ← Back to home
        </Link>
        <h1 className="mt-3 text-3xl font-black text-foreground">My Bookmarks</h1>
        <p className="text-sm text-muted-foreground">
          Saved in this browser, so they stay here next time you visit.
        </p>

        {saved.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No bookmarks yet. Tap the bookmark icon on any PDF to save it here.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                bookmarked={isBookmarked(doc.id)}
                onToggleBookmark={toggle}
              />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
