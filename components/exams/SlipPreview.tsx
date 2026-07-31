"use client";

import { Button } from "@/components/ui/Button";
import {
  downloadExaminationSlipPdf,
  generateExaminationSlip,
  getExaminationSlip,
} from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import {
  formatExamDate,
  formatExamTime,
  normalizeSlip,
  triggerBlobDownload,
} from "@/lib/exams";
import type { ExaminationSlip } from "@/lib/types";
import { ApiError } from "@/lib/types";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function SlipPreview({ examSessionId }: { examSessionId: string }) {
  const [slip, setSlip] = useState<ExaminationSlip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getExaminationSlip(examSessionId);
      setSlip(result.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;

      // Slip not generated yet — offer generate
      if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
        setError(err.message);
        setSlip(null);
      } else {
        setError(errorMessage(err, "Unable to load examination slip"));
      }
    } finally {
      setLoading(false);
    }
  }, [examSessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const view = useMemo(() => (slip ? normalizeSlip(slip) : null), [slip]);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const result = await generateExaminationSlip(examSessionId);
      setSlip(result.data);
      toast.success("Examination slip generated");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setError(errorMessage(err, "Unable to generate slip"));
      toast.error(errorMessage(err, "Unable to generate slip"));
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    if (!view) return;
    setDownloading(true);
    try {
      const computerNumber =
        view.computerNumber !== "—"
          ? String(view.computerNumber)
          : getSessionUser()?.computerNumber || "student";
      const { blob, filename } = await downloadExaminationSlipPdf(
        examSessionId,
        computerNumber,
      );
      triggerBlobDownload(blob, filename);
      toast.success("PDF downloaded — print this file for the venue");
    } catch (err) {
      toast.error(errorMessage(err, "Unable to download PDF"));
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="rounded-[10px] bg-white p-10 text-center panel-shadow">
        <p className="text-sm text-muted">Loading examination slip…</p>
      </div>
    );
  }

  if (!view) {
    return (
      <div className="space-y-4">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to my exams
        </Link>

        <div className="rounded-[10px] bg-white p-8 panel-shadow">
          <h2 className="text-lg font-semibold text-ink">Slip not available</h2>
          <p className="mt-2 text-sm text-brand-red">
            {error || "This examination slip has not been generated yet."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating…" : "Generate Slip"}
            </Button>
            <Button variant="secondary" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to my exams
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDownload} disabled={downloading}>
            <ArrowDownTrayIcon className="h-4 w-4" />
            {downloading ? "Downloading…" : "Download PDF for printing"}
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4" />
            Print preview
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-[10px] bg-brand-red/5 px-4 py-3 text-sm text-brand-red print:hidden">
          {error}
        </div>
      ) : null}

      <article className="mx-auto max-w-2xl rounded-[10px] bg-white p-6 panel-shadow sm:p-8 print:max-w-none print:shadow-none print:border print:border-black">
        <header className="flex items-center justify-between gap-4 border-b border-black/10 pb-5">
          <div className="flex items-center gap-3">
            <Image
              src="/UNZA.png"
              alt="UNZA"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                University of Zambia
              </p>
              <h1 className="text-xl font-bold tracking-tight text-ink">
                Examination Slip
              </h1>
            </div>
          </div>
          <p className="font-mono text-xs text-muted">#{view.slipId}</p>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-5">
            <div>
              <p className="text-xs text-muted">Student</p>
              <p className="text-lg font-semibold text-ink">{view.fullName}</p>
              <p className="mt-1 font-mono text-sm font-medium text-ink">
                {view.computerNumber}
              </p>
              <p className="mt-2 text-sm text-muted">
                {view.school} · {view.programme} · Year {view.currentYear}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Course</dt>
                <dd className="font-mono text-sm font-semibold text-ink">
                  {view.courseCode}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Exam type</dt>
                <dd className="text-sm font-medium text-ink">{view.examType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Date</dt>
                <dd className="text-sm font-medium text-ink">
                  {formatExamDate(view.examDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Time</dt>
                <dd className="text-sm font-medium text-ink">
                  {formatExamTime(view.startTime)} – {formatExamTime(view.endTime)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Venue</dt>
                <dd className="text-sm font-medium text-ink">{view.venueName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Building</dt>
                <dd className="text-sm font-medium text-ink">{view.building}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Seat number</dt>
                <dd className="font-mono text-base font-bold text-ink">
                  {view.seatNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Session</dt>
                <dd className="text-sm font-medium text-ink">
                  {view.academicYear} · Sem {view.semester}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col items-center justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${view.qrImageBase64}`}
              alt="Examination slip QR code"
              width={200}
              height={200}
              className="h-[200px] w-[200px] rounded-[10px] border border-black/10 bg-white p-2"
            />
            <p className="mt-3 max-w-[200px] text-center text-xs text-muted">
              Present this QR at the venue for check-in verification.
            </p>
          </div>
        </section>

        <footer className="mt-8 border-t border-black/10 pt-4 text-xs text-muted print:hidden">
          Prefer the official PDF for paper printing — it embeds the same signed QR.
        </footer>
      </article>
    </div>
  );
}
