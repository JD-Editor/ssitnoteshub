import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, FlaskConical, Layers } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadDialog } from "@/components/UploadDialog";
import { NotFoundScreen } from "@/components/NotFoundScreen";
import { getCourse } from "@/lib/catalog";
import { fetchDocuments } from "@/lib/documents";
import { getSections, getSubject, type Section } from "@/lib/syllabus";
import { useBookmarks } from "@/lib/bookmarks";

export const Route = createFileRoute("/course/$course/$semester/$subject")({
  head: ({ params }) => {
    const subject = getSubject(params.course.toUpperCase(), Number(params.semester), params.subject);
    const name = subject?.name ?? params.subject;
    const title = `${name} — Sem ${params.semester} ${params.course.toUpperCase()} | SSIT Notes Hub`;
    const description = `Textbook PDFs, practicals and previous year question papers for ${name}, semester ${params.semester} ${params.course.toUpperCase()} at SSIT Gandhinagar.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SubjectPage,
});

function SubjectPage() {
  const params = Route.useParams();
  const course = getCourse(params.course);
  const semester = Number(params.semester);
  const subject = course ? getSubject(course.id, semester, params.subject) : undefined;
  const { isBookmarked, toggle } = useBookmarks();

  const { data: docs = [], refetch } = useQuery({
    queryKey: ["documents", course?.id, semester],
    queryFn: () => fetchDocuments({ course: course!.id, semester }),
    enabled: !!course && !!subject,
  });

  if (!course || !subject) return <NotFoundScreen message="That subject isn't listed yet." />;

  const sections = getSections(subject);
  const units = sections.filter((s) => s.group === "unit");
  const practicals = sections.filter((s) => s.group === "practicals");
  const pyqs = sections.filter((s) => s.group === "pyq");

  const filesFor = (sectionId: string) =>
    docs.filter((d) => d.subject === subject.id && d.category === sectionId);

  const SectionBlock = ({ section }: { section: Section }) => {
    const files = filesFor(section.id);
    return (
      <article className="glass-card rounded-3xl p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h3 className="min-w-0 text-base font-bold text-foreground">{section.label}</h3>
          {(
            <UploadDialog
              course={course.id}
              semester={semester}
              category={section.id}
              subject={subject.id}
              contextLabel={`${subject.name} · ${section.label}`}
              onUploaded={() => void refetch()}
            />
          )}
        </div>
        {files.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No PDF uploaded yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {files.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                bookmarked={isBookmarked(doc.id)}
                onToggleBookmark={toggle}
              />
            ))}
          </div>
        )}
      </article>
    );
  };

  const Group = ({
    title,
    icon,
    items,
  }: {
    title: string;
    icon: React.ReactNode;
    items: Section[];
  }) =>
    items.length === 0 ? null : (
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </span>
          {title}
        </h2>
        <div className="mt-4 space-y-4">
          {items.map((s) => (
            <SectionBlock key={s.id} section={s} />
          ))}
        </div>
      </section>
    );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link
          to="/course/$course/$semester"
          params={{ course: course.id, semester: String(semester) }}
          className="text-sm font-medium text-primary"
        >
          ← Semester {semester} subjects
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">{subject.name}</h1>
        <p className="text-sm text-muted-foreground">
          {course.name} · Semester {semester}
          {subject.short ? ` · ${subject.short}` : ""}
        </p>

        <Group title="Textbook PDF — Units" icon={<Layers className="h-4 w-4" />} items={units} />
        <Group
          title="Practicals"
          icon={<FlaskConical className="h-4 w-4" />}
          items={practicals}
        />
        <Group
          title="Previous Year Question Papers (PYQs)"
          icon={<BookMarked className="h-4 w-4" />}
          items={pyqs}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
