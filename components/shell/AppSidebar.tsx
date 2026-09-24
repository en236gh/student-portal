"use client";

import {
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", label: "dashboard", icon: HomeIcon },
  { href: "/exams", label: "my exams", icon: AcademicCapIcon },
  { href: "/attendance", label: "attendance", icon: ClipboardDocumentCheckIcon },
  
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[290px] flex-col rounded-r-[10px] bg-white sidebar-shadow">
      <div className="flex items-center justify-center px-6 pt-8 pb-4">
        <Image
          src="/UNZA.png"
          alt="University of Zambia"
          width={144}
          height={144}
          className="h-36 w-36 object-contain"
          priority
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-ink text-white shadow-lg shadow-black/10"
                  : "text-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-[10px] px-3 py-3 text-left text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface-muted hover:text-ink"
        >
          sign out
        </button>
      </div>
    </aside>
  );
}
