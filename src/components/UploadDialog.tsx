import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COURSES, RESOURCE_TYPES, categoryLabel, getCourse } from "@/lib/catalog";
import { uploadDocument } from "@/lib/documents";

export function UploadDialog({
  course: fixedCourse,
  semester: fixedSemester,
  category: fixedCategory,
  subject: fixedSubject,
  contextLabel,
  size = "sm",
  variant = "default",
  label = "Upload PDF",
  className,
  onUploaded,
}: {
  course?: string;
  semester?: number;
  category?: string;
  subject?: string;
  contextLabel?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "secondary";
  label?: string;
  className?: string;
  onUploaded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [course, setCourse] = useState(fixedCourse ?? COURSES[0].id);
  const [semester, setSemester] = useState(String(fixedSemester ?? 1));
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<string>(RESOURCE_TYPES[0].id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const semesterCount = getCourse(course)?.semesters ?? 6;

  useEffect(() => {
    if (!fixedSemester && Number(semester) > semesterCount) setSemester("1");
  }, [semesterCount, semester, fixedSemester]);

  const reset = () => {
    setFile(null);
    setSubject("");
    setTitle("");
    setDescription("");
    setType(RESOURCE_TYPES[0].id);
    if (!fixedCourse) setCourse(COURSES[0].id);
    if (!fixedSemester) setSemester("1");
  };

  const pickFile = () => inputRef.current?.click();

  const submit = async () => {
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }
    const finalSubject = fixedSubject ?? subject;
    if (!finalSubject.trim()) {
      toast.error("Enter the subject name.");
      return;
    }
    setBusy(true);
    try {
      await uploadDocument({
        file,
        course: fixedCourse ?? course,
        semester: fixedSemester ?? Number(semester),
        subject: finalSubject,
        category: fixedCategory ?? type,
        title: title || contextLabel || "",
        description,
      });
      toast.success("File uploaded successfully.");
      reset();
      setOpen(false);
      onUploaded();
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={className ?? "rounded-full"}>
          <Upload className="h-4 w-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload study material</DialogTitle>
          <DialogDescription>
            {fixedCourse
              ? `${getCourse(fixedCourse)?.name ?? fixedCourse} · Semester ${fixedSemester} · ${
                  contextLabel ?? categoryLabel(fixedCategory ?? "")
                }`
              : "Share notes, textbooks, papers or practicals with other students."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>File</Label>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={pickFile}>
                Choose file
              </Button>
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {file ? file.name : "No file selected"}
              </span>
            </div>
          </div>

          {!fixedCourse && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {Array.from({ length: semesterCount }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={String(s)}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!fixedSubject && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Data Structures"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {!fixedCategory && (
            <div className="space-y-2">
              <Label htmlFor="type">File type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">File name / title</Label>
            <Input
              id="title"
              placeholder="e.g. Unit 1 - Arrays"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Anything useful about this file…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button className="w-full" disabled={busy} onClick={submit}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
