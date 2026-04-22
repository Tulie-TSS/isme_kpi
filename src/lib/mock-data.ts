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

// ==================== KPI DEFINITIONS ====================
export const kpiDefinitions: KPIDefinition[] = [
  { id: 'op1', groupId: 'operations', stt: 1, name: 'Làm việc với nhóm GV từng môn về nội dung giảng dạy', shortName: 'Nội dung GD', description: 'Tài liệu SoW, Assessment Plan, Assignment Brief', criteria: 'Tỷ lệ các môn học có đầy đủ các tài liệu đúng tiến độ', unit: '%' },
  { id: 'op2', groupId: 'operations', stt: 2, name: 'Hợp đồng & Thanh toán GV', shortName: 'Hợp đồng GV', description: 'HĐ GV, Thanh toán giảng dạy, Thanh toán chấm bài', criteria: 'Tỷ lệ giảng viên được cập nhật thông tin theo đúng tiến độ', unit: '%' },
  { id: 'op3', groupId: 'operations', stt: 3, name: 'Tổ chức lớp học (Setup)', shortName: 'Setup lớp', description: 'TKB, Moodle, Account, Enroll GV & SV', criteria: 'Tỷ lệ các lớp được set up theo kế hoạch', unit: '%' },
  { id: 'op4', groupId: 'operations', stt: 4, name: 'Quản lý điểm và quá trình đánh giá SV', shortName: 'Quản lý điểm', description: 'Theo dõi tiến độ nhập điểm', criteria: 'Tỷ lệ các môn học hoàn thành điểm theo đúng kế hoạch', unit: '%' },
  { id: 'op6', groupId: 'operations', stt: 6, name: 'Rà soát kết quả học tập', shortName: 'Rà soát KQ', description: 'File kết quả rà soát theo yêu cầu', criteria: 'Tỷ lệ các môn học có file kết quả rà soát', unit: '%' },
  { id: 'op7', groupId: 'operations', stt: 7, name: 'Giám sát liêm chính học thuật (Turnitin)', shortName: 'Turnitin', description: 'Báo cáo Turnitin', criteria: 'Tỷ lệ các môn học có báo cáo kết quả rà soát Turnitin', unit: '%' },
  { id: 'op8', groupId: 'operations', stt: 8, name: 'Xử lý phản hồi SV & GV', shortName: 'Phản hồi', description: 'Kiến nghị của sinh viên', criteria: 'Số lượng kiến nghị không được xử lý kịp thời', unit: 'Số kiến nghị' },
  { id: 'op9', groupId: 'operations', stt: 9, name: 'Quản lý tiến trình học tập SV', shortName: 'Hồ sơ SV', description: 'Độ trễ cập nhật hồ sơ', criteria: 'Độ trễ cập nhật hồ sơ sinh viên theo yêu cầu', unit: 'Ngày' },
  { id: 'op10', groupId: 'operations', stt: 10, name: 'Quản lý học liệu', shortName: 'Học liệu', description: 'Học liệu môn học', criteria: 'Tỷ lệ các môn có đầy đủ tài liệu môn học đúng hạn', unit: '%' },
  { id: 'as5', groupId: 'academic_support', stt: 5, name: 'Tổ chức hoạt động Ngoại khóa', shortName: 'HĐ Ngoại khóa', description: 'Tọa đàm, guest speaker, field trip', criteria: 'Số lượng các hoạt động được triển khai', unit: 'Số hoạt động' },
];

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today); date.setDate(date.getDate() + offset); return date.toISOString().split('T')[0];
};

