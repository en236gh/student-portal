"use client";

import { PassPreview } from "@/components/exams/PassPreview";
import { AppShell } from "@/components/shell/AppShell";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PassPageContent() {
  const searchParams = useSearchParams();
  const academicYear = searchParams.get("academicYear") || undefined;
  const semesterParam = searchParams.get("semester");
  const semester = semesterParam || undefined;

  return (
    <AppShell title="Examination pass">
      <PassPreview key={`${academicYear || ""}:${semester || ""}`} period={{ academicYear, semester }} />
    </AppShell>
  );
}

export default function PassPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Examination pass">
          <div className="rounded-[10px] bg-white p-10 text-center panel-shadow">
            <p className="text-sm text-muted">Loading examination pass…</p>
          </div>
        </AppShell>
      }
    >
      <PassPageContent />
    </Suspense>
  );
}
