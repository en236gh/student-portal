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
  exam,
  onPassGenerated,
}: {
  exam: StudentExamination;
  onPassGenerated?: (exam: StudentExamination) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"generate" | "download" | null>(null);
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

  const waitingAllocation = !exam.allocated;

  return (
    <article className="flex flex-col rounded-[10px] border border-transparent bg-white p-6 panel-shadow transition-colors duration-200 hover:border-ink/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
            <AcademicCapIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold tracking-wide text-muted">
              {exam.courseCode}
            </p>
            <h3 className="mt-1 text-base font-semibold text-ink">
              {exam.examType} · {exam.academicYear} · Sem {exam.semester}
            </h3>
            <p className="mt-1 text-sm text-muted">{formatExamWindow(exam)}</p>
          </div>
        </div>
        <Badge tone={examStatusTone(exam.examStatus)}>{exam.examStatus}</Badge>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Venue</dt>
          <dd className="text-sm font-medium text-ink">
            {exam.allocated ? exam.venueName || "—" : "Not allocated"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Building</dt>
          <dd className="text-sm font-medium text-ink">
            {exam.allocated ? exam.building || "—" : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Seat</dt>
          <dd className="font-mono text-sm font-semibold text-ink">
            {exam.allocated ? exam.seatNumber ?? "—" : "—"}
          </dd>
        </div>
      </dl>

      {waitingAllocation ? (
        <div className="mt-5 rounded-[10px] bg-brand-gold/10 px-4 py-3 text-sm text-amber-900">
          Waiting for venue allocation. Pass actions are disabled until a seat is
          assigned.
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {waitingAllocation ? (
          <Button size="sm" disabled>
            Generate Pass
          </Button>
        ) : !exam.passGenerated ? (
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
