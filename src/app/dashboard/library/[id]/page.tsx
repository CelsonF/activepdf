import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { LibraryPdfViewer } from "./_components";

interface LibraryPdf {
  id: string;
  name: string;
  description: string | null;
  tags: string;
  pageCount: number | null;
  fileSize: number | null;
  pdfData: string;
  createdAt: string;
}

export default async function LibraryPdfPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  let pdf: LibraryPdf;
  try {
    pdf = await serverFetch<LibraryPdf>(`/api/library/${params.id}`);
  } catch {
    notFound();
  }

  const tags: string[] = (() => {
    try {
      return JSON.parse(pdf.tags);
    } catch {
      return [];
    }
  })();

  return (
    <LibraryPdfViewer
      id={pdf.id}
      name={pdf.name}
      description={pdf.description}
      tags={tags}
      pageCount={pdf.pageCount}
      fileSize={pdf.fileSize}
      createdAt={pdf.createdAt}
      pdfData={pdf.pdfData}
    />
  );
}
