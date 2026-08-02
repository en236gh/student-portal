"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Tile } from "@/components/ui/Tile";
import { listMyExaminations } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import {
  examStatusTone,
  formatExamWindow,
  passHref,
  periodKey,
} from "@/lib/exams";
import type { StudentExamination } from "@/lib/types";
import { ApiError } from "@/lib/types";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const [firstName, setFirstName] = useState("Student");
  const [exams, setExams] = useState<StudentExamination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getSessionUser();
    if (user?.name) {
      setFirstName(user.name.split(" ")[0] || user.name);
    }

    let cancelled = false;

    async function load() {
      try {
        const result = await listMyExaminations();
        if (!cancelled) setExams(result.data || []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return;
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load examinations.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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
              subtitle="Ready for pass"
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
              helper="Create one signed QR covering all allocated exams"
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
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Upcoming sittings</h2>
              <p className="text-sm text-muted">
                Your next allocated examinations appear here for verification.
              </p>
            </div>
            <Link
              href="/exams"
              className="text-sm font-medium text-ink underline-offset-2 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="rounded-[10px] bg-white p-8 text-center panel-shadow">
              <p className="text-sm text-muted">Loading examinations…</p>
            </div>
          ) : stats.preview.length === 0 ? (
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
                          : exam.allocated
                            ? "Not generated yet"
                            : "Unavailable until allocated"}
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
