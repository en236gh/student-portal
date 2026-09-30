"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listExaminationNotifications, markExaminationNotificationRead } from "@/lib/api";
import type { ExaminationNotification } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function ExaminationNotices() {
  const [notices, setNotices] = useState<ExaminationNotification[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | number | null>(null);
  const previous = useRef<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await listExaminationNotifications();
      const next = data || [];
      const signature = JSON.stringify(next);
      if (signature !== previous.current) {
        previous.current = signature;
        window.dispatchEvent(new Event("examinations-updated"));
      }
      setNotices(next);
      setError("");
    } catch (err) {
      setNotices([]);
      setError(err instanceof Error ? err.message : "Unable to load notices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    window.addEventListener("focus", load);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  async function markRead(id: string | number) {
    setBusy(id);
    try {
      await markExaminationNotificationRead(id);
      window.dispatchEvent(new Event("examinations-updated"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to mark notice as read");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mb-6 space-y-3 rounded-[10px] bg-white p-4 panel-shadow print:hidden" aria-label="Examination notices">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Examination notices</h2>
        <Button size="sm" variant="secondary" onClick={load} disabled={loading}>Refresh notices</Button>
      </div>
      {loading ? <p className="text-sm text-muted">Loading notices…</p> : error ? <p role="alert" className="text-sm text-brand-red">{error}</p> : notices.length === 0 ? <p className="text-sm text-muted">No notices available.</p> : notices.map((notice) => (
        <article key={notice.id} className="border-t border-black/10 pt-3">
          <h3 className="text-sm font-semibold">{notice.title || "Examination update"}</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{notice.message}</p>
          {!notice.isRead && <Button size="sm" variant="secondary" className="mt-2" disabled={busy !== null} onClick={() => markRead(notice.id)}>{busy === notice.id ? "Saving…" : "Mark as read"}</Button>}
        </article>
      ))}
    </section>
  );
}
