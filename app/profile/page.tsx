"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Badge } from "@/components/ui/Badge";
import { getSessionUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return (
    <AppShell title="Profile">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-ink">Student profile</h2>
          <p className="text-sm text-muted">
            Non-sensitive account details returned by the authentication service.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[10px] bg-white p-6 panel-shadow">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-muted">Full name</dt>
                <dd className="text-sm font-semibold text-ink">{user?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Computer number</dt>
                <dd className="font-mono text-sm font-medium text-ink">
                  {user?.computerNumber ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">School</dt>
                <dd className="text-sm font-medium text-ink">{user?.school ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Programme</dt>
                <dd className="text-sm font-medium text-ink">{user?.programme ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Year of study</dt>
                <dd className="text-sm font-medium text-ink">
                  {user?.currentYear ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Account status</dt>
                <dd className="mt-1">
                  <Badge
                    tone={
                      user?.accountStatus === "ACTIVE" ? "success" : "warning"
                    }
                  >
                    {user?.accountStatus ?? "Unknown"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </section>

          <section className="flex min-h-[280px] flex-col items-center justify-center rounded-[10px] bg-white p-6 text-center panel-shadow">
            <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
              <QrCodeIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">Check-in QR</h3>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Your venue check-in code will appear here once issued by the attendance service.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
