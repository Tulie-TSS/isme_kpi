const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load mock data
const mockDataPath = path.join(__dirname, '../src/lib/mock-data.ts');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

function extractCourses() {
  const match = mockDataContent.match(/export const allCourses: Course\[\] = (\[[\s\S]*?\n\]);/);
  if (!match) return [];
  return eval(match[1]);
}

function extractSnapshots() {
  const match = mockDataContent.match(/export const allSnaps: Record<string, SemesterSnapshot> = ({[\s\S]*?\n});/);
  if (!match) return {};
  return eval('(' + match[1] + ')');
}

const allCourses = extractCourses();
const allSnaps = extractSnapshots();

const coordinators = [
  { id: 'trang-btq', name: 'Bùi Thị Quỳnh Trang', prog: 'Ban Năm 1', snapKey: 'trang-btq-sem2-2026' },
  { id: 'tuan-nm', name: 'Nguyễn Minh Tuấn', prog: 'BBAE', snapKey: 'tuan-nm-sem2-2026' },
  { id: 'nhat-vm', name: 'Vũ Minh Nhật', snapKey: 'nhat-vm-sem2-2026', prog: 'Top-up UWE' },
  { id: 'ngoc-ttb', name: 'Trần Thị Bích Ngọc', prog: 'NHTC', snapKey: 'ngoc-ttb-sem2-2026' },
  { id: 'thao-th', name: 'Trần Hương Thảo', prog: 'BTEC', snapKey: 'thao-th-sem2-2026' },
  { id: 'huyen-ngk', name: 'Nguyễn Giang Khánh Huyền', prog: 'Top-up CU', snapKey: 'huyen-ngk-sem2-2026' },
  { id: 'diep-dn', name: 'Đào Ngọc Diệp', prog: 'AU', snapKey: 'diep-dn-sem2-2026' },
  { id: 'trang-bt', name: 'Bùi Thu Trang', prog: 'Digital Marketing', snapKey: 'trang-bt-sem2-2026' }
];

const outDir = path.join(__dirname, '../templates_clean_nhap_lieu');
const publicDir = path.join(__dirname, '../public/templates_clean');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

