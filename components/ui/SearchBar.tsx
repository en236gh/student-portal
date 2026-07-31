"use client";

import { MagnifyingGlassIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

export function SearchBar({
  placeholder = "Search exams, courses…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "hidden h-12 max-w-md flex-1 items-center gap-3 rounded-[10px] bg-surface-muted px-4 text-muted transition-colors duration-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-ink/5 sm:flex",
        className,
      )}
    >
      <MagnifyingGlassIcon className="h-5 w-5 shrink-0" />
      <input
        type="search"
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
      />
      <MicrophoneIcon className="h-5 w-5 shrink-0 opacity-60" />
    </label>
  );
}
