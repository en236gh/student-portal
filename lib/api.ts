import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "@/lib/auth";
import type {
  ActivateAccountPayload,
  ApiResponse,
  AuthTokens,
  ExaminationPass,
  ExaminationPassPeriod,
  LoginPayload,
  StudentExamination,
  StudentProfile,
} from "@/lib/types";
import { ApiError } from "@/lib/types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://fourth-91rl.onrender.com";

async function readJson<T>(res: Response): Promise<ApiResponse<T> | null> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const body = await readJson<T>(res);

  if (!res.ok || !body?.success) {
    throw new ApiError(
      body?.message || `Request failed (${res.status})`,
      res.status,
    );
  }

  return body;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const result = await refreshStudentToken(refreshToken);
    saveSession(
      result.data.accessToken,
      result.data.refreshToken,
      result.data.profile,
    );
    return result.data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

type AuthFetchOptions = RequestInit & {
  /** When true, 401 redirects to login after refresh fails. Default true. */
  redirectOnUnauthorized?: boolean;
};

export async function authFetch(
  path: string,
  options: AuthFetchOptions = {},
): Promise<Response> {
  const { redirectOnUnauthorized = true, headers, ...rest } = options;

  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        ...(headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let token = getAccessToken();
  let res = await doFetch(token);

  if (res.status === 401) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      token = nextToken;
      res = await doFetch(token);
    }
  }

  if (res.status === 401) {
    clearSession();
    if (redirectOnUnauthorized && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  return res;
}

export async function activateAccount(payload: ActivateAccountPayload) {
  const res = await fetch(`${API_BASE}/api/student/auth/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<StudentProfile & { accountActivated: boolean }>(res);
}

export async function loginStudent(payload: LoginPayload) {
  const res = await fetch(`${API_BASE}/api/student/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthTokens>(res);
}

export async function refreshStudentToken(refreshToken: string) {
  const res = await fetch(`${API_BASE}/api/student/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  return parseResponse<AuthTokens>(res);
}

export async function getStudentProfile(accessToken: string) {
  const res = await fetch(`${API_BASE}/api/student/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseResponse<StudentProfile>(res);
}

function examinationPassQuery(period: ExaminationPassPeriod = {}) {
  const params = new URLSearchParams();
  if (period.academicYear) params.set("academicYear", period.academicYear);
  if (period.semester !== undefined && period.semester !== "") {
    params.set("semester", String(period.semester));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listMyExaminations() {
  const res = await authFetch("/api/student/examinations");
  return parseResponse<StudentExamination[]>(res);
}

export async function generateExaminationPass(period: ExaminationPassPeriod = {}) {
  const res = await authFetch(
    `/api/student/examination-pass${examinationPassQuery(period)}`,
    { method: "POST" },
  );
  return parseResponse<ExaminationPass>(res);
}

export async function getExaminationPass(period: ExaminationPassPeriod = {}) {
  const res = await authFetch(
    `/api/student/examination-pass${examinationPassQuery(period)}`,
  );
  return parseResponse<ExaminationPass>(res);
}

export async function downloadExaminationPassPdf(
  period: ExaminationPassPeriod = {},
  computerNumber: string,
) {
  const res = await authFetch(
    `/api/student/examination-pass/pdf${examinationPassQuery(period)}`,
  );

  if (!res.ok) {
    const body = await readJson<unknown>(res);
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: string }).message)
        : `Unable to download PDF (${res.status})`;
    throw new ApiError(message, res.status);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || `exam-pass-${computerNumber}.pdf`;

  return { blob, filename };
}
