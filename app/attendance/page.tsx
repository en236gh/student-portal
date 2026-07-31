"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/Badge";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

const records = [
  {
    code: "CSC2010",
    title: "Data Structures",
    checkedInAt: "18 Jun 2026 · 08:42",
    status: "Present",
  },
  {
    code: "CSC2020",
    title: "Discrete Mathematics",
    checkedInAt: "20 Jun 2026 · 13:51",
    status: "Present",
  },
  {
    code: "CSC2030",
    title: "Computer Networks",
    checkedInAt: "—",
    status: "Absent",
  },
];

export default function AttendancePage() {
  return (
    <AppShell title="Attendance">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-ink">Examination attendance</h2>
          <p className="text-sm text-muted">
            Lookup results appear here for visual verification.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[10px] bg-white p-6 panel-shadow">
            <h3 className="text-sm font-semibold text-ink">Summary</h3>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-muted">Present</dt>
                <dd className="text-3xl font-bold tracking-tight tabular-nums text-ink">2</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Absent</dt>
                <dd className="text-3xl font-bold tracking-tight tabular-nums text-brand-red">1</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-[10px] bg-surface-muted px-4 py-3 text-sm text-muted">
              Attendance is recorded when you check in at the venue with your student QR.
            </div>
          </section>

          <section className="rounded-[10px] bg-white p-6 panel-shadow">
            <h3 className="text-sm font-semibold text-ink">Recent records</h3>
            <ul className="mt-4 space-y-3">
              {records.map((row) => (
                <li
                  key={row.code}
                  className="flex items-center justify-between gap-3 rounded-[10px] bg-surface-muted/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-ink" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{row.title}</p>
                      <p className="text-xs text-muted">
                        {row.code} · {row.checkedInAt}
                      </p>
                    </div>
                  </div>
                  <Badge tone={row.status === "Present" ? "success" : "danger"}>
                    {row.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
