import type { SessionUser, StudentProfile } from "@/lib/types";

const ACCESS_KEY = "student_access_token";
const REFRESH_KEY = "student_refresh_token";
const PROFILE_KEY = "student_profile";

export function saveSession(
  accessToken: string,
  refreshToken: string,
  profile: StudentProfile,
) {
  if (typeof window === "undefined") return;

  const previousIdentity = getStoredProfile()?.computerNumber;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  if (previousIdentity && previousIdentity !== profile.computerNumber) window.location.reload();
  document.cookie = `student_session=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PROFILE_KEY);
  document.cookie = "student_session=; path=/; max-age=0; SameSite=Lax";
  window.dispatchEvent(new Event("student-session-cleared"));
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function profileToSessionUser(profile: StudentProfile): SessionUser {
  return {
    name: profile.fullName,
    role: "student",
    computerNumber: profile.computerNumber,
    school: profile.school,
    programme: profile.programme,
    currentYear: profile.currentYear,
    accountStatus: profile.accountStatus,
  };
}

export function getSessionUser(): SessionUser | null {
  const profile = getStoredProfile();
  if (!profile) return null;
  return profileToSessionUser(profile);
}

export function isAuthenticated() {
  return Boolean(getAccessToken() && getStoredProfile());
}

// A session change in another tab must discard every mounted student view.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === PROFILE_KEY ||
        (event.key === ACCESS_KEY && !event.newValue)) {
      window.location.reload();
    }
  });
}
