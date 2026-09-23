const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const refPath = '/Users/tungnguyen/Downloads/Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Bùi Thị Quỳnh Trang.xlsx';
const refWb = XLSX.readFile(refPath);

// Đọc toàn bộ courses & snapshots từ mock-data.ts
const mockDataContent = fs.readFileSync('src/lib/mock-data.ts', 'utf8');

// Parse courses
const coursesStart = mockDataContent.indexOf('const initialCourses: Course[] = [') + 'const initialCourses: Course[] = '.length;
const coursesEnd = mockDataContent.lastIndexOf('];\n\nconst COURSES_STORAGE_KEY');
const allCourses = JSON.parse(mockDataContent.slice(coursesStart, coursesEnd + 1).trim());

// Parse snapshots
const snapsStart = mockDataContent.indexOf('const initialKpiSnapshots: KPISnapshot[] = [') + 'const initialKpiSnapshots: KPISnapshot[] = '.length;
const snapsEnd = mockDataContent.lastIndexOf('];\n\nexport let kpiSnapshots');
const allSnaps = JSON.parse(mockDataContent.slice(snapsStart, snapsEnd + 1).trim());

// Danh sách 8 điều phối viên và chương trình tương ứng
const coordinators = [
  {
    id: 'u11',
    name: 'Bùi Thị Quỳnh Trang',
    fileNameName: 'Bùi Thị Quỳnh Trang',
    position: 'Chuyên viên điều phối Chương trình Năm 1',
    programId: 'p_nam1',
    programName: 'Năm 1',
    programFullName: 'Ban Quản lý & Vận hành Chương trình Năm 1',
    programType: 'Năm nhất (Level Tiếng Anh & Môn cơ sở)'
  },
  {
    id: 'u8',
    name: 'Nguyễn Minh Tuấn',
    fileNameName: 'Nguyễn Minh Tuấn',
    position: 'Chủ nhiệm Chương trình BBAE',
    programId: 'p7',
    programName: 'BBAE',
    programFullName: 'Chương trình Cử nhân Khởi nghiệp & PTKD (BBAE)',
    programType: 'Cử nhân cấp bằng (Full 4 năm)'
  },
  {
    id: 'u2',
    name: 'Vũ Minh Nhật',
    fileNameName: 'Vũ Minh Nhật',
    position: 'Chủ nhiệm Chương trình Top-up UWE',
    programId: 'p_uwe',
    programName: 'Top-up UWE',
    programFullName: 'Chương trình Cử nhân Top-up ĐH West of England (UWE)',
    programType: 'Chuyển tiếp Top-up (Năm cuối Level 6)'
  },
  {
    id: 'u4',
    name: 'Trần Thị Bích Ngọc',
    fileNameName: 'Trần Thị Bích Ngọc',
    position: 'Chủ nhiệm Chương trình NHTC',
    programId: 'p_nhtc',
    programName: 'NHTC',
    programFullName: 'Chương trình Cử nhân Ngân hàng - Tài chính Quốc tế',
    programType: 'Cử nhân cấp bằng (Full 3-4 năm)'
  },
  {
    id: 'u5',
    name: 'Trần Hương Thảo',
    fileNameName: 'Trần Hương Thảo',
    position: 'Chủ nhiệm Chương trình BTEC HND',
    programId: 'p3',
    programName: 'BTEC HND',
    programFullName: 'Chương trình Cao đẳng Quốc tế BTEC HND',
    programType: 'Cao đẳng Quốc tế Pearson (2 năm)'
  },
  {
    id: 'u6',
    name: 'Nguyễn Giang Khánh Huyền',
    fileNameName: 'Nguyễn Giang Khánh Huyền',
    position: 'Chủ nhiệm Chương trình Top-up CU',
    programId: 'p_cu',
    programName: 'Top-up CU',
    programFullName: 'Chương trình Cử nhân Top-up ĐH Coventry (CU)',
    programType: 'Chuyển tiếp Top-up (Năm cuối Level 6)'
  },
  {
    id: 'u7',
    name: 'Đào Ngọc Diệp',
    fileNameName: 'Đào Ngọc Diệp',
    position: 'Phụ trách Chương trình ĐH Andrews (AU)',
    programId: 'p_au',
    programName: 'AU',
    programFullName: 'Chương trình Cử nhân ĐH Andrews (Hoa Kỳ)',
    programType: 'Cử nhân cấp bằng (Full 4 năm)'
  },
  {
    id: 'u10',
    name: 'Bùi Thu Trang',
    fileNameName: 'Bùi Thu Trang',
    position: 'Chủ nhiệm Chương trình Digital Marketing',
    programId: 'p_dm',
    programName: 'Digital Marketing',
    programFullName: 'Chương trình Cử nhân Digital Marketing',
    programType: 'Cử nhân cấp bằng (Full 4 năm)'
  }
];

