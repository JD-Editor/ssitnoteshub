import { supabase } from "@/integrations/supabase/client";

export type DocumentRow = {
  id: string;
  course: string;
  semester: number;
  subject: string;
  category: string;
  title: string;
  file_name: string;
  file_path: string;
  size_bytes: number;
  created_at: string;
};

export async function fetchDocuments(filter?: { course?: string; semester?: number }) {
  let query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter?.course) query = query.eq("course", filter.course);
  if (filter?.semester) query = query.eq("semester", filter.semester);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function getFileUrl(path: string, download?: string) {
  const { data, error } = await supabase.storage
    .from("pdfs")
    .createSignedUrl(path, 60 * 60, download ? { download } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadDocument(input: {
  file: File;
  course: string;
  semester: number;
  subject: string;
  category: string;
  title: string;
}) {
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${input.course}/sem-${input.semester}/${input.category}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(path, input.file, { contentType: "application/pdf", upsert: false });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("documents").insert({
    course: input.course,
    semester: input.semester,
    subject: input.subject.trim(),
    category: input.category,
    title: input.title.trim() || input.file.name.replace(/\.pdf$/i, ""),
    file_name: input.file.name,
    file_path: path,
    size_bytes: input.file.size,
  });
  if (insertError) throw insertError;
}
