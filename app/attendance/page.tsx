"use client";

import { listMyExaminations } from "@/lib/api";
import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/Badge";
import type { StudentExamination } from "@/lib/types";
import { ApiError } from "@/lib/types";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

function statusLabel(status?: string | null) {
  return status ? status.replaceAll("_", " ") : "Not recorded";
}

function statusTone(status?: string | null) {
  const value = status?.toUpperCase();
  if (value === "PRESENT") return "success" as const;
  if (value === "ABSENT") return "danger" as const;
  return "neutral" as const;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<StudentExamination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAttendance() {
      try {
        const result = await listMyExaminations();
        setRecords(result.data || []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance records.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAttendance();
  }, []);

  const presentCount = records.filter(
    (record) => record.attendanceStatus?.toUpperCase() === "PRESENT",
  ).length;
  const absentCount = records.filter(
    (record) => record.attendanceStatus?.toUpperCase() === "ABSENT",
  ).length;

  return (
    <AppShell title="Attendance">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-ink">Examination attendance</h2>
          <p className="text-sm text-muted">
            Attendance records from your allocated examinations.
          </p>
        </div>

        {error ? (
          <div className="rounded-[10px] bg-brand-red/5 px-4 py-3 text-sm text-brand-red">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[10px] bg-white p-6 panel-shadow">
            <h3 className="text-sm font-semibold text-ink">Summary</h3>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-muted">Present</dt>
                <dd className="text-3xl font-bold tracking-tight tabular-nums text-ink">
                  {loading ? "—" : presentCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Absent</dt>
                <dd className="text-3xl font-bold tracking-tight tabular-nums text-brand-red">
                  {loading ? "—" : absentCount}
                </dd>
              </div>
            </dl>
            <div className="mt-6 rounded-[10px] bg-surface-muted px-4 py-3 text-sm text-muted">
              Attendance is recorded when you check in at the venue with your student QR.
            </div>
          </section>

          <section className="rounded-[10px] bg-white p-6 panel-shadow">
            <h3 className="text-sm font-semibold text-ink">Recent records</h3>
            {loading ? (
              <p className="mt-4 text-sm text-muted">Loading attendance records…</p>
            ) : records.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No examination records found.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {records.map((row) => (
                <li
                  key={String(row.examSessionId)}
                  className="flex items-center justify-between gap-3 rounded-[10px] bg-surface-muted/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-ink" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{row.courseCode}</p>
                      <p className="text-xs text-muted">
                        {row.examDate} · {row.startTime} – {row.endTime}
                      </p>
                    </div>
                  </div>
                  <Badge tone={statusTone(row.attendanceStatus)}>
                    {statusLabel(row.attendanceStatus)}
                  </Badge>
                </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
