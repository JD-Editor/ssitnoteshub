import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocumentCard } from "@/components/DocumentCard";
import { UploadDialog } from "@/components/UploadDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { GLOBAL_PLACEHOLDERS } from "@/lib/search-hints";
import { COURSES, TYPE_FILTERS, matchesTypeFilter } from "@/lib/catalog";
import { fetchDocuments } from "@/lib/documents";
import { getSections, getSubjects } from "@/lib/syllabus";
import { useBookmarks } from "@/lib/bookmarks";
import hero from "@/assets/hero-image.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SSIT Notes Hub | Textbook PDFs, PYQs & Practicals" },
      {
        name: "description",
        content:
          "Free textbook PDFs, previous year question papers and practicals for BCA, MCA and IT students of Shree Swaminarayan Institute of Technology, Gandhinagar.",
      },
      { property: "og:title", content: "SSIT Notes Hub | Textbook PDFs, PYQs & Practicals" },
      {
        property: "og:description",
        content: "Browse, upload and download semester-wise study material for BCA, MCA and IT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type SyllabusHit = {
  course: string;
  semester: number;
  subjectId: string;
  subjectName: string;
  detail: string;
};

function buildSyllabusIndex(): SyllabusHit[] {
  const hits: SyllabusHit[] = [];
  for (const course of COURSES) {
    for (let sem = 1; sem <= course.semesters; sem++) {
      for (const subject of getSubjects(course.id, sem)) {
        hits.push({
          course: course.id,
          semester: sem,
          subjectId: subject.id,
          subjectName: subject.name,
          detail: `Semester ${sem} subject`,
        });
        for (const section of getSections(subject)) {
          hits.push({
            course: course.id,
            semester: sem,
            subjectId: subject.id,
            subjectName: subject.name,
            detail: section.label,
          });
        }
      }
    }
  }
  return hits;
}

const SYLLABUS_INDEX = buildSyllabusIndex();

function Home() {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const qc = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetchDocuments(),
  });
  const { isBookmarked, toggle } = useBookmarks();

  const query = search.trim().toLowerCase();
  const filtering = !!query || !!courseFilter || !!semesterFilter || !!typeFilter;
  const maxSemesters = courseFilter
    ? (COURSES.find((c) => c.id === courseFilter)?.semesters ?? 6)
    : 6;

  const results = useMemo(() => {
    if (!filtering) return [];
    return docs.filter((d) => {
      if (courseFilter && d.course !== courseFilter) return false;
      if (semesterFilter && String(d.semester) !== semesterFilter) return false;
      if (typeFilter && !matchesTypeFilter(d.category, typeFilter)) return false;
      if (!query) return true;
      return [d.title, d.file_name, d.subject, d.course, d.category, `semester ${d.semester}`]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [docs, query, courseFilter, semesterFilter, typeFilter, filtering]);

  const syllabusResults = useMemo(() => {
    if (!query) return [];
    return SYLLABUS_INDEX.filter((h) => {
      if (courseFilter && h.course !== courseFilter) return false;
      if (semesterFilter && String(h.semester) !== semesterFilter) return false;
      return `${h.course} semester ${h.semester} ${h.subjectName} ${h.detail}`
        .toLowerCase()
        .includes(query);
    }).slice(0, 12);
  }, [query, courseFilter, semesterFilter]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:bg-secondary"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative isolate overflow-hidden">
        <img
          src={hero.url}
          alt="SSIT Gandhinagar campus building"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[62vh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[70vh] sm:py-24">
          <h1 className="hero-title text-3xl font-black leading-[1.15] tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            One Hub. Every Note. Endless Learning.
          </h1>
          <p className="hero-title mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/90 sm:text-lg">
            Semester-wise notes, previous year question papers and practicals for BCA, MCA and IT.
            Anyone can upload and share.
          </p>
          <div className="mt-8 flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row">
            <GlobalSearch
              value={search}
              onChange={setSearch}
              placeholders={GLOBAL_PLACEHOLDERS}
              className="flex-1"
            />
            <UploadDialog
              size="default"
              label="Upload File"
              onUploaded={() => void qc.invalidateQueries({ queryKey: ["documents"] })}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <section aria-label="Filters" className="flex flex-wrap items-center gap-2">
          {COURSES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={chip(courseFilter === c.id)}
              onClick={() => {
                setCourseFilter((prev) => (prev === c.id ? "" : c.id));
                setSemesterFilter("");
              }}
            >
              {c.name}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((s) => (
            <button
              key={s}
              type="button"
              className={chip(semesterFilter === String(s))}
              onClick={() => setSemesterFilter((prev) => (prev === String(s) ? "" : String(s)))}
            >
              Sem {s}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={chip(typeFilter === t.id)}
              onClick={() => setTypeFilter((prev) => (prev === t.id ? "" : t.id))}
            >
              {t.label}
            </button>
          ))}
          {filtering && (
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setSearch("");
                setCourseFilter("");
                setSemesterFilter("");
                setTypeFilter("");
              }}
            >
              Clear all
            </button>
          )}
        </section>

        {filtering ? (
          <section className="mt-8 space-y-8">
            {syllabusResults.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">Subjects & units</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {syllabusResults.map((hit, i) => (
                    <Link
                      key={`${hit.course}-${hit.semester}-${hit.subjectId}-${i}`}
                      to="/course/$course/$semester/$subject"
                      params={{
                        course: hit.course,
                        semester: String(hit.semester),
                        subject: hit.subjectId,
                      }}
                      className="glass-card rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
                    >
                      <p className="truncate text-sm font-semibold text-foreground">
                        {hit.subjectName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {hit.course} · Sem {hit.semester} · {hit.detail}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-foreground">
                {results.length} file{results.length === 1 ? "" : "s"}
                {search ? ` for “${search}”` : ""}
              </h2>
              {isLoading ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      bookmarked={isBookmarked(doc.id)}
                      onToggleBookmark={toggle}
                    />
                  ))}
                </div>
              )}
              {!isLoading && results.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  No uploaded file matched yet — be the first to upload one.
                </p>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-8">
            <h2 className="text-2xl font-black tracking-tight text-foreground">Courses</h2>
            <p className="text-sm text-muted-foreground">Pick your course to browse semesters.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {COURSES.map((course) => (
                <Link
                  key={course.id}
                  to="/course/$course"
                  params={{ course: course.id }}
                  className="glass-card group rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-105">
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-2xl font-black tracking-tight text-foreground">
                    {course.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{course.full}</p>
                  <p className="mt-4 text-xs font-semibold text-primary">
                    {course.semesters} semesters ·{" "}
                    {docs.filter((d) => d.course === course.id).length} files
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
