import { User, Program, Course, KPIDefinition, KPISnapshot, KPIGroup, OtherActivityRecord, LaborDisciplineRecord, Notification, ManagerQuestion, UserRole, ReviewCycle, Review, KPIEditRequest, CourseEditRequest } from './types';

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
  { id: 'u14', name: 'Nguyễn Chính', email: 'nguyen.chinh@isneu.org', role: 'admin', roles: ['manager', 'institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Admin gốc' },
  { id: 'u15', name: 'Hồ Hoàng Lan (Admin)', email: 'ho.lan@isneu.org', role: 'admin', roles: ['admin'], managerId: null, avatarUrl: '', active: true, position: 'Quản trị viên' },
  { id: 'u0', name: 'Admin System', email: 'admin@isme.edu.vn', role: 'admin', roles: ['manager'], managerId: null, avatarUrl: '', active: true, position: 'Quản trị hệ thống' },
  { id: 'u8', name: 'Nguyễn Minh Tuấn', email: 'nguyen.tuan@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BBAE' },
  { id: 'u9', name: 'Đoàn Thu Hương Giang', email: 'doan.giang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BTEC' },
];

// ==================== PROGRAMS ====================
export const programs: Program[] = [
  { id: 'p3', name: 'BTEC HND', type: 'certificate', status: 'active', shortName: 'BTEC', managerId: 'u9' },
  { id: 'p7', name: 'BBAE', type: 'degree', status: 'active', shortName: 'BBAE', managerId: 'u8' },
];

// ==================== COURSES (Matching Image 2) ====================
export const courses: Course[] = [
  // p7: BBAE
  { id: 'c1', programId: 'p7', name: 'Internship', cohort: 'BBAE K63', numLecturers: 24, numStudents: 70, attendanceRate: 0.9881, attendanceTarget: 0.95, passRate: 0.9857, submitRate: 0.95, passTarget: 0.95 },
  { id: 'c2', programId: 'p7', name: 'Creativity & Innovation Management', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0, passTarget: 0.95 },
  { id: 'c3', programId: 'p7', name: 'Entrepreneurial Design Thinking', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0, passTarget: 0.95 },
  { id: 'c4', programId: 'p7', name: 'Entrepreneurial Skills', cohort: 'BBAE K64', numLecturers: 1, numStudents: 53, attendanceRate: 0.9714, attendanceTarget: 0.95, passRate: 0.9623, submitRate: 0.9714, passTarget: 0.95 },
  { id: 'c5', programId: 'p7', name: 'Hochiminh\'s Ideology', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0, passTarget: 0.95 },
  { id: 'c6', programId: 'p7', name: 'Management of Info system', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1.0, attendanceTarget: 0.95, passRate: 1.0, submitRate: 0.9853, passTarget: 0.95 },
];

