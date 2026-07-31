import { SearchBar } from "@/components/ui/SearchBar";
import type { SessionUser } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppHeader({
  title,
  user,
}: {
  title: string;
  user: SessionUser;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h1>

      <div className="flex flex-1 items-center justify-end gap-3 sm:justify-center">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3 rounded-[10px] bg-white/70 px-3 py-2 backdrop-blur">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-brand-gold to-amber-500 text-sm font-bold text-white">
          {initials(user.name) || "ST"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="truncate text-xs capitalize text-muted">{user.role}</p>
        </div>
      </div>
    </header>
  );
}
