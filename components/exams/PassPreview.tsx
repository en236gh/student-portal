"use client";

import { Button } from "@/components/ui/Button";
import {
  downloadExaminationPassPdf,
  generateExaminationPass,
  getExaminationPass,
} from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import {
  formatExamDate,
  formatExamTime,
  normalizePass,
  triggerBlobDownload,
} from "@/lib/exams";
import type { ExaminationPass, ExaminationPassPeriod } from "@/lib/types";
import { ApiError } from "@/lib/types";
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function PassPreview({ period }: { period: ExaminationPassPeriod }) {
  const request = useRef(0);
  const [pass, setPass] = useState<ExaminationPass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    const version = ++request.current;
    setLoading(true);
    setPass(null);
    setMissing(false);
    try {
      const result = await getExaminationPass({
        academicYear: period.academicYear,
        semester: period.semester,
      });
      if (version !== request.current) return;
      setPass(result.data);
      setError("");
    } catch (err) {
      if (version !== request.current) return;
      if (err instanceof ApiError && err.status === 401) return;

      // Pass not generated yet — offer generate
      if (err instanceof ApiError && err.status === 404) {
        setMissing(true);
        setError(err.message);
        setPass(null);
      } else {
        setError(errorMessage(err, "Unable to load examination pass"));
      }
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, [period.academicYear, period.semester]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    window.addEventListener("examinations-updated", load);
    window.addEventListener("focus", load);
    return () => {
      window.clearTimeout(initialLoad);
      // Invalidate in-flight requests when this view unmounts.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
      window.removeEventListener("examinations-updated", load);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  const view = useMemo(() => (pass ? normalizePass(pass) : null), [pass]);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const result = await generateExaminationPass(period);
      setPass(result.data);
      toast.success("Examination pass generated");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setError(errorMessage(err, "Unable to generate pass"));
      toast.error(errorMessage(err, "Unable to generate pass"));
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
      const { blob, filename } = await downloadExaminationPassPdf(
        {
          academicYear: view.academicYear,
          semester: view.semester,
        },
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
        <p className="text-sm text-muted">Loading examination pass…</p>
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
          <h2 className="text-lg font-semibold text-ink">{missing ? "Pass not yet generated" : "Unable to load pass"}</h2>
          <p className="mt-2 text-sm text-brand-red">
            {error || "This examination pass has not been generated yet."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {missing && <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating…" : "Generate Pass"}
            </Button>}
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError("");
                void load();
              }}
            >
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
          <Button
            variant="secondary"
            onClick={() => {
              setLoading(true);
              setError("");
              void load();
            }}
            disabled={loading}
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh pass
          </Button>
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

      <article className="mx-auto max-w-3xl rounded-[10px] bg-white p-6 panel-shadow sm:p-8 print:max-w-none print:shadow-none print:border print:border-black">
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
                Examination Pass
              </h1>
            </div>
          </div>
          <p className="font-mono text-xs text-muted">#{view.passId}</p>
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
                <dt className="text-xs text-muted">Academic year</dt>
                <dd className="text-sm font-medium text-ink">
                  {view.academicYear}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Semester</dt>
                <dd className="text-sm font-medium text-ink">{view.semester}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col items-center justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${view.qrImageBase64}`}
              alt="Examination pass QR code"
              width={200}
              height={200}
              className="h-[200px] w-[200px] rounded-[10px] border border-black/10 bg-white p-2"
            />
            <p className="mt-3 max-w-[200px] text-center text-xs text-muted">
              Present this QR at the venue for check-in verification.
            </p>
          </div>
        </section>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Generated</dt><dd>{view.generatedAt ? new Date(view.generatedAt).toLocaleString() : "Not provided"}</dd></div>
          <div><dt className="text-muted">Expires</dt><dd>{view.expiresAt ? new Date(view.expiresAt).toLocaleString() : "Not provided"}</dd></div>
        </dl>
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-ink">Allocated examinations</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs text-muted">
                  <th className="py-2 pr-3 font-medium">Course</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Time</th>
                  <th className="py-2 pr-3 font-medium">Venue</th>
                  <th className="py-2 font-medium">Seat</th>
                </tr>
              </thead>
              <tbody>
                {view.examinations.map((exam, index) => (
                  <tr
                    key={String(exam.examSessionId ?? `${exam.courseCode}-${index}`)}
                    className="border-b border-black/5"
                  >
                    <td className="py-3 pr-3 font-mono text-xs font-semibold text-ink">
                      {exam.courseCode}
                    </td>
                    <td className="py-3 pr-3 text-ink">
                      {formatExamDate(exam.examDate)}
                    </td>
                    <td className="py-3 pr-3 text-ink">
                      {formatExamTime(exam.startTime)} –{" "}
                      {formatExamTime(exam.endTime)}
                    </td>
                    <td className="py-3 pr-3 text-ink">
                      {exam.venueName}
                      {exam.building && exam.building !== "—"
                        ? ` · ${exam.building}`
                        : ""}
                    </td>
                    <td className="py-3 font-mono font-semibold text-ink">
                      {exam.seatNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-8 border-t border-black/10 pt-4 text-xs text-muted print:hidden">
          Prefer the official PDF for paper printing — it embeds the same signed QR
          for all exams in this period.
        </footer>
      </article>
    </div>
  );
}
