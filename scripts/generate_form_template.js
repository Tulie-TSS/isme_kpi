/**
 * Generate 1 UNIVERSAL Excel template form for ALL coordinators.
 * 
 * This file replicates the EXACT layout of the original Institute file:
 *   "Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Bùi Thị Quỳnh Trang.xlsx"
 * 
 * But converts it into a FORM TEMPLATE:
 *   - All fixed cells (headers, KPI names, criteria, formulas) are LOCKED
 *   - All data-entry cells are UNLOCKED + highlighted yellow
 *   - Sheet protection is ON so coordinators can only edit yellow cells
 *   - Formulas (=I/H, =J/G, =IF(K/H>=1,...), =M/I) are pre-filled and locked
 *   - Sheet 2 has 30 blank rows for course data entry
 *   - Sheet 3 has 50 blank rows for course roadmap listing
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateTemplate() {
  const wb = new ExcelJS.Workbook();

  // ========================================================================
  // COLORS & STYLES
  // ========================================================================
  const YELLOW_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  const LIGHT_YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFCC' } };
  const LIGHT_BLUE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
  const LIGHT_GREEN = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
  const LIGHT_ORANGE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
  const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  const BOLD = { bold: true, size: 11 };
  const NORMAL = { size: 11 };
  const TITLE_FONT = { bold: true, size: 14 };
  const THIN_BORDER = {
    top: { style: 'thin' }, bottom: { style: 'thin' },
    left: { style: 'thin' }, right: { style: 'thin' }
  };
  const CENTER = { horizontal: 'center', vertical: 'middle', wrapText: true };
  const LEFT_WRAP = { horizontal: 'left', vertical: 'middle', wrapText: true };

  // ========================================================================
  // SHEET 1: OPERATION (50%) & HĐ HTHT (20%)
  // ========================================================================
  const ws1 = wb.addWorksheet('OPERATION (50%) & HĐ HTHT (20%)', {
    properties: { defaultColWidth: 15 },
    views: [{ state: 'frozen', ySplit: 10 }]
  });

  // Column widths matching original
  ws1.columns = [
    { width: 6 },   // A - STT
    { width: 22 },  // B - Nội dung đánh giá
    { width: 22 },  // C - Đầu mục CV
    { width: 35 },  // D - Nhóm KPI
    { width: 50 },  // E - Tiêu chí
    { width: 10 },  // F - Đơn vị đo
    { width: 14 },  // G - Mục tiêu đạt KPI
    { width: 16 },  // H - SL được giao
    { width: 18 },  // I - SL hoàn thành (tự ĐG)
    { width: 16 },  // J - Tỉ lệ hoàn thành
    { width: 16 },  // K - ĐG line manager
    { width: 16 },  // L - ĐG trưởng ban (điểm)
    { width: 30 },  // M - ĐG trưởng ban (Note)
  ];

  // Row 1: Title
  ws1.mergeCells('A1:L1');
  const r1 = ws1.getRow(1);
  r1.getCell(1).value = 'BẢNG ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN';
  r1.getCell(1).font = TITLE_FONT;
  r1.getCell(1).alignment = CENTER;

  // Row 2: Subtitle
  ws1.mergeCells('A2:L2');
  const r2 = ws1.getRow(2);
  r2.getCell(1).value = 'CÔNG VIỆC CÁ NHÂN';
  r2.getCell(1).font = TITLE_FONT;
  r2.getCell(1).alignment = CENTER;

  // Row 3: Period (editable)
  ws1.mergeCells('A3:D3');
  ws1.mergeCells('F3:I3');
  ws1.mergeCells('K3:L3');
  const r3 = ws1.getRow(3);
  r3.getCell(5).value = 'Kỳ đánh giá:';
  r3.getCell(5).font = BOLD;
  r3.getCell(6).value = '';  // EDITABLE: Kỳ đánh giá
  r3.getCell(6).fill = YELLOW_FILL;
  r3.getCell(6).font = NORMAL;
  r3.getCell(11).value = 'Năm:';
  r3.getCell(11).font = BOLD;

  // Row 4-5: Người được đánh giá
  ws1.mergeCells('A4:D5');
  ws1.mergeCells('E4:L4');
  ws1.mergeCells('F5:I5');
  ws1.mergeCells('K5:L5');
  const r4 = ws1.getRow(4);
  r4.getCell(1).value = 'Người được đánh giá';
  r4.getCell(1).font = BOLD;
  r4.getCell(1).alignment = CENTER;
  r4.getCell(5).value = 'Họ và tên:';
  r4.getCell(5).font = BOLD;
  // F4 merged into E4, so the name goes into E4
  
  const r5 = ws1.getRow(5);
  r5.getCell(5).value = 'Chức danh:';
  r5.getCell(5).font = BOLD;
  r5.getCell(6).value = '';  // EDITABLE
  r5.getCell(6).fill = YELLOW_FILL;
  r5.getCell(11).value = 'Mã chức danh';
  r5.getCell(11).font = BOLD;

  // Row 6-7: Người đánh giá
  ws1.mergeCells('A6:D7');
  ws1.mergeCells('E6:L6');
  ws1.mergeCells('F7:I7');
  ws1.mergeCells('K7:L7');
  const r6 = ws1.getRow(6);
  r6.getCell(1).value = 'Người đánh giá';
  r6.getCell(1).font = BOLD;
  r6.getCell(1).alignment = CENTER;
  r6.getCell(5).value = 'Họ và tên: Hồ Hoàng Lan';
  r6.getCell(5).font = BOLD;
  
  const r7 = ws1.getRow(7);
  r7.getCell(5).value = 'Chức danh: Trưởng Ban Đào tạo đại học';
  r7.getCell(5).font = BOLD;
  r7.getCell(11).value = 'Mã chức danh';
  r7.getCell(11).font = BOLD;

  // Row 8: Empty separator
  ws1.mergeCells('A8:L8');

  // Row 9-10: Header
  ws1.mergeCells('B9:D9');
  ws1.mergeCells('E9:E10');
  ws1.mergeCells('F9:F10');
  ws1.mergeCells('G9:G10');
  ws1.mergeCells('H9:H10');
  ws1.mergeCells('I9:I10');
  ws1.mergeCells('J9:J10');
  ws1.mergeCells('K9:K10');
  ws1.mergeCells('L9:L10');
  ws1.mergeCells('M9:M10');

  const headerRow1 = ws1.getRow(9);
  const headerRow2 = ws1.getRow(10);
  const h1 = [
    'STT', 'Mục tiêu hành động của vị trí công việc', '', '',
    'Tiêu chí', 'Đơn vị đo', 'Mục tiêu đạt KPI',
    'Số lượng được giao',
    'Số lượng hoàn thành\n(tự đánh giá)',
    'Tỉ lệ hoàn thành\n(tự đánh giá)',
    'Đánh giá của line manager\n(thang điểm từ 1 đến 100)',
    'Đánh giá của trưởng ban\n(thang điểm từ 1 đến 100)',
    'Đánh giá của trưởng ban\n(Note dài khoảng 100-200 words)'
  ];
  const h2 = ['', 'Nội dung đánh giá', 'Đầu mục công việc', 'Nhóm KPI theo mô tả CV', '', '', '', '', '', '', '', '', ''];

  for (let c = 1; c <= 13; c++) {
    const cell1 = headerRow1.getCell(c);
    cell1.value = h1[c-1];
    cell1.font = HEADER_FONT;
    cell1.fill = HEADER_FILL;
    cell1.alignment = CENTER;
    cell1.border = THIN_BORDER;

    const cell2 = headerRow2.getCell(c);
    cell2.value = h2[c-1];
    cell2.font = HEADER_FONT;
    cell2.fill = HEADER_FILL;
    cell2.alignment = CENTER;
    cell2.border = THIN_BORDER;
  }
  headerRow1.height = 45;
  headerRow2.height = 25;

  // ========== KPI DATA ROWS ==========
  // Exact 13 KPI items from the original file + 1 extra row for OP1 sub-item
  // The original has rows 11-24 (14 data rows, where STT 1 has 2 sub-rows)
  
  const kpiItems = [
    // STT 1 - Row 11 (two sub-criteria)
    { stt: 1, group: 'OPERATION (50%)', task: 'Quản lý nội dung giảng dạy', desc: 'Làm việc với nhóm GV từng môn về nội dung giảng dạy', criteria: 'Tỷ lệ các môn học có đầy đủ các tài liệu (SoW, Assessment Plan, Assignment Brief) theo yêu cầu và đúng tiến độ', unit: '%' },
    // STT 1 sub-row - Row 12
    { stt: '', group: '', task: '', desc: '', criteria: 'Tỷ lệ các môn có đầy đủ tài liệu môn học trong quá trình đúng hạn', unit: '%' },
    // STT 2 - Row 13
    { stt: 2, group: '', task: 'Quản lý tài liệu liên quan GV', desc: 'Cung cấp thông tin phục vụ hoàn thiện các thủ tục ký hợp đồng, thanh lý hợp đồng giảng, thủ tục thanh toán tiền giảng/trợ giảng\n- HĐ GV\n- Thanh toán giảng dạy\n- Thanh toán chấm bài', criteria: 'Tỷ lệ giảng viên được cập nhật thông tin theo đúng tiến độ và kế hoạch vận hành', unit: '%' },
    // STT 3 - Row 14
    { stt: 3, group: '', task: 'Vận hành Lớp học', desc: 'Tổ chức lớp học', criteria: 'Tỷ lệ các lớp được set up theo kế hoạch (Làm & TB TKB cho GV & SV, tạo lớp Moodle, tạo account cho GV và SV, enroll GV và SV)', unit: '%' },
    // STT 4 - Row 15
    { stt: 4, group: '', task: 'Quản lý điểm', desc: 'Quản lý điểm và quá trình đánh giá SV', criteria: 'Tỷ lệ các môn học hoàn thành điểm theo đúng kế hoạch', unit: '%' },
    // STT 5 - Row 16 (shared OPERATION + HĐ hỗ trợ HT)
    { stt: 5, group: 'OPERATION (50%) & HĐ hỗ trợ HT (20%)', task: 'Hoạt động ngoại khóa', desc: 'Tổ chức hoạt động Tọa đàm, hội thảo chuyên đề, guest speaker, field trip', criteria: 'Số lượng các hoạt động được triển khai', unit: '%' },
    // STT 6 - Row 17
    { stt: 6, group: 'OPERATION (50%)', task: 'Rà soát kết quả học tập', desc: 'Rà soát kết quả học tập, hồ sơ hoàn thành chương trình', criteria: 'Tỷ lệ các môn học có file kết quả rà soát theo yêu cầu', unit: '%' },
    // STT 7 - Row 18
    { stt: 7, group: '', task: 'Turnitin', desc: 'Giám sát liêm chính học thuật', criteria: 'Tỷ lệ các môn học có báo cáo kết quả rà soát Turnitin theo yêu cầu', unit: '%' },
    // STT 8 - Row 19
    { stt: 8, group: '', task: 'Phản hồi GV & SV', desc: 'Xử lý các phản hồi của SV & GV', criteria: 'Số lượng kiến nghị của sinh viên được xử lý kịp thời (SV KHÔNG phải phản hồi lên cấp cao hơn)', unit: '%' },
    // STT 9 - Row 20
    { stt: 9, group: '', task: 'Module report & Feedback', desc: 'Hoàn thành module report và gửi feedback của SV cho GV', criteria: 'Tỉ lệ số môn học đã làm feedback và gửi report xử lý số liệu cho GV', unit: '%' },
    // STT 10 - Row 21
    { stt: 10, group: '', task: 'Hồ sơ SV', desc: 'Quản lý tiến trình học tập của sinh viên', criteria: 'Tỷ lệ hồ sơ sinh viên được cập nhật & giải quyết, đồng bộ thông tin học tập chính xác theo các mốc tiến độ trong kỳ. (Các giấy tờ liên quan đến Giấy xác nhận, lớp học lại...)', unit: '%' },
    // STT 11 - Row 22
    { stt: 11, group: 'HĐ khác (10%)', task: 'Tuyển sinh', desc: 'Tham gia công tác tuyển sinh', criteria: 'Số lượng hoạt động tuyển sinh đã tham gia', unit: '%' },
    // STT 12 - Row 23
    { stt: 12, group: '', task: 'Hỗ trợ SV du học & exchange', desc: 'Quản lý & hỗ trợ SV trao đổi/ du học', criteria: 'Tỷ lệ sinh viên có nhu cầu chuyển tiếp/trao đổi được hỗ trợ hoàn thiện hồ sơ đi nước ngoài, mở tài khoản phần mềm liên kết và xuất bảng điểm kịp thời.', unit: '%' },
    // STT 13 - Row 24
    { stt: 13, group: '', task: 'Hoạt động khác', desc: 'Các hoạt động khác do Viện tổ chức', criteria: 'Số lượng hoạt động đã tham gia đóng góp', unit: '%' },
  ];

  // Merge cells for "Nội dung đánh giá" groups - matching original
  ws1.mergeCells('A11:A12');  // STT 1 spans 2 rows
  ws1.mergeCells('B11:B15'); // OPERATION (50%) rows 11-15
  ws1.mergeCells('C11:C12'); // Quản lý nội dung GD spans 2 rows
  ws1.mergeCells('D11:D12'); // Description spans 2 rows
  ws1.mergeCells('B17:B21'); // OPERATION (50%) rows 17-21
  ws1.mergeCells('B22:B24'); // HĐ khác (10%) rows 22-24

  for (let i = 0; i < kpiItems.length; i++) {
    const item = kpiItems[i];
    const rowNum = 11 + i;
    const row = ws1.getRow(rowNum);
    row.height = 35;

    // A - STT (locked)
    row.getCell(1).value = item.stt;
    row.getCell(1).alignment = CENTER;
    row.getCell(1).border = THIN_BORDER;
    row.getCell(1).font = BOLD;

    // B - Nội dung đánh giá (locked)
    row.getCell(2).value = item.group;
    row.getCell(2).alignment = CENTER;
    row.getCell(2).border = THIN_BORDER;
    row.getCell(2).font = BOLD;

    // C - Đầu mục CV (locked)
    row.getCell(3).value = item.task;
    row.getCell(3).alignment = LEFT_WRAP;
    row.getCell(3).border = THIN_BORDER;
    row.getCell(3).font = NORMAL;

    // D - Nhóm KPI theo mô tả CV (locked)
    row.getCell(4).value = item.desc;
    row.getCell(4).alignment = LEFT_WRAP;
    row.getCell(4).border = THIN_BORDER;
    row.getCell(4).font = NORMAL;

    // E - Tiêu chí (locked)
    row.getCell(5).value = item.criteria;
    row.getCell(5).alignment = LEFT_WRAP;
    row.getCell(5).border = THIN_BORDER;
    row.getCell(5).font = NORMAL;

    // F - Đơn vị đo (locked)
    row.getCell(6).value = item.unit;
    row.getCell(6).alignment = CENTER;
    row.getCell(6).border = THIN_BORDER;
    row.getCell(6).font = NORMAL;

    // G - Mục tiêu đạt KPI (locked = 1 = 100%)
    row.getCell(7).value = 1;
    row.getCell(7).alignment = CENTER;
    row.getCell(7).border = THIN_BORDER;
    row.getCell(7).font = NORMAL;
    row.getCell(7).numFmt = '0%';

    // H - Số lượng được giao → EDITABLE (yellow)
    row.getCell(8).value = null;
    row.getCell(8).fill = YELLOW_FILL;
    row.getCell(8).alignment = CENTER;
    row.getCell(8).border = THIN_BORDER;
    row.getCell(8).font = BOLD;
    row.getCell(8).protection = { locked: false };

    // I - Số lượng hoàn thành (tự đánh giá) → EDITABLE (yellow)
    row.getCell(9).value = null;
    row.getCell(9).fill = YELLOW_FILL;
    row.getCell(9).alignment = CENTER;
    row.getCell(9).border = THIN_BORDER;
    row.getCell(9).font = BOLD;
    row.getCell(9).protection = { locked: false };

    // J - Tỉ lệ hoàn thành = I/H (FORMULA, locked)
    row.getCell(10).value = { formula: `IF(H${rowNum}=0,"",I${rowNum}/H${rowNum})` };
    row.getCell(10).numFmt = '0.00%';
    row.getCell(10).alignment = CENTER;
    row.getCell(10).border = THIN_BORDER;
    row.getCell(10).font = BOLD;
    row.getCell(10).fill = LIGHT_GREEN;

    // K - ĐG line manager → EDITABLE (light orange)
    row.getCell(11).value = null;
    row.getCell(11).fill = LIGHT_ORANGE;
    row.getCell(11).alignment = CENTER;
    row.getCell(11).border = THIN_BORDER;
    row.getCell(11).font = NORMAL;
    row.getCell(11).protection = { locked: false };

    // L - ĐG trưởng ban (điểm) → EDITABLE (light orange)
    row.getCell(12).value = null;
    row.getCell(12).fill = LIGHT_ORANGE;
    row.getCell(12).alignment = CENTER;
    row.getCell(12).border = THIN_BORDER;
    row.getCell(12).font = NORMAL;
    row.getCell(12).protection = { locked: false };

    // M - ĐG trưởng ban (Note) → EDITABLE (light orange)
    row.getCell(13).value = null;
    row.getCell(13).fill = LIGHT_ORANGE;
    row.getCell(13).alignment = LEFT_WRAP;
    row.getCell(13).border = THIN_BORDER;
    row.getCell(13).font = NORMAL;
    row.getCell(13).protection = { locked: false };
  }

  // Legend row
  const legendRow = 26;
  const rLeg = ws1.getRow(legendRow);
  rLeg.getCell(8).value = '← Ô vàng: Coordinator tự điền';
  rLeg.getCell(8).fill = YELLOW_FILL;
  rLeg.getCell(8).font = { bold: true, size: 10 };
  rLeg.getCell(10).value = '← Ô xanh: Tự động tính (công thức)';
  rLeg.getCell(10).fill = LIGHT_GREEN;
  rLeg.getCell(10).font = { bold: true, size: 10 };
  rLeg.getCell(11).value = '← Ô cam: Line Manager / Trưởng Ban điền';
  rLeg.getCell(11).fill = LIGHT_ORANGE;
  rLeg.getCell(11).font = { bold: true, size: 10 };

  // Signature block
  const sigStart = 28;
  ws1.getRow(sigStart).getCell(4).value = 'Người Duyệt';
  ws1.getRow(sigStart).getCell(4).font = BOLD;
  ws1.getRow(sigStart).getCell(5).value = 'Người đánh giá';
  ws1.getRow(sigStart).getCell(5).font = BOLD;
  ws1.getRow(sigStart).getCell(9).value = 'Người được đánh giá';
  ws1.getRow(sigStart).getCell(9).font = BOLD;

  ws1.getRow(sigStart + 4).getCell(4).value = 'Trưởng Ban';
  ws1.getRow(sigStart + 4).getCell(4).font = BOLD;
  ws1.getRow(sigStart + 4).getCell(5).value = 'Cán bộ quản lý trực tiếp';
  ws1.getRow(sigStart + 4).getCell(5).font = BOLD;
  // Name cell editable
  ws1.getRow(sigStart + 4).getCell(9).value = null;
  ws1.getRow(sigStart + 4).getCell(9).fill = YELLOW_FILL;
  ws1.getRow(sigStart + 4).getCell(9).protection = { locked: false };
  ws1.getRow(sigStart + 4).getCell(9).font = BOLD;

  // Sheet protection: lock everything except yellow/orange cells
  ws1.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false
  });

  // ========================================================================
  // SHEET 2: KQ SV & KỶ LUẬT SV (20%)
  // ========================================================================
  const ws2 = wb.addWorksheet('KQ SV & KỶ LUẬT SV (20%)', {
    views: [{ state: 'frozen', ySplit: 3 }]
  });

  ws2.columns = [
    { width: 16 }, { width: 10 }, { width: 14 }, { width: 40 },
    { width: 12 }, { width: 14 }, { width: 14 }, { width: 14 },
    { width: 16 }, { width: 14 }, { width: 14 }, { width: 14 },
    { width: 16 }, { width: 14 }, { width: 20 }, { width: 16 }
  ];

  // Row 1: Group headers
  ws2.mergeCells('G1:I1');
  ws2.mergeCells('J1:M1');
  ws2.mergeCells('N1:P1');
  const s2r1 = ws2.getRow(1);
  s2r1.height = 25;
  // G=7, J=10, N=14
  const groupCols = [7, 10, 14];
  const groupLabels = ['MỤC TIÊU ĐẦU KỲ', 'KẾT QUẢ CUỐI KỲ', 'MỨC ĐỘ HOÀN THÀNH'];
  const groupFills = [LIGHT_BLUE, YELLOW_FILL, LIGHT_GREEN];
  groupCols.forEach((colNum, idx) => {
    const c = s2r1.getCell(colNum);
    c.value = groupLabels[idx];
    c.font = HEADER_FONT;
    c.fill = groupFills[idx];
    c.alignment = CENTER;
    c.border = THIN_BORDER;
  });

  // Row 2: Sub-group headers
  ws2.mergeCells('H2:I2');
  ws2.mergeCells('K2:M2');
  ws2.mergeCells('O2:P2');
  const s2r2 = ws2.getRow(2);
  s2r2.height = 22;
  // G=7, H=8, J=10, K=11, N=14, O=15
  const subCols =  [7,       8,        10,       11,        14,       15];
  const subLabels = ['Kỷ luật','Học tập','Kỷ luật','Học tập','Kỷ luật','Học tập'];
  const subFills =  [LIGHT_BLUE, LIGHT_BLUE, YELLOW_FILL, YELLOW_FILL, LIGHT_GREEN, LIGHT_GREEN];
  subCols.forEach((colNum, idx) => {
    const c = s2r2.getCell(colNum);
    c.value = subLabels[idx];
    c.font = HEADER_FONT;
    c.fill = subFills[idx];
    c.alignment = CENTER;
    c.border = THIN_BORDER;
  });

  // Row 3: Column headers
  const s2r3 = ws2.getRow(3);
  s2r3.height = 55;
  const colHeaders = [
    'Chương trình', 'Kỳ học', 'Khóa', 'Môn', 'Số lượng GV', 'Số lượng sinh viên',
    'Tỉ lệ đi học\nđầy đủ', 'Mục tiêu\npass 1st', 'Mục tiêu nộp bài/\nthi lần đầu\nđúng hạn',
    'Tỉ lệ đi học\nđầy đủ', 'Tỉ lệ pass 1st', 'Tỉ lệ pass\nsau Resit', 'Tỷ lệ nộp bài/thi\nlần đầu đúng hạn',
    'Tỉ lệ đi học\nđầy đủ', 'Tỉ lệ pass\n(Hiệu suất HT sau\ntính bù điểm Resit)', 'Tỷ lệ nộp bài/thi\nlần đầu đúng hạn'
  ];
  for (let c = 1; c <= 16; c++) {
    const cell = s2r3.getCell(c);
    cell.value = colHeaders[c-1];
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = CENTER;
    cell.border = THIN_BORDER;
  }

  // Data rows: 30 blank rows for coordinators to fill
  const DATA_ROWS = 30;
  for (let i = 0; i < DATA_ROWS; i++) {
    const rowNum = 4 + i;
    const row = ws2.getRow(rowNum);
    row.height = 22;

    for (let c = 1; c <= 16; c++) {
      const cell = row.getCell(c);
      cell.border = THIN_BORDER;
      cell.alignment = CENTER;
      cell.font = NORMAL;

      if (c <= 6) {
        // A-F: Course info → EDITABLE (light yellow)
        cell.fill = LIGHT_YELLOW;
        cell.protection = { locked: false };
        if (c === 4) cell.alignment = LEFT_WRAP; // Course name left-aligned
      } else if (c >= 7 && c <= 9) {
        // G-I: Mục tiêu đầu kỳ → EDITABLE (light blue)
        cell.fill = LIGHT_BLUE;
        cell.numFmt = '0%';
        cell.protection = { locked: false };
      } else if (c >= 10 && c <= 13) {
        // J-M: Kết quả cuối kỳ → EDITABLE (yellow - coordinator nhập)
        cell.fill = YELLOW_FILL;
        cell.numFmt = '0.0000';
        cell.protection = { locked: false };
      } else {
        // N-P: Mức độ hoàn thành → FORMULA (locked, green)
        cell.fill = LIGHT_GREEN;
        cell.numFmt = '0.00%';
      }
    }

    // N = J/G
    row.getCell(14).value = { formula: `IF(OR(G${rowNum}=0,G${rowNum}="",J${rowNum}=""),"",J${rowNum}/G${rowNum})` };
    // O = IF((K/H)>=1, K/H, MIN(1, (K/H)+((L/H)*1)))
    row.getCell(15).value = { formula: `IF(OR(H${rowNum}=0,H${rowNum}="",K${rowNum}=""),"",IF((K${rowNum}/H${rowNum})>=1,K${rowNum}/H${rowNum},MIN(1,(K${rowNum}/H${rowNum})+((L${rowNum}/H${rowNum})*1))))` };
    // P = M/I
    row.getCell(16).value = { formula: `IF(OR(I${rowNum}=0,I${rowNum}="",M${rowNum}=""),"",M${rowNum}/I${rowNum})` };
  }

  // Legend
  const s2LegRow = 4 + DATA_ROWS + 1;
  const s2Leg = ws2.getRow(s2LegRow);
  s2Leg.getCell(1).value = 'Chú thích:';
  s2Leg.getCell(1).font = BOLD;
  s2Leg.getCell(2).value = '← Vàng nhạt: Thông tin lớp (Coordinator điền)';
  s2Leg.getCell(2).fill = LIGHT_YELLOW;
  s2Leg.getCell(4).value = '← Xanh: Mục tiêu đầu kỳ (Coordinator điền)';
  s2Leg.getCell(4).fill = LIGHT_BLUE;
  s2Leg.getCell(7).value = '← Vàng: Kết quả cuối kỳ (Coordinator điền)';
  s2Leg.getCell(7).fill = YELLOW_FILL;
  s2Leg.getCell(10).value = '← Xanh lá: Tự động tính (KHÔNG SỬA)';
  s2Leg.getCell(10).fill = LIGHT_GREEN;

  ws2.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
  });

  // ========================================================================
  // SHEET 3: list các môn học
  // ========================================================================
  const ws3 = wb.addWorksheet('list các môn học', {
    views: [{ state: 'frozen', ySplit: 2 }]
  });

  ws3.columns = [
    { width: 8 }, { width: 22 }, { width: 50 }, { width: 22 },
    { width: 5 }, { width: 14 }, { width: 16 }, { width: 22 }
  ];

  // Row 1: Title
  ws3.mergeCells('A1:D1');
  const s3r1 = ws3.getRow(1);
  s3r1.getCell(1).value = 'DANH MỤC MÔN HỌC TOÀN CHƯƠNG TRÌNH';
  s3r1.getCell(1).font = TITLE_FONT;
  s3r1.getCell(1).alignment = CENTER;
  s3r1.getCell(6).value = 'KHÓA';
  s3r1.getCell(6).font = BOLD;
  s3r1.getCell(7).value = 'NĂM HỌC';
  s3r1.getCell(7).font = BOLD;
  s3r1.getCell(8).value = 'CHƯƠNG TRÌNH HỌC';
  s3r1.getCell(8).font = BOLD;

  // Row 2: Column headers
  const s3r2 = ws3.getRow(2);
  s3r2.height = 25;
  const s3Headers = ['STT', 'Kỳ Học', 'Tên Môn Học Tiếng Anh', 'CHƯƠNG TRÌNH HỌC', '', '', '', ''];
  for (let c = 1; c <= 8; c++) {
    const cell = s3r2.getCell(c);
    cell.value = s3Headers[c-1];
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = CENTER;
    cell.border = THIN_BORDER;
  }

  // 50 blank rows for course listing
  const COURSE_ROWS = 50;
  for (let i = 0; i < COURSE_ROWS; i++) {
    const rowNum = 3 + i;
    const row = ws3.getRow(rowNum);
    row.height = 20;
    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.border = THIN_BORDER;
      cell.fill = LIGHT_YELLOW;
      cell.alignment = (c === 3) ? LEFT_WRAP : CENTER;
      cell.font = NORMAL;
      cell.protection = { locked: false };
    }
    // Auto-number STT
    row.getCell(1).value = i + 1;
    row.getCell(1).fill = LIGHT_BLUE;
    row.getCell(1).protection = { locked: true };
  }

  ws3.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
  });

  // ========================================================================
  // SHEET 4 (BONUS): HƯỚNG DẪN ĐIỀN
  // ========================================================================
  const ws4 = wb.addWorksheet('HƯỚNG DẪN ĐIỀN');
  ws4.columns = [{ width: 5 }, { width: 50 }, { width: 80 }];

  const instructions = [
    ['', 'HƯỚNG DẪN SỬ DỤNG FILE MẪU ĐÁNH GIÁ KPI', ''],
    ['', '', ''],
    ['', 'QUY TẮC MÀU SẮC:', ''],
    ['', 'Ô NỀN VÀNG (sáng)', 'Coordinator TỰ ĐIỀN số liệu vào đây'],
    ['', 'Ô NỀN XANH DƯƠNG NHẠ', 'Mục tiêu đầu kỳ - được Ban giao hoặc Coordinator tự điền theo kế hoạch'],
    ['', 'Ô NỀN CAM NHẠT', 'Line Manager / Trưởng Ban điền đánh giá (thang điểm 1-100 và nhận xét)'],
    ['', 'Ô NỀN XANH LÁ NHẠT', 'TỰ ĐỘNG TÍNH bằng công thức — KHÔNG ĐƯỢC SỬA'],
    ['', '', ''],
    ['', 'SHEET 1: OPERATION (50%) & HĐ HTHT (20%)', ''],
    ['', 'Cột H - Số lượng được giao:', 'Nhập số lượng mục tiêu được giao đầu kỳ (VD: 6 môn, 10 GV, 16 lớp...)'],
    ['', 'Cột I - Số lượng hoàn thành:', 'Nhập số lượng thực tế đã hoàn thành cuối kỳ'],
    ['', 'Cột J - Tỉ lệ hoàn thành:', 'TỰ ĐỘNG = I/H (KHÔNG SỬA)'],
    ['', 'Cột K - Đánh giá Line Manager:', 'Line Manager nhập điểm từ 1 đến 100'],
    ['', 'Cột L - Đánh giá Trưởng Ban:', 'Trưởng Ban nhập điểm từ 1 đến 100'],
    ['', 'Cột M - Nhận xét Trưởng Ban:', 'Trưởng Ban viết nhận xét 100-200 từ'],
    ['', '', ''],
    ['', 'SHEET 2: KQ SV & KỶ LUẬT SV (20%)', ''],
    ['', 'Cột A-F: Thông tin lớp học:', 'Điền: Chương trình, Kỳ học, Khóa, Tên môn, Số GV, Số SV'],
    ['', 'Cột G-I: Mục tiêu đầu kỳ:', 'Điền tỉ lệ mục tiêu (dạng thập phân, VD: 0.9 = 90%)'],
    ['', 'Cột J: Tỉ lệ đi học đầy đủ:', 'Nhập = Số SV chuyên cần / Tổng SV (VD: 83/85)'],
    ['', 'Cột K: Tỉ lệ pass lần 1:', 'Nhập = Số SV đạt lần 1 / Số SV thi (VD: 57/71)'],
    ['', 'Cột L: Tỉ lệ pass sau Resit:', 'Nhập = Số SV đạt resit / Số SV thi lại (VD: 13/26)'],
    ['', 'Cột M: Tỷ lệ nộp bài đúng hạn:', 'Nhập tỉ lệ thực tế (VD: 1 hoặc 0.97)'],
    ['', 'Cột N-P: Mức độ hoàn thành:', 'TỰ ĐỘNG TÍNH (KHÔNG SỬA)'],
    ['', '  N = J/G', 'Tỉ lệ hoàn thành chuyên cần'],
    ['', '  O = IF((K/H)>=1, K/H, MIN(1, K/H + L/H))', 'Hiệu suất học tập (có cộng bù điểm resit)'],
    ['', '  P = M/I', 'Tỉ lệ hoàn thành nộp bài'],
    ['', '', ''],
    ['', 'SHEET 3: list các môn học', ''],
    ['', 'Liệt kê TẤT CẢ các môn:', 'Toàn bộ môn học trong lộ trình chương trình phụ trách (Năm 1 đến Năm cuối)'],
    ['', 'Phân chia theo Kỳ Học:', 'SEM FALL, SEM SPRING, SEM SUMMER...'],
    ['', '', ''],
    ['', 'LƯU Ý QUAN TRỌNG:', ''],
    ['', '1. KHÔNG sửa công thức ở cột J (Sheet 1) và cột N, O, P (Sheet 2)', ''],
    ['', '2. KHÔNG thêm/xóa cột', ''],
    ['', '3. Có thể thêm dòng mới nếu số môn vượt quá 30 (Sheet 2) hoặc 50 (Sheet 3)', ''],
    ['', '4. Nhập tỉ lệ dạng thập phân: 90% = 0.9, 100% = 1', ''],
    ['', '5. Có thể nhập phân số trực tiếp vào cột J-L Sheet 2: VD nhập =83/85', ''],
  ];

  instructions.forEach((row, i) => {
    const r = ws4.getRow(i + 1);
    r.getCell(2).value = row[1];
    r.getCell(3).value = row[2];
    if (i === 0) { r.getCell(2).font = TITLE_FONT; }
    else if (row[1].startsWith('Ô NỀN VÀNG')) { r.getCell(2).fill = YELLOW_FILL; r.getCell(2).font = BOLD; }
    else if (row[1].startsWith('Ô NỀN XANH DƯƠNG')) { r.getCell(2).fill = LIGHT_BLUE; r.getCell(2).font = BOLD; }
    else if (row[1].startsWith('Ô NỀN CAM')) { r.getCell(2).fill = LIGHT_ORANGE; r.getCell(2).font = BOLD; }
    else if (row[1].startsWith('Ô NỀN XANH LÁ')) { r.getCell(2).fill = LIGHT_GREEN; r.getCell(2).font = BOLD; }
    else if (row[1].includes('SHEET') || row[1].includes('QUY TẮC') || row[1].includes('LƯU Ý')) { r.getCell(2).font = BOLD; }
  });

  // ========================================================================
  // SAVE
  // ========================================================================
  const outDir = path.join(__dirname, '../public/templates_per_person');
  const localDir = path.join(__dirname, '../templates_per_person');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

  const fileName = 'Mau_Form_Danh_Gia_KPI_Coordinator_CHUNG.xlsx';
  await wb.xlsx.writeFile(path.join(outDir, fileName));
  await wb.xlsx.writeFile(path.join(localDir, fileName));
  
  console.log(`✅ Created: ${fileName}`);
  console.log(`📁 Local: ${localDir}/${fileName}`);
  console.log(`🌐 Public: ${outDir}/${fileName}`);
}

generateTemplate().catch(console.error);
