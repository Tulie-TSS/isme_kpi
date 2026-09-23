const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 1. Đọc file mẫu chuẩn gốc của Viện
const refPath = '/Users/tungnguyen/Downloads/Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Bùi Thị Quỳnh Trang.xlsx';
const refWb = XLSX.readFile(refPath);

// 2. Đọc toàn bộ 223 môn học từ mock-data.ts
const mockDataContent = fs.readFileSync('src/lib/mock-data.ts', 'utf8');
const startIdx = mockDataContent.indexOf('const initialCourses: Course[] = [') + 'const initialCourses: Course[] = '.length;
const endIdx = mockDataContent.lastIndexOf('];\n\nconst COURSES_STORAGE_KEY');
const courses = JSON.parse(mockDataContent.slice(startIdx, endIdx + 1).trim());

// 3. Khởi tạo workbook mới
const newWb = XLSX.utils.book_new();

// ==========================================
// SHEET 1: OPERATION (50%) & HĐ HTHT (20%)
// Giữ nguyên 100% chuẩn gốc của Viện
// ==========================================
const sheet1 = refWb.Sheets['OPERATION (50%) & HĐ HTHT (20%)'];
XLSX.utils.book_append_sheet(newWb, sheet1, 'OPERATION (50%) & HĐ HTHT (20%)');

// ==========================================
// SHEET 2: KQ SV & KỶ LUẬT SV (20%)
// Giữ nguyên định dạng 2 tầng header và công thức chuẩn gốc
// ==========================================
const sheet2 = refWb.Sheets['KQ SV & KỶ LUẬT SV (20%)'];
XLSX.utils.book_append_sheet(newWb, sheet2, 'KQ SV & KỶ LUẬT SV (20%)');

// ==========================================
// SHEET 3: DANH SÁCH 223 MÔN HỌC FULL LỘ TRÌNH TẤT CẢ CÁC CHƯƠNG TRÌNH
// (Năm nhất, Top-up năm cuối, Full 3-4 năm)
// ==========================================
const pInfo = {
  p_nam1: { name: 'Chương trình Năm 1', code: 'NAM1', type: 'Năm nhất (Level Tiếng Anh & Môn cơ sở)', years: '1 năm', manager: 'Bùi Thị Quỳnh Trang' },
  p7: { name: 'BBAE - Cử nhân Khởi nghiệp & PTKD', code: 'BBAE', type: 'Cử nhân cấp bằng (Full 4 năm)', years: '4 năm', manager: 'Nguyễn Minh Tuấn' },
  p_dm: { name: 'Digital Marketing (DM)', code: 'DM', type: 'Cử nhân cấp bằng (Full 4 năm)', years: '4 năm', manager: 'Bùi Thu Trang' },
  p_au: { name: 'Andrews University (AU)', code: 'AU', type: 'Cử nhân cấp bằng (Full 4 năm)', years: '4 năm', manager: 'Đào Ngọc Diệp' },
  p_nhtc: { name: 'Ngân hàng - Tài chính (NHTC)', code: 'NHTC', type: 'Cử nhân cấp bằng (Full 3-4 năm)', years: '3-4 năm', manager: 'Trần Thị Bích Ngọc' },
  p3: { name: 'BTEC HND', code: 'BTEC', type: 'Cao đẳng Quốc tế Pearson (2 năm)', years: '2 năm', manager: 'Trần Hương Thảo' },
  p_uwe: { name: 'Top-up UWE (ĐH West of England)', code: 'UWE', type: 'Chuyển tiếp Top-up (Năm cuối)', years: 'Năm cuối', manager: 'Vũ Minh Nhật' },
  p_cu: { name: 'Top-up Coventry (CU)', code: 'CU', type: 'Chuyển tiếp Top-up (Năm cuối)', years: 'Năm cuối', manager: 'Nguyễn Giang Khánh Huyền' }
};

