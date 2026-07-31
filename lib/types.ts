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
  slipGenerated: boolean;
  slipId: number | string | null;
};

export type ExaminationSlip = {
  slipId: number | string;
  examSessionId: number | string;
  computerNumber: string;
  fullName: string;
  school?: string;
  programme?: string;
  currentYear?: number;
  courseCode?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  academicYear?: string;
  semester?: string | number;
  examType?: string;
  venueName: string;
  building?: string | null;
  seatNumber: string | number;
  qrToken: string;
  qrImageBase64: string;
  student?: {
    computerNumber: string;
    fullName: string;
    school?: string;
    programme?: string;
    currentYear?: number;
  };
  exam?: {
    courseCode?: string;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    academicYear?: string;
    semester?: string | number;
    examType?: string;
    venueName?: string;
    building?: string | null;
    seatNumber?: string | number;
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
