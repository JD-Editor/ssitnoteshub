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

export function getCourse(id: string) {
  return COURSES.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function formatSize(bytes: number) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
