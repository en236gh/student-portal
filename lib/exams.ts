import type {
  ExaminationPass,
  ExaminationPassPeriod,
  StudentExamination,
} from "@/lib/types";

export function formatExamDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatExamTime(value?: string | null) {
  if (!value) return "—";

  // Accept "09:00:00", "09:00", or ISO datetime
  const timePart = value.includes("T")
    ? value.split("T")[1]?.slice(0, 5)
    : value.slice(0, 5);

  return timePart || value;
}

export function formatExamWindow(
  exam: Pick<StudentExamination, "examDate" | "startTime" | "endTime">,
) {
  return `${formatExamDate(exam.examDate)} · ${formatExamTime(exam.startTime)} – ${formatExamTime(exam.endTime)}`;
}

export function periodKey(period: ExaminationPassPeriod) {
  return `${period.academicYear ?? ""}::${period.semester ?? ""}`;
}

export function samePeriod(
  a: ExaminationPassPeriod,
  b: ExaminationPassPeriod,
) {
  return (
    String(a.academicYear ?? "") === String(b.academicYear ?? "") &&
    String(a.semester ?? "") === String(b.semester ?? "")
  );
}

export function passHref(period: ExaminationPassPeriod) {
  const params = new URLSearchParams();
  if (period.academicYear) params.set("academicYear", period.academicYear);
  if (period.semester !== undefined && period.semester !== "") {
    params.set("semester", String(period.semester));
  }
  const query = params.toString();
  return query ? `/exams/pass?${query}` : "/exams/pass";
}

export function normalizePass(pass: ExaminationPass) {
  const student = pass.student;

  return {
    passId: pass.passId,
    academicYear: pass.academicYear,
    semester: pass.semester,
    computerNumber: pass.computerNumber || student?.computerNumber || "—",
    fullName: pass.fullName || student?.fullName || "—",
    school: pass.school || student?.school || "—",
    programme: pass.programme || student?.programme || "—",
    currentYear: pass.currentYear ?? student?.currentYear ?? "—",
    qrImageBase64: pass.qrImageBase64,
    expiresAt: pass.expiresAt || null,
    examinations: (pass.examinations || []).map((exam) => ({
      examSessionId: exam.examSessionId,
      courseCode: exam.courseCode || "—",
      examDate: exam.examDate || "",
      startTime: exam.startTime || "",
      endTime: exam.endTime || "",
      examType: exam.examType || "—",
      venueName: exam.venueName || "—",
      building: exam.building || "—",
      seatNumber: exam.seatNumber ?? "—",
    })),
  };
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Delay revoke so mobile Safari can finish the download handoff
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function examStatusTone(status: string) {
  const value = status.toUpperCase();
  if (value.includes("COMPLETE") || value.includes("CLOSED")) return "neutral" as const;
  if (value.includes("LIVE") || value.includes("IN_PROGRESS")) return "success" as const;
  if (value.includes("CANCEL")) return "danger" as const;
  return "info" as const;
}
