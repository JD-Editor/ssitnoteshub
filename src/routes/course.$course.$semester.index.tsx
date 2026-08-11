import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, FileStack, FlaskConical } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadDialog } from "@/components/UploadDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, getCourse } from "@/lib/catalog";
import { fetchDocuments, type DocumentRow } from "@/lib/documents";
import { getSubjects } from "@/lib/syllabus";
import { useBookmarks } from "@/lib/bookmarks";
import { NotFoundScreen } from "@/components/NotFoundScreen";

export const Route = createFileRoute("/course/$course/$semester/")({
  head: ({ params }) => {
    const c = getCourse(params.course);
    const title = `${c?.name ?? params.course} Semester ${params.semester} Subjects | SSIT Notes Hub`;
    const description = `Subject-wise textbook PDFs, practicals and PYQs for ${c?.name ?? params.course} semester ${params.semester} at SSIT Gandhinagar.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SemesterPage,
});

function SemesterPage() {
  const params = Route.useParams();
  const course = getCourse(params.course);
  const semester = Number(params.semester);
  const { isBookmarked, toggle } = useBookmarks();

  const valid =
    !!course && Number.isInteger(semester) && semester >= 1 && semester <= (course?.semesters ?? 0);

  const { data: docs = [], refetch } = useQuery({
    queryKey: ["documents", course?.id, semester],
    queryFn: () => fetchDocuments({ course: course!.id, semester }),
    enabled: valid,
  });

  if (!valid || !course) return <NotFoundScreen />;

  const subjects = getSubjects(course.id, semester);

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
        <Link
          to="/course/$course"
          params={{ course: course.id }}
          className="text-sm font-medium text-primary"
        >
          ← {course.name} semesters
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">
          {course.name} · Semester {semester}
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick a subject to open its textbook PDFs, practicals and previous year papers.
        </p>

        {subjects.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const count = docs.filter((d) => d.subject === subject.id).length;
              return (
                <Link
                  key={subject.id}
                  to="/course/$course/$semester/$subject"
                  params={{
                    course: course.id,
                    semester: String(semester),
                    subject: subject.id,
                  }}
                  className="glass-card group flex flex-col gap-3 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-bold leading-tight text-foreground">
                      {subject.name}
                      {subject.short ? (
                        <span className="text-muted-foreground"> ({subject.short})</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {subject.units.length > 0 && (
                      <span className="chip">
                        <FileStack className="h-3.5 w-3.5" /> {subject.units.length} units
                      </span>
                    )}
                    {subject.practicals && (
                      <span className="chip">
                        <FlaskConical className="h-3.5 w-3.5" /> Practicals
                      </span>
                    )}
                    <span className="chip">PYQs</span>
                  </span>
                  <span className="mt-auto flex items-center justify-between pt-2 text-xs font-medium text-primary">
                    {count} file{count === 1 ? "" : "s"}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
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
                    {(
                      <UploadDialog
                        course={course.id}
                        semester={semester}
                        category={cat.id}
                        onUploaded={() => void refetch()}
                      />
                    )}
                  </div>

                  {groups.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      No {cat.label.toLowerCase()} uploaded yet.
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
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