const sheet3Headers = [
  [
    'STT', 'Mã CT', 'Tên chương trình', 'Khung đào tạo', 'Khóa / Lớp', 'Năm học', 'Kỳ học', 
    'Mã môn', 'Tên môn học', 'Điều phối viên phụ trách', 'Số lượng GV', 'Số lượng SV',
    'Mục tiêu Đi học đầy đủ (%)', 'Mục tiêu Pass 1st (%)', 'Mục tiêu Nộp bài đúng hạn (%)',
    'Kết quả Đi học đầy đủ (%)', 'Kết quả Pass 1st (%)', 'Kết quả Pass sau Resit (%)', 'Kết quả Nộp bài đúng hạn (%)',
    'Mức hoàn thành Đi học (%)', 'Mức hoàn thành Pass bù Resit (%)', 'Mức hoàn thành Nộp bài (%)', 'Hoàn thành chung Môn (%)',
    'Phân loại kỳ đánh giá'
  ]
];

// Thứ tự ưu tiên sắp xếp chương trình: Năm 1 -> BBAE -> DM -> AU -> NHTC -> BTEC -> UWE -> CU
const progOrder = ['p_nam1', 'p7', 'p_dm', 'p_au', 'p_nhtc', 'p3', 'p_uwe', 'p_cu'];
const sortedCourses = [...courses].sort((a, b) => {
  const pA = progOrder.indexOf(a.programId);
  const pB = progOrder.indexOf(b.programId);
  if (pA !== pB) return pA - pB;
  if (a.year !== b.year) return (a.year || 1) - (b.year || 1);
  if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
  return a.code.localeCompare(b.code);
});

const sheet3Rows = sortedCourses.map((c, idx) => {
  const p = pInfo[c.programId] || { name: c.programId, code: c.programId, type: 'Khác', years: '', manager: c.coordinatorName || '' };
  const rowNum = idx + 2; // Row 1 is header

  // Format targets & rates
  const attTarget = c.isAttendanceNA ? 'N/A' : Math.round(c.attendanceTarget * 1000) / 10;
  const passTarget = c.isPassNA ? 'N/A' : Math.round(c.passTarget * 1000) / 10;
  const submitTarget = c.isSubmitNA ? 'N/A' : Math.round(c.submitTarget * 1000) / 10;

  const attRate = c.isAttendanceNA ? 'N/A' : Math.round(c.attendanceRate * 1000) / 10;
  const passRate = c.isPassNA ? 'N/A' : Math.round(c.passRate * 1000) / 10;
  const passResit = c.isPassResitNA || c.passResitRate === undefined ? 'N/A' : Math.round(c.passResitRate * 1000) / 10;
  const submitRate = c.isSubmitNA ? 'N/A' : Math.round(c.submitRate * 1000) / 10;

  // Công thức Excel
  const fAttend = { t: 'n', f: `IF(OR(M${rowNum}="N/A",P${rowNum}="N/A"),"N/A",ROUND(P${rowNum}/M${rowNum}*100,1))` };
  const fPass = { t: 'n', f: `IF(OR(N${rowNum}="N/A",Q${rowNum}="N/A"),"N/A",ROUND(IF(Q${rowNum}/N${rowNum}>=1,Q${rowNum}/N${rowNum},MIN(1,(Q${rowNum}/N${rowNum})+(IF(OR(R${rowNum}="N/A",R${rowNum}=""),0,R${rowNum}/N${rowNum}))))*100,1))` };
  const fSubmit = { t: 'n', f: `IF(OR(O${rowNum}="N/A",S${rowNum}="N/A"),"N/A",ROUND(S${rowNum}/O${rowNum}*100,1))` };
  const fAvg = { t: 'n', f: `IF(COUNT(T${rowNum}:V${rowNum})>0,ROUND(AVERAGE(T${rowNum}:V${rowNum}),1),"N/A")` };

  let kyDanhGia = 'Kỳ học theo khóa';
  if (c.semester === 'SEM 2' || c.semester === 'SEM SPRING' || c.semester === 'SEM FALL & SPRING') {
    kyDanhGia = 'Kỳ 2 (Kỳ hiện tại)';
  }

  return [
    idx + 1,
    p.code,
    p.name,
    p.type,
    c.cohort,
    `Năm ${c.year || 1}`,
    c.semester,
    c.code,
    c.name,
    c.coordinatorName || p.manager,
    c.numLecturers,
    c.numStudents,
    attTarget,
    passTarget,
    submitTarget,
    attRate,
    passRate,
    passResit,
    submitRate,
    fAttend,
    fPass,
    fSubmit,
    fAvg,
    kyDanhGia
  ];
});