// ==================== KPI SNAPSHOTS (Extracted from Excel) ====================
export const kpiSnapshots: KPISnapshot[] = [
  // Nguyễn Minh Tuấn (u8)
  { id: 'ks_u8_op1', userId: 'u8', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, calculatedAt: d(0) },
  { id: 'ks_u8_op10', userId: 'u8', kpiDefinitionId: 'op10', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, calculatedAt: d(0) },
  { id: 'ks_u8_op3', userId: 'u8', kpiDefinitionId: 'op3', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 27, actualValue: 27, calculatedAt: d(0) },
  { id: 'ks_u8_op6', userId: 'u8', kpiDefinitionId: 'op6', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 17, actualValue: 17, calculatedAt: d(0) },
  
  // Đào Ngọc Diệp (u7)
  { id: 'ks_u7_op1', userId: 'u7', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 11, actualValue: 11, calculatedAt: d(0) },
  { id: 'ks_u7_op10', userId: 'u7', kpiDefinitionId: 'op10', period: 'Kỳ 2 2024-2025', score: 81.82, targetValue: 11, actualValue: 9, calculatedAt: d(0) },
  { id: 'ks_u7_op3', userId: 'u7', kpiDefinitionId: 'op3', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 3, actualValue: 3, calculatedAt: d(0) },
  
  // Vũ Minh Nhật (u2)
  { id: 'ks_u2_op1', userId: 'u2', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 80, targetValue: 5, actualValue: 4, calculatedAt: d(0) },
  
  // Đoàn Thu Hương Giang (u9)
  { id: 'ks_u9_op1', userId: 'u9', kpiDefinitionId: 'op1', period: 'Kỳ 2 2024-2025', score: 100, targetValue: 12, actualValue: 12, calculatedAt: d(0) },
  { id: 'ks_u9_op10', userId: 'u9', kpiDefinitionId: 'op10', period: 'Kỳ 2 2024-2025', score: 91.67, targetValue: 12, actualValue: 11, calculatedAt: d(0) },
];

// ==================== COURSES ====================
export const courses: Course[] = [
  { id: 'c1', programId: 'p7', name: 'Internship', cohort: 'BBAE K63', numLecturers: 24, numStudents: 70, attendanceRate: 1, attendanceTarget: 0.95, passRate: 0.988, submitRate: 1, passTarget: 0.95 },
  { id: 'c2', programId: 'p7', name: 'Creativity & Innovation Management', cohort: 'BBAE K64', numLecturers: 1, numStudents: 52, attendanceRate: 1, attendanceTarget: 0.95, passRate: 1, submitRate: 1, passTarget: 0.95 },
  { id: 'c3', programId: 'p3', name: 'Academic Writing', cohort: 'Intake 10 + 11', numLecturers: 1, numStudents: 145, attendanceRate: 0.95, attendanceTarget: 0.95, passRate: 0.764, submitRate: 0.96, passTarget: 0.95 },
];

// ==================== HELPERS ====================
export function getUserById(id: string): User | undefined { return users.find(u => u.id === id); }
export function getProgramById(id: string): Program | undefined { return programs.find(p => p.id === id); }
export function getKPISnapshotsByUser(userId: string, period?: string): KPISnapshot[] { return kpiSnapshots.filter(s => s.userId === userId && (!period || s.period === period)); }
export function getNotificationsByUser(userId: string): Notification[] { return []; }

export function calculateOverallKPI(userId: string, period: string): number {
  const snapshots = getKPISnapshotsByUser(userId, period);
  if (snapshots.length === 0) return 0;
  const avg = snapshots.reduce((sum, s) => sum + s.score, 0) / snapshots.length;
  return Math.round(avg);
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

// Dummy exports for legacy components
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
export function getManagerQuestions(): ManagerQuestion[] { return []; }
export function getQuestionsForUser(userId: string): ManagerQuestion[] { return []; }
export function subscribeQuestions(fn: any): any { return () => {}; }

export const reviewCycles: ReviewCycle[] = [
  { id: 'rc1', name: 'Đánh giá giữa kỳ 2', startDate: '2024-03-01', endDate: '2024-03-15', reviewDeadline: '2024-03-20', status: 'closed' },
  { id: 'rc2', name: 'Đánh giá cuối kỳ 2', startDate: '2024-06-01', endDate: '2024-06-15', reviewDeadline: '2024-06-20', status: 'open' },
];
export const reviews: Review[] = [];
