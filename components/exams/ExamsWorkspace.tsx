"use client";

import { ExamCard } from "@/components/exams/ExamCard";
import { listMyExaminations } from "@/lib/api";
import { periodKey, isPublishedExam } from "@/lib/exams";
import type { StudentExamination } from "@/lib/types";
import { ApiError } from "@/lib/types";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

export function ExamsWorkspace() {
  const request = useRef(0);
  const [exams, setExams] = useState<StudentExamination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const version = ++request.current;
    setLoading(true);
    setError("");
    setExams([]);
    try {
      const result = await listMyExaminations();
      if (version !== request.current) return;
      setExams((result.data || []).filter(isPublishedExam));
    } catch (err) {
      if (version !== request.current) return;
      if (err instanceof ApiError && err.status === 401) return;
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load examinations. The API may be unavailable.",
      );
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    return () => {
      // Invalidate in-flight requests when this view unmounts.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
      window.clearTimeout(initialLoad);
    };
  }, [load]);

  useEffect(() => {
    window.addEventListener("examinations-updated", load);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("examinations-updated", load);
      window.removeEventListener("focus", load);
    };
  }, [load]);

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
        <button className="ml-3 underline" onClick={load}>Retry</button>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[10px] bg-white p-8 text-center panel-shadow">
        <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
          <AcademicCapIcon className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-ink">No eligible examinations</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Your eligible published examinations will appear here when available.
        </p>
      </div>
    );
  }

  const groups = new Map<string, StudentExamination[]>();
  for (const exam of exams) {
    const key = periodKey(exam);
    groups.set(key, [...(groups.get(key) || []), exam]);
  }
  return <div className="space-y-4">
    <button className="text-sm underline" onClick={load}>Refresh examinations</button>
    {Array.from(groups, ([key, items]) => (
      <ExamCard key={key} exams={items} onPassGenerated={() => void load()} />
    ))}
  </div>;
}
