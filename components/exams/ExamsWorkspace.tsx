"use client";

import { ExamCard } from "@/components/exams/ExamCard";
import { listMyExaminations } from "@/lib/api";
import { samePeriod } from "@/lib/exams";
import type { StudentExamination } from "@/lib/types";
import { ApiError } from "@/lib/types";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

export function ExamsWorkspace() {
  const [exams, setExams] = useState<StudentExamination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listMyExaminations();
      setExams(result.data || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load examinations. The API may be unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handlePassGenerated(updated: StudentExamination) {
    setExams((current) =>
      current.map((exam) =>
        samePeriod(exam, updated)
          ? {
              ...exam,
              passGenerated: true,
              passId: updated.passId,
            }
          : exam,
      ),
    );
  }

  if (loading) {
    return (
      <div className="rounded-[10px] bg-white p-10 text-center panel-shadow">
        <p className="text-sm text-muted">Loading your examinations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[10px] bg-brand-red/5 px-4 py-3 text-sm text-brand-red">
        {error}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[10px] bg-white p-8 text-center panel-shadow">
        <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
          <AcademicCapIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-ink">No examinations yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Registered courses with exam sessions will appear here once allocated.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {exams.map((exam) => (
        <ExamCard
          key={String(exam.examSessionId)}
          exam={exam}
          onPassGenerated={handlePassGenerated}
        />
      ))}
    </div>
  );
}
