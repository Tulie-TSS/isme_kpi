import type { Task } from './types';

const today = new Date();
const d = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

// ==================== HIERARCHICAL TASKS ====================
// Level 0: Nhiệm vụ lớn (yearly KPI tasks)
// Level 1: Cụm nhiệm vụ (quarterly groups)
// Level 2: Nhiệm vụ con (individual actions)

export const tasks: Task[] = [
  // ═══════════════ HƯƠNG GIANG (u9) — BTEC ═══════════════
  // L0: Nhiệm vụ lớn
  { id: 'T0-1', templateId: null, parentId: null, category: 'kpi', frequency: 'yearly', kpiDefinitionId: 'kpi1', title: 'Đảm bảo tài liệu giảng dạy BTEC — Kỳ 2.2526', description: 'Đảm bảo 100% môn BTEC có đầy đủ SoW, Assessment Plan, Assignment Brief', ownerId: 'u9', programId: 'p3', dueDate: '2026-06-30', status: 'IN_PROGRESS', progress: 71, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: '2026-02-01', updatedAt: d(0), requiresEvidence: true },
  { id: 'T0-2', templateId: null, parentId: null, category: 'kpi', frequency: 'yearly', kpiDefinitionId: 'kpi3', title: 'Tổ chức lớp học BTEC — Kỳ 2.2526', description: 'Setup TKB, Moodle, account cho toàn bộ môn BTEC', ownerId: 'u9', programId: 'p3', dueDate: '2026-06-30', status: 'IN_PROGRESS', progress: 80, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: '2026-02-01', updatedAt: d(0), requiresEvidence: true },
  { id: 'T0-3', templateId: null, parentId: null, category: 'kpi', frequency: 'yearly', kpiDefinitionId: 'kpi4', title: 'Quản lý điểm & đánh giá BTEC — Kỳ 2.2526', description: 'Hoàn thành điểm đúng kế hoạch cho toàn bộ môn', ownerId: 'u9', programId: 'p3', dueDate: '2026-06-30', status: 'IN_PROGRESS', progress: 57, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: '2026-02-01', updatedAt: d(0), requiresEvidence: true },
  { id: 'T0-4', templateId: null, parentId: null, category: 'kpi', frequency: 'yearly', kpiDefinitionId: 'kpi7', title: 'Liêm chính học thuật BTEC — Kỳ 2.2526', description: 'Rà soát Turnitin cho toàn bộ môn', ownerId: 'u9', programId: 'p3', dueDate: '2026-06-30', status: 'IN_PROGRESS', progress: 60, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: '2026-02-01', updatedAt: d(0), requiresEvidence: true },
  { id: 'T0-5', templateId: null, parentId: null, category: 'kpi', frequency: 'yearly', kpiDefinitionId: 'kpi5', title: 'Hoạt động ngoại khóa BTEC — Kỳ 2.2526', description: 'Tổ chức guest speaker / field trip cho các môn', ownerId: 'u9', programId: 'p3', dueDate: '2026-06-30', status: 'IN_PROGRESS', progress: 30, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: '2026-02-01', updatedAt: d(0), requiresEvidence: true },

  // L1: Cụm nhiệm vụ — Tài liệu GD
  { id: 'T1-1', templateId: null, parentId: 'T0-1', category: 'kpi', frequency: 'quarterly', kpiDefinitionId: null, title: 'Chuẩn bị tài liệu — Đợt 1 (tháng 2-3)', description: 'Thu thập syllabus, SoW từ GV cho các môn đợt 1', ownerId: 'u9', programId: 'p3', dueDate: d(5), status: 'IN_PROGRESS', progress: 80, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: '2026-02-01', updatedAt: d(0), requiresEvidence: true },
  { id: 'T1-2', templateId: null, parentId: 'T0-1', category: 'kpi', frequency: 'quarterly', kpiDefinitionId: null, title: 'Chuẩn bị tài liệu — Đợt 2 (tháng 4-5)', description: 'Thu thập tài liệu cho các môn đợt 2', ownerId: 'u9', programId: 'p3', dueDate: '2026-05-15', status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: '2026-02-01', updatedAt: d(0), requiresEvidence: true },

  // L2: Nhiệm vụ con — Tài liệu GD Đợt 1
  { id: 't1', templateId: 'tt1', parentId: 'T1-1', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi DS lớp và TKB cho GV — Contemporary Business Env', description: 'Gửi danh sách lớp và TKB cho GV môn CBE', ownerId: 'u9', programId: 'p3', dueDate: d(-5), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/evidence1', issueFlag: false, issueNote: '', completedAt: d(-6), createdAt: d(-30), updatedAt: d(-6), requiresEvidence: true, courseName: 'Contemporary Business Environment' },
  { id: 't2', templateId: 'tt2', parentId: 'T1-1', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhận syllabus từ GV — HRM', description: 'Nhận syllabus từ GV môn HRM', ownerId: 'u9', programId: 'p3', dueDate: d(-3), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/evidence2', issueFlag: false, issueNote: '', completedAt: d(-4), createdAt: d(-25), updatedAt: d(-4), requiresEvidence: true, courseName: 'Management of Human Resources' },
  { id: 't3', templateId: 'tt3', parentId: 'T1-1', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Yêu cầu GV up tài liệu Moodle — Accounting', description: 'Yêu cầu GV upload tài liệu lên Moodle', ownerId: 'u9', programId: 'p3', dueDate: d(-2), status: 'IN_PROGRESS', progress: 70, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-20), updatedAt: d(-1), requiresEvidence: true, courseName: 'Accounting Principles' },
  { id: 't10', templateId: null, parentId: 'T1-1', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi feedback SV cho GV — Business Law', description: 'Thu thập và gửi feedback SV', ownerId: 'u9', programId: 'p3', dueDate: d(-4), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/evidence3', issueFlag: false, issueNote: '', completedAt: d(-5), createdAt: d(-20), updatedAt: d(-5), requiresEvidence: true, courseName: 'Business Law' },
  { id: 't8', templateId: 'tt9', parentId: 'T1-1', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Kiểm tra tài liệu Moodle — Marketing', description: 'Kiểm tra tài liệu trên Moodle', ownerId: 'u9', programId: 'p3', dueDate: d(3), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-5), updatedAt: d(-5), requiresEvidence: true, courseName: 'Marketing Insights and Analytics' },

  // L1: Cụm — Quản lý đánh giá
  { id: 'T1-3', templateId: null, parentId: 'T0-3', category: 'kpi', frequency: 'quarterly', kpiDefinitionId: null, title: 'Chốt Assessment Plan — Đợt 1', description: 'Finalize assessment plans cho đợt 1', ownerId: 'u9', programId: 'p3', dueDate: d(2), status: 'BLOCKED', progress: 40, evidenceUrl: null, issueFlag: true, issueNote: 'Chờ phản hồi từ GV', completedAt: null, createdAt: '2026-02-15', updatedAt: d(0), requiresEvidence: true },

  // L2: Nhiệm vụ con — Assessment Plan
  { id: 't4', templateId: 'tt4', parentId: 'T1-3', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'GV gửi Assessment Plan — OB Management', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(2), status: 'IN_PROGRESS', progress: 50, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-15), updatedAt: d(0), requiresEvidence: true, courseName: 'Organisational Behaviour Management' },
  { id: 't5', templateId: 'tt5', parentId: 'T1-3', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Kiểm tra điểm danh SV — Business Strategy', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(-7), status: 'DONE', progress: 100, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: d(-8), createdAt: d(-20), updatedAt: d(-8), requiresEvidence: false, courseName: 'Business Strategy' },
  { id: 't6', templateId: 'tt6', parentId: 'T1-3', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Chốt Assessment Plan toàn CT BTEC', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(-1), status: 'BLOCKED', progress: 40, evidenceUrl: null, issueFlag: true, issueNote: 'Chờ phản hồi từ GV môn Marketing, Innovation', completedAt: null, createdAt: d(-25), updatedAt: d(0), requiresEvidence: true },

  // L1: Cụm — Turnitin
  { id: 'T1-4', templateId: null, parentId: 'T0-4', category: 'kpi', frequency: 'monthly', kpiDefinitionId: null, title: 'Rà soát Turnitin — Tháng 3', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(5), status: 'IN_PROGRESS', progress: 50, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-10), updatedAt: d(-1), requiresEvidence: true },

  { id: 't11', templateId: null, parentId: 'T1-4', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Rà soát Turnitin — Innovation', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(-2), status: 'IN_PROGRESS', progress: 80, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-14), updatedAt: d(-1), requiresEvidence: true, courseName: 'Innovation and Commercialisation' },

  // L1: Cụm — Ngoại khóa
  { id: 'T1-5', templateId: null, parentId: 'T0-5', category: 'kpi', frequency: 'quarterly', kpiDefinitionId: null, title: 'Guest Speaker & Field Trip — Q1', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(15), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-5), updatedAt: d(-5), requiresEvidence: true },
  { id: 't9', templateId: 'tt10', parentId: 'T1-5', category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Plan Guest Speaker — Operations Mgmt', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(10), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-3), updatedAt: d(-3), requiresEvidence: true, courseName: 'Principles of Operations Management' },

  // L0: Tổng hợp kỷ luật (standalone)
  { id: 't7', templateId: 'tt7', parentId: null, category: 'kpi', frequency: 'quarterly', kpiDefinitionId: 'kpi6', title: 'Tổng hợp kỷ luật — BTEC HND giữa kỳ', description: '', ownerId: 'u9', programId: 'p3', dueDate: d(5), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-5), updatedAt: d(-5), requiresEvidence: true },

  // ═══════════════ ADHOC TASKS — Hương Giang ═══════════════
  { id: 'ta1', templateId: null, parentId: null, category: 'adhoc', frequency: 'once', kpiDefinitionId: null, title: 'Hỗ trợ tổ chức ISME Open Day', description: 'Phụ trách logistics cho sự kiện Open Day', ownerId: 'u9', programId: 'p3', dueDate: d(7), status: 'IN_PROGRESS', progress: 40, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-10), updatedAt: d(-1), requiresEvidence: false },
  { id: 'ta2', templateId: null, parentId: null, category: 'adhoc', frequency: 'monthly', kpiDefinitionId: null, title: 'Kiêm nhiệm cố vấn học tập K68', description: 'Theo dõi tình hình SV K68', ownerId: 'u9', programId: 'p3', dueDate: d(14), status: 'IN_PROGRESS', progress: 55, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-30), updatedAt: d(-2), requiresEvidence: false },
  { id: 'ta3', templateId: null, parentId: null, category: 'adhoc', frequency: 'once', kpiDefinitionId: null, title: 'Xử lý khiếu nại SV về điểm — CBE', description: 'SV Nguyễn Văn A khiếu nại điểm assignment 2', ownerId: 'u9', programId: 'p3', dueDate: d(1), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: true, issueNote: 'Cần xác minh với GV trước 20/03', completedAt: null, createdAt: d(-2), updatedAt: d(-2), requiresEvidence: true },

  // ═══════════════ OTHER STAFF TASKS ═══════════════
  // Bùi Quỳnh Trang (u2)
  { id: 't12', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB cho GV Tiếng Anh — Năm 1', description: '', ownerId: 'u2', programId: 'p1', dueDate: d(-10), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev4', issueFlag: false, issueNote: '', completedAt: d(-11), createdAt: d(-30), updatedAt: d(-11), requiresEvidence: true },
  { id: 't13', templateId: 'tt2', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhận syllabus Toán Cao Cấp — Năm 1', description: '', ownerId: 'u2', programId: 'p1', dueDate: d(-3), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev5', issueFlag: false, issueNote: '', completedAt: d(-2), createdAt: d(-25), updatedAt: d(-2), requiresEvidence: true },
  { id: 't14', templateId: 'tt5', parentId: null, category: 'kpi', frequency: 'weekly', kpiDefinitionId: null, title: 'Điểm danh SV Năm 1 — Tuần 4', description: '', ownerId: 'u2', programId: 'p1', dueDate: d(1), status: 'IN_PROGRESS', progress: 60, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-7), updatedAt: d(0), requiresEvidence: false },
  { id: 't15', templateId: 'tt8', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhắc nhở SV Năm 1 nghỉ quá phép', description: '', ownerId: 'u2', programId: 'p1', dueDate: d(-1), status: 'DONE', progress: 100, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: d(0), createdAt: d(-5), updatedAt: d(0), requiresEvidence: false },
  { id: 't16', templateId: 'tt10', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Plan Field Trip cho SV Năm 1', description: '', ownerId: 'u2', programId: 'p1', dueDate: d(7), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-3), updatedAt: d(-3), requiresEvidence: true },
  // Bùi Thu Trang (u3)
  { id: 't40', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB GV — Digital Marketing', description: '', ownerId: 'u3', programId: 'p2', dueDate: d(-10), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev14', issueFlag: false, issueNote: '', completedAt: d(-11), createdAt: d(-28), updatedAt: d(-11), requiresEvidence: true },
  { id: 't41', templateId: 'tt2', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhận syllabus — Digital Marketing', description: '', ownerId: 'u3', programId: 'p2', dueDate: d(-5), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev15', issueFlag: false, issueNote: '', completedAt: d(-4), createdAt: d(-22), updatedAt: d(-4), requiresEvidence: true },
  { id: 't42', templateId: 'tt5', parentId: null, category: 'kpi', frequency: 'weekly', kpiDefinitionId: null, title: 'Điểm danh SV — Digital Marketing', description: '', ownerId: 'u3', programId: 'p2', dueDate: d(1), status: 'IN_PROGRESS', progress: 55, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-7), updatedAt: d(0), requiresEvidence: false },
  { id: 't43', templateId: 'tt3', parentId: null, category: 'adhoc', frequency: 'once', kpiDefinitionId: null, title: 'Điều phối môn học BTEC — Bùi Thu Trang', description: '', ownerId: 'u3', programId: 'p3', dueDate: d(-1), status: 'IN_PROGRESS', progress: 70, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-14), updatedAt: d(0), requiresEvidence: true },
  // Trần Hương Thảo (u4)
  { id: 't17', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB cho GV BTEC — Kỳ mới', description: '', ownerId: 'u4', programId: 'p3', dueDate: d(-12), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev6', issueFlag: false, issueNote: '', completedAt: d(-13), createdAt: d(-30), updatedAt: d(-13), requiresEvidence: true },
  { id: 't18', templateId: null, parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Báo cáo tuyển sinh BTEC kỳ mới', description: '', ownerId: 'u4', programId: 'p3', dueDate: d(-5), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev7', issueFlag: false, issueNote: '', completedAt: d(-4), createdAt: d(-20), updatedAt: d(-4), requiresEvidence: true },
  { id: 't19', templateId: null, parentId: null, category: 'kpi', frequency: 'quarterly', kpiDefinitionId: null, title: 'Rà soát chất lượng giảng dạy BTEC', description: '', ownerId: 'u4', programId: 'p3', dueDate: d(3), status: 'IN_PROGRESS', progress: 45, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-10), updatedAt: d(-1), requiresEvidence: true },
  { id: 't20', templateId: null, parentId: null, category: 'adhoc', frequency: 'once', kpiDefinitionId: null, title: 'Hỗ trợ tư vấn du học — SV BTEC', description: '', ownerId: 'u4', programId: 'p3', dueDate: d(14), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-5), updatedAt: d(-5), requiresEvidence: false },
  // Trần Bích Ngọc (u5)
  { id: 't21', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB cho GV — NHTC kỳ 2', description: '', ownerId: 'u5', programId: 'p4', dueDate: d(-8), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev8', issueFlag: false, issueNote: '', completedAt: d(-9), createdAt: d(-28), updatedAt: d(-9), requiresEvidence: true },
  { id: 't22', templateId: 'tt4', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhận Assessment Plan — NHTC', description: '', ownerId: 'u5', programId: 'p4', dueDate: d(-2), status: 'IN_PROGRESS', progress: 75, evidenceUrl: null, issueFlag: true, issueNote: 'GV môn TCFD chưa gửi', completedAt: null, createdAt: d(-18), updatedAt: d(0), requiresEvidence: true },
  { id: 't23', templateId: 'tt7', parentId: null, category: 'kpi', frequency: 'quarterly', kpiDefinitionId: null, title: 'Tổng hợp kỷ luật — NHTC giữa kỳ', description: '', ownerId: 'u5', programId: 'p4', dueDate: d(4), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-5), updatedAt: d(-5), requiresEvidence: true },
  // Vũ Minh Nhật (u6)
  { id: 't24', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB GV — Top-up UWE', description: '', ownerId: 'u6', programId: 'p5', dueDate: d(-10), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev9', issueFlag: false, issueNote: '', completedAt: d(-11), createdAt: d(-30), updatedAt: d(-11), requiresEvidence: true },
  { id: 't25', templateId: 'tt3', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Upload tài liệu Moodle — UWE', description: '', ownerId: 'u6', programId: 'p5', dueDate: d(-6), status: 'DONE', progress: 100, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: d(-5), createdAt: d(-20), updatedAt: d(-5), requiresEvidence: false },
  { id: 't26', templateId: null, parentId: null, category: 'adhoc', frequency: 'monthly', kpiDefinitionId: null, title: 'CN Lớp NHTC Năm 2 — Theo dõi SV', description: '', ownerId: 'u6', programId: 'p4', dueDate: d(2), status: 'IN_PROGRESS', progress: 50, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-10), updatedAt: d(-1), requiresEvidence: false },
  // Nguyễn Giang Khánh Huyền (u7)
  { id: 't44', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB GV — Top-up CU', description: '', ownerId: 'u7', programId: 'p6', dueDate: d(-9), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev16', issueFlag: false, issueNote: '', completedAt: d(-10), createdAt: d(-28), updatedAt: d(-10), requiresEvidence: true },
  { id: 't45', templateId: null, parentId: null, category: 'adhoc', frequency: 'monthly', kpiDefinitionId: null, title: 'Cố vấn học tập — BBAE K67', description: '', ownerId: 'u7', programId: 'p7', dueDate: d(7), status: 'IN_PROGRESS', progress: 35, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-14), updatedAt: d(-2), requiresEvidence: false },
  { id: 't46', templateId: 'tt4', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhận Assessment Plan — CU', description: '', ownerId: 'u7', programId: 'p6', dueDate: d(-3), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev17', issueFlag: false, issueNote: '', completedAt: d(-2), createdAt: d(-18), updatedAt: d(-2), requiresEvidence: true },
  // Nguyễn Minh Tuấn (u8)
  { id: 't27', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB cho GV — BBAE', description: '', ownerId: 'u8', programId: 'p7', dueDate: d(-8), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev10', issueFlag: false, issueNote: '', completedAt: d(-9), createdAt: d(-28), updatedAt: d(-9), requiresEvidence: true },
  { id: 't28', templateId: null, parentId: null, category: 'adhoc', frequency: 'once', kpiDefinitionId: null, title: 'Hỗ trợ IT — Fix lỗi hệ thống LMS', description: '', ownerId: 'u8', programId: 'p7', dueDate: d(-4), status: 'DONE', progress: 100, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: d(-3), createdAt: d(-10), updatedAt: d(-3), requiresEvidence: false },
  { id: 't29', templateId: 'tt5', parentId: null, category: 'kpi', frequency: 'weekly', kpiDefinitionId: null, title: 'Điểm danh SV — BSU', description: '', ownerId: 'u8', programId: 'p7', dueDate: d(1), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-3), updatedAt: d(-3), requiresEvidence: false },
  { id: 't30', templateId: null, parentId: null, category: 'adhoc', frequency: 'monthly', kpiDefinitionId: null, title: 'Cố vấn học tập BBAE K66', description: '', ownerId: 'u8', programId: 'p7', dueDate: d(7), status: 'IN_PROGRESS', progress: 30, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-14), updatedAt: d(-2), requiresEvidence: false },
  // Đào Ngọc Diệp (u10)
  { id: 't31', templateId: 'tt1', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Gửi TKB GV — Andrews', description: '', ownerId: 'u10', programId: 'p8', dueDate: d(-9), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev11', issueFlag: false, issueNote: '', completedAt: d(-10), createdAt: d(-28), updatedAt: d(-10), requiresEvidence: true },
  { id: 't32', templateId: 'tt2', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhận syllabus GV — Lincoln', description: '', ownerId: 'u10', programId: 'p9', dueDate: d(-3), status: 'DONE', progress: 100, evidenceUrl: 'https://drive.google.com/ev12', issueFlag: false, issueNote: '', completedAt: d(-2), createdAt: d(-20), updatedAt: d(-2), requiresEvidence: true },
  { id: 't33', templateId: null, parentId: null, category: 'adhoc', frequency: 'monthly', kpiDefinitionId: null, title: 'ISME Mentoring — Operation Lead', description: '', ownerId: 'u10', programId: 'p8', dueDate: d(5), status: 'IN_PROGRESS', progress: 60, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-14), updatedAt: d(-1), requiresEvidence: false },

  // ═══════════════ MOCK DATA LIÊN KẾT CHECKLIST (UWE & NHTC) ═══════════════
  { id: 't100', templateId: 'tt4', parentId: null, category: 'kpi', frequency: 'once', kpiDefinitionId: null, title: 'Nhận Assessment Plan — UWE', description: 'Đốc thúc UWE gửi CW brief', ownerId: 'u6', programId: 'p5', dueDate: d(2), status: 'IN_PROGRESS', progress: 40, evidenceUrl: null, issueFlag: true, issueNote: 'UWE gửi CW brief, nhiều môn chưa có', completedAt: null, createdAt: d(-15), updatedAt: d(0), requiresEvidence: true, courseName: 'Các môn UWE' },
  { id: 't101', templateId: 'tt5', parentId: null, category: 'kpi', frequency: 'weekly', kpiDefinitionId: null, title: 'Kiểm tra điểm danh tuần 2 — UWE', description: 'Yêu cầu GV hoàn thành điểm danh', ownerId: 'u6', programId: 'p5', dueDate: d(-1), status: 'TODO', progress: 0, evidenceUrl: null, issueFlag: true, issueNote: 'Microeconomics - GV chưa điểm danh\nAccounting Principles - Mới có điểm danh giấy', completedAt: null, createdAt: d(-7), updatedAt: d(-1), requiresEvidence: false, courseName: 'Microeconomics, Accounting' },
  { id: 't102', templateId: 'tt5', parentId: null, category: 'kpi', frequency: 'weekly', kpiDefinitionId: null, title: 'Điểm danh SV — NHTC', description: 'Kiểm tra điểm danh NHTC', ownerId: 'u5', programId: 'p4', dueDate: d(1), status: 'IN_PROGRESS', progress: 50, evidenceUrl: null, issueFlag: false, issueNote: '', completedAt: null, createdAt: d(-5), updatedAt: d(-2), requiresEvidence: false },
];

// ==================== HELPERS ====================
export function getTaskChildren(taskId: string): Task[] {
  return tasks.filter(t => t.parentId === taskId);
}

export function getTaskParent(taskId: string): Task | undefined {
  const task = tasks.find(t => t.id === taskId);
  if (!task?.parentId) return undefined;
  return tasks.find(t => t.id === task.parentId);
}

export function getTaskAncestors(taskId: string): Task[] {
  const ancestors: Task[] = [];
  let current = tasks.find(t => t.id === taskId);
  while (current?.parentId) {
    const parent = tasks.find(t => t.id === current!.parentId);
    if (parent) { ancestors.unshift(parent); current = parent; } else break;
  }
  return ancestors;
}

export function getTopLevelTasks(userId?: string): Task[] {
  return tasks.filter(t => !t.parentId && (!userId || t.ownerId === userId));
}

export function calculateTaskProgress(taskId: string): number {
  const children = getTaskChildren(taskId);
  if (children.length === 0) {
    const task = tasks.find(t => t.id === taskId);
    return task?.progress ?? 0;
  }
  return Math.round(children.reduce((sum, c) => sum + calculateTaskProgress(c.id), 0) / children.length);
}
