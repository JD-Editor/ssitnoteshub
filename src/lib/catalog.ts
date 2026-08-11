export const COURSES = [
  { id: "BCA", name: "BCA", full: "Bachelor of Computer Applications", semesters: 6 },
  { id: "MCA", name: "MCA", full: "Master of Computer Applications", semesters: 4 },
  { id: "IT", name: "IT", full: "Information Technology", semesters: 6 },
] as const;

export type CourseId = (typeof COURSES)[number]["id"];

export const CATEGORIES = [
  { id: "notes", label: "Notes" },
  { id: "pyqs", label: "PYQs" },
  { id: "practicals", label: "Practicals" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

/** File types offered in the public upload form. */
export const RESOURCE_TYPES = [
  { id: "textbook", label: "Textbook" },
  { id: "notes", label: "Notes" },
  { id: "pyq", label: "Previous Year Paper" },
  { id: "practical", label: "Practical" },
  { id: "other", label: "Other" },
] as const;

/** Filter chips → matcher over a stored document category id. */
export const TYPE_FILTERS = [
  { id: "textbook", label: "Textbooks" },
  { id: "notes", label: "Notes" },
  { id: "pyq", label: "Previous Year Papers" },
  { id: "practical", label: "Practicals" },
] as const;

export function matchesTypeFilter(category: string, filter: string) {
  switch (filter) {
    case "textbook":
      return category === "textbook" || category.startsWith("unit-");
    case "notes":
      return category === "notes";
    case "pyq":
      return category === "pyq" || category.startsWith("pyq") || category === "pyqs";
    case "practical":
      return category === "practical" || category === "practicals";
    default:
      return true;
  }
}

export function getCourse(id: string) {
  return COURSES.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

export function categoryLabel(id: string) {
  const known = CATEGORIES.find((c) => c.id === id)?.label;
  if (known) return known;
  const type = RESOURCE_TYPES.find((t) => t.id === id)?.label;
  if (type) return type;
  const unit = /^unit-(\d+)$/.exec(id);
  if (unit) return `Unit ${unit[1]}`;
  if (id.startsWith("pyq-")) {
    return `PYQ ${id
      .slice(4)
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ")}`;
  }
  return id;
}

export function formatSize(bytes: number) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
