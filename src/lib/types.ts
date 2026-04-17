export type Role = 'staff' | 'manager' | 'admin';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type TaskCategory = 'kpi' | 'adhoc';
export type TaskFrequency = 'yearly' | 'quarterly' | 'monthly' | 'weekly' | 'once';
export type ProgramType = 'degree' | 'certificate' | 'short_course' | 'event';
export type ReviewStatus = 'open' | 'in_review' | 'closed';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type Phase = 'preparation' | 'execution' | 'post';

// Vai trò tổ chức — 1 người có thể kiêm nhiệm nhiều vai trò
export type UserRole =
  | 'operation'              // Điều phối / Operation staff
  | 'coordinator_director'   // Chủ nhiệm CT đồng thời là điều phối
  | 'manager'                // Quản lý
  | 'institute_leader';      // Lãnh đạo viện đào tạo

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
}

export interface Course {
  id: string;
  programId: string;
  name: string;
  cohort: string;
  numLecturers: number;
  numStudents: number;
  attendanceRate: number;
  attendanceTarget: number;
  passRate: number;
  passTarget: number;
  submitRate: number;
}

export interface TaskTemplate {
  id: string;
  name: string;
  phase: Phase;
  defaultDurationDays: number;
  requiresEvidence: boolean;
  evidenceDescription?: string;
}

export interface Task {
  id: string;
  templateId: string | null;
  parentId: string | null;
  category: TaskCategory;
  frequency: TaskFrequency;
  kpiDefinitionId: string | null;
  title: string;
  description: string;
  ownerId: string;
  programId: string;
  dueDate: string;
  status: TaskStatus;
  progress: number;
  evidenceUrl: string | null;
  issueFlag: boolean;
  issueNote: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requiresEvidence: boolean;
  courseName?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: { id: string; userId: string; content: string; createdAt: string }[];
}

export interface KPIDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  formulaType: string;
  weight: number;
  thresholds: { excellent: number; good: number; warning: number; critical: number };
  unit: string;
}

export interface KPISnapshot {
  id: string;
  userId: string;
  kpiDefinitionId: string;
  period: string;
  score: number;
  rawNumerator: number;
  rawDenominator: number;
  calculatedAt: string;
}

// KPI detail items for drill-down (e.g. 7 courses for "6/7" score)
export interface KPIDetailItem {
  id: string;
  kpiSnapshotId: string;
  label: string;        // e.g. "Business Strategy"
  achieved: boolean;
  note: string;
  relatedTaskId?: string;
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

export type NotificationType = 'overdue' | 'reminder' | 'kpi_warning' | 'review' | 'system' | 'assignment' | 'completion' | 'escalation';
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
  taskId?: string;
  actionUrl?: string;
  actionLabel?: string;
  category: 'task' | 'kpi' | 'review' | 'system';
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
  oldNumerator: number;
  oldDenominator: number;
  // New values
  newScore: number;
  newNumerator: number;
  newDenominator: number;
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
  contextType: 'kpi' | 'task' | 'course' | 'general';
  contextId: string;          // reference ID (kpi def id, task id, course id)
  status: QuestionStatus;
  createdAt: string;
  answer: string;             // staff's answer
  answeredAt: string | null;
  managerReply: string;       // manager's follow-up reply
  repliedAt: string | null;
}
