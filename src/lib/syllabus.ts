export type Subject = {
  id: string;
  name: string;
  short?: string;
  units: string[];
  practicals?: boolean;
};

export const PYQ_TERMS = [
  { id: "pyq-summer-2026", label: "Summer 2026" },
  { id: "pyq-winter-2025", label: "Winter 2025" },
] as const;

const BCA_SEM_1: Subject[] = [
  {
    id: "fp",
    name: "Fundamental of Programming",
    short: "FP",
    units: [
      "Introduction to C",
      "Input Output And Control Structure",
      "Array and Functions",
      "Pointers and Structure",
      "Using Files in C",
    ],
    practicals: true,
  },
  {
    id: "fwt",
    name: "Fundamentals of Web Technology",
    short: "FWT",
    units: [
      "Introduction to Web Technology",
      "HTML, XHTML & HTML5",
      "Page Designing with CSS",
      "Client-side Scripting",
      "JSON",
    ],
    practicals: true,
  },
  {
    id: "fco",
    name: "Fundamentals of Computer Organization",
    short: "FCO",
    units: [
      "Number System And Logic Gates",
      "Basic Structure of Computer",
      "Register Transfer Language And Micro-operations",
      "Computer Arithmetic",
      "The Memory System",
    ],
  },
  {
    id: "maths-1",
    name: "Mathematics-1",
    units: ["Set Theory", "Functions", "Matrix and Determinant", "Coordinate Geometry"],
  },
  {
    id: "communication-skills",
    name: "Communication Skills",
    units: [
      "Basics of Technical Communication",
      "Effective Presentation Strategies, Interviews and Group Communication",
      "Letters, Memos, Emails, Reports",
      "Introduction to Modern Communication Media",
      "Vocabulary",
    ],
  },
  {
    id: "iks",
    name: "Indian Knowledge System",
    short: "IKS",
    units: [
      "Introduction to IKS",
      "The Vedic Corpus",
      "Indian Philosophical System",
      "Scientific Foundation in Linguistics",
      "Indian Number System and Units of Measurement",
      "Knowledge Framework and Classification",
      "Indian Mathematics: Vedic Mathematics and Ancient Mathematical Works",
      "Astronomy",
      "Health, Wellness and Psychology",
    ],
  },
  {
    id: "office-automation",
    name: "Office Automation",
    short: "OA",
    units: [],
    practicals: true,
  },
];

const BCA_SEM_2: Subject[] = [
  {
    id: "data-structure",
    name: "Data Structure",
    units: [
      "Introduction to Data Structure",
      "Linear Data Structure",
      "Non-linear Data Structure",
      "Hashing and File Structure",
      "Sorting & Searching",
    ],
  },
  {
    id: "dbms",
    name: "Database Management System",
    short: "DBMS",
    units: [
      "Introduction to Database System",
      "Entity Relationship Model",
      "Database Design",
      "Relational Model Concepts",
      "Introduction to Transaction Processing Concepts",
    ],
  },
  {
    id: "awt",
    name: "Advanced Web Technology",
    short: "AWT",
    units: [
      "Introduction to PHP",
      "Working with Arrays, Forms and Functions",
      "Advanced PHP",
      "jQuery Basics",
      "Angular",
    ],
  },
  {
    id: "maths-2",
    name: "Mathematics-2",
    units: ["Mathematical Logic", "Relation & Ordering", "Combinatorics", "Graph Theory"],
  },
  {
    id: "data-analytics-spreadsheet",
    name: "Data Analytics using Spreadsheet",
    units: [],
    practicals: true,
  },
  {
    id: "technical-writing",
    name: "Technical Writing",
    units: [
      "Dynamics of Communication",
      "Technical Writing",
      "Technical Communication",
      "Etiquettes",
      "Self-development and Assessment",
    ],
  },
  {
    id: "professional-ethics",
    name: "Professional Ethics",
    units: [
      "History of Computing",
      "Morality and the Law",
      "Ethics and Ethical Analysis",
      "Ethics and the Profession",
      "Anonymity, Security, Privacy and Civil Liberties",
      "Intellectual Property Rights (IPR) and Computer Technology",
      "Social Context of Computing",
      "Software Issues",
      "Computer Crimes",
      "New Frontiers of Computer Ethics",
      "Cyberbullying",
    ],
  },
];

export const SYLLABUS: Record<string, Record<number, Subject[]>> = {
  BCA: { 1: BCA_SEM_1, 2: BCA_SEM_2 },
};

export function getSubjects(course: string, semester: number): Subject[] {
  return SYLLABUS[course.toUpperCase()]?.[semester] ?? [];
}

export function getSubject(course: string, semester: number, subjectId: string) {
  return getSubjects(course, semester).find((s) => s.id === subjectId);
}

export type Section = { id: string; label: string; group: "unit" | "practicals" | "pyq" };

export function getSections(subject: Subject): Section[] {
  const sections: Section[] = subject.units.map((u, i) => ({
    id: `unit-${i + 1}`,
    label: `Unit ${i + 1} · ${u}`,
    group: "unit",
  }));
  if (subject.practicals) {
    sections.push({ id: "practicals", label: "Practicals", group: "practicals" });
  }
  for (const term of PYQ_TERMS) {
    sections.push({ id: term.id, label: term.label, group: "pyq" });
  }
  return sections;
}

export function sectionLabel(subject: Subject | undefined, sectionId: string) {
  if (subject) {
    const found = getSections(subject).find((s) => s.id === sectionId);
    if (found) return found.label;
  }
  const pyq = PYQ_TERMS.find((t) => t.id === sectionId);
  if (pyq) return `PYQ ${pyq.label}`;
  if (sectionId === "practicals") return "Practicals";
  const m = /^unit-(\d+)$/.exec(sectionId);
  if (m) return `Unit ${m[1]}`;
  return sectionId;
}
