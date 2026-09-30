"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  downloadExaminationPassPdf,
  generateExaminationPass,
} from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import {
  examStatusTone,
  formatExamWindow,
  passHref,
  triggerBlobDownload,
} from "@/lib/exams";
import type { StudentExamination } from "@/lib/types";
import { ApiError } from "@/lib/types";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function ExamCard({
  exams,
  onPassGenerated,
}: {
  exams: StudentExamination[];
  onPassGenerated?: (exam: StudentExamination) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"generate" | "download" | null>(null);
  const exam = exams[0];
  const period = {
    academicYear: exam.academicYear,
    semester: exam.semester,
  };

  async function handleGenerate() {
    setBusy("generate");
    try {
      const result = await generateExaminationPass(period);
      toast.success("Examination pass generated");
      onPassGenerated?.({
        ...exam,
        passGenerated: true,
        passId: result.data.passId,
      });
      router.push(passHref(period));
    } catch (err) {
      toast.error(errorMessage(err, "Unable to generate pass"));
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const computerNumber = getSessionUser()?.computerNumber || "student";
      const { blob, filename } = await downloadExaminationPassPdf(
        period,
        computerNumber,
      );
      triggerBlobDownload(blob, filename);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(errorMessage(err, "Unable to download PDF"));
    } finally {
      setBusy(null);
    }
  }

  const waitingAllocation = exams.some((item) => !item.allocated);
  const sameStatus = exams.every((item) => item.examStatus === exam.examStatus);

  return (
    <article className="flex flex-col rounded-[10px] border border-transparent bg-white p-6 panel-shadow transition-colors duration-200 hover:border-ink/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
            <AcademicCapIcon className="h-5 w-5" />
          </div>
          <div>
              <h3 className="text-base font-semibold text-ink">
                Examination pass · {exam.academicYear} · Sem {exam.semester}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {exams.length} eligible course{exams.length === 1 ? "" : "s"}
              </p>
          </div>
        </div>
          <Badge tone={examStatusTone(sameStatus ? exam.examStatus : "Mixed statuses")}>
            {sameStatus ? exam.examStatus : "Mixed statuses"}
          </Badge>
      </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs text-muted">
                <th className="py-2 pr-3 font-medium">Course</th>
                <th className="py-2 pr-3 font-medium">Exam</th>
                <th className="py-2 pr-3 font-medium">Date and time</th>
                <th className="py-2 font-medium">Venue</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((item) => (
                <tr key={String(item.examSessionId)} className="border-b border-black/5 last:border-b-0">
                  <td className="py-3 pr-3 font-mono text-xs font-semibold text-ink">
                    {item.courseCode}
                  </td>
                  <td className="py-3 pr-3 text-ink">{item.examType}</td>
                  <td className="py-3 pr-3 text-ink">{formatExamWindow(item)}</td>
                  <td className="py-3 text-ink">
                    {item.allocated ? [item.venueName, item.building].filter(Boolean).join(" · ") || "—" : "Not allocated"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {waitingAllocation ? (
          <div className="mt-5 rounded-[10px] bg-brand-gold/10 px-4 py-3 text-sm text-amber-900">
            Some examinations are awaiting venue allocation. Pass eligibility is checked when you generate a pass.
          </div>
        ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {!exam.passGenerated ? (
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={busy !== null}
          >
            <DocumentTextIcon className="h-4 w-4" />
            {busy === "generate" ? "Generating…" : "Generate Pass"}
          </Button>
        ) : (
          <>
            <Button size="sm" onClick={() => router.push(passHref(period))}>
              <DocumentTextIcon className="h-4 w-4" />
              View Pass
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              disabled={busy !== null}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {busy === "download" ? "Downloading…" : "Download PDF"}
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