coordinators.forEach(coord => {
  const wb = XLSX.utils.book_new();
  const snap = allSnaps[coord.snapKey] || {};

  // Sheet 1: NHAP_KPI
  // Pure flat tabular data: Row 1 is header
  const kpiRows = [
    {
      'Mã chỉ tiêu': 'OP1',
      'Nhóm KPI': 'Vận hành (OPERATION)',
      'Tên chỉ tiêu công việc': 'Mở lớp theo kế hoạch đào tạo',
      'Trọng số (%)': 0.10,
      'Chỉ tiêu (Target)': snap.op1Target ?? 4,
      'Thực hiện (Actual)': snap.op1Actual ?? '',
      'Đơn vị tính': 'Lớp',
      'Ghi chú / Link minh chứng': ''
    },
    {
      'Mã chỉ tiêu': 'OP2',
      'Nhóm KPI': 'Vận hành (OPERATION)',
      'Tên chỉ tiêu công việc': 'Hoàn thành hồ sơ thanh toán giảng viên đúng hạn',
      'Trọng số (%)': 0.10,
      'Chỉ tiêu (Target)': snap.op2Target ?? 2,
      'Thực hiện (Actual)': snap.op2Actual ?? '',
      'Đơn vị tính': 'Hồ sơ',
      'Ghi chú / Link minh chứng': ''
    },
    {
      'Mã chỉ tiêu': 'OP3',
      'Nhóm KPI': 'Vận hành (OPERATION)',
      'Tên chỉ tiêu công việc': 'Cập nhật điểm sinh viên lên hệ thống đúng hạn',
      'Trọng số (%)': 0.10,
      'Chỉ tiêu (Target)': snap.op3Target ?? 4,
      'Thực hiện (Actual)': snap.op3Actual ?? '',
      'Đơn vị tính': 'Môn',
      'Ghi chú / Link minh chứng': ''
    },
    {
      'Mã chỉ tiêu': 'OP4',
      'Nhóm KPI': 'Vận hành (OPERATION)',
      'Tên chỉ tiêu công việc': 'Tiếp nhận và giải quyết phản hồi / khiếu nại của SV',
      'Trọng số (%)': 0.10,
      'Chỉ tiêu (Target)': snap.op4Target ?? 5,
      'Thực hiện (Actual)': snap.op4Actual ?? '',
      'Đơn vị tính': 'Vụ việc',
      'Ghi chú / Link minh chứng': ''
    },
    {
      'Mã chỉ tiêu': 'OP5',
      'Nhóm KPI': 'Vận hành (OPERATION)',
      'Tên chỉ tiêu công việc': 'Báo cáo tình hình học tập định kỳ hàng tháng',
      'Trọng số (%)': 0.10,
      'Chỉ tiêu (Target)': snap.op5Target ?? 3,
      'Thực hiện (Actual)': snap.op5Actual ?? '',
      'Đơn vị tính': 'Báo cáo',
      'Ghi chú / Link minh chứng': ''
    },
    {
      'Mã chỉ tiêu': 'OTHER11',
      'Nhóm KPI': 'Hoạt động hỗ trợ & phong trào',
      'Tên chỉ tiêu công việc': 'Tham gia tổ chức sự kiện chào tân SV / định hướng / Workshop',
      'Trọng số (%)': 0.05,
      'Chỉ tiêu (Target)': snap.other1Target ?? 2,
      'Thực hiện (Actual)': snap.other1Actual ?? '',
      'Đơn vị tính': 'Sự kiện',
      'Ghi chú / Link minh chứng': ''
    },
    {
      'Mã chỉ tiêu': 'OTHER12',
      'Nhóm KPI': 'Hoạt động hỗ trợ & phong trào',
      'Tên chỉ tiêu công việc': 'Hỗ trợ công tác tuyển sinh và tư vấn khóa mới',
      'Trọng số (%)': 0.05,
      'Chỉ tiêu (Target)': snap.other2Target ?? 10,
      'Thực hiện (Actual)': snap.other2Actual ?? '',
      'Đơn vị tính': 'Hồ sơ',
      'Ghi chú / Link minh chứng': ''
    },
    {
      'Mã chỉ tiêu': 'OTHER13',
      'Nhóm KPI': 'Hoạt động hỗ trợ & phong trào',
      'Tên chỉ tiêu công việc': 'Tham gia các hoạt động chung của Viện và Trường',
      'Trọng số (%)': 0.10,
      'Chỉ tiêu (Target)': snap.other3Target ?? 1,
      'Thực hiện (Actual)': snap.other3Actual ?? '',
      'Đơn vị tính': 'Hoạt động',
      'Ghi chú / Link minh chứng': ''
    }
  ];
  const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
  XLSX.utils.book_append_sheet(wb, wsKpi, 'NHAP_KPI');

  // Sheet 2: NHAP_LOP_MON_HOC
  // Flat tabular data for current semester classes
  const myCourses = allCourses.filter(c => c.coordinatorId === coord.id);
  const classRows = myCourses.map((c, idx) => ({
    'STT': idx + 1,
    'Học kỳ': c.semester,
    'Mã môn': c.courseCode,
    'Tên môn học': c.courseName,
    'Lớp học phần': c.courseCode + '_L01',
    'Giảng viên': 'ThS. / TS. Phụ trách',
    'Sĩ số (Tổng SV)': c.totalStudents,
    'SV chuyên cần (≥80%)': c.attendanceCount,
    'SV đạt lần 1 (Pass)': c.passedCount,
    'SV thi lại / nộp lại': c.resitCount,
    'SV nộp bài đúng hạn': c.submittedCount,
    'Ghi chú': ''
  }));
  const wsClasses = XLSX.utils.json_to_sheet(classRows.length > 0 ? classRows : [
    {
      'STT': 1,
      'Học kỳ': 'Sem 2 2026',
      'Mã môn': '',
      'Tên môn học': '',
      'Lớp học phần': '',
      'Giảng viên': '',
      'Sĩ số (Tổng SV)': '',
      'SV chuyên cần (≥80%)': '',
      'SV đạt lần 1 (Pass)': '',
      'SV thi lại / nộp lại': '',
      'SV nộp bài đúng hạn': '',
      'Ghi chú': ''
    }
  ]);
  XLSX.utils.book_append_sheet(wb, wsClasses, 'NHAP_LOP_MON_HOC');

  // Sheet 3: DANH_MUC_MON_TOAN_KHOA
  // All program courses across all years
  const progMap = {
    'trang-btq': 'Ban Năm 1',
    'tuan-nm': 'BBAE',
    'nhat-vm': 'Top-up UWE',
    'ngoc-ttb': 'NHTC',
    'thao-th': 'BTEC',
    'huyen-ngk': 'Top-up CU',
    'diep-dn': 'AU',
    'trang-bt': 'Digital Marketing'
  };
  const progCourses = allCourses.filter(c => c.program === progMap[coord.id]);
  const roadmapRows = progCourses.map((c, idx) => ({
    'STT': idx + 1,
    'Năm học': c.yearLevel ? `Năm ${c.yearLevel}` : 'Năm 1',
    'Học kỳ': c.semester,
    'Mã môn học': c.courseCode,
    'Tên môn học': c.courseName,
    'Số tín chỉ / Giờ': 3,
    'Loại môn': 'Bắt buộc',
    'Ghi chú': ''
  }));
  const wsRoadmap = XLSX.utils.json_to_sheet(roadmapRows);
  XLSX.utils.book_append_sheet(wb, wsRoadmap, 'DANH_MUC_MON_TOAN_KHOA');

  const fileName = `Mau_Nhap_Lieu_${coord.name.replace(/\s+/g, '_')}_${coord.prog.replace(/\s+/g, '_')}.xlsx`;
  const filePath = path.join(outDir, fileName);
  const publicPath = path.join(publicDir, fileName);
  XLSX.writeFile(wb, filePath);
  XLSX.writeFile(wb, publicPath);
  console.log(`Created: ${fileName}`);
});

