import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadDialog } from "@/components/UploadDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, getCourse } from "@/lib/catalog";
import { fetchDocuments, type DocumentRow } from "@/lib/documents";
import { useBookmarks } from "@/lib/bookmarks";

export const Route = createFileRoute("/course/$course/$semester")({
  head: ({ params }) => {
    const c = getCourse(params.course);
    const title = `${c?.name ?? params.course} Semester ${params.semester} Material | SSIT Study Hub`;
    const description = `Download notes, PYQs and practicals for ${c?.name ?? params.course} semester ${params.semester} at SSIT Gandhinagar.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  beforeLoad: ({ params }) => {
    const c = getCourse(params.course);
    const sem = Number(params.semester);
    if (!c || !Number.isInteger(sem) || sem < 1 || sem > c.semesters) throw notFound();
  },
  component: SemesterPage,
});

function SemesterPage() {
  const params = Route.useParams();
  const course = getCourse(params.course)!;
  const semester = Number(params.semester);
  const { isBookmarked, toggle } = useBookmarks();

  const { data: docs = [], refetch } = useQuery({
    queryKey: ["documents", course.id, semester],
    queryFn: () => fetchDocuments({ course: course.id, semester }),
  });

  const grouped = (category: string) => {
    const items = docs.filter((d) => d.category === category);
    const map = new Map<string, DocumentRow[]>();
    for (const item of items) {
      map.set(item.subject, [...(map.get(item.subject) ?? []), item]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/course/$course" params={{ course: course.id }} className="text-sm font-medium text-primary">
          ← {course.name} semesters
        </Link>
        <h1 className="mt-3 text-3xl font-black text-foreground">
          {course.name} · Semester {semester}
        </h1>
        <p className="text-sm text-muted-foreground">
          Study material organised by subject. Anyone can upload a PDF.
        </p>

        <Tabs defaultValue={CATEGORIES[0].id} className="mt-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => {
            const groups = grouped(cat.id);
            return (
              <TabsContent key={cat.id} value={cat.id} className="mt-5 space-y-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <h2 className="truncate text-lg font-bold text-foreground">{cat.label}</h2>
                  <UploadDialog
                    course={course.id}
                    semester={semester}
                    category={cat.id}
                    onUploaded={() => void refetch()}
                  />
                </div>

                {groups.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No {cat.label.toLowerCase()} uploaded yet. Be the first to upload one.
                  </p>
                ) : (
                  groups.map(([subject, items]) => (
                    <section key={subject}>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {subject}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((doc) => (
                          <DocumentCard
                            key={doc.id}
                            doc={doc}
                            bookmarked={isBookmarked(doc.id)}
                            onToggleBookmark={toggle}
                          />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
