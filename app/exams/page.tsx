"use client";

import { ExamsWorkspace } from "@/components/exams/ExamsWorkspace";
import { AppShell } from "@/components/shell/AppShell";

export default function ExamsPage() {
  return (
    <AppShell title="My exams">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-ink">My examinations</h2>
          <p className="text-sm text-muted">
            Generate a slip for each allocated sitting, then download the PDF to
            print and bring to the venue.
          </p>
        </div>

        <ExamsWorkspace />
      </div>
    </AppShell>
  );
}
