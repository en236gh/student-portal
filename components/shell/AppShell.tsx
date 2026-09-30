"use client";

import { ExaminationNotices } from "@/components/notifications/ExaminationNotices";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { getSessionUser, isAuthenticated } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const clear = () => {
      setReady(false);
      setUser(null);
      router.replace("/login");
    };
    window.addEventListener("student-session-cleared", clear);
    const initialize = window.setTimeout(() => {
      setUser(getSessionUser());
      setReady(isAuthenticated());
    }, 0);
    return () => {
      window.clearTimeout(initialize);
      window.removeEventListener("student-session-cleared", clear);
    };
  }, [router]);

  if (!ready || !user) {
    return (
      <div className="page-canvas flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  return (
    <div className="page-canvas min-h-screen">
      <AppSidebar />
      <main className="min-h-screen pl-[290px]">
        <div className="animate-fade-up p-4 md:p-8">
          <AppHeader title={title} user={user} />
          <ExaminationNotices />
          {children}
        </div>
      </main>
    </div>
  );
}
