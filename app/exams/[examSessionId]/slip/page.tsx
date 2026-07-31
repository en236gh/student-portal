"use client";

import { SlipPreview } from "@/components/exams/SlipPreview";
import { AppShell } from "@/components/shell/AppShell";
import { use } from "react";

export default function SlipPage({
  params,
}: {
  params: Promise<{ examSessionId: string }>;
}) {
  const { examSessionId } = use(params);

  return (
    <AppShell title="Examination slip">
      <SlipPreview examSessionId={examSessionId} />
    </AppShell>
  );
}