// ==================== KPI DEFINITIONS (Matching Image 1) ====================
export const kpiDefinitions: KPIDefinition[] = [
  // Operations (50%)
  { id: 'op1', groupId: 'operations', stt: 1, name: 'Làm việc với nhóm GV từng môn về nội dung giảng dạy', shortName: 'Nội dung GD', description: 'Tài liệu SoW, Assessment Plan, Assignment Brief', criteria: 'Tỷ lệ các môn học có đầy đủ các tài liệu đúng tiến độ', unit: '%' },
  { id: 'op2', groupId: 'operations', stt: 2, name: 'Cung cấp thông tin phục vụ hoàn thiện các thủ tục ký hợp đồng, thanh lý...', shortName: 'Hợp đồng GV', description: 'HĐ GV, Thanh toán giảng dạy, Thanh toán chấm bài', criteria: 'Tỷ lệ giảng viên được cập nhật thông tin theo đúng tiến độ', unit: '%' },
  { id: 'op3', groupId: 'operations', stt: 3, name: 'Tổ chức lớp học', shortName: 'Setup lớp', description: 'TKB, Moodle, Account, Enroll GV & SV', criteria: 'Tỷ lệ các lớp được set up theo kế hoạch', unit: '%' },
  { id: 'op4', groupId: 'operations', stt: 4, name: 'Quản lý điểm và quá trình đánh giá SV', shortName: 'Quản lý điểm', description: 'Theo dõi tiến độ nhập điểm', criteria: 'Tỷ lệ các môn học hoàn thành điểm theo đúng kế hoạch', unit: '%' },
  { id: 'op6', groupId: 'operations', stt: 6, name: 'Rà soát kết quả học tập, hồ sơ hoàn thành chương trình', shortName: 'Rà soát KQ', description: 'File kết quả rà soát theo yêu cầu', criteria: 'Tỷ lệ các môn học có file kết quả rà soát', unit: '%' },
  { id: 'op7', groupId: 'operations', stt: 7, name: 'Giám sát liêm chính học thuật', shortName: 'Turnitin', description: 'Báo cáo Turnitin', criteria: 'Tỷ lệ các môn học có báo cáo kết quả rà soát Turnitin', unit: '%' },
  { id: 'op8', groupId: 'operations', stt: 8, name: 'Xử lý các phản hồi của SV & GV', shortName: 'Phản hồi', description: 'Kiến nghị của sinh viên', criteria: 'Số lượng kiến nghị không được xử lý kịp thời', unit: 'Số kiến nghị' },
  { id: 'op9', groupId: 'operations', stt: 9, name: 'Quản lý tiến trình học tập của sinh viên', shortName: 'Hồ sơ SV', description: 'Độ trễ cập nhật hồ sơ', criteria: 'Độ trễ cập nhật hồ sơ sinh viên theo yêu cầu', unit: 'Ngày' },
  { id: 'op10', groupId: 'operations', stt: 10, name: 'Quản lý học liệu (BTEC)', shortName: 'Học liệu', description: 'Học liệu môn học', criteria: 'Tỷ lệ các môn có đầy đủ tài liệu môn học đúng hạn', unit: '%' },

  // Academic Support (20%)
  { id: 'as5', groupId: 'academic_support', stt: 5, name: 'Tổ chức hoạt động Tọa đàm, hội thảo chuyên đề, guest speaker, field trip', shortName: 'HĐ Ngoại khóa', description: 'Các hoạt động ngoại khóa', criteria: 'Số lượng các hoạt động được triển khai (số hoạt động/ số môn)', unit: '%' },
];

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today); date.setDate(date.getDate() + offset); return date.toISOString().split('T')[0];
};

// ==================== KPI SNAPSHOTS ====================
export const kpiSnapshots: KPISnapshot[] = [
  // Nguyễn Minh Tuấn (u8) - Operations
  { id: 'ks1', userId: 'u8', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, calculatedAt: d(0) },
  { id: 'ks2', userId: 'u8', kpiDefinitionId: 'op2', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 41, actualValue: 41, calculatedAt: d(0) },
  { id: 'ks3', userId: 'u8', kpiDefinitionId: 'op3', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 27, actualValue: 27, calculatedAt: d(0) },
  { id: 'ks4', userId: 'u8', kpiDefinitionId: 'op4', period: 'Kỳ 2 2024-2025', score: 94.12, targetValue: 17, actualValue: 16, calculatedAt: d(0) },
  { id: 'ks6', userId: 'u8', kpiDefinitionId: 'op6', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, calculatedAt: d(0) },
  { id: 'ks7', userId: 'u8', kpiDefinitionId: 'op7', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 1, actualValue: 1, calculatedAt: d(0) },
  { id: 'ks5', userId: 'u8', kpiDefinitionId: 'as5', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 5, actualValue: 5, calculatedAt: d(0) },
];

// ==================== OTHER ACTIVITIES ====================
export const otherActivityRecords: OtherActivityRecord[] = [
  { userId: 'u8', period: 'Kỳ 2 2024-2025', admission: true, studyAbroad: true, exchange: false, otherInstitute: true, updatedAt: d(0) },
];

// ==================== LABOR DISCIPLINE ====================
export const laborDisciplineRecords: LaborDisciplineRecord[] = [
  { userId: 'u8', period: 'Kỳ 2 2024-2025', score: 95, note: 'Đi làm đúng giờ, tuân thủ nội quy', updatedBy: 'u1', updatedAt: d(0) },
];

// ==================== NOTIFICATIONS ====================
export const notifications: Notification[] = [
  { id: 'n1', userId: 'u8', type: 'kpi_warning', priority: 'medium', title: 'Tiến độ nhập điểm', message: 'Môn Entrepreneurial Skills chưa hoàn thành nhập điểm đúng hạn.', severity: 'warning', read: false, createdAt: d(0), category: 'kpi' },
];

