export type Role = 'staff' | 'manager' | 'admin';
export type ProgramType = 'degree' | 'certificate' | 'short_course' | 'event';
export type ReviewStatus = 'open' | 'in_review' | 'closed';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type Phase = 'preparation' | 'execution' | 'post';

// Vai trò tổ chức — 1 người có thể kiêm nhiệm nhiều vai trò
export type UserRole =
  | 'operation'              // Điều phối / Operation staff
  | 'coordinator_director'   // Chủ nhiệm CT đồng thời là điều phối
  | 'manager'                // Quản lý
  | 'institute_leader'       // Lãnh đạo viện đào tạo
  | 'admin';                 // Quản trị viên

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roles: UserRole[];         // Multi-role: 1 người kiêm nhiệm nhiều vai trò
  managerId: string | null;
  avatarUrl: string;
  active: boolean;
  position: string;
}

export interface Program {
  id: string;
  name: string;
  type: ProgramType;
  status: 'active' | 'archived';
  shortName: string;
  managerId: string;           // Person in charge
  secondaryManagerId?: string; // Optional second person in charge (e.g. for BTEC)
}

// Matching Image 2 columns
export interface Course {
  id: string;
  programId: string;
  name: string;
  cohort: string;
  numLecturers: number;
  numStudents: number;
  // Kỷ luật
  attendanceRate: number;      // Tỉ lệ đi học trung bình
  attendanceTarget: number;    // Mục tiêu kỷ luật
  // Học tập
  passRate: number;            // Tỉ lệ pass trung bình
  submitRate: number;          // Tỉ lệ nộp bài lần đầu đúng hạn
  passTarget: number;          // Mục tiêu học tập
}

export type KPIGroupId = 'operations' | 'academic_support' | 'student_results' | 'other_activities' | 'labor_discipline';

export interface KPIGroup {
  id: KPIGroupId;
  name: string;
  weight: number;             // Total weight of this group (e.g. 50, 20, 10, 10, 10)
}

export interface KPIDefinition {
  id: string;
  groupId: KPIGroupId;
  stt: number;                // Sequence number from Image 1 (1-10)
  name: string;
  shortName: string;
  description: string;
  criteria: string;           // Tiêu chí column in Image 1
  unit: string;
  weight?: number;
  weightInGroup?: number;     // Weight within the group if applicable
}

export interface KPISnapshot {
  id: string;
  userId: string;
  kpiDefinitionId: string;
  period: string;
  score: number;
  targetValue: number;        // Số lượng được giao
  actualValue: number;        // Số lượng hoàn thành
  managerScore?: number;      // Đánh giá của line manager
  leaderScore?: number;       // Đánh giá của trưởng ban
  calculatedAt: string;
  rawNumerator?: number;
  rawDenominator?: number;
}

// For Groups with complex sub-structures
export interface OtherActivityRecord {
  userId: string;
  period: string;
  admission: boolean;         // Tuyển sinh (25%)
  studyAbroad: boolean;      // Hỗ trợ du học (25%)
  exchange: boolean;          // Hỗ trợ exchange (25%)
  otherInstitute: boolean;    // Các hđ khác của Viện (25%)
  updatedAt: string;
}

export interface LaborDisciplineRecord {
  userId: string;
  period: string;
  score: number;              // 0-100
  note: string;
  updatedBy: string;          // Manager ID
  updatedAt: string;
}

// KPI detail items for drill-down (e.g. 7 courses for "6/7" score)
export interface KPIDetailItem {
  id: string;
  kpiSnapshotId: string;
  label: string;        // e.g. "Business Strategy"
  achieved: boolean;
  note: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reviewDeadline: string;
  status: ReviewStatus;
}

export interface Review {
  id: string;
  userId: string;
  cycleId: string;
  selfNote: string;
  managerNote: string;
  adjustedScore: number | null;
  adjustmentReason: string;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export type NotificationType = 'kpi_warning' | 'review' | 'system' | 'escalation';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  severity: AlertSeverity;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  category: 'kpi' | 'review' | 'system';
}

// ==================== KPI EDIT REQUEST ====================
export type KPIEditStatus = 'pending' | 'approved' | 'rejected';

export interface KPIEditRequest {
  id: string;
  snapshotId: string;         // which KPI snapshot to edit
  userId: string;             // staff who requested the edit
  kpiDefinitionId: string;
  period: string;
  // Old values
  oldScore: number;
  oldActualValue: number;
  oldNumerator?: number;
  oldDenominator?: number;
  // New values
  newScore: number;
  newActualValue: number;
  newNumerator?: number;
  newDenominator?: number;
  // Workflow
  reason: string;             // required reason for the edit
  status: KPIEditStatus;
  requestedAt: string;
  reviewedBy: string | null;  // manager who reviewed
  reviewedAt: string | null;
  reviewNote: string;         // manager's note on approval/rejection
}

// ==================== COURSE EDIT REQUEST ====================
export type CourseEditField = 'attendanceRate' | 'passRate' | 'submitRate' | 'numLecturers' | 'numStudents';

export interface CourseEditRequest {
  id: string;
  courseId: string;
  userId: string;            // who requested
  field: CourseEditField;
  fieldLabel: string;        // human-readable field name
  oldValue: number;
  newValue: number;
  reason: string;
  status: KPIEditStatus;     // reuse same status type
  requestedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string;
}

// ==================== MANAGER QUESTIONS ====================
export type QuestionStatus = 'open' | 'answered' | 'closed';

export interface ManagerQuestion {
  id: string;
  fromUserId: string;         // manager who asked
  toUserId: string;           // staff who is being asked
  subject: string;            // question subject
  question: string;           // full question text
  context: string;            // context: KPI name, metric, score, etc.
  contextType: 'kpi' | 'course' | 'general';
  contextId: string;          // reference ID (kpi def id, course id)
  status: QuestionStatus;
  createdAt: string;
  answer: string;             // staff's answer
  answeredAt: string | null;
  managerReply: string;       // manager's follow-up reply
  repliedAt: string | null;
}

