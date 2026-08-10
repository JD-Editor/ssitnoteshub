import { useRef, useState } from "react";
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
import { COURSES, categoryLabel } from "@/lib/catalog";
import { uploadDocument } from "@/lib/documents";

export function UploadDialog({
  course,
  semester,
  category,
  subject: fixedSubject,
  contextLabel,
  size = "sm",
  onUploaded,
}: {
  course: string;
  semester: number;
  category: string;
  subject?: string;
  contextLabel?: string;
  size?: "sm" | "default";
  onUploaded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setSubject("");
    setTitle("");
  };

  const submit = async () => {
    if (!file) {
      toast.error("Choose a PDF file first.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed.");
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
        course,
        semester,
        subject: finalSubject,
        category,
        title: title || contextLabel || "",
      });
      toast.success("PDF uploaded successfully.");
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
        <Button size={size} className="rounded-full">
          <Upload className="h-4 w-4" /> Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload PDF</DialogTitle>
          <DialogDescription>
            {COURSES.find((c) => c.id === course)?.name ?? course} · Semester {semester} ·{" "}
            {contextLabel ?? categoryLabel(category)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Unit 1 - Arrays"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>PDF file</Label>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                Choose file
              </Button>
              <span className="min-w-0 truncate text-sm text-muted-foreground">
                {file ? file.name : "No file selected"}
              </span>
            </div>
          </div>
          <Button className="w-full" disabled={busy} onClick={submit}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
