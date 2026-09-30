export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type StudentProfile = {
  computerNumber: string;
  fullName: string;
  school: string;
  programme: string;
  currentYear: number;
  accountStatus: string;
  accountActivated: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  profile: StudentProfile;
};

export type ActivateAccountPayload = {
  computerNumber: string;
  nationalId: string;
  password: string;
  confirmPassword: string;
};

export type LoginPayload = {
  computerNumber: string;
  password: string;
};

export type SessionUser = {
  name: string;
  role: string;
  computerNumber: string;
  school?: string;
  programme?: string;
  currentYear?: number;
  accountStatus?: string;
};

export type StudentExamination = {
  examSessionId: number | string;
  courseCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: string | number;
  examType: string;
  examStatus: string;
  allocated: boolean;
  venueName: string | null;
  building: string | null;
  seatNumber: string | number | null;
  passGenerated: boolean;
  passId: number | string | null;
  attendanceStatus?: string | null;
};

export type ExaminationPassPeriod = {
  academicYear?: string;
  semester?: string | number;
};

export type ExaminationPassExam = {
  examSessionId?: number | string;
  courseCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  academicYear?: string;
  semester?: string | number;
  examType?: string;
  examStatus?: string;
  venueName: string | null;
  building?: string | null;
  seatNumber: string | number | null;
};

export type ExaminationPass = {
  passId: number | string;
  academicYear: string;
  semester: string | number;
  computerNumber: string;
  fullName: string;
  school?: string;
  programme?: string;
  currentYear?: number;
  qrToken: string;
  qrImageBase64: string;
  generatedAt?: string | null;
  expiresAt?: string | null;
  examinations: ExaminationPassExam[];
  student?: {
    computerNumber: string;
    fullName: string;
    school?: string;
    programme?: string;
    currentYear?: number;
  };
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ExaminationNotification = {
  id: string | number;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
};