// Also create a single Master template containing all 3 sheets blank + full schema
const masterWb = XLSX.utils.book_new();
const kpiSchema = [
  { 'Mã trường': 'ma_chi_tieu', 'Tên trường thông tin': 'Mã chỉ tiêu', 'Mô tả': 'Mã định danh chỉ tiêu (OP1..OP10, OTHER11..OTHER13)', 'Kiểu dữ liệu': 'Văn bản (Text)', 'Bắt buộc': 'Có', 'Ví dụ': 'OP1' },
  { 'Mã trường': 'nhom_kpi', 'Tên trường thông tin': 'Nhóm KPI', 'Mô tả': 'Vận hành (50%), Hoạt động khác (20%)', 'Kiểu dữ liệu': 'Văn bản (Text)', 'Bắt buộc': 'Có', 'Ví dụ': 'Vận hành (OPERATION)' },
  { 'Mã trường': 'ten_chi_tieu', 'Tên trường thông tin': 'Tên chỉ tiêu công việc', 'Mô tả': 'Nội dung công việc cần đánh giá', 'Kiểu dữ liệu': 'Văn bản (Text)', 'Bắt buộc': 'Có', 'Ví dụ': 'Mở lớp theo kế hoạch đào tạo' },
  { 'Mã trường': 'trong_so', 'Tên trường thông tin': 'Trọng số (%)', 'Mô tả': 'Tỉ trọng phần trăm của chỉ tiêu', 'Kiểu dữ liệu': 'Số thập phân (Decimal / %)', 'Bắt buộc': 'Có', 'Ví dụ': '10%' },
  { 'Mã trường': 'chi_tieu_giao', 'Tên trường thông tin': 'Chỉ tiêu giao (Target)', 'Mô tả': 'Số lượng mục tiêu được giao đầu kỳ', 'Kiểu dữ liệu': 'Số (Number)', 'Bắt buộc': 'Có', 'Ví dụ': '4' },
  { 'Mã trường': 'thuc_hien', 'Tên trường thông tin': 'Thực tế thực hiện (Actual)', 'Mô tả': 'Số lượng hoàn thành thực tế cuối kỳ', 'Kiểu dữ liệu': 'Số (Number)', 'Bắt buộc': 'Có', 'Ví dụ': '4' },
  { 'Mã trường': 'don_vi_tinh', 'Tên trường thông tin': 'Đơn vị tính', 'Mô tả': 'Lớp, Báo cáo, Vụ việc, Lần...', 'Kiểu dữ liệu': 'Văn bản (Text)', 'Bắt buộc': 'Có', 'Ví dụ': 'Lớp' },
  { 'Mã trường': 'ghi_chu_minh_chung', 'Tên trường thông tin': 'Ghi chú / Link minh chứng', 'Mô tả': 'Đường dẫn file drive hoặc văn bản đối chứng', 'Kiểu dữ liệu': 'Văn bản (Text/Link)', 'Bắt buộc': 'Không', 'Ví dụ': 'https://drive.google.com/...' }
];
XLSX.utils.book_append_sheet(masterWb, XLSX.utils.json_to_sheet(kpiSchema), 'TRUONG_KPI');

