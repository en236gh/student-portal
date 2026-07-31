import type { ExaminationSlip, StudentExamination } from "@/lib/types";

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

export function formatExamWindow(exam: Pick<StudentExamination, "examDate" | "startTime" | "endTime">) {
  return `${formatExamDate(exam.examDate)} · ${formatExamTime(exam.startTime)} – ${formatExamTime(exam.endTime)}`;
}

export function normalizeSlip(slip: ExaminationSlip): {
  slipId: string | number;
  examSessionId: string | number;
  computerNumber: string;
  fullName: string;
  school: string;
  programme: string;
  currentYear: string | number;
  courseCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: string | number;
  examType: string;
  venueName: string;
  building: string;
  seatNumber: string | number;
  qrImageBase64: string;
} {
  const student = slip.student;
  const exam = slip.exam;

  return {
    slipId: slip.slipId,
    examSessionId: slip.examSessionId,
    computerNumber: slip.computerNumber || student?.computerNumber || "—",
    fullName: slip.fullName || student?.fullName || "—",
    school: slip.school || student?.school || "—",
    programme: slip.programme || student?.programme || "—",
    currentYear: slip.currentYear ?? student?.currentYear ?? "—",
    courseCode: slip.courseCode || exam?.courseCode || "—",
    examDate: slip.examDate || exam?.examDate || "",
    startTime: slip.startTime || exam?.startTime || "",
    endTime: slip.endTime || exam?.endTime || "",
    academicYear: slip.academicYear || exam?.academicYear || "—",
    semester: slip.semester ?? exam?.semester ?? "—",
    examType: slip.examType || exam?.examType || "—",
    venueName: slip.venueName || exam?.venueName || "—",
    building: slip.building || exam?.building || "—",
    seatNumber: slip.seatNumber ?? exam?.seatNumber ?? "—",
    qrImageBase64: slip.qrImageBase64,
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