// ==================== HELPERS ====================
export function getUserById(id: string): User | undefined { return users.find(u => u.id === id); }
export function getProgramById(id: string): Program | undefined { return programs.find(p => p.id === id); }
export function getKPISnapshotsByUser(userId: string, period?: string): KPISnapshot[] { return kpiSnapshots.filter(s => s.userId === userId && (!period || s.period === period)); }
export function getNotificationsByUser(userId: string): Notification[] { return notifications.filter(n => n.userId === userId); }

// Complex Overall KPI Calculation
export function calculateOverallKPI(userId: string, period: string): number {
  const snapshots = getKPISnapshotsByUser(userId, period);
  
  // 1. Operations (50%)
  const opSnaps = snapshots.filter(s => {
    const def = kpiDefinitions.find(d => d.id === s.kpiDefinitionId);
    return def?.groupId === 'operations';
  });
  const opScore = opSnaps.length > 0 ? opSnaps.reduce((sum, s) => sum + s.score, 0) / opSnaps.length : 0;

  // 2. Academic Support (20%)
  const asSnaps = snapshots.filter(s => {
    const def = kpiDefinitions.find(d => d.id === s.kpiDefinitionId);
    return def?.groupId === 'academic_support';
  });
  const asScore = asSnaps.length > 0 ? asSnaps.reduce((sum, s) => sum + s.score, 0) / asSnaps.length : 0;

  // 3. Student Results (10%)
  const userCourses = courses;
  const studentResultsScore = userCourses.length > 0 ? userCourses.reduce((sum, c) => {
    const disciplineScore = (c.attendanceRate / c.attendanceTarget) * 100;
    const academicScore = (c.passRate / c.passTarget) * 100;
    return sum + (Math.min(disciplineScore, 100) + Math.min(academicScore, 100)) / 2;
  }, 0) / userCourses.length : 0;

  // 4. Other Activities (10%)
  const otherRec = otherActivityRecords.find(r => r.userId === userId && r.period === period);
  let otherScore = 0;
  if (otherRec) {
    if (otherRec.admission) otherScore += 25;
    if (otherRec.studyAbroad) otherScore += 25;
    if (otherRec.exchange) otherScore += 25;
    if (otherRec.otherInstitute) otherScore += 25;
  }

  // 5. Labor Discipline (10%)
  const laborRec = laborDisciplineRecords.find(r => r.userId === userId && r.period === period);
  const laborScore = laborRec?.score || 0;

  // Final Weighted sum
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

// ==================== REVIEWS (Restored for review page) ====================

export const reviewCycles: ReviewCycle[] = [
  { id: 'rc1', name: 'Đánh giá giữa kỳ 2', startDate: '2024-03-01', endDate: '2024-03-15', reviewDeadline: '2024-03-20', status: 'closed' },
  { id: 'rc2', name: 'Đánh giá cuối kỳ 2', startDate: '2024-06-01', endDate: '2024-06-15', reviewDeadline: '2024-06-20', status: 'open' },
];

export const reviews: Review[] = [
  { id: 'r1', userId: 'u8', cycleId: 'rc2', selfNote: '', managerNote: '', adjustedScore: null, adjustmentReason: '', submittedAt: new Date().toISOString(), reviewedAt: null },
];

// ==================== DUMMY EXPORTS FOR LEGACY UI ====================
export const semesterData: any[] = [];
export function createCourseEditRequest(req: any): any {}
export function getPendingCourseEditForField(cid: string, field: string): any { return null; }
export function getCourseEditRequests(): any[] { return []; }
export function subscribeCourseEditRequests(fn: any): any { return () => {}; }
export function approveCourseEditRequest(id: string, note: string): any {}
export function rejectCourseEditRequest(id: string, note: string): any {}
export function getPendingEditForSnapshot(sid: string): any { return null; }
export function subscribeEditRequests(fn: any): any { return () => {}; }
export function getKPIEditRequests(): any[] { return []; }
export function approveKPIEditRequest(id: string, note: string): any {}
export function rejectKPIEditRequest(id: string, note: string): any {}
export function createKPIEditRequest(req: any): any {}

