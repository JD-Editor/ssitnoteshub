import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DocumentCard } from "@/components/DocumentCard";
import { Input } from "@/components/ui/input";
import { COURSES } from "@/lib/catalog";
import { fetchDocuments } from "@/lib/documents";
import { useBookmarks } from "@/lib/bookmarks";
import hero from "@/assets/hero-image.asset.json";
import logo from "@/assets/ssit_logo.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SSIT Study Hub | Notes, PYQs & Practicals" },
      {
        name: "description",
        content:
          "Free notes, previous year papers and practicals for BCA, MCA and IT students of Shree Swaminarayan Institute of Technology, Gandhinagar.",
      },
      { property: "og:title", content: "SSIT Study Hub | Notes, PYQs & Practicals" },
      {
        property: "og:description",
        content: "Browse, upload and download semester-wise study material for BCA, MCA and IT.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [search, setSearch] = useState("");
  const { data: docs = [] } = useQuery({ queryKey: ["documents"], queryFn: () => fetchDocuments() });
  const { isBookmarked, toggle } = useBookmarks();

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return docs.filter((d) =>
      [d.title, d.subject, d.course, d.category, `semester ${d.semester}`]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [docs, search]);

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
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="flex flex-col items-start gap-6">
            <img
              src={logo.url}
              alt="SSIT logo"
              className="h-20 w-20 rounded-full bg-background/90 p-1 sm:h-24 sm:w-24"
            />
            <div className="max-w-2xl">
              <h1 className="text-3xl font-black leading-tight text-primary-foreground sm:text-5xl">
                Welcome to SSIT Study Hub
              </h1>
              <p className="mt-3 text-sm text-primary-foreground/85 sm:text-base">
                Everything you need in one place — semester-wise notes, previous year question
                papers and practicals for BCA, MCA and IT.
              </p>
            </div>
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes, PYQs, practicals or subjects…"
                className="h-12 rounded-full border-0 bg-card pl-10 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {search.trim() ? (
          <section>
            <h2 className="text-xl font-bold text-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for “{search}”
            </h2>
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
            {results.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing matched your search yet.
              </p>
            )}
          </section>
        ) : (
          <section>
            <h2 className="text-xl font-bold text-foreground">Courses</h2>
            <p className="text-sm text-muted-foreground">Pick your course to browse semesters.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COURSES.map((course) => (
                <Link
                  key={course.id}
                  to="/course/$course"
                  params={{ course: course.id }}
                  className="card-soft group rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-2xl font-black text-foreground">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">{course.full}</p>
                  <p className="mt-3 text-xs font-medium text-primary">
                    {course.semesters} semesters ·{" "}
                    {docs.filter((d) => d.course === course.id).length} files
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
