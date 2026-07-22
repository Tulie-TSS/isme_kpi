import { User, Program, Course, KPIDefinition, KPISnapshot, KPIGroup, OtherActivityRecord, LaborDisciplineRecord, Notification, ManagerQuestion, UserRole, ReviewCycle, Review, KPIDetailItem, CoordinatorStats, KPIEditRequest, CourseEditRequest, CourseEditField, AuditLog } from './types';
export { getTasksByUser, getOverdueTasksByUser } from './mock-tasks';

// Helper to check window environment
const isClient = typeof window !== 'undefined';

function getSaved<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// ==================== KPI GROUPS ====================
export const kpiGroups: KPIGroup[] = [
  { id: 'operations', name: 'Nhóm KPI theo mô tả CV (Operations)', weight: 50 },
  { id: 'academic_support', name: 'Hoạt động hỗ trợ học tập', weight: 20 },
  { id: 'student_results', name: 'Kết quả học tập và Kỷ luật của sinh viên', weight: 20 },
  { id: 'other_activities', name: 'Các hoạt động khác', weight: 10 },
];

// ==================== USERS ====================
export const users: User[] = [
  { id: 'u1', name: 'Hồ Hoàng Lan', email: 'ho.lan@isneu.org', role: 'manager', roles: ['manager', 'institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Trưởng Ban Đào tạo đại học' },
  { id: 'u14', name: 'Nguyễn Thùy Chinh', email: 'nguyen.chinh@isneu.org', role: 'manager', roles: ['manager'], managerId: null, avatarUrl: '', active: true, position: 'Phó Trưởng ban' },
  { id: 'u0', name: 'Admin System', email: 'admin@isneu.org', role: 'admin', roles: ['manager'], managerId: null, avatarUrl: '', active: true, position: 'Quản trị hệ thống' },
  
  // Leaders
  { id: 'u20', name: 'Lê Thanh', email: 'le.thanh@isneu.org', role: 'manager', roles: ['institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Lãnh đạo Viện' },
  { id: 'u21', name: 'Trịnh Giang', email: 'trinh.giang@isneu.org', role: 'manager', roles: ['institute_leader'], managerId: null, avatarUrl: '', active: true, position: 'Lãnh đạo Viện' },

  // Coordinators
  { id: 'u8', name: 'Nguyễn Minh Tuấn', email: 'nguyen.tuan@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CN CT BBAE' },
  { id: 'u9', name: 'Đoàn Thu Hương Giang', email: 'doan.giang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u2', name: 'Vũ Minh Nhật', email: 'vu.nhat@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CNCT Top-up UWE' },
  { id: 'u3', name: 'Phạm Gia Linh', email: 'pham.gialinh@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Điều phối viên' },
  { id: 'u4', name: 'Trần Thị Bích Ngọc', email: 'tran.ngoc@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CNCT NHTC' },
  { id: 'u5', name: 'Trần Hương Thảo', email: 'tran.thao@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CNCT BTEC' },
  { id: 'u6', name: 'Nguyễn Giang Khánh Huyền', email: 'nguyen.huyen@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CNCT Top-up CU' },
  { id: 'u7', name: 'Đào Ngọc Diệp', email: 'dao.diep@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'Phụ trách CT AU' },
  { id: 'u10', name: 'Bùi Thu Trang', email: 'bui.thutrang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CNCT DM' },
  { id: 'u11', name: 'Bùi Thị Quỳnh Trang', email: 'bui.trang@isneu.org', role: 'staff', roles: ['coordinator_director'], managerId: 'u1', avatarUrl: '', active: true, position: 'CNCT Năm 1' },
];

// ==================== PROGRAMS ====================
export const programs: Program[] = [
  { id: 'p_au', name: 'Andrews University', type: 'degree', status: 'active', shortName: 'Andrews', managerId: 'u7' },
  { id: 'p7', name: 'BBAE', type: 'degree', status: 'active', shortName: 'BBAE', managerId: 'u8' },
  { id: 'p3', name: 'BTEC HND', type: 'certificate', status: 'active', shortName: 'BTEC', managerId: 'u5' },
  { id: 'p_dm', name: 'Digital Marketing', type: 'degree', status: 'active', shortName: 'DM', managerId: 'u10' },
  { id: 'p_uwe', name: 'Top-up UWE', type: 'degree', status: 'active', shortName: 'UWE', managerId: 'u2' },
  { id: 'p_nam1', name: 'Chương trình Năm 1', type: 'degree', status: 'active', shortName: 'Năm 1', managerId: 'u11' },
  { id: 'p_cu', name: 'Top-up CU', type: 'degree', status: 'active', shortName: 'CU', managerId: 'u6' },
  { id: 'p_nhtc', name: 'Ngân hàng Tài chính', type: 'degree', status: 'active', shortName: 'NHTC', managerId: 'u4' },
];

// Current Semester definition (matches Excel file)
export const semesterData = { currentSemester: 'Kỳ 2 2025-2026', startDate: '2026-02-01', endDate: '2026-07-31' };

// ==================== COURSES ====================
// Seed courses with Year and Semester, including Đào Ngọc Diệp's real sheets.
const initialCourses: Course[] = [
  {
    "id": "c_u10_1",
    "programId": "p_dm",
    "name": "Digital Optimisation",
    "cohort": "I19 - DM",
    "numLecturers": 2,
    "numStudents": 54,
    "attendanceTarget": 0.9,
    "passTarget": 0.9,
    "submitTarget": 0.9,
    "attendanceRate": 0.9074,
    "passRate": 0.8889,
    "submitRate": 0.9074,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_2",
    "programId": "p_dm",
    "name": "Marketing and Digital Strategy",
    "cohort": "I19 - DM",
    "numLecturers": 2,
    "numStudents": 53,
    "attendanceTarget": 0.9,
    "passTarget": 0.9,
    "submitTarget": 0.9,
    "attendanceRate": 0.9434,
    "passRate": 0.8113,
    "submitRate": 0.9434,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_3",
    "programId": "p_dm",
    "name": "Digital Marketing Dissertation",
    "cohort": "I19 - DM",
    "numLecturers": 26,
    "numStudents": 53,
    "attendanceTarget": 1,
    "passTarget": 1,
    "submitTarget": 1,
    "attendanceRate": 0.9811,
    "passRate": 0.8868,
    "submitRate": 0.9811,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_4",
    "programId": "p_dm",
    "name": "Customer Journeys and Insights",
    "cohort": "I20 - DM",
    "numLecturers": 3,
    "numStudents": 54,
    "attendanceTarget": 0.9811320754716981,
    "passTarget": 0.9622641509433962,
    "submitTarget": 0.96,
    "attendanceRate": 0.9815,
    "passRate": 0.9259,
    "submitRate": 0.9815,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_5",
    "programId": "p_dm",
    "name": "Research for Digital Marketing",
    "cohort": "I20 - DM",
    "numLecturers": 3,
    "numStudents": 55,
    "attendanceTarget": 1,
    "passTarget": 0.9622641509433962,
    "submitTarget": 0.92,
    "attendanceRate": 0.9636,
    "passRate": 0.8545,
    "submitRate": 0.9636,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_6",
    "programId": "p_dm",
    "name": "Digital Marketing Planning",
    "cohort": "I20 - DM",
    "numLecturers": 2,
    "numStudents": 55,
    "attendanceTarget": 0.96,
    "passTarget": 0.9622641509433962,
    "submitTarget": 0.96,
    "attendanceRate": 0.9818,
    "passRate": 0.8182,
    "submitRate": 0.9818,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_7",
    "programId": "p_dm",
    "name": "Marketing Data and Analytics",
    "cohort": "I21 - DM",
    "numLecturers": 3,
    "numStudents": 55,
    "attendanceTarget": 0.9516129032258065,
    "passTarget": 0.967741935483871,
    "submitTarget": 0.97,
    "attendanceRate": 0.9636,
    "passRate": 0.8545,
    "submitRate": 0.9636,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_8",
    "programId": "p_dm",
    "name": "Introduction to Marketing Communications",
    "cohort": "I21 - DM",
    "numLecturers": 3,
    "numStudents": 55,
    "attendanceTarget": 0.95,
    "passTarget": 0.9838709677419355,
    "submitTarget": 0.98,
    "attendanceRate": 0.9455,
    "passRate": 0.8182,
    "submitRate": 0.9455,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u10_9",
    "programId": "p_dm",
    "name": "Digital Marketing Tools",
    "cohort": "I21 - DM",
    "numLecturers": 2,
    "numStudents": 56,
    "attendanceTarget": 0.9,
    "passTarget": 0.9193548387096774,
    "submitTarget": 0.92,
    "attendanceRate": 0.9464,
    "passRate": 0.9107,
    "submitRate": 0.9464,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_10",
    "programId": "p_uwe",
    "name": "MDGC",
    "cohort": "I18 MT",
    "numLecturers": 2,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 1,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_11",
    "programId": "p_uwe",
    "name": "IBMS",
    "cohort": "I18 MT",
    "numLecturers": 2,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 1,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_12",
    "programId": "p_uwe",
    "name": "GMM",
    "cohort": "I18 MT",
    "numLecturers": 2,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 1,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 0.99,
    "submitRate": 0.96,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_13",
    "programId": "p_uwe",
    "name": "BP",
    "cohort": "I18 MT",
    "numLecturers": 2,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 0.9,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_14",
    "programId": "p_uwe",
    "name": "APD",
    "cohort": "I19 MX",
    "numLecturers": 2,
    "numStudents": 52,
    "attendanceTarget": 0.95,
    "passTarget": 1,
    "submitTarget": 1,
    "attendanceRate": 1,
    "passRate": 0.94,
    "submitRate": 0.99,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u2_15",
    "programId": "p_uwe",
    "name": "MOC",
    "cohort": "I19 MX",
    "numLecturers": 2,
    "numStudents": 52,
    "attendanceTarget": 0.95,
    "passTarget": 1,
    "submitTarget": 1,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u2_16",
    "programId": "p_uwe",
    "name": "BS",
    "cohort": "I19 MX",
    "numLecturers": 2,
    "numStudents": 52,
    "attendanceTarget": 0.95,
    "passTarget": 1,
    "submitTarget": 1,
    "attendanceRate": 0.98,
    "passRate": 0.99,
    "submitRate": 0.99,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u2_17",
    "programId": "p_uwe",
    "name": "BPT",
    "cohort": "I19 MX",
    "numLecturers": 3,
    "numStudents": 52,
    "attendanceTarget": 0.95,
    "passTarget": 0.9,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 0.88,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u2_18",
    "programId": "p_uwe",
    "name": "AFDM",
    "cohort": "BScBF I20",
    "numLecturers": 2,
    "numStudents": 35,
    "attendanceTarget": 0.95,
    "passTarget": 0.8,
    "submitTarget": 0.95,
    "attendanceRate": 0.94,
    "passRate": 0.77,
    "submitRate": 0.96,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_19",
    "programId": "p_uwe",
    "name": "FIM",
    "cohort": "BScBF I20",
    "numLecturers": 2,
    "numStudents": 35,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.94,
    "passRate": 0.96,
    "submitRate": 0.99,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_20",
    "programId": "p_uwe",
    "name": "PSBF",
    "cohort": "BScBF I20",
    "numLecturers": 1,
    "numStudents": 35,
    "attendanceTarget": 0.95,
    "passTarget": 0.9,
    "submitTarget": 1,
    "attendanceRate": 0.94,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u2_21",
    "programId": "p_uwe",
    "name": "EBF",
    "cohort": "BScBF I20",
    "numLecturers": 2,
    "numStudents": 35,
    "attendanceTarget": 0.95,
    "passTarget": 0.9,
    "submitTarget": 1,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u11_22",
    "programId": "p_nam1",
    "name": "ENGLISH (Upper -Intermediate Level)",
    "cohort": "SEM 2",
    "numLecturers": 13,
    "numStudents": 85,
    "attendanceTarget": 0.9,
    "passTarget": 0.7,
    "submitTarget": 1,
    "attendanceRate": 0.9765,
    "passRate": 0.8028,
    "submitRate": 1,
    "year": 1,
    "semester": "I21 MT"
  },
  {
    "id": "c_u11_23",
    "programId": "p_nam1",
    "name": "ENGLISH (Advanced Level)",
    "cohort": "SEM 2",
    "numLecturers": 11,
    "numStudents": 92,
    "attendanceTarget": 0.9,
    "passTarget": 0.5,
    "submitTarget": 0.95,
    "attendanceRate": 0.9891,
    "passRate": 0.4675,
    "submitRate": 0.989,
    "year": 1,
    "semester": "I21 MT"
  },
  {
    "id": "c_u11_24",
    "programId": "p_nam1",
    "name": "Basic Economics",
    "cohort": "SEM 2",
    "numLecturers": 2,
    "numStudents": 83,
    "attendanceTarget": 0.85,
    "passTarget": 0.7,
    "submitTarget": 0.95,
    "attendanceRate": 0.94,
    "passRate": 0.8333,
    "submitRate": 0.97,
    "year": 1,
    "semester": "I21 MT"
  },
  {
    "id": "c_u11_25",
    "programId": "p_nam1",
    "name": "ENGLISH (Intermediate Level)",
    "cohort": "SEM 2",
    "numLecturers": 2,
    "numStudents": 32,
    "attendanceTarget": 0.9,
    "passTarget": 0.7,
    "submitTarget": 1,
    "attendanceRate": 1,
    "passRate": 0.8421,
    "submitRate": 1,
    "year": 1,
    "semester": "I22 MX"
  },
  {
    "id": "c_u11_26",
    "programId": "p_nam1",
    "name": "ENGLISH (Upper -Intermediate Level)",
    "cohort": "SEM 2",
    "numLecturers": 2,
    "numStudents": 39,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "I22 MX"
  },
  {
    "id": "c_u11_27",
    "programId": "p_nam1",
    "name": "Study skills",
    "cohort": "SEM 2",
    "numLecturers": 2,
    "numStudents": 75,
    "attendanceTarget": 0.85,
    "passTarget": 0.7,
    "submitTarget": 0.95,
    "attendanceRate": 0.88,
    "passRate": 0.4844,
    "submitRate": 0.96,
    "year": 1,
    "semester": "I22 MX"
  },
  {
    "id": "c_u6_28",
    "programId": "p_cu",
    "name": "Project/ Khóa luận tốt nghiệp",
    "cohort": "CU",
    "numLecturers": 1,
    "numStudents": 20,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u6_29",
    "programId": "p_cu",
    "name": "Academic Writing 3/ Kỹ năng viết luận học thuật 3",
    "cohort": "CU",
    "numLecturers": 1,
    "numStudents": 20,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u6_30",
    "programId": "p_cu",
    "name": "Career Development/ Phát triển nghề nghiệp",
    "cohort": "CU",
    "numLecturers": 1,
    "numStudents": 20,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u6_31",
    "programId": "p_cu",
    "name": "Innovation and Change/ Sáng tạo và thay đổi",
    "cohort": "CU",
    "numLecturers": 1,
    "numStudents": 20,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.9649,
    "submitRate": 0.9649,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u6_32",
    "programId": "p_cu",
    "name": "Contemporary Marketing Issues/ Các vấn đề của Marketing đương đại",
    "cohort": "CU",
    "numLecturers": 1,
    "numStudents": 20,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_u6_33",
    "programId": "p_cu",
    "name": "Project",
    "cohort": "I19 MX",
    "numLecturers": 10,
    "numStudents": 37,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.973,
    "submitRate": 0.973,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u6_34",
    "programId": "p_cu",
    "name": "Academic Writing 3",
    "cohort": "I19 MX",
    "numLecturers": 1,
    "numStudents": 63,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.9841,
    "submitRate": 0.9841,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u6_35",
    "programId": "p_cu",
    "name": "Career Development",
    "cohort": "I19 MX",
    "numLecturers": 1,
    "numStudents": 63,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.9841,
    "submitRate": 0.9841,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u6_36",
    "programId": "p_cu",
    "name": "Responsible Business Strategy",
    "cohort": "I19 MX",
    "numLecturers": 2,
    "numStudents": 100,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u6_37",
    "programId": "p_cu",
    "name": "Marketing Strategy",
    "cohort": "I19 MX",
    "numLecturers": 1,
    "numStudents": 100,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.94,
    "submitRate": 0.94,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u8_38",
    "programId": "p7",
    "name": "Thực tập",
    "cohort": "BBAE K64",
    "numLecturers": 23,
    "numStudents": 51,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.9608,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_39",
    "programId": "p7",
    "name": "Creativity & Innovation Management",
    "cohort": "BBAE K65",
    "numLecturers": 1,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_40",
    "programId": "p7",
    "name": "Entrepreneurial Design Thinking",
    "cohort": "BBAE K65",
    "numLecturers": 1,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_41",
    "programId": "p7",
    "name": "Entrepreneurial Skills",
    "cohort": "BBAE K65",
    "numLecturers": 1,
    "numStudents": 36,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_42",
    "programId": "p7",
    "name": "Tư tưởng HCM",
    "cohort": "BBAE K65",
    "numLecturers": 1,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_43",
    "programId": "p7",
    "name": "Management of Info system",
    "cohort": "BBAE K65",
    "numLecturers": 1,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_44",
    "programId": "p7",
    "name": "Intercultural & Communication Mgt",
    "cohort": "BBAE K65",
    "numLecturers": 1,
    "numStudents": 34,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_45",
    "programId": "p7",
    "name": "Business Decision Making 2",
    "cohort": "BBAE K66 A+B",
    "numLecturers": 1,
    "numStudents": 87,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 0.8824,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_46",
    "programId": "p7",
    "name": "Business Law",
    "cohort": "BBAE K66 A+B",
    "numLecturers": 1,
    "numStudents": 85,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 0.9882,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_47",
    "programId": "p7",
    "name": "Managerial Accounting",
    "cohort": "BBAE K66 A+B",
    "numLecturers": 1,
    "numStudents": 85,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_48",
    "programId": "p7",
    "name": "Macroeconomics",
    "cohort": "BBAE K66 A+B",
    "numLecturers": 2,
    "numStudents": 85,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 0.9882,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_49",
    "programId": "p7",
    "name": "Principles of Marketing",
    "cohort": "BBAE K66 A+B",
    "numLecturers": 1,
    "numStudents": 86,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 0.9882,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_50",
    "programId": "p7",
    "name": "Business Environment",
    "cohort": "BBAE K67 A+B+C",
    "numLecturers": 1,
    "numStudents": 102,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 0.9898,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_51",
    "programId": "p7",
    "name": "Introduction to Calculus",
    "cohort": "BBAE K67 A+B+C",
    "numLecturers": 1,
    "numStudents": 109,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 0.9898,
    "passRate": 0.9286,
    "submitRate": 0.9898,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_52",
    "programId": "p7",
    "name": "Introduction to Environmental Studies",
    "cohort": "BBAE K67 A+B+C",
    "numLecturers": 1,
    "numStudents": 101,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 1,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_53",
    "programId": "p7",
    "name": "Triết học ML",
    "cohort": "BBAE K67 A+B+C",
    "numLecturers": 2,
    "numStudents": 101,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 0.9898,
    "passRate": 0.9898,
    "submitRate": 0.9898,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u8_54",
    "programId": "p7",
    "name": "English 2",
    "cohort": "BBAE K67 A+B+C",
    "numLecturers": 2,
    "numStudents": 18,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 0.95,
    "attendanceRate": 0.9388,
    "passRate": 0.9459,
    "submitRate": 0.9388,
    "year": 1,
    "semester": "2"
  },
  {
    "id": "c_u5_55",
    "programId": "p3",
    "name": "Marketing Processes and Planning",
    "cohort": "BTEC HND",
    "numLecturers": 4,
    "numStudents": 148,
    "attendanceTarget": 0.9516129032258065,
    "passTarget": 0.8,
    "submitTarget": 0.9,
    "attendanceRate": 0.8,
    "passRate": 0.793,
    "submitRate": 0.936,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u5_56",
    "programId": "p3",
    "name": "Management of Human Resources",
    "cohort": "BTEC HND",
    "numLecturers": 3,
    "numStudents": 157,
    "attendanceTarget": 0.9516129032258065,
    "passTarget": 0.8,
    "submitTarget": 0.9,
    "attendanceRate": 0.94,
    "passRate": 0.537,
    "submitRate": 0.924,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u5_57",
    "programId": "p3",
    "name": "Leadership and Management",
    "cohort": "BTEC HND",
    "numLecturers": 3,
    "numStudents": 83,
    "attendanceTarget": 0.9516129032258065,
    "passTarget": 0.8,
    "submitTarget": 0.9,
    "attendanceRate": 1,
    "passRate": 0.891,
    "submitRate": 0.945,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u5_58",
    "programId": "p3",
    "name": "Digital Marketing",
    "cohort": "BTEC HND",
    "numLecturers": 2,
    "numStudents": 64,
    "attendanceTarget": 0.951612903225806,
    "passTarget": 0.8,
    "submitTarget": 0.9,
    "attendanceRate": 0.92,
    "passRate": 0.841,
    "submitRate": 0.908,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u5_59",
    "programId": "p3",
    "name": "Integrated Marketing Communications",
    "cohort": "BTEC HND",
    "numLecturers": 2,
    "numStudents": 55,
    "attendanceTarget": 0.951612903225806,
    "passTarget": 0.8,
    "submitTarget": 0.9,
    "attendanceRate": 0.88,
    "passRate": 0.899,
    "submitRate": 0.973,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u5_60",
    "programId": "p3",
    "name": "Managing and Leading change",
    "cohort": "BTEC HND",
    "numLecturers": 2,
    "numStudents": 54,
    "attendanceTarget": 0.951612903225806,
    "passTarget": 0.8,
    "submitTarget": 0.9,
    "attendanceRate": 0.95,
    "passRate": 0.91,
    "submitRate": 0.925,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u5_61",
    "programId": "p3",
    "name": "Global Business Environment",
    "cohort": "BTEC HND",
    "numLecturers": 2,
    "numStudents": 51,
    "attendanceTarget": 0.951612903225806,
    "passTarget": 0.8,
    "submitTarget": 0.9,
    "attendanceRate": 0.6667,
    "passRate": 0.881,
    "submitRate": 0.902,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_62",
    "programId": "p_nhtc",
    "name": "Principles and Practices of Banking",
    "cohort": "BScBF I19",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 0.95,
    "attendanceRate": 0.93,
    "passRate": 1,
    "submitRate": 0.96,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_63",
    "programId": "p_nhtc",
    "name": "Economic Research Methods",
    "cohort": "BScBF I19",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 0.95,
    "attendanceRate": 0.96,
    "passRate": 0.89,
    "submitRate": 0.96,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_64",
    "programId": "p_nhtc",
    "name": "Investment Banking",
    "cohort": "BScBF I19",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 0.95,
    "attendanceRate": 0.85,
    "passRate": 0.78,
    "submitRate": 0.96,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_65",
    "programId": "p_nhtc",
    "name": "Governance and Ethics in Banking",
    "cohort": "BScBF I19",
    "numLecturers": 1,
    "numStudents": 20,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 0.95,
    "attendanceRate": 0.96,
    "passRate": 0.96,
    "submitRate": 0.96,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_66",
    "programId": "p_nhtc",
    "name": "Contemporary Issues in Banking and Finance",
    "cohort": "BScBF I18",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 1,
    "attendanceRate": 0.94,
    "passRate": 0.94,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_67",
    "programId": "p_nhtc",
    "name": "Project",
    "cohort": "BScBF I18",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 1,
    "attendanceRate": 0.9,
    "passRate": 0.97,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_68",
    "programId": "p_nhtc",
    "name": "Economics of International Financial Markets",
    "cohort": "BScBF I18",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 1,
    "attendanceRate": 0.97,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_u4_69",
    "programId": "p_nhtc",
    "name": "Investment Management",
    "cohort": "BScBF I18",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.9,
    "passTarget": 0.85,
    "submitTarget": 1,
    "attendanceRate": 1,
    "passRate": 0.88,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au2_1",
    "programId": "p_au",
    "name": "Biology with lab",
    "code": "BBAE1109",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au2_2",
    "programId": "p_au",
    "name": "Introduction to Dancesport",
    "code": "BBAE1114",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au2_3",
    "programId": "p_au",
    "name": "Business Communication",
    "code": "BBAE1125",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au2_4",
    "programId": "p_au",
    "name": "Foundations of Info Tech",
    "code": "INFS120",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au2_5",
    "programId": "p_au",
    "name": "College Writing I",
    "code": "ENGL-115",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au2_6",
    "programId": "p_au",
    "name": "Introduction to Environmental Studies",
    "code": "BBAE1107",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.8,
    "passRate": 1,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au2_7",
    "programId": "p_au",
    "name": "Introduction to Calculus",
    "code": "BBAE1108",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.94,
    "passRate": 0.9047619048,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au2_8",
    "programId": "p_au",
    "name": "Computer skills",
    "code": "BBAE1110",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au2_9",
    "programId": "p_au",
    "name": "College Writing II",
    "code": "ENGL- 215",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 21,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 1,
    "passRate": 0.9047619048,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au2_10",
    "programId": "p_au",
    "name": "Orientation to Human Services",
    "code": "SOWK-101",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 20,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.92,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au2_11",
    "programId": "p_au",
    "name": "Written Communication in Business",
    "code": "WRIT-3132",
    "cohort": "AU2",
    "numLecturers": 1,
    "numStudents": 23,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.88,
    "passRate": 0.9130434783,
    "submitRate": 0.9130434783,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au1_1",
    "programId": "p_au",
    "name": "Business Decision Making 1",
    "code": "BBAE1118",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au1_2",
    "programId": "p_au",
    "name": "Microeconomics",
    "code": "BBAE1116",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au1_3",
    "programId": "p_au",
    "name": "Principles of Accounting",
    "code": "BBAE1120",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au1_4",
    "programId": "p_au",
    "name": "Operations Management",
    "code": "BBAE1133",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au1_5",
    "programId": "p_au",
    "name": "Psychology",
    "code": "BBAE1138",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au1_6",
    "programId": "p_au",
    "name": "Information Systems: Theory & Application",
    "code": "INFS-215",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 1,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au1_7",
    "programId": "p_au",
    "name": "Macroeconomics",
    "code": "BBAE1117",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.6666666667,
    "passRate": 0.7777777778,
    "submitRate": 0.8,
    "year": 2,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au1_8",
    "programId": "p_au",
    "name": "Principles of Marketing",
    "code": "BBAE1123",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.8888888889,
    "passRate": 1,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au1_9",
    "programId": "p_au",
    "name": "Business Law",
    "code": "BBAE1130",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.6666666667,
    "passRate": 1,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au1_10",
    "programId": "p_au",
    "name": "Self Defense (1)",
    "code": "FTES-135",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.7777777778,
    "passRate": 1,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au1_11",
    "programId": "p_au",
    "name": "Enjoyment of Music",
    "code": "MUHL-214",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.5555555556,
    "passRate": 1,
    "submitRate": 1,
    "year": 2,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au3_1",
    "programId": "p_au",
    "name": "Biology with lab",
    "code": "BBAE1109",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au3_2",
    "programId": "p_au",
    "name": "Introduction to Dancesport",
    "code": "BBAE1114",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au3_3",
    "programId": "p_au",
    "name": "Business Communication",
    "code": "BBAE1125",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au3_4",
    "programId": "p_au",
    "name": "Foundations of Info Tech",
    "code": "INFS120",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au3_5",
    "programId": "p_au",
    "name": "College Writing I",
    "code": "ENGL-115",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 1"
  },
  {
    "id": "c_au_au3_6",
    "programId": "p_au",
    "name": "Introduction to Environmental Studies",
    "code": "BBAE1107",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au3_7",
    "programId": "p_au",
    "name": "Introduction to Calculus",
    "code": "BBAE1108",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au3_8",
    "programId": "p_au",
    "name": "Computer skills",
    "code": "BBAE1110",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au3_9",
    "programId": "p_au",
    "name": "College Writing II",
    "code": "ENGL- 215",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au3_10",
    "programId": "p_au",
    "name": "Orientation to Human Services",
    "code": "SOWK-101",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au3_11",
    "programId": "p_au",
    "name": "Written Communication in Business",
    "code": "WRIT-3132",
    "cohort": "AU3 (Dự kiến 2026-2027)",
    "numLecturers": 1,
    "numStudents": 25,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 1,
    "semester": "SEM 2"
  },
  {
    "id": "c_au_au1_adv_1",
    "programId": "p_au",
    "name": "American History II",
    "code": "HIST-205",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_2",
    "programId": "p_au",
    "name": "Economic Development",
    "code": "ECON-427",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_3",
    "programId": "p_au",
    "name": "Accounting II",
    "code": "ACCT122",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_4",
    "programId": "p_au",
    "name": "American Government I",
    "code": "PLSC104",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_5",
    "programId": "p_au",
    "name": "Corporate Finance",
    "code": "BBAE1122",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_6",
    "programId": "p_au",
    "name": "Management and Organization",
    "code": "BSAD355",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM SP"
  },
  {
    "id": "c_au_au1_adv_7",
    "programId": "p_au",
    "name": "Quality Management",
    "code": "BSAD-407",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM SP"
  },
  {
    "id": "c_au_au1_adv_8",
    "programId": "p_au",
    "name": "Advertising and Promotion",
    "code": "MKTG-368",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM SP"
  },
  {
    "id": "c_au_au1_adv_9",
    "programId": "p_au",
    "name": "Investments",
    "code": "FNCE-397",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM SU"
  },
  {
    "id": "c_au_au1_adv_10",
    "programId": "p_au",
    "name": "Business Ethics",
    "code": "RELT-390",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM SU"
  },
  {
    "id": "c_au_au1_adv_11",
    "programId": "p_au",
    "name": "International Marketing",
    "code": "MKTG-465",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 3,
    "semester": "SEM SU"
  },
  {
    "id": "c_au_au1_adv_12",
    "programId": "p_au",
    "name": "International Economics",
    "code": "ECON-454",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_13",
    "programId": "p_au",
    "name": "International Environment of Business",
    "code": "BSAD-365",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_14",
    "programId": "p_au",
    "name": "Consumer Behavior",
    "code": "MKTG-320",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_15",
    "programId": "p_au",
    "name": "Human Resource Management",
    "code": "BSAD-384",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM AU"
  },
  {
    "id": "c_au_au1_adv_16",
    "programId": "p_au",
    "name": "Internship",
    "code": "BSAD-487",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM SP"
  },
  {
    "id": "c_au_au1_adv_17",
    "programId": "p_au",
    "name": "Entrepreneuring",
    "code": "BSAD-410",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM SP"
  },
  {
    "id": "c_au_au1_adv_18",
    "programId": "p_au",
    "name": "International Management",
    "code": "BSAD-467",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM SP"
  },
  {
    "id": "c_au_au1_adv_19",
    "programId": "p_au",
    "name": "Multicultural Business Relations",
    "code": "BSAD-450",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM SP"
  },
  {
    "id": "c_au_au1_adv_20",
    "programId": "p_au",
    "name": "International Finance",
    "code": "FNCE-426",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM SU"
  },
  {
    "id": "c_au_au1_adv_21",
    "programId": "p_au",
    "name": "Business Strategy & Decisions",
    "code": "BSAD-494",
    "cohort": "AU1",
    "numLecturers": 1,
    "numStudents": 9,
    "attendanceTarget": 0.95,
    "passTarget": 0.95,
    "submitTarget": 1,
    "attendanceRate": 0.95,
    "passRate": 0.95,
    "submitRate": 1,
    "year": 4,
    "semester": "SEM SU"
  }
];

export let courses: Course[] = getSaved<Course[]>('isme_courses_v7', initialCourses);



export function updateCourseValue(courseId: string, updates: Partial<Course>) {
  courses = courses.map(c => c.id === courseId ? { ...c, ...updates } : c);
  save('isme_courses', courses);
}

// ==================== KPI DEFINITIONS ====================
export const kpiDefinitions: KPIDefinition[] = [
  // Group 1: Operations (50%) - weight: 5 (10 * 5 = 50)
  {
    id: 'op1',
    groupId: 'operations',
    stt: 1,
    name: 'Quản lý nội dung giảng dạy',
    shortName: 'Nội dung GD',
    description: 'Làm việc với nhóm GV từng môn về nội dung giảng dạy (SoW, Assessment Plan, Assignment Brief)',
    criteria: 'Tỷ lệ các môn học có đầy đủ các tài liệu đúng tiến độ',
    unit: '%',
    weight: 5
  },
  {
    id: 'op2',
    groupId: 'operations',
    stt: 2,
    name: 'Quản lý tài liệu liên quan GV',
    shortName: 'Tài liệu GV',
    description: 'Cung cấp thông tin phục vụ hoàn thiện các thủ tục ký hợp đồng, thanh lý hợp đồng giảng, thủ tục thanh toán tiền giảng/trợ giảng\n- HĐ GV\n- Thanh toán giảng dạy\n- Thanh toán chấm bài',
    criteria: 'Tỷ lệ giảng viên được cập nhật thông tin đúng tiến độ và kế hoạch vận hành',
    unit: '%',
    weight: 5
  },
  {
    id: 'op3',
    groupId: 'operations',
    stt: 3,
    name: 'Vận hành Lớp học',
    shortName: 'Vận hành lớp',
    description: 'Tổ chức lớp học (Làm & TB TKB cho GV & SV, tạo lớp Moodle, tạo account cho GV và SV, enroll GV và SV)',
    criteria: 'Tỷ lệ các lớp được set up theo kế hoạch',
    unit: '%',
    weight: 5
  },
  {
    id: 'op4',
    groupId: 'operations',
    stt: 4,
    name: 'Quản lý điểm',
    shortName: 'Quản lý điểm',
    description: 'Quản lý điểm và quá trình đánh giá SV (Theo dõi và đôn đốc tiến độ nhập điểm đúng hạn, rà soát bảng điểm trên hệ thống)',
    criteria: 'Tỷ lệ các môn học hoàn thành điểm theo đúng kế hoạch',
    unit: '%',
    weight: 5
  },
  {
    id: 'op5_op',
    groupId: 'operations',
    stt: 5,
    name: 'Hoạt động ngoại khóa - Vận hành',
    shortName: 'HĐ Ngoại khóa (Vận hành)',
    description: 'Tổ chức hoạt động Tọa đàm, hội thảo chuyên đề, guest speaker, field trip (khâu chuẩn bị thủ tục, setup)',
    criteria: 'Số lượng các hoạt động được triển khai thành công đúng tiến độ',
    unit: 'Hoạt động',
    weight: 5
  },
  {
    id: 'op6',
    groupId: 'operations',
    stt: 6,
    name: 'Rà soát kết quả học tập',
    shortName: 'Rà soát KQ',
    description: 'Rà soát kết quả học tập, hồ sơ hoàn thành chương trình',
    criteria: 'Tỷ lệ các môn học có file kết quả rà soát theo yêu cầu',
    unit: '%',
    weight: 5
  },
  {
    id: 'op7',
    groupId: 'operations',
    stt: 7,
    name: 'Turnitin',
    shortName: 'Turnitin',
    description: 'Giám sát liêm chính học thuật',
    criteria: 'Tỷ lệ các môn học có báo cáo kết quả rà soát Turnitin theo yêu cầu',
    unit: '%',
    weight: 5
  },
  {
    id: 'op8',
    groupId: 'operations',
    stt: 8,
    name: 'Phản hồi GV & SV',
    shortName: 'Phản hồi',
    description: 'Xử lý các phản hồi của SV & GV',
    criteria: 'Số lượng kiến nghị của sinh viên được xử lý kịp thời (SV KHÔNG phải phản hồi lên cấp cao hơn)',
    unit: '%',
    weight: 5
  },
  {
    id: 'op9',
    groupId: 'operations',
    stt: 9,
    name: 'Module report & Feedback',
    shortName: 'Report & Feedback',
    description: 'Hoàn thành module report và gửi feedback của SV cho GV',
    criteria: 'Tỉ lệ số môn học đã làm feedback và gửi report xử lý số liệu cho GV',
    unit: '%',
    weight: 5
  },
  {
    id: 'op10',
    groupId: 'operations',
    stt: 10,
    name: 'Hồ sơ SV',
    shortName: 'Hồ sơ SV',
    description: 'Quản lý tiến trình học tập của sinh viên (giấy xác nhận, lớp học lại...)',
    criteria: 'Tỷ lệ hồ sơ sinh viên được cập nhật & giải quyết, đồng bộ thông tin học tập chính xác theo các mốc tiến độ',
    unit: '%',
    weight: 5
  },
  
  // Group 2: Academic Support (20%)
  {
    id: 'op5_as',
    groupId: 'academic_support',
    stt: 5,
    name: 'Hoạt động ngoại khóa - Hỗ trợ học tập',
    shortName: 'HĐ Ngoại khóa (Học tập)',
    description: 'Tổ chức hoạt động Tọa đàm, hội thảo chuyên đề, guest speaker, field trip (Hiệu quả học thuật và hỗ trợ SV)',
    criteria: 'Hiệu quả và chất lượng của hoạt động ngoại khóa mang lại cho SV (mức độ hài lòng, số lượng tham gia)',
    unit: '%',
    weight: 20
  },
  
  // Group 4: Other Activities (10%)
  {
    id: 'other11',
    groupId: 'other_activities',
    stt: 11,
    name: 'Tuyển sinh',
    shortName: 'Tuyển sinh',
    description: 'Tham gia công tác tuyển sinh',
    criteria: 'Số lượng hoạt động tuyển sinh đã tham gia',
    unit: '%',
    weight: 4
  },
  {
    id: 'other12',
    groupId: 'other_activities',
    stt: 12,
    name: 'Hỗ trợ SV du học & exchange',
    shortName: 'Hỗ trợ Du học/Exchange',
    description: 'Quản lý & hỗ trợ SV trao đổi/ du học',
    criteria: 'Tỷ lệ sinh viên có nhu cầu chuyển tiếp/trao đổi được hỗ trợ hoàn thiện hồ sơ đi nước ngoài',
    unit: '%',
    weight: 3
  },
  {
    id: 'other13',
    groupId: 'other_activities',
    stt: 13,
    name: 'Hoạt động khác',
    shortName: 'Hoạt động khác',
    description: 'Các hoạt động khác do Viện tổ chức',
    criteria: 'Số lượng hoạt động đã tham gia đóng góp',
    unit: 'Hoạt động',
    weight: 3
  }
];

// ==================== KPI SNAPSHOTS ====================
// Seed snapshots matching Sheet 0 for Đào Ngọc Diệp (u7)
const initialKpiSnapshots: KPISnapshot[] = [
  {
    "id": "ks_u10_op1",
    "userId": "u10",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 9,
    "actualValue": 9,
    "rawNumerator": 9,
    "rawDenominator": 9,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op2",
    "userId": "u10",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 27,
    "actualValue": 27,
    "rawNumerator": 27,
    "rawDenominator": 27,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op3",
    "userId": "u10",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 3,
    "actualValue": 3,
    "rawNumerator": 3,
    "rawDenominator": 3,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op4",
    "userId": "u10",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 9,
    "actualValue": 9,
    "rawNumerator": 9,
    "rawDenominator": 9,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op5_op",
    "userId": "u10",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 8,
    "actualValue": 8,
    "rawNumerator": 8,
    "rawDenominator": 8,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op6",
    "userId": "u10",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 9,
    "actualValue": 9,
    "rawNumerator": 9,
    "rawDenominator": 9,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op7",
    "userId": "u10",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 9,
    "actualValue": 9,
    "rawNumerator": 9,
    "rawDenominator": 9,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op8",
    "userId": "u10",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 18,
    "actualValue": 18,
    "rawNumerator": 18,
    "rawDenominator": 18,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op9",
    "userId": "u10",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 9,
    "actualValue": 9,
    "rawNumerator": 9,
    "rawDenominator": 9,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_op10",
    "userId": "u10",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 165,
    "actualValue": 165,
    "rawNumerator": 165,
    "rawDenominator": 165,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_other11",
    "userId": "u10",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_other12",
    "userId": "u10",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 0,
    "actualValue": 0,
    "rawNumerator": 0,
    "rawDenominator": 1,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u10_other13",
    "userId": "u10",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op1",
    "userId": "u2",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 12,
    "actualValue": 12,
    "rawNumerator": 12,
    "rawDenominator": 12,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op2",
    "userId": "u2",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 23,
    "actualValue": 23,
    "rawNumerator": 23,
    "rawDenominator": 23,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op3",
    "userId": "u2",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 3,
    "actualValue": 3,
    "rawNumerator": 3,
    "rawDenominator": 3,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op4",
    "userId": "u2",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 12,
    "actualValue": 12,
    "rawNumerator": 12,
    "rawDenominator": 12,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op5_op",
    "userId": "u2",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 4,
    "actualValue": 4,
    "rawNumerator": 4,
    "rawDenominator": 4,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op6",
    "userId": "u2",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 12,
    "actualValue": 12,
    "rawNumerator": 12,
    "rawDenominator": 12,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op7",
    "userId": "u2",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 12,
    "actualValue": 12,
    "rawNumerator": 12,
    "rawDenominator": 12,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op8",
    "userId": "u2",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 30,
    "actualValue": 30,
    "rawNumerator": 30,
    "rawDenominator": 30,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op9",
    "userId": "u2",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 12,
    "actualValue": 12,
    "rawNumerator": 12,
    "rawDenominator": 12,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_op10",
    "userId": "u2",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 15,
    "actualValue": 15,
    "rawNumerator": 15,
    "rawDenominator": 15,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_other11",
    "userId": "u2",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 11,
    "actualValue": 11,
    "rawNumerator": 11,
    "rawDenominator": 11,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_other12",
    "userId": "u2",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 17,
    "actualValue": 17,
    "rawNumerator": 17,
    "rawDenominator": 17,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u2_other13",
    "userId": "u2",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 2,
    "actualValue": 2,
    "rawNumerator": 2,
    "rawDenominator": 2,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op1",
    "userId": "u11",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 6,
    "actualValue": 6,
    "rawNumerator": 6,
    "rawDenominator": 6,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op2",
    "userId": "u11",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op3",
    "userId": "u11",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 16,
    "actualValue": 16,
    "rawNumerator": 16,
    "rawDenominator": 16,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op4",
    "userId": "u11",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 6,
    "actualValue": 6,
    "rawNumerator": 6,
    "rawDenominator": 6,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op5_op",
    "userId": "u11",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op6",
    "userId": "u11",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 6,
    "actualValue": 6,
    "rawNumerator": 6,
    "rawDenominator": 6,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op7",
    "userId": "u11",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 4,
    "actualValue": 4,
    "rawNumerator": 4,
    "rawDenominator": 4,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op8",
    "userId": "u11",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op9",
    "userId": "u11",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_op10",
    "userId": "u11",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 125,
    "actualValue": 125,
    "rawNumerator": 125,
    "rawDenominator": 125,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_other11",
    "userId": "u11",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 11,
    "actualValue": 11,
    "rawNumerator": 11,
    "rawDenominator": 11,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_other12",
    "userId": "u11",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 0,
    "actualValue": 0,
    "rawNumerator": 0,
    "rawDenominator": 1,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u11_other13",
    "userId": "u11",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op1",
    "userId": "u6",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op2",
    "userId": "u6",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op3",
    "userId": "u6",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 2,
    "actualValue": 2,
    "rawNumerator": 2,
    "rawDenominator": 2,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op4",
    "userId": "u6",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op5_op",
    "userId": "u6",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 4,
    "actualValue": 4,
    "rawNumerator": 4,
    "rawDenominator": 4,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op6",
    "userId": "u6",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op7",
    "userId": "u6",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op8",
    "userId": "u6",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 3,
    "actualValue": 3,
    "rawNumerator": 3,
    "rawDenominator": 3,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op9",
    "userId": "u6",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 86,
    "targetValue": 7,
    "actualValue": 6,
    "rawNumerator": 6,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_op10",
    "userId": "u6",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_other11",
    "userId": "u6",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_other12",
    "userId": "u6",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 0,
    "actualValue": 0,
    "rawNumerator": 0,
    "rawDenominator": 1,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u6_other13",
    "userId": "u6",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 2,
    "actualValue": 2,
    "rawNumerator": 2,
    "rawDenominator": 2,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op1",
    "userId": "u8",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 17,
    "actualValue": 17,
    "rawNumerator": 17,
    "rawDenominator": 17,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op2",
    "userId": "u8",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 42,
    "actualValue": 42,
    "rawNumerator": 42,
    "rawDenominator": 42,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op3",
    "userId": "u8",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 30,
    "actualValue": 30,
    "rawNumerator": 30,
    "rawDenominator": 30,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op4",
    "userId": "u8",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 17,
    "actualValue": 17,
    "rawNumerator": 17,
    "rawDenominator": 17,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op5_op",
    "userId": "u8",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 4,
    "actualValue": 4,
    "rawNumerator": 4,
    "rawDenominator": 4,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op6",
    "userId": "u8",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op7",
    "userId": "u8",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 3,
    "actualValue": 3,
    "rawNumerator": 3,
    "rawDenominator": 3,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op8",
    "userId": "u8",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 3,
    "actualValue": 3,
    "rawNumerator": 3,
    "rawDenominator": 3,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op9",
    "userId": "u8",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 17,
    "actualValue": 17,
    "rawNumerator": 17,
    "rawDenominator": 17,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_op10",
    "userId": "u8",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 13,
    "actualValue": 13,
    "rawNumerator": 13,
    "rawDenominator": 13,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_other11",
    "userId": "u8",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 15,
    "actualValue": 15,
    "rawNumerator": 15,
    "rawDenominator": 15,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_other12",
    "userId": "u8",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 4,
    "actualValue": 4,
    "rawNumerator": 4,
    "rawDenominator": 4,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u8_other13",
    "userId": "u8",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op1",
    "userId": "u5",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op2",
    "userId": "u5",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 18,
    "actualValue": 18,
    "rawNumerator": 18,
    "rawDenominator": 18,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op3",
    "userId": "u5",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 33,
    "actualValue": 33,
    "rawNumerator": 33,
    "rawDenominator": 33,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op4",
    "userId": "u5",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op5_op",
    "userId": "u5",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op6",
    "userId": "u5",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op7",
    "userId": "u5",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op8",
    "userId": "u5",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 1,
    "actualValue": 1,
    "rawNumerator": 1,
    "rawDenominator": 1,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op9",
    "userId": "u5",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_op10",
    "userId": "u5",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 1,
    "actualValue": 1,
    "rawNumerator": 1,
    "rawDenominator": 1,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_other11",
    "userId": "u5",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 9,
    "actualValue": 9,
    "rawNumerator": 9,
    "rawDenominator": 9,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_other12",
    "userId": "u5",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 15,
    "actualValue": 15,
    "rawNumerator": 15,
    "rawDenominator": 15,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u5_other13",
    "userId": "u5",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 1,
    "actualValue": 1,
    "rawNumerator": 1,
    "rawDenominator": 1,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op1",
    "userId": "u4",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 8,
    "actualValue": 8,
    "rawNumerator": 8,
    "rawDenominator": 8,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op2",
    "userId": "u4",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 13,
    "actualValue": 13,
    "rawNumerator": 13,
    "rawDenominator": 13,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op3",
    "userId": "u4",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 13,
    "actualValue": 13,
    "rawNumerator": 13,
    "rawDenominator": 13,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op4",
    "userId": "u4",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 8,
    "actualValue": 8,
    "rawNumerator": 8,
    "rawDenominator": 8,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op5_op",
    "userId": "u4",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 4,
    "actualValue": 4,
    "rawNumerator": 4,
    "rawDenominator": 4,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op6",
    "userId": "u4",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 8,
    "actualValue": 8,
    "rawNumerator": 8,
    "rawDenominator": 8,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op7",
    "userId": "u4",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 8,
    "actualValue": 8,
    "rawNumerator": 8,
    "rawDenominator": 8,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op8",
    "userId": "u4",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 8,
    "actualValue": 8,
    "rawNumerator": 8,
    "rawDenominator": 8,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op9",
    "userId": "u4",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 8,
    "actualValue": 8,
    "rawNumerator": 8,
    "rawDenominator": 8,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_op10",
    "userId": "u4",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 15,
    "actualValue": 15,
    "rawNumerator": 15,
    "rawDenominator": 15,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_other11",
    "userId": "u4",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_other12",
    "userId": "u4",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 6,
    "actualValue": 6,
    "rawNumerator": 6,
    "rawDenominator": 6,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u4_other13",
    "userId": "u4",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op1",
    "userId": "u7",
    "kpiDefinitionId": "op1",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op2",
    "userId": "u7",
    "kpiDefinitionId": "op2",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op3",
    "userId": "u7",
    "kpiDefinitionId": "op3",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 2,
    "actualValue": 2,
    "rawNumerator": 2,
    "rawDenominator": 2,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op4",
    "userId": "u7",
    "kpiDefinitionId": "op4",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op5_op",
    "userId": "u7",
    "kpiDefinitionId": "op5_op",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 4,
    "actualValue": 4,
    "rawNumerator": 4,
    "rawDenominator": 4,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op6",
    "userId": "u7",
    "kpiDefinitionId": "op6",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op7",
    "userId": "u7",
    "kpiDefinitionId": "op7",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 10,
    "actualValue": 10,
    "rawNumerator": 10,
    "rawDenominator": 10,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op8",
    "userId": "u7",
    "kpiDefinitionId": "op8",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 3,
    "actualValue": 3,
    "rawNumerator": 3,
    "rawDenominator": 3,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op9",
    "userId": "u7",
    "kpiDefinitionId": "op9",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 7,
    "actualValue": 7,
    "rawNumerator": 7,
    "rawDenominator": 7,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_op10",
    "userId": "u7",
    "kpiDefinitionId": "op10",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_other11",
    "userId": "u7",
    "kpiDefinitionId": "other11",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 15,
    "actualValue": 15,
    "rawNumerator": 15,
    "rawDenominator": 15,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_other12",
    "userId": "u7",
    "kpiDefinitionId": "other12",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 3,
    "actualValue": 3,
    "rawNumerator": 3,
    "rawDenominator": 3,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  },
  {
    "id": "ks_u7_other13",
    "userId": "u7",
    "kpiDefinitionId": "other13",
    "period": "Kỳ 2 2025-2026",
    "score": 100,
    "targetValue": 5,
    "actualValue": 5,
    "rawNumerator": 5,
    "rawDenominator": 5,
    "calculatedAt": "2026-07-22T00:00:00.000Z"
  }
];

export let kpiSnapshots: KPISnapshot[] = getSaved<KPISnapshot[]>('isme_kpi_snapshots_v6', initialKpiSnapshots);

export function updateSnapshotValue(snapshotId: string, updates: Partial<KPISnapshot>) {
  kpiSnapshots = kpiSnapshots.map(s => s.id === snapshotId ? { ...s, ...updates } : s);
  save('isme_kpi_snapshots', kpiSnapshots);
}

// ==================== SUBMISSION STATUS ====================
// Persistent status for coordinators' self assessments. format: [userId_period]: 'open' | 'submitted' | 'approved'
export let submissionStatuses: Record<string, 'open' | 'submitted' | 'approved'> = getSaved<Record<string, 'open' | 'submitted' | 'approved'>>('isme_submission_statuses', {
  'u7_Kỳ 2 2025-2026': 'open',
  'u8_Kỳ 2 2025-2026': 'open'
});

export function setSubmissionStatus(userId: string, period: string, status: 'open' | 'submitted' | 'approved') {
  const key = `${userId}_${period}`;
  submissionStatuses = { ...submissionStatuses, [key]: status };
  save('isme_submission_statuses', submissionStatuses);
}

export function getSubmissionStatus(userId: string, period: string): 'open' | 'submitted' | 'approved' {
  const key = `${userId}_${period}`;
  return submissionStatuses[key] || 'open';
}

// ==================== OTHER ACTIVITIES RECORD (LEGACY COMPATIBILITY) ====================
export const otherActivityRecords: OtherActivityRecord[] = [
  { userId: 'u8', period: 'Kỳ 2 2025-2026', admission: true, studyAbroad: true, exchange: false, otherInstitute: true, updatedAt: new Date().toISOString() },
];

// ==================== LABOR DISCIPLINE (LEGACY COMPATIBILITY) ====================
export const laborDisciplineRecords: LaborDisciplineRecord[] = [
  { userId: 'u8', period: 'Kỳ 2 2025-2026', score: 95, note: 'Đi làm đúng giờ', updatedBy: 'u1', updatedAt: new Date().toISOString() },
];

// ==================== NOTIFICATIONS ====================
export const notifications: Notification[] = [
  { id: 'n1', userId: 'u7', type: 'kpi_warning', priority: 'high', title: 'Thiết lập KPI mới', message: 'Hệ thống đã cập nhật biểu mẫu đánh giá KPI Sem 2 2026 của Coordinator.', severity: 'info', read: false, createdAt: new Date().toISOString(), category: 'kpi' },
];

// ==================== REVIEW CYCLES ====================
export const reviewCycles: ReviewCycle[] = [
  { id: 'rc1', name: 'Kỳ 1 2025-2026', startDate: '2025-08-01', endDate: '2026-01-31', reviewDeadline: '2026-02-15', status: 'closed' },
  { id: 'rc2', name: 'Kỳ 2 2025-2026', startDate: '2026-02-01', endDate: '2026-07-31', reviewDeadline: '2026-08-15', status: 'open' },
];

// ==================== REVIEWS ====================
export const reviews: Review[] = [
  { id: 'r1', userId: 'u7', cycleId: 'rc2', selfNote: 'Tôi đã hoàn thành tốt các đầu mục công việc, tổ chức đầy đủ hoạt động ngoại khóa.', managerNote: '', adjustedScore: null, adjustmentReason: '', submittedAt: null, reviewedAt: null },
];

// ==================== AUDIT LOGS SYSTEM ====================
const initialAuditLogs: AuditLog[] = [
  { id: 'log_init', timestamp: new Date(Date.now() - 3600000 * 3).toISOString().replace('T', ' ').substring(0, 19), userId: 'u0', userName: 'Admin System', action: 'Khởi tạo hệ thống', ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', details: 'Thiết lập biểu mẫu KPI mới theo Đào Ngọc Diệp Sem 2 2026 và cấu hình 13 đầu mục.' }
];

export let auditLogs: AuditLog[] = getSaved<AuditLog[]>('isme_audit_logs', initialAuditLogs);

export function addAuditLog(userId: string, action: string, details: string) {
  const user = users.find(u => u.id === userId);
  const userName = user ? user.name : 'Unknown User';
  const mockIps = ['192.168.1.45', '172.16.2.110', '118.70.124.9', '14.161.12.87'];
  const ipAddress = mockIps[Math.floor(Math.random() * mockIps.length)];
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server Environment';
  
  const newLog: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId,
    userName,
    action,
    ipAddress,
    userAgent,
    details
  };
  
  auditLogs = [newLog, ...auditLogs];
  save('isme_audit_logs', auditLogs);
}

export function getAuditLogs(): AuditLog[] {
  return auditLogs;
}

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
  // Calculate average of the scores for op1-op10
  return opSnaps.length > 0 ? Math.round(opSnaps.reduce((sum, s) => sum + s.score, 0) / opSnaps.length) : 0;
}

export function getKPIDetailsBySnapshot(snapshotId: string): KPIDetailItem[] {
  return [];
}

export function getCoordinatorStats(userId: string): CoordinatorStats | undefined {
  const user = getUserById(userId);
  if (!user) return undefined;
  
  // Basic stats for demonstration
  return {
    userId: user.id,
    programme: user.id === 'u7' ? 'Andrews' : user.id === 'u9' ? 'BTEC' : 'BBAE',
    totalStudents: user.id === 'u7' ? 40 : user.id === 'u9' ? 145 : 122,
    totalClasses: user.id === 'u7' ? 2 : user.id === 'u9' ? 5 : 6,
    totalLecturers: user.id === 'u7' ? 2 : user.id === 'u9' ? 12 : 29,
    passRateActual: user.id === 'u7' ? 0.95 : user.id === 'u9' ? 0.85 : 0.9857,
    passRateTarget: 0.95,
    attendanceRateActual: user.id === 'u7' ? 0.88 : user.id === 'u9' ? 0.92 : 0.9881,
    attendanceRateTarget: 0.95,
  };
}

export function calculateCoursesKPI(programId: string, filterSemester: 'current' | 'all' = 'current'): number {
  const activeSemester = semesterData.currentSemester; // e.g. Kỳ 2 2025-2026
  
  // Filter courses by program
  let filteredCourses = courses.filter(c => c.programId === programId);
  
  if (filterSemester === 'current') {
    // Show only active courses of the current period (which correspond to SEM 2)
    filteredCourses = filteredCourses.filter(c => c.semester === 'SEM 2' && c.year <= 2);
  } else {
    // Show only courses that have started (exclude future courses where year > 2)
    filteredCourses = filteredCourses.filter(c => c.year <= 2);
  }

  if (filteredCourses.length === 0) return 100; // default to perfect if no courses

  const sumCompletion = filteredCourses.reduce((sum, c) => {
    // Discipline (attendance) ratio (capped at 100% or allow up to 100% KPI weight)
    const disciplineScore = Math.min((c.attendanceRate / c.attendanceTarget) * 100, 100);
    // Pass rate ratio
    const passScore = Math.min((c.passRate / c.passTarget) * 100, 100);
    // Submit rate ratio
    const submitScore = Math.min((c.submitRate / c.submitTarget) * 100, 100);
    
    // Average of 3 components for this course
    const courseAvg = (disciplineScore + passScore + submitScore) / 3;
    return sum + courseAvg;
  }, 0);

  return Math.round(sumCompletion / filteredCourses.length);
}

export function calculateOverallKPI(userId: string, period: string): number {
  // 1. Vận hành - Operations (50%)
  const opScore = calculateOperationsKPI(userId, period);
  
  // 2. HĐ hỗ trợ học tập - Academic Support (20%)
  // Shared KPI: Linked directly to op5_as (Hoạt động ngoại khóa - Học tập)
  const snapshots = getKPISnapshotsByUser(userId, period);
  const op5AsSnap = snapshots.find(s => s.kpiDefinitionId === 'op5_as');
  const asScore = op5AsSnap ? op5AsSnap.score : 0;

  // 3. Kết quả học tập & Kỷ luật - Student Results (20%)
  // Find which program this user manages
  const userProg = programs.find(p => p.managerId === userId);
  const studentResultsScore = userProg ? calculateCoursesKPI(userProg.id, 'current') : 80;

  // 4. Các hoạt động khác - Other Activities (10%)
  const otherSnaps = snapshots.filter(s => {
    const def = kpiDefinitions.find(d => d.id === s.kpiDefinitionId);
    return def?.groupId === 'other_activities';
  });
  const otherScore = otherSnaps.length > 0 
    ? otherSnaps.reduce((sum, s) => sum + s.score, 0) / otherSnaps.length 
    : 0;

  // Final Overall formula
  const final = (opScore * 0.5) + (asScore * 0.2) + (studentResultsScore * 0.2) + (otherScore * 0.1);
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
let _editRequests: KPIEditRequest[] = getSaved<KPIEditRequest[]>('isme_edit_requests', []);
let _editListeners: (() => void)[] = [];

export function subscribeEditRequests(fn: () => void) {
  _editListeners.push(fn);
  return () => { _editListeners = _editListeners.filter(f => f !== fn); };
}

function _notifyEdit() {
  save('isme_edit_requests', _editRequests);
  _editListeners.forEach(fn => fn());
}

export function getKPIEditRequests(): KPIEditRequest[] {
  return _editRequests;
}

export function getPendingEditForSnapshot(snapshotId: string): KPIEditRequest | undefined {
  return _editRequests.find(r => r.snapshotId === snapshotId && r.status === 'pending');
}

export function createKPIEditRequest(req: Omit<KPIEditRequest, 'id' | 'status' | 'requestedAt' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>) {
  const newReq: KPIEditRequest = {
    ...req,
    id: 'er' + Date.now(),
    status: 'pending',
    requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: ''
  };
  _editRequests = [newReq, ..._editRequests];
  addAuditLog(req.userId, 'Gửi yêu cầu sửa KPI', `Đã gửi yêu cầu chỉnh sửa KPI ${kpiDefinitions.find(k => k.id === req.kpiDefinitionId)?.shortName}. Thay đổi trị số: ${req.oldNumerator}/${req.oldDenominator} -> ${req.newNumerator}/${req.newDenominator}. Lý do: "${req.reason}"`);
  _notifyEdit();
  return newReq;
}

export function approveKPIEditRequest(id: string, reviewerId: string, note: string) {
  _editRequests = _editRequests.map(r => {
    if (r.id !== id) return r;
    
    // Apply changes to target snapshot
    updateSnapshotValue(r.snapshotId, {
      actualValue: r.newActualValue,
      rawNumerator: r.newNumerator,
      rawDenominator: r.newDenominator,
      score: r.newScore
    });

    addAuditLog(reviewerId, 'Duyệt yêu cầu sửa KPI', `Đã duyệt yêu cầu sửa KPI của ${getUserById(r.userId)?.name}. KPI: ${kpiDefinitions.find(k => k.id === r.kpiDefinitionId)?.shortName}. Nội dung duyệt: "${note}"`);
    return {
      ...r,
      status: 'approved' as const,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewNote: note
    };
  });
  _notifyEdit();
}

export function rejectKPIEditRequest(id: string, reviewerId: string, note: string) {
  _editRequests = _editRequests.map(r => {
    if (r.id !== id) return r;
    addAuditLog(reviewerId, 'Từ chối yêu cầu sửa KPI', `Đã từ chối yêu cầu sửa KPI của ${getUserById(r.userId)?.name}. KPI: ${kpiDefinitions.find(k => k.id === r.kpiDefinitionId)?.shortName}. Lý do từ chối: "${note}"`);
    return {
      ...r,
      status: 'rejected' as const,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewNote: note
    };
  });
  _notifyEdit();
}

// ==================== COURSE EDIT REQUESTS ====================
let _courseEditRequests: CourseEditRequest[] = getSaved<CourseEditRequest[]>('isme_course_edit_requests', []);
let _courseEditListeners: (() => void)[] = [];

export function subscribeCourseEditRequests(fn: () => void) {
  _courseEditListeners.push(fn);
  return () => { _courseEditListeners = _courseEditListeners.filter(f => f !== fn); };
}

function _notifyCourseEdit() {
  save('isme_course_edit_requests', _courseEditRequests);
  _courseEditListeners.forEach(fn => fn());
}

export function getCourseEditRequests(): CourseEditRequest[] {
  return _courseEditRequests;
}

export function getPendingCourseEditForField(courseId: string, field: CourseEditField): CourseEditRequest | undefined {
  return _courseEditRequests.find(r => r.courseId === courseId && r.field === field && r.status === 'pending');
}

export function createCourseEditRequest(req: Omit<CourseEditRequest, 'id' | 'status' | 'requestedAt' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>) {
  const newReq: CourseEditRequest = {
    ...req,
    id: 'cer' + Date.now(),
    status: 'pending',
    requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: ''
  };
  _courseEditRequests = [newReq, ..._courseEditRequests];
  
  const course = courses.find(c => c.id === req.courseId);
  addAuditLog(req.userId, 'Gửi yêu cầu sửa Điểm môn học', `Đã gửi yêu cầu sửa điểm môn ${course?.name} (${req.fieldLabel}). Giá trị thay đổi: ${req.oldValue}% -> ${req.newValue}%. Lý do: "${req.reason}"`);
  
  _notifyCourseEdit();
  return newReq;
}

export function approveCourseEditRequest(id: string, reviewerId: string, note: string) {
  _courseEditRequests = _courseEditRequests.map(r => {
    if (r.id !== id) return r;
    
    // Apply changes to course object
    const valDecimal = r.newValue / 100;
    updateCourseValue(r.courseId, {
      [r.field]: valDecimal
    });

    const course = courses.find(c => c.id === r.courseId);
    addAuditLog(reviewerId, 'Duyệt yêu cầu sửa Điểm môn học', `Đã duyệt yêu cầu sửa điểm môn ${course?.name} của ${getUserById(r.userId)?.name}. Nội dung duyệt: "${note}"`);
    
    return {
      ...r,
      status: 'approved' as const,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewNote: note
    };
  });
  _notifyCourseEdit();
}

export function rejectCourseEditRequest(id: string, reviewerId: string, note: string) {
  _courseEditRequests = _courseEditRequests.map(r => {
    if (r.id !== id) return r;
    
    const course = courses.find(c => c.id === r.courseId);
    addAuditLog(reviewerId, 'Từ chối yêu cầu sửa Điểm môn học', `Đã từ chối yêu cầu sửa điểm môn ${course?.name} của ${getUserById(r.userId)?.name}. Lý do từ chối: "${note}"`);
    
    return {
      ...r,
      status: 'rejected' as const,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reviewNote: note
    };
  });
  _notifyCourseEdit();
}

// ==================== MANAGER QUESTIONS ====================
let _managerQuestions: ManagerQuestion[] = [
  { id: 'mq1', fromUserId: 'u1', toUserId: 'u7', subject: 'Tỷ lệ nộp bài đúng hạn', question: 'Môn Macroeconomics tại sao tỷ lệ đi học và nộp bài chỉ ở mức 66% và 80%?', context: 'Macroeconomics', contextType: 'course', contextId: 'c_au1_2', status: 'open', createdAt: new Date().toISOString().split('T')[0], answer: '', answeredAt: null, managerReply: '', repliedAt: null },
];
let _questionListeners: (() => void)[] = [];

export function subscribeQuestions(fn: () => void) {
  _questionListeners.push(fn);
  return () => { _questionListeners = _questionListeners.filter(f => f !== fn); };
}

function _notifyQuestions() {
  _questionListeners.forEach(fn => fn());
}

export function getManagerQuestions(): ManagerQuestion[] { return _managerQuestions; }
export function getQuestionsForUser(userId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.toUserId === userId); }
export function getQuestionsByManager(managerId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.fromUserId === managerId); }
export function getOpenQuestionsForUser(userId: string): ManagerQuestion[] { return _managerQuestions.filter(q => q.toUserId === userId && q.status === 'open'); }
export function createManagerQuestion(q: Omit<ManagerQuestion, 'id' | 'status' | 'createdAt' | 'answer' | 'answeredAt' | 'managerReply' | 'repliedAt'>) {
  const newQ: ManagerQuestion = {
    ...q,
    id: 'mq' + Date.now(),
    status: 'open',
    createdAt: new Date().toISOString().split('T')[0],
    answer: '',
    answeredAt: null,
    managerReply: '',
    repliedAt: null
  };
  _managerQuestions = [newQ, ..._managerQuestions];
  _notifyQuestions();
  return newQ;
}

export function answerQuestion(questionId: string, answer: string): void {
  _managerQuestions = _managerQuestions.map(q => q.id !== questionId ? q : {
    ...q,
    status: 'answered' as const,
    answer,
    answeredAt: new Date().toISOString().split('T')[0]
  });
  _notifyQuestions();
}

export function replyToAnswer(questionId: string, reply: string): void {
  _managerQuestions = _managerQuestions.map(q => q.id !== questionId ? q : {
    ...q,
    status: 'closed' as const,
    managerReply: reply,
    repliedAt: new Date().toISOString().split('T')[0]
  });
  _notifyQuestions();
}
