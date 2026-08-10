import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getCourse } from "@/lib/catalog";
import { fetchDocuments } from "@/lib/documents";

export const Route = createFileRoute("/course/$course")({
  head: ({ params }) => {
    const c = getCourse(params.course);
    const title = `${c?.name ?? params.course} Semesters | SSIT Study Hub`;
    const description = `Semester-wise notes, PYQs and practicals for ${c?.full ?? params.course} at SSIT Gandhinagar.`;
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
    if (!getCourse(params.course)) throw notFound();
  },
  component: CoursePage,
});

function CoursePage() {
  const { course: courseParam } = Route.useParams();
  const course = getCourse(courseParam)!;
  const { data: docs = [] } = useQuery({
    queryKey: ["documents", course.id],
    queryFn: () => fetchDocuments({ course: course.id }),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/" className="text-sm font-medium text-primary">
          ← Back to home
        </Link>
        <h1 className="mt-3 text-3xl font-black text-foreground">{course.name}</h1>
        <p className="text-sm text-muted-foreground">{course.full}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: course.semesters }, (_, i) => i + 1).map((sem) => (
            <Link
              key={sem}
              to="/course/$course/$semester"
              params={{ course: course.id, semester: String(sem) }}
              className="card-soft flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-1"
            >
              <span className="min-w-0">
                <span className="block text-lg font-bold text-foreground">Semester {sem}</span>
                <span className="block text-xs text-muted-foreground">
                  {docs.filter((d) => d.semester === sem).length} files
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
