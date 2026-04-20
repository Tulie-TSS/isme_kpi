import { User, Program, Course, KPIDefinition, KPISnapshot, ReviewCycle, Review, Notification, TaskTemplate, KPIDetailItem, Task, KPIEditRequest, CourseEditRequest, CourseEditField, ManagerQuestion, UserRole } from './types';
export { tasks, getTaskChildren, getTaskParent, getTaskAncestors, getTopLevelTasks, calculateTaskProgress } from './mock-tasks';

// ==================== USERS ====================
export const users: User[] = [
  { id: 'u1', name: 'Hồ Hoàng Lan', email: 'lan.hh@isme.edu.vn', role: 'manager', roles: ['manager', 'institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Trưởng Ban Đào tạo đại học' },
  { id: 'u2', name: 'Bùi Thị Quỳnh Trang', email: 'bui.trang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Chủ nhiệm CT Năm 1' },
  { id: 'u3', name: 'Bùi Thu Trang', email: 'bui.thutrang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT Digital Marketing' },
  { id: 'u4', name: 'Trần Hương Thảo', email: 'tran.thao@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BTEC' },
  { id: 'u5', name: 'Trần Thị Bích Ngọc', email: 'tran.ngoc@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT NHTC' },
  { id: 'u6', name: 'Vũ Minh Nhật', email: 'vu.nhat@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT Top-up UWE' },
  { id: 'u7', name: 'Nguyễn Giang Khánh Huyền', email: 'nguyen.huyen@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT Top-up CU' },
  { id: 'u8', name: 'Nguyễn Minh Tuấn', email: 'nguyen.tuan@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BBAE' },
  { id: 'u9', name: 'Đoàn Thu Hương Giang', email: 'doan.giang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BTEC' },
  { id: 'u10', name: 'Đào Ngọc Diệp', email: 'dao.diep@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT Andrews & Lincoln' },
  { id: 'u11', name: 'Phạm Gia Linh', email: 'pham.gialinh@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT' },
  { id: 'u12', name: 'Lê Thanh', email: 'le.thanh@isneu.org', role: 'manager', roles: ['manager', 'institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Lãnh đạo Viện' },
  { id: 'u13', name: 'Trịnh Giang', email: 'trinh.giang@isneu.org', role: 'manager', roles: ['manager', 'institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Lãnh đạo Viện' },
  { id: 'u14', name: 'Nguyễn Chính', email: 'nguyen.chinh@isneu.org', role: 'admin', roles: ['manager', 'institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Admin gốc' },
  { id: 'u15', name: 'Hồ Hoàng Lan (Admin)', email: 'ho.lan@isneu.org', role: 'admin', roles: ['admin'], managerId: null, avatarUrl: '', active: true, position: 'Quản trị viên' },
  { id: 'u0', name: 'Admin System', email: 'admin@isme.edu.vn', role: 'admin', roles: ['manager'], managerId: null, avatarUrl: '', active: true, position: 'Quản trị hệ thống' },
];

// ==================== PROGRAMS ====================
export const programs: Program[] = [
  { id: 'p1', name: 'Năm 1 (Foundation)', type: 'degree', status: 'active', shortName: 'Y1' },
  { id: 'p2', name: 'Digital Marketing', type: 'degree', status: 'active', shortName: 'DM' },
  { id: 'p3', name: 'BTEC HND', type: 'certificate', status: 'active', shortName: 'BTEC' },
  { id: 'p4', name: 'Ngân hàng Tài chính (BScBF)', type: 'degree', status: 'active', shortName: 'NHTC' },
  { id: 'p5', name: 'Top-up UWE', type: 'degree', status: 'active', shortName: 'UWE' },
  { id: 'p6', name: 'Top-up CU', type: 'degree', status: 'active', shortName: 'CU' },
  { id: 'p7', name: 'BBAE', type: 'degree', status: 'active', shortName: 'BBAE' },
  { id: 'p8', name: 'Andrews', type: 'degree', status: 'active', shortName: 'AU' },
  { id: 'p9', name: 'Lincoln', type: 'degree', status: 'active', shortName: 'LN' },
];

// ==================== COURSES (BTEC — Kỳ 2.2526 from Hương Giang) ====================
export const courses: Course[] = [
  { id: 'c1', programId: 'p3', name: 'The Contemporary Business Environment', cohort: '20 Fall', numLecturers: 3, numStudents: 87, attendanceRate: 0.960, attendanceTarget: 0.85, passRate: 0.840, passTarget: 0.75, submitRate: 0.750 },
  { id: 'c2', programId: 'p3', name: 'Management of Human Resources', cohort: '20 Fall', numLecturers: 3, numStudents: 87, attendanceRate: 0.801, attendanceTarget: 0.85, passRate: 0.761, passTarget: 0.75, submitRate: 0.750 },
  { id: 'c3', programId: 'p3', name: 'Accounting Principles', cohort: '20 Fall', numLecturers: 3, numStudents: 86, attendanceRate: 0.941, attendanceTarget: 0.85, passRate: 0.854, passTarget: 0.75, submitRate: 0.750 },
  { id: 'c4', programId: 'p3', name: 'Organisational Behaviour Management', cohort: '20 Spring', numLecturers: 4, numStudents: 110, attendanceRate: 0.960, attendanceTarget: 0.85, passRate: 0.918, passTarget: 0.80, submitRate: 0.750 },
  { id: 'c5', programId: 'p3', name: 'Business Strategy', cohort: '19 Fall', numLecturers: 4, numStudents: 109, attendanceRate: 0.954, attendanceTarget: 0.85, passRate: 0.895, passTarget: 0.80, submitRate: 0.750 },
  { id: 'c6', programId: 'p3', name: 'Marketing Insights and Analytics', cohort: '19 Fall', numLecturers: 2, numStudents: 57, attendanceRate: 0.972, attendanceTarget: 0.85, passRate: 0.905, passTarget: 0.80, submitRate: 0.750 },
  { id: 'c7', programId: 'p3', name: 'Principles of Operations Management', cohort: '19 Fall', numLecturers: 2, numStudents: 56, attendanceRate: 0.900, attendanceTarget: 0.85, passRate: 0.900, passTarget: 0.80, submitRate: 0.750 },
  { id: 'c8', programId: 'p3', name: 'Innovation and Commercialisation', cohort: '20 Fall', numLecturers: 3, numStudents: 74, attendanceRate: 0, attendanceTarget: 0.85, passRate: 0, passTarget: 0.80, submitRate: 0 },
  { id: 'c9', programId: 'p3', name: 'Business Law', cohort: '20 Fall', numLecturers: 3, numStudents: 67, attendanceRate: 0, attendanceTarget: 0.85, passRate: 0, passTarget: 0.80, submitRate: 0 },
];

// ==================== COORDINATOR PROGRAMME STATS (from Excel) ====================
export type CoordinatorStats = {
  userId: string;
  programme: string;
  semester: number;
  totalStudents: number;
  totalClasses: number;
  totalLecturers: number;
  passRateTarget: number;
  passRateActual: number;
  attendanceRateTarget: number;
  attendanceRateActual: number;
};

export const coordinatorProgrammeStats: CoordinatorStats[] = [
  { userId: 'u2', programme: 'Năm 1', semester: 2, totalStudents: 1200, totalClasses: 41, totalLecturers: 35, passRateTarget: 0.80, passRateActual: 0.82, attendanceRateTarget: 0.85, attendanceRateActual: 0.88 },
  { userId: 'u3', programme: 'Digital Marketing', semester: 2, totalStudents: 320, totalClasses: 9, totalLecturers: 8, passRateTarget: 0.80, passRateActual: 0.85, attendanceRateTarget: 0.85, attendanceRateActual: 0.90 },
  { userId: 'u4', programme: 'BTEC HND', semester: 2, totalStudents: 620, totalClasses: 27, totalLecturers: 22, passRateTarget: 0.75, passRateActual: 0.86, attendanceRateTarget: 0.85, attendanceRateActual: 0.93 },
  { userId: 'u5', programme: 'NHTC (BScBF)', semester: 2, totalStudents: 180, totalClasses: 15, totalLecturers: 12, passRateTarget: 0.80, passRateActual: 0.88, attendanceRateTarget: 0.85, attendanceRateActual: 0.91 },
  { userId: 'u6', programme: 'Top-up UWE', semester: 2, totalStudents: 150, totalClasses: 12, totalLecturers: 10, passRateTarget: 0.80, passRateActual: 0.83, attendanceRateTarget: 0.85, attendanceRateActual: 0.87 },
  { userId: 'u7', programme: 'Top-up CU', semester: 2, totalStudents: 120, totalClasses: 14, totalLecturers: 9, passRateTarget: 0.80, passRateActual: 0.85, attendanceRateTarget: 0.85, attendanceRateActual: 0.89 },
  { userId: 'u8', programme: 'BBAE', semester: 2, totalStudents: 200, totalClasses: 20, totalLecturers: 15, passRateTarget: 0.80, passRateActual: 0.79, attendanceRateTarget: 0.85, attendanceRateActual: 0.84 },
  { userId: 'u9', programme: 'BTEC HND', semester: 2, totalStudents: 733, totalClasses: 27, totalLecturers: 25, passRateTarget: 0.78, passRateActual: 0.80, attendanceRateTarget: 0.89, attendanceRateActual: 0.65 },
  { userId: 'u10', programme: 'Andrews & Lincoln', semester: 2, totalStudents: 95, totalClasses: 10, totalLecturers: 8, passRateTarget: 0.80, passRateActual: 0.87, attendanceRateTarget: 0.85, attendanceRateActual: 0.92 },
];

export function getCoordinatorStats(userId: string): CoordinatorStats | undefined {
  return coordinatorProgrammeStats.find(s => s.userId === userId);
}

export const kpiDefinitions: KPIDefinition[] = [
  { id: 'kpi1', name: 'Tài liệu giảng dạy đầy đủ', shortName: 'Tài liệu GD', description: 'Tỷ lệ môn học có đầy đủ SoW, Assessment Plan, Assignment Brief', formulaType: 'material_compliance', weight: 15, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: '%' },
  { id: 'kpi2', name: 'Thủ tục hợp đồng GV', shortName: 'HĐ Giảng viên', description: 'Tỷ lệ GV được cập nhật thông tin đúng tiến độ', formulaType: 'contract_compliance', weight: 10, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: '%' },
  { id: 'kpi3', name: 'Tổ chức lớp học', shortName: 'Setup lớp', description: 'Tỷ lệ lớp được setup theo kế hoạch', formulaType: 'class_setup', weight: 15, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: '%' },
  { id: 'kpi4', name: 'Quản lý điểm & đánh giá', shortName: 'QL Điểm', description: 'Tỷ lệ môn học hoàn thành điểm đúng kế hoạch', formulaType: 'grade_management', weight: 15, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: '%' },
  { id: 'kpi5', name: 'Hoạt động ngoại khóa', shortName: 'Ngoại khóa', description: 'Tỷ lệ môn có guest speaker/field trip', formulaType: 'extracurricular', weight: 10, thresholds: { excellent: 80, good: 60, warning: 40, critical: 20 }, unit: '%' },
  { id: 'kpi6', name: 'Rà soát kết quả học tập', shortName: 'Rà soát KQ', description: 'Tỷ lệ môn có file rà soát kết quả', formulaType: 'result_review', weight: 10, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: '%' },
  { id: 'kpi7', name: 'Liêm chính học thuật', shortName: 'Turnitin', description: 'Tỷ lệ môn có báo cáo rà soát Turnitin', formulaType: 'academic_integrity', weight: 10, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: '%' },
  { id: 'kpi8', name: 'Xử lý phản hồi', shortName: 'Phản hồi', description: 'Số kiến nghị SV không được xử lý kịp thời', formulaType: 'feedback_handling', weight: 5, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: 'cases' },
  { id: 'kpi9', name: 'Module report & feedback', shortName: 'Report', description: 'Tỷ lệ môn đã làm feedback và gửi report cho GV', formulaType: 'module_report', weight: 5, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: '%' },
  { id: 'kpi10', name: 'Cập nhật hồ sơ SV', shortName: 'Hồ sơ SV', description: 'Độ trễ cập nhật hồ sơ sinh viên', formulaType: 'student_record', weight: 5, thresholds: { excellent: 95, good: 80, warning: 60, critical: 40 }, unit: 'days' },
];

// ==================== TASK TEMPLATES ====================
export const taskTemplates: TaskTemplate[] = [
  { id: 'tt1', name: 'Gửi DS lớp và TKB cho GV', phase: 'preparation', defaultDurationDays: 7, requiresEvidence: true, evidenceDescription: 'Screenshot email gửi GV' },
  { id: 'tt2', name: 'Nhận syllabus từ GV', phase: 'preparation', defaultDurationDays: 14, requiresEvidence: true, evidenceDescription: 'File syllabus' },
  { id: 'tt3', name: 'Yêu cầu GV up tài liệu Moodle', phase: 'preparation', defaultDurationDays: 14, requiresEvidence: true, evidenceDescription: 'Screenshot Moodle' },
  { id: 'tt4', name: 'GV gửi Assessment Plan', phase: 'preparation', defaultDurationDays: 14, requiresEvidence: true, evidenceDescription: 'File Assessment Plan' },
  { id: 'tt5', name: 'Kiểm tra điểm danh SV', phase: 'execution', defaultDurationDays: 7, requiresEvidence: false },
  { id: 'tt6', name: 'Chốt Assessment Plan toàn CT', phase: 'preparation', defaultDurationDays: 21, requiresEvidence: true, evidenceDescription: 'File assessment plan finalized' },
  { id: 'tt7', name: 'Tổng hợp kỷ luật nửa đầu kỳ', phase: 'execution', defaultDurationDays: 3, requiresEvidence: true, evidenceDescription: 'File tổng hợp kỷ luật' },
  { id: 'tt8', name: 'Nhắc nhở SV nghỉ quá phép', phase: 'execution', defaultDurationDays: 3, requiresEvidence: false },
  { id: 'tt9', name: 'Kiểm tra tài liệu Moodle/BB', phase: 'execution', defaultDurationDays: 7, requiresEvidence: true, evidenceDescription: 'Screenshot kiểm tra' },
  { id: 'tt10', name: 'Lên plan Guest Speaker/Field Trip', phase: 'execution', defaultDurationDays: 14, requiresEvidence: true, evidenceDescription: 'Kế hoạch chi tiết' },
];

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today); date.setDate(date.getDate() + offset); return date.toISOString().split('T')[0];
};

// ==================== KPI SNAPSHOTS (Real data — Kỳ 2 2024-2025) ====================
export const kpiSnapshots: KPISnapshot[] = [
  // ── Đoàn Thu Hương Giang (u9) — BTEC điều phối — Kỳ II 2024-2025 ──
  { id: 'ks1', userId: 'u9', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks2', userId: 'u9', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks3', userId: 'u9', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks4', userId: 'u9', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks5', userId: 'u9', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 80, rawNumerator: 8, rawDenominator: 10, calculatedAt: d(0) },
  { id: 'ks6', userId: 'u9', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks7', userId: 'u9', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks8', userId: 'u9', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks9', userId: 'u9', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks10', userId: 'u9', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Vũ Minh Nhật (u6) — Top-up UWE — HKII 24/25 ──
  { id: 'ks_u6_kpi1', userId: 'u6', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 16, rawDenominator: 16, calculatedAt: d(0) },
  { id: 'ks_u6_kpi2', userId: 'u6', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 39, rawDenominator: 39, calculatedAt: d(0) },
  { id: 'ks_u6_kpi3', userId: 'u6', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 4, rawDenominator: 4, calculatedAt: d(0) },
  { id: 'ks_u6_kpi4', userId: 'u6', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 94, rawNumerator: 15, rawDenominator: 16, calculatedAt: d(0) },
  { id: 'ks_u6_kpi5', userId: 'u6', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 80, rawNumerator: 4, rawDenominator: 5, calculatedAt: d(0) },
  { id: 'ks_u6_kpi6', userId: 'u6', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 16, rawDenominator: 16, calculatedAt: d(0) },
  { id: 'ks_u6_kpi7', userId: 'u6', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 16, rawDenominator: 16, calculatedAt: d(0) },
  { id: 'ks_u6_kpi8', userId: 'u6', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u6_kpi9', userId: 'u6', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 16, rawDenominator: 16, calculatedAt: d(0) },
  { id: 'ks_u6_kpi10', userId: 'u6', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Đào Ngọc Diệp (u10) — Andrews & Lincoln ──
  { id: 'ks_u10_kpi1', userId: 'u10', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks_u10_kpi2', userId: 'u10', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 25, rawDenominator: 25, calculatedAt: d(0) },
  { id: 'ks_u10_kpi3', userId: 'u10', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 3, rawDenominator: 3, calculatedAt: d(0) },
  { id: 'ks_u10_kpi4', userId: 'u10', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 73, rawNumerator: 8, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks_u10_kpi5', userId: 'u10', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 80, rawNumerator: 4, rawDenominator: 5, calculatedAt: d(0) },
  { id: 'ks_u10_kpi6', userId: 'u10', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks_u10_kpi7', userId: 'u10', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks_u10_kpi8', userId: 'u10', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u10_kpi9', userId: 'u10', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks_u10_kpi10', userId: 'u10', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Trần Hương Thảo (u4) — CN CT BTEC ──
  { id: 'ks_u4_kpi1', userId: 'u4', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 7, rawDenominator: 7, calculatedAt: d(0) },
  { id: 'ks_u4_kpi2', userId: 'u4', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 18, rawDenominator: 18, calculatedAt: d(0) },
  { id: 'ks_u4_kpi3', userId: 'u4', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 33, rawDenominator: 33, calculatedAt: d(0) },
  { id: 'ks_u4_kpi4', userId: 'u4', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 7, rawDenominator: 7, calculatedAt: d(0) },
  { id: 'ks_u4_kpi5', userId: 'u4', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 60, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u4_kpi6', userId: 'u4', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 7, rawDenominator: 7, calculatedAt: d(0) },
  { id: 'ks_u4_kpi7', userId: 'u4', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 7, rawDenominator: 7, calculatedAt: d(0) },
  { id: 'ks_u4_kpi8', userId: 'u4', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u4_kpi9', userId: 'u4', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 7, rawDenominator: 7, calculatedAt: d(0) },
  { id: 'ks_u4_kpi10', userId: 'u4', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Nguyễn Minh Tuấn (u8) — BBAE ──
  { id: 'ks_u8_kpi1', userId: 'u8', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 17, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_kpi2', userId: 'u8', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 41, rawDenominator: 41, calculatedAt: d(0) },
  { id: 'ks_u8_kpi3', userId: 'u8', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 27, rawDenominator: 27, calculatedAt: d(0) },
  { id: 'ks_u8_kpi4', userId: 'u8', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 94, rawNumerator: 16, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_kpi5', userId: 'u8', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 60, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u8_kpi6', userId: 'u8', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 17, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_kpi7', userId: 'u8', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 17, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_kpi8', userId: 'u8', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u8_kpi9', userId: 'u8', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 17, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_kpi10', userId: 'u8', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Bùi Thu Trang (u3) — Digital Marketing — Kỳ 1 2025 ──
  { id: 'ks_u3_kpi1', userId: 'u3', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 20, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi2', userId: 'u3', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 20, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi3', userId: 'u3', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 20, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi4', userId: 'u3', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 20, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi5', userId: 'u3', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 75, rawNumerator: 15, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi6', userId: 'u3', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 20, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi7', userId: 'u3', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 20, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi8', userId: 'u3', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u3_kpi9', userId: 'u3', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 20, rawDenominator: 20, calculatedAt: d(0) },
  { id: 'ks_u3_kpi10', userId: 'u3', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Bùi Thị Quỳnh Trang (u2) — Năm 1 — Kỳ 2 2024-2025 ──
  { id: 'ks_u2_kpi1', userId: 'u2', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 4, rawDenominator: 4, calculatedAt: d(0) },
  { id: 'ks_u2_kpi2', userId: 'u2', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 41, rawDenominator: 41, calculatedAt: d(0) },
  { id: 'ks_u2_kpi3', userId: 'u2', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 4, rawDenominator: 4, calculatedAt: d(0) },
  { id: 'ks_u2_kpi4', userId: 'u2', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 4, rawDenominator: 4, calculatedAt: d(0) },
  { id: 'ks_u2_kpi5', userId: 'u2', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 60, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u2_kpi6', userId: 'u2', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 4, rawDenominator: 4, calculatedAt: d(0) },
  { id: 'ks_u2_kpi7', userId: 'u2', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 4, rawDenominator: 4, calculatedAt: d(0) },
  { id: 'ks_u2_kpi8', userId: 'u2', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u2_kpi9', userId: 'u2', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 4, rawDenominator: 4, calculatedAt: d(0) },
  { id: 'ks_u2_kpi10', userId: 'u2', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Trần Bích Ngọc (u5) — NHTC (BScBF) ──
  { id: 'ks_u5_kpi1', userId: 'u5', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 8, rawDenominator: 8, calculatedAt: d(0) },
  { id: 'ks_u5_kpi2', userId: 'u5', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 15, rawDenominator: 15, calculatedAt: d(0) },
  { id: 'ks_u5_kpi3', userId: 'u5', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 2, rawDenominator: 2, calculatedAt: d(0) },
  { id: 'ks_u5_kpi4', userId: 'u5', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 8, rawDenominator: 8, calculatedAt: d(0) },
  { id: 'ks_u5_kpi5', userId: 'u5', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 60, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u5_kpi6', userId: 'u5', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 8, rawDenominator: 8, calculatedAt: d(0) },
  { id: 'ks_u5_kpi7', userId: 'u5', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 8, rawDenominator: 8, calculatedAt: d(0) },
  { id: 'ks_u5_kpi8', userId: 'u5', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u5_kpi9', userId: 'u5', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 8, rawDenominator: 8, calculatedAt: d(0) },
  { id: 'ks_u5_kpi10', userId: 'u5', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Nguyễn Giang Khánh Huyền (u7) — Top-up CU ──
  { id: 'ks_u7_kpi1', userId: 'u7', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 5, rawDenominator: 5, calculatedAt: d(0) },
  { id: 'ks_u7_kpi2', userId: 'u7', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 14, rawDenominator: 14, calculatedAt: d(0) },
  { id: 'ks_u7_kpi3', userId: 'u7', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 2, rawDenominator: 2, calculatedAt: d(0) },
  { id: 'ks_u7_kpi4', userId: 'u7', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 5, rawDenominator: 5, calculatedAt: d(0) },
  { id: 'ks_u7_kpi5', userId: 'u7', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2024-2025', score: 60, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u7_kpi6', userId: 'u7', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 5, rawDenominator: 5, calculatedAt: d(0) },
  { id: 'ks_u7_kpi7', userId: 'u7', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2024-2025', score: 90, rawNumerator: 5, rawDenominator: 5, calculatedAt: d(0) },
  { id: 'ks_u7_kpi8', userId: 'u7', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u7_kpi9', userId: 'u7', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 5, rawDenominator: 5, calculatedAt: d(0) },
  { id: 'ks_u7_kpi10', userId: 'u7', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2024-2025', score: 100, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },

  // ── Kỳ 2 2025-2026 (New targets) ──
  // Bui Thu Trang (u3)
  { id: 'ks_u3_2526_k1', userId: 'u3', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k2', userId: 'u3', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k3', userId: 'u3', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k4', userId: 'u3', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k5', userId: 'u3', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k6', userId: 'u3', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k7', userId: 'u3', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k8', userId: 'u3', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k9', userId: 'u3', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u3_2526_k10', userId: 'u3', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  // Dao Ngoc Diep (u10)
  { id: 'ks_u10_2526_k1', userId: 'u10', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 10.0, rawDenominator: 10.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k2', userId: 'u10', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 90.0, rawNumerator: 9.0, rawDenominator: 10.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k3', userId: 'u10', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 2.0, rawDenominator: 2.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k4', userId: 'u10', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 10.0, rawDenominator: 10.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k5', userId: 'u10', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 4.0, rawDenominator: 4.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k6', userId: 'u10', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 10.0, rawDenominator: 10.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k7', userId: 'u10', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 10.0, rawDenominator: 10.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k8', userId: 'u10', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 3.0, rawDenominator: 3.0, calculatedAt: d(0) },
  { id: 'ks_u10_2526_k9', userId: 'u10', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  // Doan Thu Huong Giang (u9)
  { id: 'ks_u9_2526_k1', userId: 'u9', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 7.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k2', userId: 'u9', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 7.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k3', userId: 'u9', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 7.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k4', userId: 'u9', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 85.7, rawNumerator: 6.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k5', userId: 'u9', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 57.1, rawNumerator: 4.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k6', userId: 'u9', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 7.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k7', userId: 'u9', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 7.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k8', userId: 'u9', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k9', userId: 'u9', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 7.0, rawDenominator: 7.0, calculatedAt: d(0) },
  { id: 'ks_u9_2526_k10', userId: 'u9', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  // Nguyen Minh Tuan (u8)
  { id: 'ks_u8_2526_k1', userId: 'u8', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 17.0, rawDenominator: 17.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k2', userId: 'u8', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 41.0, rawDenominator: 41.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k3', userId: 'u8', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 27.0, rawDenominator: 27.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k4', userId: 'u8', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 94.1, rawNumerator: 16.0, rawDenominator: 17.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k5', userId: 'u8', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 5.0, rawDenominator: 5.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k6', userId: 'u8', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 17.0, rawDenominator: 17.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k7', userId: 'u8', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 1.0, rawDenominator: 1.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k8', userId: 'u8', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u8_2526_k9', userId: 'u8', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  // Tran Huong Thao (u4)
  { id: 'ks_u4_2526_k1', userId: 'u4', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k2', userId: 'u4', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k3', userId: 'u4', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k4', userId: 'u4', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k5', userId: 'u4', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k6', userId: 'u4', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k7', userId: 'u4', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k8', userId: 'u4', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k9', userId: 'u4', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u4_2526_k10', userId: 'u4', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  // Vu Minh Nhat (u6)
  { id: 'ks_u6_2526_k1', userId: 'u6', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 12.0, rawDenominator: 12.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k2', userId: 'u6', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 22.0, rawDenominator: 22.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k3', userId: 'u6', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 3.0, rawDenominator: 3.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k4', userId: 'u6', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 12.0, rawDenominator: 12.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k5', userId: 'u6', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k6', userId: 'u6', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 12.0, rawDenominator: 12.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k7', userId: 'u6', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 12.0, rawDenominator: 12.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k8', userId: 'u6', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k9', userId: 'u6', kpiDefinitionId: 'kpi9', period: 'Kỳ 2 2025-2026', score: 100.0, rawNumerator: 12.0, rawDenominator: 12.0, calculatedAt: d(0) },
  { id: 'ks_u6_2526_k10', userId: 'u6', kpiDefinitionId: 'kpi10', period: 'Kỳ 2 2025-2026', score: 100, rawNumerator: 0.0, rawDenominator: 0.0, calculatedAt: d(0) },

  // Special mappings for odd files (u2, u7, u5)
  { id: 'ks_u2_2526_k1', userId: 'u2', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 90.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u2_2526_k2', userId: 'u2', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 95.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u2_2526_k3', userId: 'u2', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 93.5, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u2_2526_k4', userId: 'u2', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 91.5, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u7_2526_k1', userId: 'u7', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 98.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u7_2526_k2', userId: 'u7', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 98.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u7_2526_k3', userId: 'u7', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 98.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u7_2526_k4', userId: 'u7', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 98.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u7_2526_k5', userId: 'u7', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 98.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k1', userId: 'u5', kpiDefinitionId: 'kpi1', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k2', userId: 'u5', kpiDefinitionId: 'kpi2', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k3', userId: 'u5', kpiDefinitionId: 'kpi3', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k4', userId: 'u5', kpiDefinitionId: 'kpi4', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k5', userId: 'u5', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k6', userId: 'u5', kpiDefinitionId: 'kpi6', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k7', userId: 'u5', kpiDefinitionId: 'kpi7', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
  { id: 'ks_u5_2526_k8', userId: 'u5', kpiDefinitionId: 'kpi8', period: 'Kỳ 2 2025-2026', score: 85.0, rawNumerator: 0, rawDenominator: 100, calculatedAt: d(0) },
];

// ==================== KPI DETAIL ITEMS (for drill-down) ====================
export const kpiDetailItems: KPIDetailItem[] = [
  // Hương Giang KPI4 (6/7 — QL Điểm)
  { id: 'kd1', kpiSnapshotId: 'ks4', label: 'Contemporary Business Environment', achieved: true, note: 'Đã hoàn thành đúng hạn' },
  { id: 'kd2', kpiSnapshotId: 'ks4', label: 'Management of Human Resources', achieved: true, note: 'Đã hoàn thành' },
  { id: 'kd3', kpiSnapshotId: 'ks4', label: 'Accounting Principles', achieved: true, note: 'Đã hoàn thành' },
  { id: 'kd4', kpiSnapshotId: 'ks4', label: 'Organisational Behaviour Mgmt', achieved: true, note: 'Hoàn thành sớm 2 ngày' },
  { id: 'kd5', kpiSnapshotId: 'ks4', label: 'Business Strategy', achieved: true, note: 'Đúng hạn' },
  { id: 'kd6', kpiSnapshotId: 'ks4', label: 'Marketing Insights', achieved: true, note: 'Đúng hạn' },
  { id: 'kd7', kpiSnapshotId: 'ks4', label: 'Operations Management', achieved: false, note: 'GV chưa gửi điểm đúng hạn', relatedTaskId: 't4' },
  // Hương Giang KPI5 (4/7 — Ngoại khóa)
  { id: 'kd8', kpiSnapshotId: 'ks5', label: 'Contemporary Business Environment', achieved: true, note: 'Field trip đã tổ chức' },
  { id: 'kd9', kpiSnapshotId: 'ks5', label: 'Business Strategy', achieved: true, note: 'Guest speaker đã mời' },
  { id: 'kd10', kpiSnapshotId: 'ks5', label: 'Accounting Principles', achieved: true, note: 'Guest speaker đã tổ chức' },
  { id: 'kd11', kpiSnapshotId: 'ks5', label: 'Management of Human Resources', achieved: true, note: 'Field trip thực tế' },
  { id: 'kd12', kpiSnapshotId: 'ks5', label: 'Innovation and Commercialisation', achieved: false, note: 'Chưa liên hệ được speaker', relatedTaskId: 't9' },
  { id: 'kd13', kpiSnapshotId: 'ks5', label: 'Marketing Insights', achieved: false, note: 'Đang plan nhưng chưa confirm' },
  { id: 'kd14', kpiSnapshotId: 'ks5', label: 'Operations Management', achieved: false, note: 'Chưa bắt đầu', relatedTaskId: 't9' },
  // Hương Giang KPI10 (5/7 — Hồ sơ SV)
  { id: 'kd15', kpiSnapshotId: 'ks10', label: 'CBE — Danh sách SV', achieved: true, note: 'Cập nhật đúng hạn' },
  { id: 'kd16', kpiSnapshotId: 'ks10', label: 'HRM — Danh sách SV', achieved: true, note: 'Cập nhật đúng hạn' },
  { id: 'kd17', kpiSnapshotId: 'ks10', label: 'Accounting — DS SV', achieved: true, note: 'Đúng hạn' },
  { id: 'kd18', kpiSnapshotId: 'ks10', label: 'OB Mgmt — DS SV', achieved: true, note: 'Đúng hạn' },
  { id: 'kd19', kpiSnapshotId: 'ks10', label: 'Business Strategy — DS SV', achieved: true, note: 'Đúng hạn' },
  { id: 'kd20', kpiSnapshotId: 'ks10', label: 'Marketing — DS SV', achieved: false, note: 'Thiếu thông tin 3 SV chuyển tiếp' },
  { id: 'kd21', kpiSnapshotId: 'ks10', label: 'Ops Mgmt — DS SV', achieved: false, note: 'Chưa nhận DS từ phòng đào tạo' },
];

// ==================== REVIEW CYCLES ====================
export const reviewCycles: ReviewCycle[] = [
  { id: 'rc1', name: 'Kỳ 1 — 2025-2026', startDate: '2025-09-01', endDate: '2026-01-31', reviewDeadline: '2026-02-15', status: 'closed' },
  { id: 'rc2', name: 'Kỳ 2 — 2025-2026', startDate: '2026-02-01', endDate: '2026-06-30', reviewDeadline: '2026-07-15', status: 'open' },
];

export const reviews: Review[] = [
  { id: 'rv1', userId: 'u9', cycleId: 'rc1', selfNote: 'Đã hoàn thành tốt việc điều phối 9 môn học BTEC HND.', managerNote: 'Hương Giang làm việc tích cực, cần cải thiện ngoại khóa.', adjustedScore: null, adjustmentReason: '', submittedAt: '2026-02-10', reviewedAt: '2026-02-14' },
  { id: 'rv2', userId: 'u2', cycleId: 'rc1', selfNote: 'Hoàn thành tốt nhiệm vụ CN chương trình Năm 1.', managerNote: '', adjustedScore: null, adjustmentReason: '', submittedAt: '2026-02-08', reviewedAt: null },
];

// ==================== NOTIFICATIONS (Enhanced) ====================
export const notifications: Notification[] = [
  { id: 'n1', userId: 'u9', type: 'overdue', priority: 'high', title: 'Task quá hạn', message: 'Chốt Assessment Plan toàn CT BTEC đã quá hạn 1 ngày. Cần liên hệ GV Marketing & Innovation để hoàn thành.', severity: 'warning', read: false, createdAt: d(0), taskId: 't6', actionUrl: '/tasks', actionLabel: 'Xem task', category: 'task' },
  { id: 'n2', userId: 'u9', type: 'reminder', priority: 'medium', title: 'Sắp đến hạn', message: 'Kiểm tra tài liệu Moodle — Marketing còn 3 ngày. Bạn có thể kiểm tra ngay trên hệ thống.', severity: 'info', read: false, createdAt: d(0), taskId: 't8', actionUrl: '/tasks', actionLabel: 'Cập nhật', category: 'task' },
  { id: 'n3', userId: 'u9', type: 'kpi_warning', priority: 'high', title: 'KPI cần cải thiện', message: 'KPI Hoạt động ngoại khóa đang ở mức 60% (4/7 môn). Cần tổ chức thêm 3 buổi guest speaker/field trip trước cuối kỳ.', severity: 'warning', read: false, createdAt: d(-1), actionUrl: '/kpi', actionLabel: 'Xem KPI', category: 'kpi' },
  { id: 'n4', userId: 'u1', type: 'escalation', priority: 'urgent', title: 'Cần can thiệp', message: 'Đào Ngọc Diệp có KPI Hợp đồng GV = 90% (9/10). Đề xuất: Hỗ trợ hoàn thiện hồ sơ GV còn thiếu.', severity: 'critical', read: false, createdAt: d(0), actionUrl: '/kpi/heatmap', actionLabel: 'Xem heatmap', category: 'kpi' },
  { id: 'n5', userId: 'u1', type: 'kpi_warning', priority: 'medium', title: 'KPI thấp', message: 'Đoàn Thu Hương Giang có KPI Ngoại khóa = 60%. Đề xuất: Hỗ trợ liên hệ guest speaker cho 3 môn còn thiếu.', severity: 'warning', read: false, createdAt: d(-1), actionUrl: '/kpi/heatmap', actionLabel: 'Xem heatmap', category: 'kpi' },
  { id: 'n6', userId: 'u5', type: 'overdue', priority: 'high', title: 'Task cần hành động', message: 'Nhận Assessment Plan NHTC đã quá hạn — GV môn TCFD chưa gửi. Đề xuất: gửi email nhắc lần 2.', severity: 'warning', read: false, createdAt: d(0), taskId: 't22', actionUrl: '/tasks', actionLabel: 'Xử lý ngay', category: 'task' },
  { id: 'n7', userId: 'u10', type: 'reminder', priority: 'medium', title: 'Nhắc nhở KPI', message: 'KPI Module report chưa có dữ liệu. Cần hoàn thành feedback và gửi report cho GV trước cuối kỳ.', severity: 'info', read: false, createdAt: d(0), actionUrl: '/kpi', actionLabel: 'Xem KPI', category: 'kpi' },
  { id: 'n8', userId: 'u9', type: 'review', priority: 'low', title: 'Kỳ đánh giá mới', message: 'Kỳ 2 — 2025-2026 đã mở. Hãy cập nhật task đầy đủ và submit self-review trước 15/07.', severity: 'info', read: true, createdAt: d(-7), actionUrl: '/review', actionLabel: 'Xem đánh giá', category: 'review' },
  { id: 'n9', userId: 'u9', type: 'assignment', priority: 'medium', title: 'Được giao việc mới', message: 'Bạn được giao thêm: "Hỗ trợ tổ chức ISME Open Day" — deadline 7 ngày.', severity: 'info', read: false, createdAt: d(-3), taskId: 'ta1', actionUrl: '/tasks', actionLabel: 'Xem task', category: 'task' },
  { id: 'n10', userId: 'u9', type: 'completion', priority: 'low', title: 'Hoàn thành task', message: 'Task "Gửi feedback SV cho GV — Business Law" đã hoàn thành. KPI Report tăng lên 100%.', severity: 'info', read: true, createdAt: d(-5), taskId: 't10', category: 'task' },
  { id: 'n11', userId: 'u9', type: 'system', priority: 'low', title: 'Tổng kết tuần', message: 'Tuần này: 2 task hoàn thành, 1 task quá hạn, 3 task đang làm. KPI trung bình: 93%.', severity: 'info', read: true, createdAt: d(-1), category: 'system' },
];

// ==================== HELPERS ====================
export function getUserById(id: string): User | undefined { return users.find(u => u.id === id); }
export function getTasksByUser(userId: string): Task[] { const { tasks } = require('./mock-tasks'); return tasks.filter((t: Task) => t.ownerId === userId); }
export function getTasksByProgram(programId: string): Task[] { const { tasks } = require('./mock-tasks'); return tasks.filter((t: Task) => t.programId === programId); }
export function getKPISnapshotsByUser(userId: string, period?: string): KPISnapshot[] { return kpiSnapshots.filter(s => s.userId === userId && (!period || s.period === period)); }
export function getNotificationsByUser(userId: string): Notification[] { return notifications.filter(n => n.userId === userId); }
export function getProgramById(id: string): Program | undefined { return programs.find(p => p.id === id); }
export function getKPIDetailsBySnapshot(snapshotId: string): KPIDetailItem[] { return kpiDetailItems.filter(d => d.kpiSnapshotId === snapshotId); }
export function getOverdueTasks(): Task[] { const { tasks } = require('./mock-tasks'); const now = new Date().toISOString().split('T')[0]; return tasks.filter((t: Task) => t.status !== 'DONE' && t.dueDate < now); }
export function getOverdueTasksByUser(userId: string): Task[] { const { tasks } = require('./mock-tasks'); const now = new Date().toISOString().split('T')[0]; return tasks.filter((t: Task) => t.ownerId === userId && t.status !== 'DONE' && t.dueDate < now); }
export function calculateOverallKPI(userId: string, period: string): number {
  const snapshots = getKPISnapshotsByUser(userId, period);
  if (snapshots.length === 0) return 0;
  let totalWeight = 0, weightedSum = 0;
  for (const snap of snapshots) { const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId); if (def) { weightedSum += snap.score * def.weight; totalWeight += def.weight; } }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// Operations KPI = trung bình cộng đơn giản (không trọng số)
export function calculateOperationsKPI(userId: string, period: string): number {
  const snapshots = getKPISnapshotsByUser(userId, period);
  if (snapshots.length === 0) return 0;
  const total = snapshots.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / snapshots.length);
}

// Helper: label vai trò tiếng Việt
export function getUserRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    operation: 'Điều phối',
    coordinator_director: 'CN CT & Điều phối',
    manager: 'Quản lý',
    institute_leader: 'Lãnh đạo Viện',
  };
  return labels[role] || role;
}

// Helper: check if user has a specific role
export function userHasRole(userId: string, role: UserRole): boolean {
  const user = getUserById(userId);
  return user ? user.roles.includes(role) : false;
}

// ==================== KPI EDIT REQUESTS ====================
let _kpiEditRequests: KPIEditRequest[] = [
  // Sample: Hương Giang requested to change KPI5 score
  { id: 'er1', snapshotId: 'ks5', userId: 'u9', kpiDefinitionId: 'kpi5', period: 'Kỳ 2 2025-2026',
    oldScore: 57, oldNumerator: 4, oldDenominator: 7, newScore: 71, newNumerator: 5, newDenominator: 7,
    reason: 'Đã tổ chức thêm 1 buổi guest speaker cho môn Innovation & Commercialisation ngày 15/03. Cập nhật từ 4/7 lên 5/7.',
    status: 'pending', requestedAt: d(-1), reviewedBy: null, reviewedAt: null, reviewNote: '' },
];

let _editListeners: (() => void)[] = [];
export function subscribeEditRequests(fn: () => void) { _editListeners.push(fn); return () => { _editListeners = _editListeners.filter(f => f !== fn); }; }
function _notifyEdit() { _editListeners.forEach(fn => fn()); }

export function getKPIEditRequests(): KPIEditRequest[] { return _kpiEditRequests; }
export function getKPIEditRequestsByUser(userId: string): KPIEditRequest[] { return _kpiEditRequests.filter(r => r.userId === userId); }
export function getKPIEditRequestsByStatus(status: KPIEditRequest['status']): KPIEditRequest[] { return _kpiEditRequests.filter(r => r.status === status); }
export function getPendingEditForSnapshot(snapshotId: string): KPIEditRequest | undefined { return _kpiEditRequests.find(r => r.snapshotId === snapshotId && r.status === 'pending'); }

export function createKPIEditRequest(req: Omit<KPIEditRequest, 'id' | 'status' | 'requestedAt' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>): KPIEditRequest {
  const newReq: KPIEditRequest = {
    ...req,
    id: 'er' + Date.now(),
    status: 'pending',
    requestedAt: new Date().toISOString().split('T')[0],
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: '',
  };
  _kpiEditRequests = [..._kpiEditRequests, newReq];
  _notifyEdit();
  return newReq;
}

export function approveKPIEditRequest(requestId: string, reviewerId: string, note: string): void {
  _kpiEditRequests = _kpiEditRequests.map(r => {
    if (r.id !== requestId) return r;
    // Apply the changes to the snapshot
    const snapIdx = kpiSnapshots.findIndex(s => s.id === r.snapshotId);
    if (snapIdx >= 0) {
      kpiSnapshots[snapIdx] = { ...kpiSnapshots[snapIdx], score: r.newScore, rawNumerator: r.newNumerator, rawDenominator: r.newDenominator, calculatedAt: new Date().toISOString().split('T')[0] };
    }
    return { ...r, status: 'approved' as const, reviewedBy: reviewerId, reviewedAt: new Date().toISOString().split('T')[0], reviewNote: note };
  });
  _notifyEdit();
}

export function rejectKPIEditRequest(requestId: string, reviewerId: string, note: string): void {
  _kpiEditRequests = _kpiEditRequests.map(r => {
    if (r.id !== requestId) return r;
    return { ...r, status: 'rejected' as const, reviewedBy: reviewerId, reviewedAt: new Date().toISOString().split('T')[0], reviewNote: note };
  });
  _notifyEdit();
}

// ==================== COURSE EDIT REQUESTS ====================
let _courseEditRequests: CourseEditRequest[] = [
  // Demo: Hương Giang yêu cầu sửa tỷ lệ chuyên cần môn Management of Human Resources
  { id: 'cer1', courseId: 'c2', userId: 'u9', field: 'attendanceRate', fieldLabel: 'Management of Human Resources — Tỷ lệ chuyên cần',
    oldValue: 80.10, newValue: 85.50, reason: 'Cập nhật lại số liệu sau khi rà soát danh sách SV vắng có phép. 3 SV đã bổ sung đơn xin phép hợp lệ, tỷ lệ CC tăng từ 80.1% lên 85.5%.',
    status: 'pending', requestedAt: d(-1), reviewedBy: null, reviewedAt: null, reviewNote: '' },
  // Demo: Hương Giang yêu cầu sửa tỷ lệ pass môn Organisational Behaviour
  { id: 'cer2', courseId: 'c5', userId: 'u9', field: 'passRate', fieldLabel: 'Organisational Behaviour Mgmt — Tỷ lệ pass',
    oldValue: 90, newValue: 93, reason: 'GV đã chấm lại 2 bài thi phúc khảo, kết quả 2 SV đạt pass. Cập nhật tỷ lệ pass từ 90% lên 93%.',
    status: 'pending', requestedAt: d(-2), reviewedBy: null, reviewedAt: null, reviewNote: '' },
  // Demo: Đã duyệt — sửa tỷ lệ nộp bài môn CBE
  { id: 'cer3', courseId: 'c1', userId: 'u9', field: 'submitRate', fieldLabel: 'Contemporary Business Environment — Nộp bài đúng hạn',
    oldValue: 75, newValue: 80, reason: 'Phát hiện 5 bài nộp qua email chưa được tính vào hệ thống Moodle. Đã xác nhận với GV và cập nhật.',
    status: 'approved', requestedAt: d(-5), reviewedBy: 'u1', reviewedAt: d(-3), reviewNote: 'Đã kiểm tra email GV, xác nhận 5 bài hợp lệ. Đồng ý cập nhật.' },
];

let _courseEditListeners: (() => void)[] = [];
export function subscribeCourseEditRequests(fn: () => void) { _courseEditListeners.push(fn); return () => { _courseEditListeners = _courseEditListeners.filter(f => f !== fn); }; }
function _notifyCourseEdit() { _courseEditListeners.forEach(fn => fn()); }

export function getCourseEditRequests(): CourseEditRequest[] { return _courseEditRequests; }
export function getPendingCourseEditForField(courseId: string, field: CourseEditField): CourseEditRequest | undefined {
  return _courseEditRequests.find(r => r.courseId === courseId && r.field === field && r.status === 'pending');
}
export function getPendingCourseEdits(): CourseEditRequest[] { return _courseEditRequests.filter(r => r.status === 'pending'); }

export function createCourseEditRequest(req: Omit<CourseEditRequest, 'id' | 'status' | 'requestedAt' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>): CourseEditRequest {
  const newReq: CourseEditRequest = { ...req, id: 'cer' + Date.now(), status: 'pending', requestedAt: new Date().toISOString().split('T')[0], reviewedBy: null, reviewedAt: null, reviewNote: '' };
  _courseEditRequests = [..._courseEditRequests, newReq];
  _notifyCourseEdit();
  return newReq;
}

export function approveCourseEditRequest(requestId: string, reviewerId: string, note: string): void {
  _courseEditRequests = _courseEditRequests.map(r => {
    if (r.id !== requestId) return r;
    const courseIdx = courses.findIndex(c => c.id === r.courseId);
    if (courseIdx >= 0) { (courses[courseIdx] as unknown as Record<string, unknown>)[r.field] = r.newValue; }
    return { ...r, status: 'approved' as const, reviewedBy: reviewerId, reviewedAt: new Date().toISOString().split('T')[0], reviewNote: note };
  });
  _notifyCourseEdit();
}

export function rejectCourseEditRequest(requestId: string, reviewerId: string, note: string): void {
  _courseEditRequests = _courseEditRequests.map(r => {
    if (r.id !== requestId) return r;
    return { ...r, status: 'rejected' as const, reviewedBy: reviewerId, reviewedAt: new Date().toISOString().split('T')[0], reviewNote: note };
  });
  _notifyCourseEdit();
}

// ==================== MANAGER QUESTIONS ====================
let _managerQuestions: ManagerQuestion[] = [
  { id: 'mq1', fromUserId: 'u1', toUserId: 'u9', subject: 'Tỷ lệ chuyên cần BTEC thấp', question: 'Tỷ lệ chuyên cần lớp Management of HR chỉ đạt 80.1%, thấp hơn mục tiêu 85%. Nguyên nhân là gì và kế hoạch cải thiện?', context: 'Chuyên cần — Management of Human Resources (80.1%)', contextType: 'course', contextId: 'c2', status: 'open', createdAt: d(-1), answer: '', answeredAt: null, managerReply: '', repliedAt: null },
  { id: 'mq2', fromUserId: 'u1', toUserId: 'u5', subject: 'Tiến độ chuẩn bị ngoại khoá', question: 'KPI Ngoại khoá đang ở mức 4/7 chương trình. Khi nào có thể hoàn thành 3 chương trình còn lại?', context: 'KPI Ngoại khoá (57%)', contextType: 'kpi', contextId: 'kpi7', status: 'answered', createdAt: d(-3), answer: 'Em đã lên kế hoạch cho 3 chương trình còn lại. Dự kiến hoàn thành trong 2 tuần tới. Hiện đang chờ xác nhận địa điểm từ đối tác.', answeredAt: d(-2), managerReply: '', repliedAt: null },
  { id: 'mq3', fromUserId: 'u1', toUserId: 'u3', subject: 'Tỉ lệ pass thấp môn c5', question: 'Tỉ lệ pass môn Organisational Behaviour chỉ 87.27%, tuy đạt mục tiêu nhưng thấp hơn kỳ vọng. Có vấn đề gì với chương trình giảng dạy không?', context: 'Pass Rate — Organisational Behaviour', contextType: 'course', contextId: 'c5', status: 'closed', createdAt: d(-7), answer: 'GV đã phản hồi rằng đề thi kỳ này có phần case study khó hơn. Em đang phối hợp với GV điều chỉnh cấu trúc đề thi để phù hợp hơn.', answeredAt: d(-6), managerReply: 'OK, theo dõi tiếp kỳ sau. Nếu cần hỗ trợ từ Academic thì báo chị.', repliedAt: d(-5) },
];

let _questionListeners: (() => void)[] = [];
export function subscribeQuestions(fn: () => void) { _questionListeners.push(fn); return () => { _questionListeners = _questionListeners.filter(f => f !== fn); }; }
function _notifyQuestions() { _questionListeners.forEach(fn => fn()); }

export function getManagerQuestions(): ManagerQuestion[] { return _managerQuestions; }
export function getQuestionsForUser(userId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.toUserId === userId); }
export function getQuestionsByManager(managerId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.fromUserId === managerId); }
export function getOpenQuestionsForUser(userId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.toUserId === userId && q.status === 'open'); }

export function createManagerQuestion(q: Omit<ManagerQuestion, 'id' | 'status' | 'createdAt' | 'answer' | 'answeredAt' | 'managerReply' | 'repliedAt'>): ManagerQuestion {
  const newQ: ManagerQuestion = { ...q, id: 'mq' + Date.now(), status: 'open', createdAt: new Date().toISOString().split('T')[0], answer: '', answeredAt: null, managerReply: '', repliedAt: null };
  _managerQuestions = [newQ, ..._managerQuestions];
  _notifyQuestions();
  return newQ;
}

export function answerQuestion(questionId: string, answer: string): void {
  _managerQuestions = _managerQuestions.map(q => q.id !== questionId ? q : { ...q, status: 'answered' as const, answer, answeredAt: new Date().toISOString().split('T')[0] });
  _notifyQuestions();
}

export function replyToAnswer(questionId: string, reply: string): void {
  _managerQuestions = _managerQuestions.map(q => q.id !== questionId ? q : { ...q, status: 'closed' as const, managerReply: reply, repliedAt: new Date().toISOString().split('T')[0] });
  _notifyQuestions();
}