const ws3 = XLSX.utils.aoa_to_sheet([...sheet3Headers, ...sheet3Rows]);
ws3['!cols'] = [
  { width: 6 },   // STT
  { width: 10 },  // Mã CT
  { width: 28 },  // Tên CT
  { width: 30 },  // Khung đào tạo
  { width: 16 },  // Khóa
  { width: 10 },  // Năm học
  { width: 14 },  // Kỳ học
  { width: 16 },  // Mã môn
  { width: 38 },  // Tên môn
  { width: 24 },  // ĐPV
  { width: 10 },  // Số GV
  { width: 10 },  // Số SV
  { width: 16 },  // MT Đi học
  { width: 16 },  // MT Pass
  { width: 16 },  // MT Nộp bài
  { width: 16 },  // TT Đi học
  { width: 16 },  // TT Pass 1st
  { width: 16 },  // TT Resit
  { width: 16 },  // TT Nộp bài
  { width: 18 },  // Hoàn thành Đi học
  { width: 22 },  // Hoàn thành Pass bù Resit
  { width: 18 },  // Hoàn thành Nộp bài
  { width: 20 },  // Hoàn thành chung
  { width: 20 }   // Phân loại kỳ
];
XLSX.utils.book_append_sheet(newWb, ws3, 'DS_223_MON_HOC_FULL_CAC_CT');

