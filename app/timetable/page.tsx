"use client";

import { AppShell } from "@/components/shell/AppShell";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const slots = [
  { day: "Thursday", date: "31 Jul", item: "CSC3010 · Database Systems · 09:00 · Hall A" },
  { day: "Saturday", date: "02 Aug", item: "CSC3020 · Software Engineering · 14:00 · Lab 2" },
  { day: "Monday", date: "04 Aug", item: "No sitting allocated" },
];

export default function TimetablePage() {
  return (
    <AppShell title="Timetable">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-ink">Exam timetable</h2>
          <p className="text-sm text-muted">
            Your examination schedule for the current session.
          </p>
        </div>

        <div className="rounded-[10px] bg-white p-6 panel-shadow">
          <ul className="space-y-4">
            {slots.map((slot) => (
              <li
                key={slot.date}
                className="flex items-start gap-4 border-b border-black/5 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-surface-muted text-ink">
                  <CalendarDaysIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {slot.day} · {slot.date}
                  </p>
                  <p className="mt-1 text-sm text-muted">{slot.item}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
