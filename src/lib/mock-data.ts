import { User, Program, Course, KPIDefinition, KPISnapshot, KPIGroup, OtherActivityRecord, LaborDisciplineRecord, Notification, ManagerQuestion, UserRole, ReviewCycle, Review, KPIDetailItem, CoordinatorStats, KPIEditRequest, CourseEditRequest, CourseEditField } from './types';
export { getTasksByUser, getOverdueTasksByUser } from './mock-tasks';

// ==================== KPI GROUPS ====================
export const kpiGroups: KPIGroup[] = [
  { id: 'operations', name: 'Nhóm KPI theo mô tả CV (Operations)', weight: 50 },
  { id: 'academic_support', name: 'Hoạt động hỗ trợ học tập', weight: 20 },
  { id: 'student_results', name: 'Kết quả học tập và Kỷ luật của sinh viên', weight: 10 },
  { id: 'other_activities', name: 'Các hoạt động khác', weight: 10 },
  { id: 'labor_discipline', name: 'Kỷ luật lao động', weight: 10 },
];

// ==================== USERS ====================
export const users: User[] = [
  { id: 'u1', name: 'Hồ Hoàng Lan', email: 'lan.hh@isme.edu.vn', role: 'manager', roles: ['manager', 'institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Trưởng Ban Đào tạo đại học' },
  { id: 'u14', name: 'Nguyễn Chính', email: 'nguyen.chinh@isneu.org', role: 'manager', roles: ['manager'], managerId: null, avatarUrl: '', active: true, position: 'Phó Ban Đào tạo đại học' },
  { id: 'u0', name: 'Admin System', email: 'admin@isme.edu.vn', role: 'admin', roles: ['manager'], managerId: null, avatarUrl: '', active: true, position: 'Quản trị hệ thống' },
  
  // Leaders
  { id: 'u20', name: 'Lê Thanh', email: 'le.thanh@isneu.org', role: 'manager', roles: ['institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Lãnh đạo Viện' },
  { id: 'u21', name: 'Trịnh Giang', email: 'trinh.giang@isneu.org', role: 'manager', roles: ['institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Lãnh đạo Viện' },

  // Coordinators
  { id: 'u8', name: 'Nguyễn Minh Tuấn', email: 'nguyen.tuan@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BBAE' },
  { id: 'u9', name: 'Đoàn Thu Hương Giang', email: 'doan.giang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BTEC' },
  { id: 'u2', name: 'Vũ Minh Nhật', email: 'vu.nhat@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u3', name: 'Phạm Gia Linh', email: 'pham.gialinh@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u4', name: 'Trần Thị Bích Ngọc', email: 'tran.ngoc@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u5', name: 'Trần Hương Thảo', email: 'tran.thao@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u6', name: 'Nguyễn Giang Khánh Huyền', email: 'nguyen.huyen@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u7', name: 'Đào Ngọc Diệp', email: 'dao.diep@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u10', name: 'Bùi Thu Trang', email: 'bui.thutrang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u11', name: 'Bùi Thị Quỳnh Trang', email: 'bui.trang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
];

// ==================== PROGRAMS ====================
export const programs: Program[] = [
  { id: 'p3', name: 'BTEC HND', type: 'certificate', status: 'active', shortName: 'BTEC', managerId: 'u9' },
  { id: 'p7', name: 'BBAE', type: 'degree', status: 'active', shortName: 'BBAE', managerId: 'u8' },
];

// ==================== COURSES ====================
export const courses: Course[] = [
  { id: 'c1', programId: 'p7', name: 'Internship', cohort: 'BBAE K63', numLecturers: 24, numStudents: 70, attendanceRate: 0.9881, attendanceTarget: 0.95, passRate: 0.9857, submitRate: 0.95, passTarget: 0.95 },
  { id: 'c2', programId: 'p7', name: 'Creativity & Innovation Management', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0, passTarget: 0.95 },
  { id: 'c3', programId: 'p7', name: 'Entrepreneurial Design Thinking', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0, passTarget: 0.95 },
  { id: 'c4', programId: 'p7', name: 'Entrepreneurial Skills', cohort: 'BBAE K64', numLecturers: 1, numStudents: 53, attendanceRate: 0.9714, attendanceTarget: 0.95, passRate: 0.9623, submitRate: 0.9714, passTarget: 0.95 },
  { id: 'c5', programId: 'p7', name: 'Hochiminh\'s Ideology', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0, passTarget: 0.95 },
  { id: 'c6', programId: 'p7', name: 'Management of Info system', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 0.9853, passTarget: 0.95 },
];

// ==================== KPI DEFINITIONS ====================
export const kpiDefinitions: KPIDefinition[] = [
  // Group 1: Operations (50%)
  { id: 'op1', groupId: 'operations', stt: 1, name: 'Làm việc với nhóm GV từng môn về nội dung giảng dạy', shortName: 'Nội dung GD', description: 'Tài liệu SoW, Assessment Plan, Assignment Brief', criteria: 'Tỷ lệ các môn học có đầy đủ các tài liệu đúng tiến độ', unit: '%', weight: 5 },
  { id: 'op2', groupId: 'operations', stt: 2, name: 'Cung cấp thông tin phục vụ hoàn thiện các thủ tục ký hợp đồng, thanh lý...', shortName: 'Hợp đồng GV', description: 'HĐ GV, Thanh toán giảng dạy, Thanh toán chấm bài', criteria: 'Tỷ lệ giảng viên được cập nhật thông tin theo đúng tiến độ', unit: '%', weight: 5 },
  { id: 'op3', groupId: 'operations', stt: 3, name: 'Tổ chức lớp học', shortName: 'Setup lớp', description: 'TKB, Moodle, Account, Enroll GV & SV', criteria: 'Tỷ lệ các lớp được set up theo kế hoạch', unit: '%', weight: 5 },
  { id: 'op4', groupId: 'operations', stt: 4, name: 'Quản lý điểm và quá trình đánh giá SV', shortName: 'Quản lý điểm', description: 'Theo dõi tiến độ nhập điểm', criteria: 'Tỷ lệ các môn học hoàn thành điểm theo đúng kế hoạch', unit: '%', weight: 10 },
  { id: 'op6', groupId: 'operations', stt: 6, name: 'Rà soát kết quả học tập, hồ sơ hoàn thành chương trình', shortName: 'Rà soát KQ', description: 'File kết quả rà soát theo yêu cầu', criteria: 'Tỷ lệ các môn học có file kết quả rà soát', unit: '%', weight: 5 },
  { id: 'op7', groupId: 'operations', stt: 7, name: 'Giám sát liêm chính học thuật', shortName: 'Turnitin', description: 'Báo cáo Turnitin', criteria: 'Tỷ lệ các môn học có báo cáo kết quả rà soát Turnitin', unit: '%', weight: 5 },
  { id: 'op8', groupId: 'operations', stt: 8, name: 'Xử lý các phản hồi của SV & GV', shortName: 'Phản hồi', description: 'Kiến nghị của sinh viên', criteria: 'Số lượng kiến nghị không được xử lý kịp thời', unit: 'Số kiến nghị', weight: 5 },
  { id: 'op9', groupId: 'operations', stt: 9, name: 'Quản lý tiến trình học tập của sinh viên', shortName: 'Hồ sơ SV', description: 'Độ trễ cập nhật hồ sơ', criteria: 'Độ trễ cập nhật hồ sơ sinh viên theo yêu cầu', unit: 'Ngày', weight: 5 },
  { id: 'op10', groupId: 'operations', stt: 10, name: 'Quản lý học liệu (BTEC)', shortName: 'Học liệu', description: 'Học liệu môn học', criteria: 'Tỷ lệ các môn có đầy đủ tài liệu môn học đúng hạn', unit: '%', weight: 5 },
  
  // Group 2: Academic Support (20%)
  { id: 'as5', groupId: 'academic_support', stt: 5, name: 'Tổ chức hoạt động Tọa đàm, hội thảo chuyên đề, guest speaker, field trip', shortName: 'HĐ Ngoại khóa', description: 'Các hoạt động ngoại khóa', criteria: 'Số lượng các hoạt động được triển khai (số hoạt động/ số môn)', unit: '%', weight: 20 },
];

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today); date.setDate(date.getDate() + offset); return date.toISOString().split('T')[0];
};

// ==================== KPI SNAPSHOTS ====================
export const kpiSnapshots: KPISnapshot[] = [
  // Nguyễn Minh Tuấn (u8)
  { id: 'ks_u8_op1', userId: 'u8', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, rawNumerator: 17, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_op2', userId: 'u8', kpiDefinitionId: 'op2', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 41, actualValue: 41, rawNumerator: 41, rawDenominator: 41, calculatedAt: d(0) },
  { id: 'ks_u8_op3', userId: 'u8', kpiDefinitionId: 'op3', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 27, actualValue: 27, rawNumerator: 27, rawDenominator: 27, calculatedAt: d(0) },
  { id: 'ks_u8_op4', userId: 'u8', kpiDefinitionId: 'op4', period: 'Kỳ 2 2024-2025', score: 94.12, targetValue: 17, actualValue: 16, rawNumerator: 16, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_op6', userId: 'u8', kpiDefinitionId: 'op6', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, rawNumerator: 17, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_op7', userId: 'u8', kpiDefinitionId: 'op7', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 1, actualValue: 1, rawNumerator: 1, rawDenominator: 1, calculatedAt: d(0) },
  { id: 'ks_u8_op8', userId: 'u8', kpiDefinitionId: 'op8', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 0, actualValue: 0, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u8_op9', userId: 'u8', kpiDefinitionId: 'op9', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 0, actualValue: 0, rawNumerator: 0, rawDenominator: 0, calculatedAt: d(0) },
  { id: 'ks_u8_op10', userId: 'u8', kpiDefinitionId: 'op10', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, rawNumerator: 17, rawDenominator: 17, calculatedAt: d(0) },
  { id: 'ks_u8_as5', userId: 'u8', kpiDefinitionId: 'as5', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 5, actualValue: 5, rawNumerator: 5, rawDenominator: 5, calculatedAt: d(0) },

  // Đào Ngọc Diệp (u7)
  { id: 'ks_u7_op1', userId: 'u7', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 11, actualValue: 11, rawNumerator: 11, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks_u7_op10', userId: 'u7', kpiDefinitionId: 'op10', period: 'Kỳ 2 2024-2025', score: 81.82, targetValue: 11, actualValue: 9, rawNumerator: 9, rawDenominator: 11, calculatedAt: d(0) },
  { id: 'ks_u7_op3', userId: 'u7', kpiDefinitionId: 'op3', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 3, actualValue: 3, rawNumerator: 3, rawDenominator: 3, calculatedAt: d(0) },

  // Vũ Minh Nhật (u2)
  { id: 'ks_u2_op1', userId: 'u2', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 80, targetValue: 5, actualValue: 4, rawNumerator: 4, rawDenominator: 5, calculatedAt: d(0) },

  // Đoàn Thu Hương Giang (u9)
  { id: 'ks_u9_op1', userId: 'u9', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 12, actualValue: 12, rawNumerator: 12, rawDenominator: 12, calculatedAt: d(0) },
  { id: 'ks_u9_op10', userId: 'u9', kpiDefinitionId: 'op10', period: 'Kỳ 2 2024-2025', score: 91.67, targetValue: 12, actualValue: 11, rawNumerator: 11, rawDenominator: 12, calculatedAt: d(0) },
];

// ==================== OTHER ACTIVITIES ====================
export const otherActivityRecords: OtherActivityRecord[] = [
  { userId: 'u8', period: 'Kỳ 2 2024-2025', admission: true, studyAbroad: true, exchange: false, otherInstitute: true, updatedAt: d(0) },
  { userId: 'u9', period: 'Kỳ 2 2024-2025', admission: true, studyAbroad: false, exchange: false, otherInstitute: true, updatedAt: d(0) },
];

// ==================== LABOR DISCIPLINE ====================
export const laborDisciplineRecords: LaborDisciplineRecord[] = [
  { userId: 'u8', period: 'Kỳ 2 2024-2025', score: 95, note: 'Đi làm đúng giờ, tuân thủ nội quy', updatedBy: 'u1', updatedAt: d(0) },
  { userId: 'u9', period: 'Kỳ 2 2024-2025', score: 100, note: 'Tốt', updatedBy: 'u1', updatedAt: d(0) },
];

// ==================== NOTIFICATIONS ====================
export const notifications: Notification[] = [
  { id: 'n1', userId: 'u8', type: 'kpi_warning', priority: 'medium', title: 'Tiến độ nhập điểm', message: 'Môn Entrepreneurial Skills chưa hoàn thành nhập điểm đúng hạn.', severity: 'warning', read: false, createdAt: d(0), category: 'kpi' },
];

// ==================== REVIEW CYCLES ====================
export const reviewCycles: ReviewCycle[] = [
  { id: 'rc1', name: 'Kỳ 1 2024-2025', startDate: '2024-08-01', endDate: '2025-01-31', reviewDeadline: '2025-02-15', status: 'closed' },
  { id: 'rc2', name: 'Kỳ 2 2024-2025', startDate: '2025-02-01', endDate: '2025-07-31', reviewDeadline: '2025-08-15', status: 'open' },
];

// ==================== REVIEWS ====================
export const reviews: Review[] = [
  { id: 'r1', userId: 'u8', cycleId: 'rc2', selfNote: 'Em đã nỗ lực hoàn thành các chỉ tiêu được giao.', managerNote: '', adjustedScore: null, adjustmentReason: '', submittedAt: d(-2), reviewedAt: null },
  { id: 'r2', userId: 'u9', cycleId: 'rc2', selfNote: 'Học liệu BTEC đã được chuẩn bị đầy đủ.', managerNote: 'Tốt.', adjustedScore: 95, adjustmentReason: 'Vượt tiến độ', submittedAt: d(-5), reviewedAt: d(-4) },
];

// ==================== HELPERS ====================
export function getUserById(id: string): User | undefined { return users.find(u => u.id === id); }
export function getProgramById(id: string): Program | undefined { return programs.find(p => p.id === id); }
export function getKPISnapshotsByUser(userId: string, period?: string): KPISnapshot[] { return kpiSnapshots.filter(s => s.userId === userId && (!period || s.period === period)); }
export function getNotificationsByUser(userId: string): Notification[] { return notifications.filter(n => n.userId === userId); }

export function calculateOperationsKPI(userId: string, period: string): number {
  const snapshots = getKPISnapshotsByUser(userId, period);
  const opSnaps = snapshots.filter(s => {
    const def = kpiDefinitions.find(d => d.id === s.kpiDefinitionId);
    return def?.groupId === 'operations';
  });
  return opSnaps.length > 0 ? Math.round(opSnaps.reduce((sum, s) => sum + s.score, 0) / opSnaps.length) : 0;
}

export function getKPIDetailsBySnapshot(snapshotId: string): KPIDetailItem[] {
  if (snapshotId === 'ks_u8_op4') {
    return [
      { id: 'di1', kpiSnapshotId: 'ks_u8_op4', label: 'Internship', achieved: true, note: 'Đã nhập điểm' },
      { id: 'di2', kpiSnapshotId: 'ks_u8_op4', label: 'Entrepreneurial Skills', achieved: false, note: 'Chưa nhập điểm xong' },
    ];
  }
  return [];
}

export function getCoordinatorStats(userId: string): CoordinatorStats | undefined {
  const user = getUserById(userId);
  if (!user) return undefined;
  
  // Basic stats for demonstration
  return {
    userId: user.id,
    programme: user.id === 'u9' ? 'BTEC' : 'BBAE',
    totalStudents: user.id === 'u9' ? 145 : 122,
    totalClasses: user.id === 'u9' ? 5 : 6,
    totalLecturers: user.id === 'u9' ? 12 : 29,
    passRateActual: user.id === 'u9' ? 0.85 : 0.9857,
    passRateTarget: 0.95,
    attendanceRateActual: user.id === 'u9' ? 0.92 : 0.9881,
    attendanceRateTarget: 0.95,
  };
}

export function calculateOverallKPI(userId: string, period: string): number {
  const snapshots = getKPISnapshotsByUser(userId, period);
  const opScore = calculateOperationsKPI(userId, period);
  const asSnaps = snapshots.filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'academic_support');
  const asScore = asSnaps.length > 0 ? asSnaps.reduce((sum, s) => sum + s.score, 0) / asSnaps.length : 0;
  const userCourses = courses;
  const studentResultsScore = userCourses.length > 0 ? userCourses.reduce((sum, c) => {
    const disciplineScore = (c.attendanceRate / c.attendanceTarget) * 100;
    const academicScore = (c.passRate / c.passTarget) * 100;
    return sum + (Math.min(disciplineScore, 100) + Math.min(academicScore, 100)) / 2;
  }, 0) / userCourses.length : 0;
  const otherRec = otherActivityRecords.find(r => r.userId === userId && r.period === period);
  let otherScore = 0;
  if (otherRec) {
    if (otherRec.admission) otherScore += 25;
    if (otherRec.studyAbroad) otherScore += 25;
    if (otherRec.exchange) otherScore += 25;
    if (otherRec.otherInstitute) otherScore += 25;
  }
  const laborRec = laborDisciplineRecords.find(r => r.userId === userId && r.period === period);
  const laborScore = laborRec?.score || 0;
  const final = (opScore * 0.5) + (asScore * 0.2) + (studentResultsScore * 0.1) + (otherScore * 0.1) + (laborScore * 0.1);
  return Math.round(final);
}

export function getUserRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    operation: 'Điều phối',
    coordinator_director: 'CN CT & Điều phối',
    manager: 'Quản lý',
    institute_leader: 'Lãnh đạo Viện',
    admin: 'Quản trị viên',
  };
  return labels[role] || role;
}

export function userHasRole(userId: string, role: UserRole): boolean {
  const user = getUserById(userId);
  return user ? user.roles.includes(role) : false;
}

// ==================== KPI EDIT REQUESTS ====================
let _editRequests: KPIEditRequest[] = [];
let _editListeners: (() => void)[] = [];
export function subscribeEditRequests(fn: () => void) { _editListeners.push(fn); return () => { _editListeners = _editListeners.filter(f => f !== fn); }; }
function _notifyEdit() { _editListeners.forEach(fn => fn()); }
export function getKPIEditRequests(): KPIEditRequest[] { return _editRequests; }
export function getPendingEditForSnapshot(snapshotId: string): KPIEditRequest | undefined { return _editRequests.find(r => r.snapshotId === snapshotId && r.status === 'pending'); }
export function createKPIEditRequest(req: Omit<KPIEditRequest, 'id' | 'status' | 'requestedAt' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>) {
  const newReq: KPIEditRequest = { ...req, id: 'er' + Date.now(), status: 'pending', requestedAt: new Date().toISOString(), reviewedBy: null, reviewedAt: null, reviewNote: '' };
  _editRequests = [newReq, ..._editRequests]; _notifyEdit(); return newReq;
}
export function approveKPIEditRequest(id: string, reviewerId: string, note: string) { _editRequests = _editRequests.map(r => r.id !== id ? r : { ...r, status: 'approved', reviewedBy: reviewerId, reviewedAt: new Date().toISOString(), reviewNote: note }); _notifyEdit(); }
export function rejectKPIEditRequest(id: string, reviewerId: string, note: string) { _editRequests = _editRequests.map(r => r.id !== id ? r : { ...r, status: 'rejected', reviewedBy: reviewerId, reviewedAt: new Date().toISOString(), reviewNote: note }); _notifyEdit(); }

// ==================== COURSE EDIT REQUESTS ====================
let _courseEditRequests: CourseEditRequest[] = [];
let _courseEditListeners: (() => void)[] = [];
export function subscribeCourseEditRequests(fn: () => void) { _courseEditListeners.push(fn); return () => { _courseEditListeners = _courseEditListeners.filter(f => f !== fn); }; }
function _notifyCourseEdit() { _courseEditListeners.forEach(fn => fn()); }
export function getCourseEditRequests(): CourseEditRequest[] { return _courseEditRequests; }
export function getPendingCourseEditForField(courseId: string, field: CourseEditField): CourseEditRequest | undefined { return _courseEditRequests.find(r => r.courseId === courseId && r.field === field && r.status === 'pending'); }
export function createCourseEditRequest(req: Omit<CourseEditRequest, 'id' | 'status' | 'requestedAt' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>) {
  const newReq: CourseEditRequest = { ...req, id: 'cer' + Date.now(), status: 'pending', requestedAt: new Date().toISOString(), reviewedBy: null, reviewedAt: null, reviewNote: '' };
  _courseEditRequests = [newReq, ..._courseEditRequests]; _notifyCourseEdit(); return newReq;
}
export function approveCourseEditRequest(id: string, reviewerId: string, note: string) { _courseEditRequests = _courseEditRequests.map(r => r.id !== id ? r : { ...r, status: 'approved', reviewedBy: reviewerId, reviewedAt: new Date().toISOString(), reviewNote: note }); _notifyCourseEdit(); }
export function rejectCourseEditRequest(id: string, reviewerId: string, note: string) { _courseEditRequests = _courseEditRequests.map(r => r.id !== id ? r : { ...r, status: 'rejected', reviewedBy: reviewerId, reviewedAt: new Date().toISOString(), reviewNote: note }); _notifyCourseEdit(); }

export const semesterData = { currentSemester: 'Kỳ 2 2024-2025', startDate: '2025-02-01', endDate: '2025-07-31' };

// ==================== MANAGER QUESTIONS ====================
let _managerQuestions: ManagerQuestion[] = [
  { id: 'mq1', fromUserId: 'u1', toUserId: 'u8', subject: 'Tiến độ nhập điểm', question: 'Môn Entrepreneurial Skills tại sao chưa nhập điểm xong?', context: 'Entrepreneurial Skills', contextType: 'course', contextId: 'c4', status: 'open', createdAt: d(-1), answer: '', answeredAt: null, managerReply: '', repliedAt: null },
];
let _questionListeners: (() => void)[] = [];
export function subscribeQuestions(fn: () => void) { _questionListeners.push(fn); return () => { _questionListeners = _questionListeners.filter(f => f !== fn); }; }
function _notifyQuestions() { _questionListeners.forEach(fn => fn()); }
export function getManagerQuestions(): ManagerQuestion[] { return _managerQuestions; }
export function getQuestionsForUser(userId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.toUserId === userId); }
export function getQuestionsByManager(managerId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.fromUserId === managerId); }
export function getOpenQuestionsForUser(userId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.toUserId === userId && q.status === 'open'); }
export function createManagerQuestion(q: Omit<ManagerQuestion, 'id' | 'status' | 'createdAt' | 'answer' | 'answeredAt' | 'managerReply' | 'repliedAt'>) {
  const newQ: ManagerQuestion = { ...q, id: 'mq' + Date.now(), status: 'open', createdAt: new Date().toISOString().split('T')[0], answer: '', answeredAt: null, managerReply: '', repliedAt: null };
  _managerQuestions = [newQ, ..._managerQuestions]; _notifyQuestions(); return newQ;
}
export function answerQuestion(questionId: string, answer: string): void { _managerQuestions = _managerQuestions.map(q => q.id !== questionId ? q : { ...q, status: 'answered' as const, answer, answeredAt: new Date().toISOString().split('T')[0] }); _notifyQuestions(); }
export function replyToAnswer(questionId: string, reply: string): void { _managerQuestions = _managerQuestions.map(q => q.id !== questionId ? q : { ...q, status: 'closed' as const, managerReply: reply, repliedAt: new Date().toISOString().split('T')[0] }); _notifyQuestions(); }