// ==========================================
// SHEET 4: LỘ TRÌNH ĐÀO TẠO & SỐ KỲ THEO CHƯƠNG TRÌNH (ROADMAP)
// ==========================================
const sheet4Data = [
  ['BẢNG TỔNG HỢP LỘ TRÌNH ĐÀO TẠO, SỐ KỲ & SỐ MÔN HỌC THEO TỪNG CHƯƠNG TRÌNH (ISME)'],
  ['Áp dụng: Quy chuẩn học vụ & theo dõi KPI Viện Đào tạo Quốc tế'],
  [''],
  [
    'STT', 'Mã CT', 'Tên chương trình đào tạo', 'Loại hình / Mô hình đào tạo', 'Thời gian đào tạo', 
    'Số kỳ chuẩn', 'Các học kỳ áp dụng', 'Quy chuẩn danh sách môn học', 'Số môn hệ thống', 'Điều phối viên phụ trách chính'
  ],
  [
    1, 'NAM1', 'Ban Quản lý & Vận hành Chương trình Năm 1', 'Đào tạo cơ sở & Chuẩn bị tiếng Anh', '1 năm (Năm nhất)',
    '3 kỳ', 'SEM FALL, SEM SPRING, SEM SUMMER', 'Các Level Tiếng Anh (Level 1, 2, 3, 4) và các môn kiến thức cơ sở (Basic Economics, Study Skills, Maths in Economic, Data Analysis and AI).', 15, 'Bùi Thị Quỳnh Trang'
  ],
  [
    2, 'BBAE', 'Cử nhân Khởi nghiệp & Phát triển kinh doanh (BBAE)', 'Cử nhân chính quy cấp bằng (Full 4 năm)', '4 năm (Năm 1 -> Năm 4)',
    '8 kỳ', 'SEM 1 (Fall) & SEM 2 (Spring) cho cả 4 năm', 'Toàn bộ lộ trình từ môn đại cương, cơ sở ngành (Kinh tế vi mô, vĩ mô, Kế toán, Marketing), chuyên ngành (Đổi mới sáng tạo, Tư duy thiết kế khởi nghiệp) đến Thực tập tốt nghiệp.', 40, 'Nguyễn Minh Tuấn'
  ],
  [
    3, 'DM', 'Cử nhân Digital Marketing', 'Cử nhân chính quy cấp bằng (Full 4 năm)', '4 năm (Năm 1 -> Năm 4)',
    '8 kỳ', 'SEM 1 (Fall) & SEM 2 (Spring) cho cả 4 năm', 'Chuyên ngành Marketing số: Marketing Essentials, Digital Tools, Analytics, Customer Journeys, Content Marketing, Chiến lược số và Khóa luận tốt nghiệp.', 23, 'Bùi Thu Trang'
  ],
  [
    4, 'AU', 'Cử nhân Đại học Andrews (Hoa Kỳ)', 'Cử nhân quốc tế cấp bằng (Full 4 năm)', '4 năm (Năm 1 -> Năm 4)',
    '10 kỳ', 'SEM 1, SEM 2, SEM AU, SEM SP, SEM SU', 'Toàn bộ các môn học theo chuẩn kiểm định Hoa Kỳ: Biology with lab, American History, Micro/Macro, Finance, Investments, Business Ethics, International Management, Strategy...', 43, 'Đào Ngọc Diệp'
  ],
  [
    5, 'NHTC', 'Cử nhân Ngân hàng - Tài chính Quốc tế', 'Cử nhân quốc tế cấp bằng (Full 3-4 năm)', '3-4 năm (Khóa I18, I19, I20)',
    '8 kỳ', 'SEM 1 (Fall) & SEM 2 (Spring) các năm 2, 3, 4', 'Chuyên sâu Tài chính - Ngân hàng: Modern Banking, Financial Analysis, Econometrics, Portfolio Management, Credit Risk Analysis, Thị trường tài chính quốc tế và Project.', 39, 'Trần Thị Bích Ngọc'
  ],
  [
    6, 'BTEC', 'Cao đẳng Quốc tế BTEC HND', 'Chương trình nghề nghiệp Anh quốc (Pearson)', '2 năm (Level 4 & Level 5)',
    '4 kỳ', 'SEM 1 (Fall) & SEM 2 (Spring)', '15 Unit chuẩn Pearson Edexcel: Contemporary Business Environment, Marketing Processes, Human Resources, Accounting Principles, Business Law, Research Project...', 21, 'Trần Hương Thảo'
  ],
  [
    7, 'UWE', 'Cử nhân Chuyển tiếp Top-up ĐH West of England (UWE)', 'Chương trình Chuyển tiếp (Năm cuối - Level 6)', '1 năm cuối (Year 4)',
    '2 kỳ', 'SEM 1 & SEM 2 (Khóa I18, I19, I20)', 'Các môn chuyên ngành năm cuối: Multinationals in Global Context (MDGC), Business Management Simulation (IBMS), Global Marketing (GMM), Business Strategy, Business Project (BP)...', 27, 'Vũ Minh Nhật'
  ],
  [
    8, 'CU', 'Cử nhân Chuyển tiếp Top-up ĐH Coventry (CU)', 'Chương trình Chuyển tiếp (Năm cuối - Level 6)', '1 năm cuối (Year 4)',
    '2 kỳ', 'SEM 1 & SEM 2 (Khóa I19 MX, I19 MT)', 'Các môn học nhận bằng ĐH Coventry: Academic Writing 3, Career Development, Responsible Business Strategy, Marketing Strategy, Graduation Project...', 15, 'Nguyễn Giang Khánh Huyền'
  ],
  [''],
  ['TỔNG CỘNG HỆ THỐNG', '', '8 Chương trình Đào tạo Đại học & Liên kết Quốc tế', '', '', '', '', 'Toàn bộ các môn học theo từng kỳ đã được số hóa và đồng bộ đầy đủ trên hệ thống ISME Ops OS.', 223, 'Viện ISME']
];

const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
ws4['!cols'] = [
  { width: 6 },
  { width: 10 },
  { width: 38 },
  { width: 32 },
  { width: 22 },
  { width: 12 },
  { width: 28 },
  { width: 65 },
  { width: 14 },
  { width: 25 }
];
XLSX.utils.book_append_sheet(newWb, ws4, 'LO_TRINH_DAO_TAO_THEO_KY');

