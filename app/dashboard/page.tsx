"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tile } from "@/components/ui/Tile";
import { listMyExaminations } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import {
  examStatusTone,
  isPublishedExam,
  formatExamWindow,
  passHref,
  periodKey,
} from "@/lib/exams";
import type { StudentExamination } from "@/lib/types";
import { ApiError } from "@/lib/types";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("Student");
  const request = useRef(0);
  const [exams, setExams] = useState<StudentExamination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExaminations = useCallback(async () => {
    const version = ++request.current;
    setLoading(true);
    setExams([]);
    try {
      const result = await listMyExaminations();
      if (version !== request.current) return;
      const user = getSessionUser();
      if (user?.name) {
        setFirstName(user.name.split(" ")[0] || user.name);
      }
      setExams((result.data || []).filter(isPublishedExam));
      setError("");
    } catch (err) {
      if (version !== request.current) return;
      if (err instanceof ApiError && err.status === 401) return;
      setError(
        err instanceof Error ? err.message : "Unable to load examinations.",
      );
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadExaminations(), 0);
    window.addEventListener("examinations-updated", loadExaminations);
    window.addEventListener("focus", loadExaminations);
    return () => {
      // Invalidate in-flight requests when this view unmounts.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
      window.clearTimeout(initialLoad);
      window.removeEventListener("examinations-updated", loadExaminations);
      window.removeEventListener("focus", loadExaminations);
    };
  }, [loadExaminations]);

  const stats = useMemo(() => {
    const upcoming = exams.filter((e) => {
      const status = e.examStatus?.toUpperCase() || "";
      return !status.includes("COMPLETE") && !status.includes("CANCEL");
    });
    const allocated = exams.filter((e) => e.allocated).length;
    const periodsWithPass = new Set(
      exams
        .filter((e) => e.passGenerated)
        .map((e) => periodKey(e)),
    );
    const awaitingSeat = exams.filter((e) => !e.allocated).length;

    return {
      upcoming: upcoming.length,
      allocated,
      passesReady: periodsWithPass.size,
      awaitingSeat,
      preview: upcoming.slice(0, 4),
    };
  }, [exams]);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-8">
        <p className="text-sm text-muted">
          Welcome back, {firstName}. Review upcoming sittings and generate your
          examination pass here.
        </p>

        {error ? (
          <div className="rounded-[10px] bg-brand-red/5 px-4 py-3 text-sm text-brand-red">
            {error}
          </div>
        ) : null}

        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Tile
              title="Upcoming exams"
              value={loading ? "—" : stats.upcoming}
              subtitle="Registered"
              accent="ink"
              icon={<AcademicCapIcon className="h-5 w-5" />}
            />
            <Tile
              title="Venue allocated"
              value={loading ? "—" : stats.allocated}
              subtitle="Venue confirmed"
              accent="green"
              icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />}
            />
            <Tile
              title="Passes generated"
              value={loading ? "—" : stats.passesReady}
              subtitle={
                stats.awaitingSeat > 0
                  ? `${stats.awaitingSeat} awaiting seat`
                  : "Printable"
              }
              accent="gold"
              icon={<DocumentTextIcon className="h-5 w-5" />}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Quick actions</h2>
            <p className="text-sm text-muted">
              Open your examinations list to generate a pass and download the PDF.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Tile
              title="My examinations"
              helper="See course, venue, seat, and pass status"
              href="/exams"
              accent="ink"
              className="min-h-[140px]"
              wash="bg-gradient-to-br from-white to-slate-50"
              icon={<AcademicCapIcon className="h-5 w-5" />}
            />
            <Tile
              title="Generate a pass"
              helper="Request a pass for your eligible examinations"
              href="/exams"
              accent="gold"
              className="min-h-[140px]"
              wash="bg-gradient-to-br from-white to-amber-50/60"
              icon={<DocumentTextIcon className="h-5 w-5" />}
            />
            <Tile
              title="Download PDF"
              helper="Print the official pass and bring it to the venue"
              href="/exams"
              accent="green"
              className="min-h-[140px]"
              wash="bg-gradient-to-br from-white to-emerald-50/60"
              icon={<ArrowDownTrayIcon className="h-5 w-5" />}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Upcoming sittings</h2>
              <p className="text-sm text-muted">
                Your eligible published examinations appear here for verification.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setLoading(true);
                  setError("");
                  void loadExaminations();
                }}
                disabled={loading}
              >
                <ArrowPathIcon className="h-4 w-4" />
                {loading ? "Refreshing…" : "Refresh"}
              </Button>
              <Link
                href="/exams"
                className="text-sm font-medium text-ink underline-offset-2 hover:underline"
              >
                View all
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[10px] bg-white p-8 text-center panel-shadow">
              <p className="text-sm text-muted">Loading examinations…</p>
            </div>
          ) : error ? null : stats.preview.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-[10px] bg-white p-8 text-center panel-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
                <AcademicCapIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">No upcoming exams</p>
              <p className="mt-1 text-sm text-muted">
                Registered exam sessions will show here once available.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {stats.preview.map((exam) => (
                <Link
                  key={String(exam.examSessionId)}
                  href={
                    exam.passGenerated
                      ? passHref({
                          academicYear: exam.academicYear,
                          semester: exam.semester,
                        })
                      : "/exams"
                  }
                  className="rounded-[10px] border border-transparent bg-white p-6 panel-shadow transition-colors duration-200 hover:border-ink/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold tracking-wide text-muted">
                        {exam.courseCode}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-ink">
                        {exam.examType}
                      </h3>
                    </div>
                    <Badge tone={examStatusTone(exam.examStatus)}>
                      {exam.examStatus}
                    </Badge>
                  </div>

                  <dl className="mt-5 space-y-3">
                    <div>
                      <dt className="text-xs text-muted">Date & time</dt>
                      <dd className="text-sm font-medium text-ink">
                        {formatExamWindow(exam)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Venue / seat</dt>
                      <dd className="text-sm font-medium text-ink">
                        {exam.allocated
                          ? `${exam.venueName || "—"} · Seat ${exam.seatNumber ?? "—"}`
                          : "Waiting for venue allocation"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Pass</dt>
                      <dd className="text-sm font-medium text-ink">
                        {exam.passGenerated
                          ? "Ready — view / download"
                          : "Not generated yet"}
                      </dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
