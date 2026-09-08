/** Rotating placeholder hints for the global + in-document search bars. */

export const GLOBAL_PLACEHOLDERS = [
  "Search notes, subjects, semester or PYQs…",
  "Try 'DBMS Unit 3 notes'",
  "Try 'BCA Sem 4 previous papers'",
  "Try 'Data Structures practicals'",
];

export const QUICK_SUGGESTIONS = [
  "DBMS notes",
  "BCA Sem 1 textbook",
  "Previous year papers",
  "C programming practicals",
  "MCA Sem 2 notes",
];

const TOPIC_HINTS: { match: RegExp; hints: string[] }[] = [
  {
    match: /dbms|database|sql/i,
    hints: [
      "Explain normalization with example",
      "What is a foreign key?",
      "ACID properties in DBMS",
      "Difference between DELETE, DROP and TRUNCATE",
    ],
  },
  {
    match: /data structure|dsa|algorithm/i,
    hints: [
      "Stack vs Queue with examples",
      "Explain linked list traversal",
      "Time complexity of binary search",
      "Difference between BFS and DFS",
    ],
  },
  {
    match: /\bc\b|c programming|fp|fundamental|program/i,
    hints: [
      "Difference between call by value and reference",
      "Explain pointers with example",
      "What are storage classes in C?",
      "Loops in C with examples",
    ],
  },
  {
    match: /java|oop|object/i,
    hints: [
      "Explain inheritance with example",
      "Difference between abstract class and interface",
      "What is polymorphism?",
      "Exception handling in Java",
    ],
  },
  {
    match: /network|cn/i,
    hints: [
      "Explain OSI model layers",
      "TCP vs UDP",
      "What is IP addressing?",
      "Difference between hub and switch",
    ],
  },
  {
    match: /operating system|os/i,
    hints: [
      "Explain process scheduling algorithms",
      "What is deadlock?",
      "Paging vs segmentation",
      "Difference between process and thread",
    ],
  },
  {
    match: /web|html|css|javascript/i,
    hints: [
      "Difference between HTML and XHTML",
      "Explain CSS box model",
      "What is DOM in JavaScript?",
      "GET vs POST method",
    ],
  },
  {
    match: /math|statistic|discrete/i,
    hints: [
      "Explain set operations with example",
      "What is probability distribution?",
      "Solve using matrix method",
      "Difference between mean, median and mode",
    ],
  },
  {
    match: /iks|knowledge system|communication|english|soft skill/i,
    hints: [
      "Short note on Indian Knowledge Systems",
      "Explain effective communication",
      "Types of communication barriers",
      "Write a formal letter format",
    ],
  },
];

/** Context-aware exam-style hints for the currently open document. */
export function getDocumentPlaceholders(input: {
  subject: string;
  category: string;
  course: string;
  semester: number;
}) {
  const key = `${input.subject} ${input.category}`;
  const topic = TOPIC_HINTS.find((t) => t.match.test(key));
  const subject = input.subject.trim() || "this subject";
  if (topic) return topic.hints;
  return [
    `Important questions in ${subject}`,
    `${subject} unit-wise notes`,
    `${input.course} Sem ${input.semester} previous papers`,
    `${subject} practicals`,
  ];
}
