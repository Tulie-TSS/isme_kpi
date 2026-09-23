/**
 * Generate per-coordinator Excel templates that faithfully mirror
 * the official Institute file:
 *   "Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Bùi Thị Quỳnh Trang.xlsx"
 *
 * File gốc có 3 sheets:
 *   Sheet 1: "OPERATION (50%) & HĐ HTHT (20%)" — 13 chỉ tiêu KPI (STT 1-13)
 *            Cột: STT | Nội dung đánh giá | Đầu mục CV | Nhóm KPI theo mô tả CV | Tiêu chí | Đơn vị đo | Mục tiêu đạt KPI | Số lượng được giao | Số lượng hoàn thành (tự đánh giá) | Tỉ lệ hoàn thành (tự đánh giá) | Đánh giá của line manager (1-100) | Đánh giá của trưởng ban (1-100) | Đánh giá của trưởng ban (Note 100-200 words)
 *   Sheet 2: "KQ SV & KỶ LUẬT SV (20%)" — Bảng kết quả từng môn học
 *            Cột: Chương trình | Kỳ học | Khóa | Môn | Số lượng GV | Số lượng SV | MỤC TIÊU ĐẦU KỲ (Kỷ luật: Tỉ lệ đi học đầy đủ | Học tập: Mục tiêu pass 1st | Mục tiêu nộp bài đúng hạn) | KẾT QUẢ CUỐI KỲ (Kỷ luật: Tỉ lệ đi học đầy đủ | Học tập: Tỉ lệ pass 1st | Tỉ lệ pass sau Resit | Tỷ lệ nộp bài đúng hạn) | MỨC ĐỘ HOÀN THÀNH (Kỷ luật: Tỉ lệ đi học đầy đủ | Học tập: Tỉ lệ pass (sau Resit) | Tỷ lệ nộp bài đúng hạn)
 *   Sheet 3: "list các môn học" — Danh mục chương trình toàn khóa
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ==================== LOAD DATA FROM mock-data.ts ====================
const mockContent = fs.readFileSync(path.join(__dirname, '../src/lib/mock-data.ts'), 'utf8');

// Parse users
const usersMatch = mockContent.match(/export const users: User\[\] = \[([\s\S]*?)\];/);
let users = [];
if (usersMatch) {
  const block = usersMatch[1];
  const re = /\{[^}]+\}/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    try { users.push(eval('(' + m[0] + ')')); } catch(e) {}
  }
}

// Parse kpiDefinitions
const kpiMatch = mockContent.match(/export const kpiDefinitions: KPIDefinition\[\] = \[([\s\S]*?)\];/);
let kpiDefs = [];
if (kpiMatch) {
  try { kpiDefs = eval('[' + kpiMatch[1] + ']'); } catch(e) { console.error('kpiDefs parse error', e); }
}

// Parse kpiGroups
const groupsMatch = mockContent.match(/export const kpiGroups: KPIGroup\[\] = \[([\s\S]*?)\];/);
let kpiGroups = [];
if (groupsMatch) {
  try { kpiGroups = eval('[' + groupsMatch[1] + ']'); } catch(e) {}
}

// Parse initialCourses
const coursesMatch = mockContent.match(/const initialCourses: Course\[\] = \[([\s\S]*?)\n\];/);
let courses = [];
if (coursesMatch) {
  try { courses = eval('[' + coursesMatch[1] + ']'); } catch(e) { console.error('courses parse error', e); }
}

// Parse initialKpiSnapshots
const snapsMatch = mockContent.match(/const initialKpiSnapshots: KPISnapshot\[\] = \[([\s\S]*?)\n\];/);
let snapshots = [];
if (snapsMatch) {
  try { snapshots = eval('[' + snapsMatch[1] + ']'); } catch(e) { console.error('snapshots parse error', e); }
}

// Parse programs
const progsMatch = mockContent.match(/export const programs: Program\[\] = \[([\s\S]*?)\];/);
let programs = [];
if (progsMatch) {
  try { programs = eval('[' + progsMatch[1] + ']'); } catch(e) {}
}

console.log(`Loaded: ${users.length} users, ${kpiDefs.length} KPI definitions, ${courses.length} courses, ${snapshots.length} snapshots, ${programs.length} programs`);

// ==================== COORDINATORS ====================
const coordinatorIds = ['u11', 'u8', 'u2', 'u4', 'u5', 'u6', 'u7', 'u10'];
const coordUsers = coordinatorIds.map(id => users.find(u => u.id === id)).filter(Boolean);

// ==================== HELPERS ====================
function getUserSnapshots(userId) {
  return snapshots.filter(s => s.userId === userId && s.period === 'Kỳ 2 2025-2026');
}

function getUserCourses(userId) {
  return courses.filter(c => c.coordinatorId === userId);
}

function getProgram(userId) {
  return programs.find(p => p.managerId === userId);
}

function cellStyle(bold, fill, border, align, wrap) {
  const s = {};
  if (bold) s.font = { bold: true };
  if (fill) s.fill = { fgColor: { rgb: fill } };
  if (border) s.border = {
    top: { style: 'thin' }, bottom: { style: 'thin' },
    left: { style: 'thin' }, right: { style: 'thin' }
  };
  if (align) s.alignment = { horizontal: align, vertical: 'center', wrapText: !!wrap };
  return s;
}

// ==================== GENERATE PER USER ====================
const outDir = path.join(__dirname, '../templates_per_person');
const publicDir = path.join(__dirname, '../public/templates_per_person');
[outDir, publicDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

coordUsers.forEach(user => {
  const wb = XLSX.utils.book_new();
  const userSnaps = getUserSnapshots(user.id);
  const userCourses = getUserCourses(user.id);
  const program = getProgram(user.id);
  const progName = program ? program.name : user.position;

  // =========================
  // SHEET 1: OPERATION (50%) & HĐ HTHT (20%)
  // =========================
  // Exact column mapping from original file:
  // A=STT, B=Nội dung đánh giá, C=Đầu mục CV, D=Nhóm KPI theo mô tả CV, E=Tiêu chí, F=Đơn vị đo, G=Mục tiêu đạt KPI, H=Số lượng được giao, I=Số lượng hoàn thành (tự đánh giá), J=Tỉ lệ hoàn thành (tự đánh giá), K=Đánh giá LM (1-100), L=Đánh giá TB (1-100), M=Note TB

  const s1Data = [];
  // Row 1: Title
  s1Data.push(['BẢNG ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN', '', '', '', '', '', '', '', '', '', '', '', '']);
  // Row 2: Subtitle
  s1Data.push(['CÔNG VIỆC CÁ NHÂN', '', '', '', '', '', '', '', '', '', '', '', '']);
  // Row 3: Period info
  s1Data.push(['', '', '', '', 'Kỳ đánh giá: Kỳ II', 'Năm: 2025 - 2026', '', '', '', '', '', '', '']);
  // Row 4: Person being evaluated
  s1Data.push(['Người được đánh giá', '', '', '', `Họ và tên: ${user.name}`, '', '', '', '', '', '', '', '']);
  // Row 5: Position
  s1Data.push(['', '', '', '', `Chức danh: ${user.position}`, 'Mã chức danh', '', '', '', '', '', '', '']);
  // Row 6: Evaluator
  s1Data.push(['Người đánh giá', '', '', '', 'Họ và tên: Hồ Hoàng Lan', '', '', '', '', '', '', '', '']);
  // Row 7: Evaluator position
  s1Data.push(['', '', '', '', 'Chức danh: Trưởng Ban Đào tạo đại học', 'Mã chức danh', '', '', '', '', '', '', '']);
  // Row 8: Empty
  s1Data.push(['', '', '', '', '', '', '', '', '', '', '', '', '']);
  // Row 9: Header row 1
  s1Data.push(['STT', 'Mục tiêu hành động của vị trí công việc', '', '', 'Tiêu chí', 'Đơn vị đo', 'Mục tiêu đạt KPI', 'Số lượng được giao', 'Số lượng hoàn thành\n(tự đánh giá)', 'Tỉ lệ hoàn thành\n(tự đánh giá)', 'Đánh giá của\nline manager\n(thang điểm 1-100)', 'Đánh giá của\ntrưởng ban\n(thang điểm 1-100)', 'Đánh giá của trưởng ban\n(Note 100-200 words)']);
  // Row 10: Header row 2
  s1Data.push(['', 'Nội dung đánh giá', 'Đầu mục công việc', 'Nhóm KPI theo mô tả CV', '', '', '', '', '', '', '', '', '']);

  // KPI items grouped exactly like the original file
  // Group: OPERATION (50%) — STT 1 to 10 (from kpiDefs op1-op10)
  // Group: OPERATION (50%) & HĐ hỗ trợ HT (20%) — STT 5 is shared
  // Group: HĐ khác (10%) — STT 11-13

  const opDefs = kpiDefs.filter(k => k.groupId === 'operations');
  const asDef = kpiDefs.find(k => k.id === 'op5_as');
  const otherDefs = kpiDefs.filter(k => k.groupId === 'other_activities');

  // Operations rows (STT 1-10)
  opDefs.forEach((kpi, idx) => {
    const snap = userSnaps.find(s => s.kpiDefinitionId === kpi.id);
    const target = snap ? snap.targetValue : '';
    const actual = snap ? snap.actualValue : '';
    const ratio = (target && actual && target > 0) ? actual / target : '';

    // Determine the "Nội dung đánh giá" label
    let groupLabel = '';
    if (idx === 0) groupLabel = 'OPERATION (50%)'; // Rows 1-4
    if (idx === 4) groupLabel = 'OPERATION (50%) & HĐ hỗ trợ HT (20%)'; // Row 5
    if (idx === 5) groupLabel = 'OPERATION (50%)'; // Rows 6-10

    s1Data.push([
      kpi.stt,
      groupLabel,
      kpi.name,
      kpi.description,
      kpi.criteria,
      kpi.unit,
      1, // Mục tiêu đạt KPI = 100% = 1
      target,
      actual,
      ratio,
      '', // Đánh giá LM - để trống cho LM điền
      '', // Đánh giá TB - để trống cho TB điền
      ''  // Note TB - để trống cho TB điền
    ]);
  });

  // Other activities rows (STT 11-13)
  otherDefs.forEach((kpi, idx) => {
    const snap = userSnaps.find(s => s.kpiDefinitionId === kpi.id);
    const target = snap ? snap.targetValue : '';
    const actual = snap ? snap.actualValue : '';
    const ratio = (target && actual && target > 0) ? actual / target : '';

    let groupLabel = '';
    if (idx === 0) groupLabel = 'HĐ khác (10%)';

    s1Data.push([
      kpi.stt,
      groupLabel,
      kpi.name,
      kpi.description,
      kpi.criteria,
      kpi.unit,
      1,
      target,
      actual,
      ratio,
      '',
      '',
      ''
    ]);
  });

  // Signature block
  s1Data.push([]); // empty row
  s1Data.push(['', '', '', 'Người Duyệt', 'Người đánh giá', '', '', '', 'Người được đánh giá', '', '', '', '']);
  s1Data.push([]); s1Data.push([]); s1Data.push([]); s1Data.push([]);
  s1Data.push(['', '', '', 'Trưởng Ban', 'Cán bộ quản lý trực tiếp', '', '', '', user.name, '', '', '', '']);

  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  
  // Set column widths
  ws1['!cols'] = [
    { wch: 5 },  // A - STT
    { wch: 20 }, // B - Nội dung đánh giá
    { wch: 20 }, // C - Đầu mục CV
    { wch: 30 }, // D - Nhóm KPI
    { wch: 45 }, // E - Tiêu chí
    { wch: 10 }, // F - Đơn vị đo
    { wch: 12 }, // G - Mục tiêu KPI
    { wch: 12 }, // H - SL giao
    { wch: 14 }, // I - SL hoàn thành (tự ĐG)
    { wch: 14 }, // J - Tỉ lệ hoàn thành
    { wch: 14 }, // K - ĐG line manager
    { wch: 14 }, // L - ĐG trưởng ban
    { wch: 25 }, // M - Note trưởng ban
  ];

  // Formulas for ratio column (J) = I/H
  for (let r = 10; r < 10 + opDefs.length + otherDefs.length; r++) {
    const jAddr = XLSX.utils.encode_cell({ r, c: 9 }); // col J
    ws1[jAddr] = { t: 'n', f: `IF(H${r+1}=0,"N/A",I${r+1}/H${r+1})` };
  }

  XLSX.utils.book_append_sheet(wb, ws1, 'OPERATION (50%) & HĐ HTHT (20%)');

  // =========================
  // SHEET 2: KQ SV & KỶ LUẬT SV (20%)
  // =========================
  // This sheet lists each course with targets and actual results
  // Columns from original file:
  // A=Chương trình, B=Kỳ học, C=Khóa, D=Môn, E=Số lượng GV, F=Số lượng SV
  // G=MỤC TIÊU ĐẦU KỲ: Kỷ luật (Tỉ lệ đi học đầy đủ)
  // H=MỤC TIÊU ĐẦU KỲ: Học tập (Mục tiêu pass 1st)
  // I=MỤC TIÊU ĐẦU KỲ: Mục tiêu nộp bài/thi đúng hạn
  // J=KẾT QUẢ CUỐI KỲ: Kỷ luật (Tỉ lệ đi học đầy đủ)
  // K=KẾT QUẢ CUỐI KỲ: Học tập (Tỉ lệ pass 1st)
  // L=KẾT QUẢ CUỐI KỲ: Tỉ lệ pass sau Resit
  // M=KẾT QUẢ CUỐI KỲ: Tỷ lệ nộp bài/thi đúng hạn
  // N=MỨC ĐỘ HOÀN THÀNH: Kỷ luật (Tỉ lệ đi học) = J/G
  // O=MỨC ĐỘ HOÀN THÀNH: Học tập (Tỉ lệ pass bao gồm bù điểm Resit) = IF((K/H)>=1, K/H, MIN(1, (K/H)+((L/H)*1)))
  // P=MỨC ĐỘ HOÀN THÀNH: Tỷ lệ nộp bài = M/I

  const s2Data = [];
  // Row 1: Group headers
  s2Data.push(['', '', '', '', '', '', 'MỤC TIÊU ĐẦU KỲ', '', '', 'KẾT QUẢ CUỐI KỲ', '', '', '', 'MỨC ĐỘ HOÀN THÀNH', '', '']);
  // Row 2: Sub-group headers
  s2Data.push(['', '', '', '', '', '', 'Kỷ luật', 'Học tập', '', 'Kỷ luật', 'Học tập', '', '', 'Kỷ luật', 'Học tập', '']);
  // Row 3: Column headers
  s2Data.push([
    'Chương trình', 'Kỳ học', 'Khóa', 'Môn', 'Số lượng GV', 'Số lượng sinh viên',
    'Tỉ lệ đi học\nđầy đủ', 'Mục tiêu\npass 1st', 'Mục tiêu nộp bài/\nthi lần đầu\nđúng hạn',
    'Tỉ lệ đi học\nđầy đủ', 'Tỉ lệ pass 1st', 'Tỉ lệ pass\nsau Resit', 'Tỷ lệ nộp bài/\nthi lần đầu\nđúng hạn',
    'Tỉ lệ đi học\nđầy đủ', 'Tỉ lệ pass\n(Điểm hiệu suất\nhọc tập sau khi\nđã tính bù điểm Resit)', 'Tỷ lệ nộp bài/\nthi lần đầu\nđúng hạn'
  ]);

  // Data rows: per course
  // Group by cohort, then by semester
  const sem2Courses = userCourses.filter(c => {
    const s = (c.semester || '').toUpperCase();
    return s.includes('2') || s.includes('SPRING') || s.includes('SP');
  });
  
  const dataStartRow = 3; // 0-indexed, row 4 in Excel
  sem2Courses.forEach((c, idx) => {
    const r = dataStartRow + idx + 1; // Excel 1-indexed row
    s2Data.push([
      progName,           // A - Chương trình
      c.semester || 'SEM 2', // B - Kỳ học
      c.cohort || '',     // C - Khóa
      c.name,             // D - Môn
      c.numLecturers || '',  // E - Số lượng GV
      c.numStudents || '',   // F - Số lượng SV
      c.attendanceTarget || 0.9,  // G - Mục tiêu Kỷ luật: Tỉ lệ đi học
      c.passTarget || 0.7,  // H - Mục tiêu Học tập: pass 1st
      c.submitTarget || 1,  // I - Mục tiêu nộp bài đúng hạn
      c.attendanceRate || '', // J - KQ: Tỉ lệ đi học (nhân sự tự điền)
      c.passRate || '',      // K - KQ: Tỉ lệ pass 1st (nhân sự tự điền)
      c.passResitRate || '', // L - KQ: Tỉ lệ pass sau Resit (nhân sự tự điền)
      c.submitRate || '',    // M - KQ: Tỷ lệ nộp bài (nhân sự tự điền)
      '', // N - formula = J/G
      '', // O - formula
      ''  // P - formula = M/I
    ]);
  });

  // If no SEM2 courses, add empty rows for data entry
  if (sem2Courses.length === 0) {
    for (let i = 0; i < 5; i++) {
      s2Data.push([progName, 'SEM 2', '', '', '', '', 0.9, 0.7, 1, '', '', '', '', '', '', '']);
    }
  }

  // Signature block
  s2Data.push([]);
  s2Data.push(['', 'Người Duyệt', '', 'Người đánh giá', '', '', '', 'Người được đánh giá', '', '', '', '', '', '', '', '']);
  s2Data.push([]); s2Data.push([]); s2Data.push([]); s2Data.push([]);
  s2Data.push(['', 'Trưởng Ban', '', 'Cán bộ quản lý trực tiếp', '', '', '', user.name, '', '', '', '', '', '', '', '']);

  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);

  // Add formulas for completion ratio columns N, O, P
  const numDataRows = Math.max(sem2Courses.length, 5);
  for (let i = 0; i < numDataRows; i++) {
    const r = 3 + i; // 0-indexed row (row 4 in Excel)
    const excelRow = r + 1; // 1-indexed
    const nAddr = XLSX.utils.encode_cell({ r, c: 13 }); // N
    const oAddr = XLSX.utils.encode_cell({ r, c: 14 }); // O
    const pAddr = XLSX.utils.encode_cell({ r, c: 15 }); // P
    
    // N = J/G (attendance completion)
    ws2[nAddr] = { t: 'n', f: `IF(G${excelRow}=0,"N/A",J${excelRow}/G${excelRow})` };
    // O = pass completion with resit credit: IF((K/H)>=1, K/H, MIN(1, (K/H)+((L/H)*1)))
    ws2[oAddr] = { t: 'n', f: `IF(H${excelRow}=0,"N/A",IF((K${excelRow}/H${excelRow})>=1,K${excelRow}/H${excelRow},MIN(1,(K${excelRow}/H${excelRow})+((L${excelRow}/H${excelRow})*1))))` };
    // P = M/I (submission completion)
    ws2[pAddr] = { t: 'n', f: `IF(I${excelRow}=0,"N/A",M${excelRow}/I${excelRow})` };
  }

  ws2['!cols'] = [
    { wch: 15 }, // A
    { wch: 10 }, // B
    { wch: 12 }, // C
    { wch: 35 }, // D
    { wch: 10 }, // E
    { wch: 12 }, // F
    { wch: 14 }, // G
    { wch: 14 }, // H
    { wch: 14 }, // I
    { wch: 14 }, // J
    { wch: 14 }, // K
    { wch: 14 }, // L
    { wch: 14 }, // M
    { wch: 14 }, // N
    { wch: 18 }, // O
    { wch: 14 }, // P
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'KQ SV & KỶ LUẬT SV (20%)');

  // =========================
  // SHEET 3: list các môn học
  // =========================
  // Full roadmap of all courses in this coordinator's program across all years/semesters
  const allProgCourses = userCourses.sort((a, b) => {
    if ((a.year || 1) !== (b.year || 1)) return (a.year || 1) - (b.year || 1);
    const semOrder = (s) => {
      if (!s) return 0;
      const u = s.toUpperCase();
      if (u.includes('FALL') || u.includes('AU') || u === 'SEM 1' || u === 'KỲ 1') return 1;
      if (u.includes('SPRING') || u.includes('SP') || u === 'SEM 2' || u === 'KỲ 2') return 2;
      if (u.includes('SUMMER') || u.includes('SU')) return 3;
      return 0;
    };
    return semOrder(a.semester) - semOrder(b.semester);
  });

  const s3Data = [];
  // Row 1: Program header
  s3Data.push([progName, '', '', '', '', 'KHÓA', 'NĂM HỌC', 'CHƯƠNG TRÌNH HỌC']);
  // Row 2: Column headers
  s3Data.push(['STT', 'Kỳ Học', 'Tên Môn Học Tiếng Anh', 'CHƯƠNG TRÌNH HỌC', '', '', '', '']);

  // Data rows
  allProgCourses.forEach((c, idx) => {
    s3Data.push([
      idx + 1,
      c.semester || '',
      c.name,
      c.cohort || progName,
      '',
      '',
      '',
      ''
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
  ws3['!cols'] = [
    { wch: 6 },  // A - STT
    { wch: 20 }, // B - Kỳ Học
    { wch: 45 }, // C - Tên Môn Học
    { wch: 20 }, // D - Chương trình
    { wch: 5 },  // E
    { wch: 12 }, // F - Khóa
    { wch: 15 }, // G - Năm học
    { wch: 20 }, // H - CT Học
  ];

  XLSX.utils.book_append_sheet(wb, ws3, 'list các môn học');

  // Write file
  const fileName = `Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_${user.name}.xlsx`;
  XLSX.writeFile(wb, path.join(outDir, fileName));
  XLSX.writeFile(wb, path.join(publicDir, fileName));
  console.log(`✓ ${user.name} (${progName}) — ${allProgCourses.length} môn, ${sem2Courses.length} môn Sem 2, ${userSnaps.length} KPI snapshots`);
});

// Create ZIP
const { execSync } = require('child_process');
execSync(`cd "${outDir}" && zip -r "Bo_8_File_KPI_Sem2_2026.zip" *.xlsx`);
execSync(`cp "${outDir}/Bo_8_File_KPI_Sem2_2026.zip" "${publicDir}/Bo_8_File_KPI_Sem2_2026.zip"`);

console.log('\n✅ Done! Generated 8 files + 1 ZIP');
console.log(`📁 Output: ${outDir}`);
console.log(`🌐 Public: ${publicDir}`);