// ==========================================
// SHEET 5: HƯỚNG DẪN & QUY ĐỊNH CHẤM KPI
// ==========================================
const sheet5Data = [
  ['HƯỚNG DẪN SỬ DỤNG FILE TEMPLATE CHUẨN ĐÁNH GIÁ KPI & MÔN HỌC VIỆN ISME'],
  ['File chuẩn được ban hành theo quy định của Ban Đào tạo đại học - Viện Đào tạo Quốc tế (ISME)'],
  [''],
  ['1. ĐỐI TƯỢNG VÀ NGUYÊN TẮC ÁP DỤNG'],
  ['- Điều phối viên Ban Năm 1:', 'Phụ trách nhập và theo dõi danh sách môn tiếng Anh (Level 1, 2, 3, 4) và các môn cơ sở của sinh viên năm nhất.'],
  ['- Điều phối viên các chương trình Cử nhân cấp bằng 4 năm (BBAE, AU, DM, NHTC):', 'Theo dõi toàn bộ môn học trong kỳ của cả 4 năm (Năm 1, Năm 2, Năm 3, Năm 4) theo đúng khung chương trình.'],
  ['- Điều phối viên chương trình BTEC (2 năm) và Top-up (UWE, CU):', 'Theo dõi các môn học theo năm 1-2 (BTEC) hoặc năm cuối Level 6 chuyển tiếp nhận bằng Anh quốc.'],
  [''],
  ['2. CÔNG THỨC TÍNH ĐIỂM KPI MÔN HỌC CHUẨN CỦA VIỆN (SHEET 2 & SHEET 3)'],
  ['Chỉ tiêu Đi học chuyên cần:', 'Mức hoàn thành = Thực tế Đi học / Mục tiêu Đi học. (Nếu không áp dụng điểm danh ghi N/A)'],
  ['Chỉ tiêu Nộp bài đúng hạn:', 'Mức hoàn thành = Thực tế Nộp bài / Mục tiêu Nộp bài. (Nếu không có bài nộp ghi N/A)'],
  ['Chỉ tiêu Điểm Pass (có bù Resit):', 'Áp dụng công thức Excel chính thức của Viện:'],
  ['', '=IF((Pass1st / Target) >= 1, Pass1st / Target, MIN(1, (Pass1st / Target) + ((PassResit / Target) * 1)))'],
  ['Ý nghĩa công thức:', 'Nếu tỷ lệ Pass lần 1 đã đạt hoặc vượt mục tiêu thì lấy theo Pass 1st. Nếu chưa đạt, được cộng bù tỷ lệ sinh viên đỗ sau đợt thi lại (Resit) nhưng tối đa không quá 100% mục tiêu.'],
  [''],
  ['3. CƠ CẤU 100% ĐIỂM KPI TỔNG HỢP'],
  ['- Nhóm 1: Chỉ tiêu Vận hành (50%)', '10 chỉ tiêu quản lý học vụ (OP1 -> OP10) tại Sheet 1'],
  ['- Nhóm 2: Hoạt động Hỗ trợ học tập (20%)', 'Chỉ tiêu ngoại khóa học thuật (OP5_AS) tại Sheet 1'],
  ['- Nhóm 3: Kết quả SV & Kỷ luật (20%)', 'Tính bình quân mức hoàn thành các môn học trong kỳ tại Sheet 2'],
  ['- Nhóm 4: Hoạt động khác (10%)', 'Tuyển sinh, hỗ trợ du học/trao đổi, đóng góp chung (OTHER11 -> OTHER13) tại Sheet 1'],
  ['TỔNG ĐIỂM KPI', '= (Vận hành * 50%) + (Hỗ trợ HT * 20%) + (Kết quả SV * 20%) + (Khác * 10%)']
];

const ws5 = XLSX.utils.aoa_to_sheet(sheet5Data);
ws5['!cols'] = [
  { width: 35 },
  { width: 85 }
];
XLSX.utils.book_append_sheet(newWb, ws5, 'HUONG_DAN_&_QUY_DINH');

// ==========================================
// XUẤT FILE RA TẤT CẢ CÁC ĐƯỜNG DẪN CẦN THIẾT
// ==========================================
const fileName = 'Mau_Nhap_Lieu_KPI_Va_Mon_Hoc_ISME_2026.xlsx';
const outputPath = path.join(process.cwd(), fileName);
const publicPath = path.join(process.cwd(), 'public', fileName);
const artifactPath = path.join('/Users/tungnguyen/.gemini/antigravity-ide/brain/cb94dea0-e2eb-4a79-b910-5d1fc1bbf464', fileName);

XLSX.writeFile(newWb, outputPath);
XLSX.writeFile(newWb, publicPath);
XLSX.writeFile(newWb, artifactPath);

console.log('Successfully generated full workbook with 5 sheets!');
console.log('1. Workspace root:', outputPath);
console.log('2. Public folder:', publicPath);
console.log('3. Artifacts:', artifactPath);