const classSchema = [
  { 'Mã trường': 'stt', 'Tên trường thông tin': 'STT', 'Mô tả': 'Số thứ tự', 'Kiểu dữ liệu': 'Số', 'Bắt buộc': 'Có', 'Ví dụ': '1' },
  { 'Mã trường': 'hoc_ky', 'Tên trường thông tin': 'Học kỳ', 'Mô tả': 'Kỳ đánh giá', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'Sem 2 2026' },
  { 'Mã trường': 'ma_mon', 'Tên trường thông tin': 'Mã môn', 'Mô tả': 'Mã học phần', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'BBAE101' },
  { 'Mã trường': 'ten_mon', 'Tên trường thông tin': 'Tên môn học', 'Mô tả': 'Tên chi tiết môn học', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'Kinh tế vi mô' },
  { 'Mã trường': 'lop_hoc_phan', 'Tên trường thông tin': 'Lớp học phần', 'Mô tả': 'Mã định danh lớp học', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'BBAE101_L01' },
  { 'Mã trường': 'giang_vien', 'Tên trường thông tin': 'Giảng viên', 'Mô tả': 'Họ tên GV giảng dạy', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Không', 'Ví dụ': 'ThS. Nguyễn Văn A' },
  { 'Mã trường': 'si_so', 'Tên trường thông tin': 'Sĩ số (Tổng SV)', 'Mô tả': 'Tổng số SV đăng ký học lớp này', 'Kiểu dữ liệu': 'Số nguyên', 'Bắt buộc': 'Có', 'Ví dụ': '45' },
  { 'Mã trường': 'sv_chuyen_can', 'Tên trường thông tin': 'SV chuyên cần (≥80%)', 'Mô tả': 'Số lượng SV đạt chuyên cần', 'Kiểu dữ liệu': 'Số nguyên', 'Bắt buộc': 'Có', 'Ví dụ': '42' },
  { 'Mã trường': 'sv_pass_lan_1', 'Tên trường thông tin': 'SV đạt lần 1 (Pass)', 'Mô tả': 'Số SV qua môn ngay lần 1', 'Kiểu dữ liệu': 'Số nguyên', 'Bắt buộc': 'Có', 'Ví dụ': '38' },
  { 'Mã trường': 'sv_resit', 'Tên trường thông tin': 'SV thi lại / nộp lại', 'Mô tả': 'Số SV đạt sau đợt thi lại/nộp lại', 'Kiểu dữ liệu': 'Số nguyên', 'Bắt buộc': 'Có', 'Ví dụ': '5' },
  { 'Mã trường': 'sv_nop_bai', 'Tên trường thông tin': 'SV nộp bài đúng hạn', 'Mô tả': 'Số SV nộp Assignment/Tiểu luận đúng hạn', 'Kiểu dữ liệu': 'Số nguyên', 'Bắt buộc': 'Có', 'Ví dụ': '44' },
  { 'Mã trường': 'ghi_chu', 'Tên trường thông tin': 'Ghi chú', 'Mô tả': 'Tình hình đặc biệt của lớp', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Không', 'Ví dụ': '1 SV bảo lưu' }
];
XLSX.utils.book_append_sheet(masterWb, XLSX.utils.json_to_sheet(classSchema), 'TRUONG_LOP_MON_HOC');

const roadmapSchema = [
  { 'Mã trường': 'nam_hoc', 'Tên trường thông tin': 'Năm học', 'Mô tả': 'Năm 1, Năm 2, Năm 3, Năm 4', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'Năm 1' },
  { 'Mã trường': 'hoc_ky', 'Tên trường thông tin': 'Học kỳ', 'Mô tả': 'Kỳ 1, Kỳ 2, Kỳ Hè...', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'Kỳ 1' },
  { 'Mã trường': 'ma_mon', 'Tên trường thông tin': 'Mã môn học', 'Mô tả': 'Mã môn theo chương trình khung', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'ENG101' },
  { 'Mã trường': 'ten_mon', 'Tên trường thông tin': 'Tên môn học', 'Mô tả': 'Tên môn học tiếng Việt hoặc Anh', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'General English 1' },
  { 'Mã trường': 'so_tin_chi', 'Tên trường thông tin': 'Số tín chỉ / Giờ', 'Mô tả': 'Số tín chỉ tương đương', 'Kiểu dữ liệu': 'Số', 'Bắt buộc': 'Có', 'Ví dụ': '3' },
  { 'Mã trường': 'loai_mon', 'Tên trường thông tin': 'Loại môn', 'Mô tả': 'Bắt buộc / Tự chọn / Tiếng Anh', 'Kiểu dữ liệu': 'Văn bản', 'Bắt buộc': 'Có', 'Ví dụ': 'Bắt buộc' }
];
XLSX.utils.book_append_sheet(masterWb, XLSX.utils.json_to_sheet(roadmapSchema), 'TRUONG_DANH_MUC_MON');

const masterPath = path.join(outDir, 'So_Tay_Truong_Du_Lieu_Nhap_KPI.xlsx');
const masterPublic = path.join(publicDir, 'So_Tay_Truong_Du_Lieu_Nhap_KPI.xlsx');
XLSX.writeFile(masterWb, masterPath);
XLSX.writeFile(masterWb, masterPublic);

// Create ZIP file
const { execSync } = require('child_process');
execSync(`cd "${outDir}" && zip -r "Bo_File_Nhap_Lieu_KPI_8_Nhan_Su.zip" *.xlsx`);
execSync(`cp "${outDir}/Bo_File_Nhap_Lieu_KPI_8_Nhan_Su.zip" "${publicDir}/Bo_File_Nhap_Lieu_KPI_8_Nhan_Su.zip"`);

console.log('All clean data entry templates generated successfully!');