// Helper lọc môn kỳ hiện tại (Kỳ 2 2025-2026) theo đúng logic nghiệp vụ của Viện
function isCurrentActiveCourse(c, programId) {
  if (c.cohort.includes('dự kiến') || c.cohort === 'I22 MT' || c.cohort === 'I23 MX' || c.cohort === 'I19 MT' || c.cohort === 'I20 MX' || c.cohort === 'I20 MT') return false;
  if (programId === 'p_nam1') {
    return (c.semester === 'SEM SPRING' || c.semester === 'SEM FALL & SPRING' || c.semester === 'SEM 2');
  }
  if (programId === 'p_cu') {
    return c.cohort === 'I19 MX' && c.semester === 'SEM 2';
  }
  if (programId === 'p_nhtc') {
    return (c.cohort === 'BScBF I19' || c.cohort === 'BScBF I18') && c.semester === 'SEM 2';
  }
  if (programId === 'p_uwe') {
    return (c.cohort === 'I18 MT - IBM' && c.semester === 'SEM 2') || (c.cohort === 'I19 MX - IBM' && c.semester === 'SEM 1');
  }
  return c.semester === 'SEM 2' && (c.year || 1) <= 2;
}

// Thư mục lưu file
const outDir = path.join(process.cwd(), 'templates_coordinators');
const publicDir = path.join(process.cwd(), 'public', 'templates');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const generatedFiles = [];

