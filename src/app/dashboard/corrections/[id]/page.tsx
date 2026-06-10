import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { CorrectionClient } from "./CorrectionClient";

interface FieldItem {
  id: string;
  type: string;
  label: string;
  studentAnswer: string | boolean | null;
  correct: boolean | null;
  feedback: string | null;
}

interface ReviewData {
  id: string;
  title: string;
  pdfName: string;
  pdfData: string;
  status: string;
  grade: string | null;
  comment: string | null;
  student: { id: string; name: string } | null;
  items: FieldItem[];
  createdAt: string;
}

export default async function CorrectionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  let review: ReviewData;
  try {
    review = await serverFetch<ReviewData>(
      `/api/exercises/${params.id}/review`
    );
  } catch {
    notFound();
  }

  const fullExercise = await serverFetch<{ pdfData: string }>(
    `/api/exercises/${params.id}`
  );

  return (
    <CorrectionClient
      exerciseId={review.id}
      pdfData={fullExercise.pdfData}
      pdfName={review.pdfName}
      title={review.title}
      studentName={review.student?.name ?? "Sem aluno"}
      items={review.items}
      initialGrade={review.grade}
      initialComment={review.comment}
    />
  );
}