for (const coord of coordinators) {
  const wb = XLSX.utils.book_new();

  // ----------------------------------------------------
  // 1. SHEET 1: OPERATION (50%) & HĐ HTHT (20%)
  // ----------------------------------------------------
  const refS1 = refWb.Sheets['OPERATION (50%) & HĐ HTHT (20%)'];
  // Clone sheet data
  const s1Data = XLSX.utils.sheet_to_json(refS1, { header: 1, raw: false });

  // Update header info
  // Row 4: Họ và tên
  s1Data[3][4] = `Họ và tên: ${coord.name}`;
  // Row 5: Chức danh
  s1Data[4][4] = `Chức danh: ${coord.position}`;
  // Row 31: Ký tên
  if (s1Data[30]) {
    s1Data[30][8] = coord.name;
  }

  // Get snapshots for this coordinator
  const userSnaps = allSnaps.filter(s => s.userId === coord.id);
  const snapMap = {};
  userSnaps.forEach(s => { snapMap[s.kpiDefinitionId] = s; });

  // Map row index to KPI definition
  const rowKpiMap = {
    10: 'op1',
    11: 'op1',
    12: 'op2',
    13: 'op3',
    14: 'op4',
    15: 'op5_op',
    16: 'op6',
    17: 'op7',
    18: 'op8',
    19: 'op9',
    20: 'op10',
    21: 'other11',
    22: 'other12',
    23: 'other13'
  };

  for (const [rIdxStr, defId] of Object.entries(rowKpiMap)) {
    const rIdx = parseInt(rIdxStr);
    const snap = snapMap[defId];
    if (snap && s1Data[rIdx]) {
      s1Data[rIdx][7] = snap.targetValue;
      s1Data[rIdx][8] = snap.actualValue;
      // Formula =I/H
      const rowNum = rIdx + 1;
      s1Data[rIdx][9] = { t: 'n', f: `I${rowNum}/H${rowNum}` };
    }
  }

  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  // Restore merges
  if (refS1['!merges']) {
    ws1['!merges'] = JSON.parse(JSON.stringify(refS1['!merges']));
  }
  // Restore col widths
  ws1['!cols'] = [
    { width: 5 }, { width: 22 }, { width: 25 }, { width: 32 }, { width: 45 },
    { width: 10 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 14 },
    { width: 15 }, { width: 15 }, { width: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'OPERATION (50%) & HĐ HTHT (20%)');

  // ----------------------------------------------------
  // 2. SHEET 2: KQ SV & KỶ LUẬT SV (20%)
  // Các môn học của chương trình này trong Kỳ 2 2025-2026
  // ----------------------------------------------------
  const progCourses = allCourses.filter(c => c.programId === coord.programId);
  const activeSemCourses = progCourses.filter(c => isCurrentActiveCourse(c, coord.programId));
  const coursesForSheet2 = activeSemCourses.length > 0 ? activeSemCourses : progCourses.slice(0, 6);

  // Headers (Row 1, 2, 3)
  const s2Rows = [
    [null, null, null, null, null, null, 'MỤC TIÊU ĐẦU KỲ', null, null, 'KẾT QUẢ CUỐI KỲ', null, null, null, 'MỨC ĐỘ HOÀN THÀNH', null, null],
    [null, null, null, null, null, null, 'Kỷ luật', 'Học tập', null, 'Kỷ luật', 'Học tập', null, null, 'Kỷ luật', 'Học tập', null],
    [
      'Chương trình', 'Kỳ học', 'Khóa', 'Môn', 'Số lượng GV', 'Số lượng sinh viên', 
      'Tỉ lệ đi học đầy đủ', 'Mục tiêu pass 1st', 'Mục tiêu nộp bài/ thi lần đầu đúng hạn', 
      'Tỉ lệ đi học đầy đủ', 'Tỉ lệ pass 1st', 'Tỉ lệ pass sau Resit', 'Tỷ lệ nộp bài/thi lần đầu đúng hạn', 
      'Tỉ lệ đi học đầy đủ', 'Tỉ lệ pass (Điểm hiệu suất học tập sau khi đã tính bù điểm Resit)', 'Tỷ lệ nộp bài/thi lần đầu đúng hạn'
    ]
  ];

  coursesForSheet2.forEach((c, idx) => {
    const rowNum = idx + 4; // Data starts at row 4
    const attT = c.isAttendanceNA ? 'N/A' : c.attendanceTarget;
    const passT = c.isPassNA ? 'N/A' : c.passTarget;
    const subT = c.isSubmitNA ? 'N/A' : c.submitTarget;

    const attA = c.isAttendanceNA ? 'N/A' : c.attendanceRate;
    const passA = c.isPassNA ? 'N/A' : c.passRate;
    const resitA = c.isPassResitNA || c.passResitRate === undefined ? 'N/A' : c.passResitRate;
    const subA = c.isSubmitNA ? 'N/A' : c.submitRate;

    const fAtt = { t: 'n', f: `IF(OR(G${rowNum}="N/A",J${rowNum}="N/A"),"N/A",J${rowNum}/G${rowNum})` };
    const fPass = { t: 'n', f: `IF(OR(H${rowNum}="N/A",K${rowNum}="N/A"),"N/A",IF((K${rowNum}/H${rowNum})>=1, K${rowNum}/H${rowNum}, MIN(1, (K${rowNum}/H${rowNum}) + ((IF(OR(L${rowNum}="N/A",L${rowNum}=""),0,L${rowNum})/H${rowNum})*1))))` };
    const fSub = { t: 'n', f: `IF(OR(I${rowNum}="N/A",M${rowNum}="N/A"),"N/A",M${rowNum}/I${rowNum})` };

    s2Rows.push([
      coord.programName,
      c.semester,
      c.cohort,
      c.name,
      c.numLecturers,
      c.numStudents,
      attT, passT, subT,
      attA, passA, resitA, subA,
      fAtt, fPass, fSub
    ]);
  });

  // Footer sign-off
  s2Rows.push([]);
  s2Rows.push([null, 'Người Duyệt', null, 'Người đánh giá', null, null, null, 'Người được đánh giá']);
  s2Rows.push([]);
  s2Rows.push([]);
  s2Rows.push([]);
  s2Rows.push([null, 'Trưởng Ban', null, 'Cán bộ quản lý trực tiếp', null, null, null, coord.name]);

  const ws2 = XLSX.utils.aoa_to_sheet(s2Rows);
  // Merges for header and sign-off
  const s2Merges = [
    { s: { c: 6, r: 0 }, e: { c: 8, r: 0 } },  // MỤC TIÊU ĐẦU KỲ
    { s: { c: 9, r: 0 }, e: { c: 12, r: 0 } }, // KẾT QUẢ CUỐI KỲ
    { s: { c: 13, r: 0 }, e: { c: 15, r: 0 } },// MỨC ĐỘ HOÀN THÀNH
    { s: { c: 7, r: 1 }, e: { c: 8, r: 1 } },  // Học tập
    { s: { c: 10, r: 1 }, e: { c: 12, r: 1 } },// Học tập
    { s: { c: 14, r: 1 }, e: { c: 15, r: 1 } } // Học tập
  ];
  ws2['!merges'] = s2Merges;
  ws2['!cols'] = [
    { width: 14 }, { width: 12 }, { width: 16 }, { width: 38 }, { width: 10 }, { width: 10 },
    { width: 14 }, { width: 14 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 15 },
    { width: 16 }, { width: 15 }, { width: 22 }, { width: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'KQ SV & KỶ LUẬT SV (20%)');

  // ----------------------------------------------------
  // 3. SHEET 3: list các môn học (CỦA RIÊNG CHƯƠNG TRÌNH NÀY)
  // Đầy đủ số môn, số kỳ, lộ trình 1 năm / 2 năm / 4 năm
  // ----------------------------------------------------
  const s3Rows = [
    [`DANH SÁCH MÔN HỌC THEO KỲ - ${coord.programFullName.toUpperCase()}`, null, null, null, null, `KHUNG ĐÀO TẠO: ${coord.programType}`],
    ['STT', 'Khóa / Lớp', 'Năm học', 'Kỳ học', 'Mã môn', 'Tên môn học tiếng Anh', 'Số GV', 'Số SV', 'Trạng thái'],
  ];

  progCourses.forEach((c, idx) => {
    s3Rows.push([
      idx + 1,
      c.cohort,
      `Năm ${c.year || 1}`,
      c.semester,
      c.code,
      c.name,
      c.numLecturers,
      c.numStudents,
      isCurrentActiveCourse(c, coord.programId) ? 'Kỳ hiện tại (Active)' : 'Kỳ học theo khóa'
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(s3Rows);
  ws3['!cols'] = [
    { width: 6 }, { width: 16 }, { width: 10 }, { width: 14 }, { width: 16 },
    { width: 42 }, { width: 8 }, { width: 8 }, { width: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'list các môn học');

  // Save individual workbook
  const outFileName = `Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_${coord.fileNameName}.xlsx`;
  const fileOutPath = path.join(outDir, outFileName);
  const filePubPath = path.join(publicDir, outFileName);

  XLSX.writeFile(wb, fileOutPath);
  XLSX.writeFile(wb, filePubPath);

  generatedFiles.push({
    name: coord.name,
    program: coord.programName,
    fileName: outFileName,
    filePath: fileOutPath,
    numCourses: progCourses.length,
    activeCourses: coursesForSheet2.length
  });

  console.log(`Generated file for ${coord.name}: ${outFileName} (${progCourses.length} môn)`);
}

// Tạo file ZIP đóng gói cả 8 file
const zipName = 'Bo_Mau_KPI_Sem2_2026_8_Coordinators.zip';
const zipOutPath = path.join(outDir, zipName);
const zipPubPath = path.join(publicDir, zipName);

// Nén tất cả các file trong outDir thành zip
execSync(`cd "${outDir}" && zip -q "${zipName}" *.xlsx`);
fs.copyFileSync(zipOutPath, zipPubPath);

console.log('Successfully created ZIP package at:', zipOutPath);
console.log('Public ZIP available at:', zipPubPath);
