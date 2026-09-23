const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.utils.book_new();

// ==========================================
// SHEET 1: HƯỚNG DẪN SỬ DỤNG
// ==========================================
const sheet1Data = [
  ['QUY CHUẨN & HƯỚNG DẪN NHẬP LIỆU DỮ LIỆU KPI & MÔN HỌC - VIỆN ĐÀO TẠO QUỐC TẾ (ISME)'],
  ['Học kỳ áp dụng: Kỳ 2 Năm học 2025-2026 (Áp dụng cho toàn bộ Điều phối viên & Chủ nhiệm chương trình)'],
  [''],
  ['1. CƠ CẤU TRỌNG SỐ ĐÁNH GIÁ KPI TỔNG HỢP (100%)'],
  ['Nhóm chỉ tiêu', 'Trọng số', 'Mô tả chi tiết', 'Nơi nhập dữ liệu'],
  ['I. Chỉ tiêu Vận hành (Operations)', '50%', 'Gồm 10 chỉ tiêu quản lý học liệu, hợp đồng giảng viên, vận hành lớp học, rà soát kết quả, Turnitin, xử lý kiến nghị...', 'Sheet 3: 3. KPI_Van_Hanh_Ca_Nhan'],
  ['II. Hoạt động Hỗ trợ học tập (Academic Support)', '20%', 'Tổ chức tọa đàm, hội thảo học thuật, guest speaker, field trip, trợ giảng nâng cao chất lượng học tập...', 'Sheet 3: 3. KPI_Van_Hanh_Ca_Nhan (Mã OP5_AS)'],
  ['III. Kết quả học tập & Kỷ luật sinh viên (Student Results)', '20%', 'Đo lường mức độ hoàn thành 3 chỉ tiêu: Đi học chuyên cần, Pass lần 1 (kèm bù Resit), Nộp bài đúng hạn của các môn học trong kỳ.', 'Sheet 2: 2. KPI_Mon_Hoc'],
  ['IV. Các hoạt động khác (Other Activities)', '10%', 'Tham gia công tác tuyển sinh, hỗ trợ SV du học / trao đổi sinh viên quốc tế, đóng góp phát triển chung cho Viện.', 'Sheet 3: 3. KPI_Van_Hanh_Ca_Nhan (OTHER11 -> 13)'],
  ['TỔNG CỘNG', '100%', 'Công thức: Overall = (Vận hành * 50%) + (Hỗ trợ học tập * 20%) + (Kết quả SV * 20%) + (Hoạt động khác * 10%)', 'Hệ thống tự động tổng hợp'],
  [''],
  ['2. QUY ƯỚC NHẬP LIỆU SHEET "2. KPI_Mon_Hoc" (DỮ LIỆU MÔN HỌC)'],
  ['- Các cột Số lượng (Số GV, Số SV):', 'Nhập số nguyên dương (VD: 1, 2, 45, 60...).'],
  ['- Các cột Tỷ lệ (%):', 'Nhập tỷ lệ % theo thang 0 - 100 (Ví dụ: 95 nghĩa là 95%, 80 nghĩa là 80%).'],
  ['- Tiêu chí không áp dụng:', 'Nếu môn học không yêu cầu điểm danh, không có đợt thi lại (Resit), hoặc không có bài tập nộp, ghi rõ chữ "N/A".'],
  ['- Công thức tính điểm Pass sau Resit chuẩn Viện ISME:', '=IF((Pass1st / Target)>=1, Pass1st / Target, MIN(1, (Pass1st / Target) + (PassResit / Target)))'],
  ['- Cột công thức tự động:', 'Các cột Mức hoàn thành (S, T, U, V) đã cài sẵn công thức Excel tự động tính toán. Nhân sự chỉ cần điền các cột Mục tiêu và Thực tế.'],
  [''],
  ['3. QUY ƯỚC NHẬP LIỆU SHEET "3. KPI_Van_Hanh_Ca_Nhan"'],
  ['- Cột Kế hoạch (Target) & Thực hiện (Actual):', 'Điền số lượng hoặc tỷ lệ % tương ứng với đơn vị tính của chỉ tiêu.'],
  ['- Cột Tự chấm (%):', 'Nhân sự tự đánh giá tỷ lệ hoàn thành từ 0% đến 100%.'],
  ['- Cột Minh chứng / Link hồ sơ:', 'Dán đường dẫn thư mục Google Drive lưu trữ hồ sơ, minh chứng nghiệm thu công việc để Trưởng ban đối soát.'],
  ['- Cột Nhận xét tự đánh giá:', 'Viết nhận xét tóm tắt kết quả đạt được, khó khăn và bài học kinh nghiệm (Khuyến nghị 100 - 200 từ).'],
  [''],
  ['4. QUY TRÌNH NỘP & PHÊ DUYỆT'],
  ['Bước 1:', 'Điều phối viên tải file mẫu, cập nhật đầy đủ thông tin vào Sheet 2 (Môn học) và Sheet 3 (Vận hành cá nhân).'],
  ['Bước 2:', 'Kiểm tra kỹ các công thức tự động và rà soát link minh chứng trước khi nộp.'],
  ['Bước 3:', 'Nạp file lên hệ thống ISME Ops OS hoặc gửi Trưởng ban Đào tạo đại học để tiến hành chấm điểm và phê duyệt chính thức.']
];

const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
ws1['!cols'] = [
  { width: 34 },
  { width: 22 },
  { width: 65 },
  { width: 38 }
];
XLSX.utils.book_append_sheet(wb, ws1, '1. Huong_Dan_Su_Dung');

// ==========================================
// SHEET 2: KPI MÔN HỌC (COURSES KPI)
// ==========================================
const sheet2Headers = [
  [
    'STT', 'Mã CT', 'Khóa / Lớp', 'Học kỳ', 'Năm học', 'Mã môn', 'Tên môn học', 
    'Điều phối viên', 'Giảng viên', 'Số GV', 'Số SV',
    'Mục tiêu Đi học (%)', 'Mục tiêu Pass 1st (%)', 'Mục tiêu Nộp bài (%)',
    'Thực tế Đi học (%)', 'Thực tế Pass 1st (%)', 'Thực tế Pass Resit (%)', 'Thực tế Nộp bài (%)',
    'Hoàn thành Đi học (%)', 'Hoàn thành Pass sau Resit (%)', 'Hoàn thành Nộp bài (%)', 'Hoàn thành chung Môn (%)',
    'Trạng thái / Ghi chú'
  ]
];

// Dữ liệu mẫu chuẩn của các chương trình thực tế Viện ISME
const sheet2SampleRows = [
  [
    1, 'BBAE', 'BBAE 12', 'SEM 2', 2, 'MKT301', 'Digital Marketing Strategy',
    'Nguyễn Minh Tuấn', 'TS. Nguyễn Văn A', 2, 45,
    95, 80, 90,
    98.5, 82, 5, 96,
    { t: 'n', f: 'IF(OR(L2="N/A",O2="N/A"),"N/A",ROUND(O2/L2*100,1))' },
    { t: 'n', f: 'IF(OR(M2="N/A",P2="N/A"),"N/A",ROUND(IF(P2/M2>=1,P2/M2,MIN(1,(P2/M2)+(IF(OR(Q2="N/A",Q2=""),0,Q2/M2))))*100,1))' },
    { t: 'n', f: 'IF(OR(N2="N/A",R2="N/A"),"N/A",ROUND(R2/N2*100,1))' },
    { t: 'n', f: 'ROUND(AVERAGE(S2:U2),1)' },
    'Kỳ hiện tại - Hoàn thành tốt'
  ],
  [
    2, 'BBAE', 'BBAE 12', 'SEM 2', 2, 'FIN202', 'Corporate Financial Management',
    'Nguyễn Minh Tuấn', 'ThS. Trần Thị B', 2, 42,
    95, 75, 90,
    96, 78, 6, 92,
    { t: 'n', f: 'IF(OR(L3="N/A",O3="N/A"),"N/A",ROUND(O3/L3*100,1))' },
    { t: 'n', f: 'IF(OR(M3="N/A",P3="N/A"),"N/A",ROUND(IF(P3/M3>=1,P3/M3,MIN(1,(P3/M3)+(IF(OR(Q3="N/A",Q3=""),0,Q3/M3))))*100,1))' },
    { t: 'n', f: 'IF(OR(N3="N/A",R3="N/A"),"N/A",ROUND(R3/N3*100,1))' },
    { t: 'n', f: 'ROUND(AVERAGE(S3:U3),1)' },
    'Kỳ hiện tại'
  ],
  [
    3, 'UWE', 'I18 MT - IBM', 'SEM 2', 3, 'UMAD5S-15-3', 'Managing Finance in a Strategic Context',
    'Vũ Minh Nhật', 'TS. Lê Hoàng C', 2, 38,
    90, 80, 90,
    93, 76, 12, 94,
    { t: 'n', f: 'IF(OR(L4="N/A",O4="N/A"),"N/A",ROUND(O4/L4*100,1))' },
    { t: 'n', f: 'IF(OR(M4="N/A",P4="N/A"),"N/A",ROUND(IF(P4/M4>=1,P4/M4,MIN(1,(P4/M4)+(IF(OR(Q4="N/A",Q4=""),0,Q4/M4))))*100,1))' },
    { t: 'n', f: 'IF(OR(N4="N/A",R4="N/A"),"N/A",ROUND(R4/N4*100,1))' },
    { t: 'n', f: 'ROUND(AVERAGE(S4:U4),1)' },
    'Kỳ hiện tại - Đã xét bù Resit'
  ],
  [
    4, 'BTEC', 'BTEC HND K14', 'SEM 2', 2, 'RQF21.CBE', 'The Contemporary Business Environment',
    'Trần Hương Thảo', 'ThS. Đỗ Minh D', 2, 50,
    95, 80, 90,
    94, 85, 0, 95,
    { t: 'n', f: 'IF(OR(L5="N/A",O5="N/A"),"N/A",ROUND(O5/L5*100,1))' },
    { t: 'n', f: 'IF(OR(M5="N/A",P5="N/A"),"N/A",ROUND(IF(P5/M5>=1,P5/M5,MIN(1,(P5/M5)+(IF(OR(Q5="N/A",Q5=""),0,Q5/M5))))*100,1))' },
    { t: 'n', f: 'IF(OR(N5="N/A",R5="N/A"),"N/A",ROUND(R5/N5*100,1))' },
    { t: 'n', f: 'ROUND(AVERAGE(S5:U5),1)' },
    'Kỳ hiện tại'
  ],
  [
    5, 'NHTC', 'BScBF I19', 'SEM 2', 3, 'BF305', 'Commercial Banking Operations',
    'Trần Thị Bích Ngọc', 'PGS.TS. Vũ Đình E', 1, 35,
    95, 85, 95,
    97, 88, 4, 98,
    { t: 'n', f: 'IF(OR(L6="N/A",O6="N/A"),"N/A",ROUND(O6/L6*100,1))' },
    { t: 'n', f: 'IF(OR(M6="N/A",P6="N/A"),"N/A",ROUND(IF(P6/M6>=1,P6/M6,MIN(1,(P6/M6)+(IF(OR(Q6="N/A",Q6=""),0,Q6/M6))))*100,1))' },
    { t: 'n', f: 'IF(OR(N6="N/A",R6="N/A"),"N/A",ROUND(R6/N6*100,1))' },
    { t: 'n', f: 'ROUND(AVERAGE(S6:U6),1)' },
    'Kỳ hiện tại'
  ],
  [
    6, 'AU', 'AU Cohort 5', 'SEM 2', 1, 'ECON201', 'Principles of Macroeconomics',
    'Đào Ngọc Diệp', 'TS. Paul Anderson', 2, 28,
    90, 75, 85,
    92, 79, 6, 88,
    { t: 'n', f: 'IF(OR(L7="N/A",O7="N/A"),"N/A",ROUND(O7/L7*100,1))' },
    { t: 'n', f: 'IF(OR(M7="N/A",P7="N/A"),"N/A",ROUND(IF(P7/M7>=1,P7/M7,MIN(1,(P7/M7)+(IF(OR(Q7="N/A",Q7=""),0,Q7/M7))))*100,1))' },
    { t: 'n', f: 'IF(OR(N7="N/A",R7="N/A"),"N/A",ROUND(R7/N7*100,1))' },
    { t: 'n', f: 'ROUND(AVERAGE(S7:U7),1)' },
    'Kỳ hiện tại'
  ]
];

// Thêm các dòng trống sẵn sàng cho nhân sự điền thêm
for (let i = 7; i <= 30; i++) {
  sheet2SampleRows.push([
    i, '', '', 'SEM 2', '', '', '',
    '', '', '', '',
    95, 80, 90,
    '', '', '', '',
    { t: 'n', f: `IF(OR(L${i+1}="N/A",O${i+1}="N/A",O${i+1}=""),"N/A",ROUND(O${i+1}/L${i+1}*100,1))` },
    { t: 'n', f: `IF(OR(M${i+1}="N/A",P${i+1}="N/A",P${i+1}=""),"N/A",ROUND(IF(P${i+1}/M${i+1}>=1,P${i+1}/M${i+1},MIN(1,(P${i+1}/M${i+1})+(IF(OR(Q${i+1}="N/A",Q${i+1}=""),0,Q${i+1}/M${i+1}))))*100,1))` },
    { t: 'n', f: `IF(OR(N${i+1}="N/A",R${i+1}="N/A",R${i+1}=""),"N/A",ROUND(R${i+1}/N${i+1}*100,1))` },
    { t: 'n', f: `IF(COUNT(S${i+1}:U${i+1})>0,ROUND(AVERAGE(S${i+1}:U${i+1}),1),"")` },
    ''
  ]);
}

const ws2 = XLSX.utils.aoa_to_sheet([...sheet2Headers, ...sheet2SampleRows]);
ws2['!cols'] = [
  { width: 6 },   // STT
  { width: 10 },  // Mã CT
  { width: 16 },  // Khóa/Lớp
  { width: 12 },  // Học kỳ
  { width: 10 },  // Năm học
  { width: 15 },  // Mã môn
  { width: 36 },  // Tên môn học
  { width: 22 },  // Điều phối viên
  { width: 22 },  // Giảng viên
  { width: 8 },   // Số GV
  { width: 8 },   // Số SV
  { width: 15 },  // Mục tiêu Đi học
  { width: 16 },  // Mục tiêu Pass 1st
  { width: 16 },  // Mục tiêu Nộp bài
  { width: 15 },  // Thực tế Đi học
  { width: 16 },  // Thực tế Pass 1st
  { width: 16 },  // Thực tế Pass Resit
  { width: 16 },  // Thực tế Nộp bài
  { width: 18 },  // Hoàn thành Đi học
  { width: 22 },  // Hoàn thành Pass sau Resit
  { width: 18 },  // Hoàn thành Nộp bài
  { width: 20 },  // Hoàn thành chung Môn
  { width: 25 }   // Trạng thái/Ghi chú
];
XLSX.utils.book_append_sheet(wb, ws2, '2. KPI_Mon_Hoc');

// ==========================================
// SHEET 3: KPI VẬN HÀNH & CHỈ TIÊU CÁ NHÂN
// ==========================================
const sheet3Headers = [
  ['BẢNG TỰ ĐÁNH GIÁ CHỈ TIÊU VẬN HÀNH & HOẠT ĐỘNG CÁ NHÂN (HỌC KỲ 2 2025-2026)'],
  ['Họ và tên nhân sự: .....................................................    Chương trình phụ trách: ...........................................'],
  [''],
  [
    'STT', 'Mã chỉ tiêu', 'Nhóm chỉ tiêu', 'Tên chỉ tiêu', 'Tiêu chí đo lường chất lượng & Yêu cầu', 
    'Đơn vị tính', 'Trọng số nhóm (%)', 'Chỉ tiêu Kế hoạch (Target)', 'Kết quả Thực hiện (Actual)', 
    'Tự chấm (%)', 'Minh chứng / Link hồ sơ kiểm tra', 'Tự nhận xét / Giải trình (100 - 200 từ)', 
    'Trưởng ban chấm (0-100)', 'Đánh giá của Trưởng ban (100 - 200 từ)'
  ]
];

const sheet3Rows = [
  // I. VẬN HÀNH (50%)
  [1, 'op1', 'I. Vận hành (50%)', 'Quản lý học liệu', 'Tỷ lệ các môn học có đầy đủ đề cương, tài liệu bài giảng, syllabus được cập nhật đúng tiến độ', '%', '5%', 100, 100, 100, 'https://drive.google.com/drive/folders/...', 'Nhân sự đã hoàn thành cập nhật 100% học liệu cho tất cả các môn trước ngày khai giảng 1 tuần.', 100, 'Tài liệu đầy đủ, chỉn chu, đúng tiến độ.'],
  [2, 'op2', 'I. Vận hành (50%)', 'Quản lý tài liệu liên quan GV', 'Cung cấp thông tin phục vụ hoàn thiện thủ tục ký HĐ giảng, thanh lý hợp đồng và thanh toán tiền giảng/chấm bài đúng hạn', '%', '5%', 100, 100, 100, '', 'Hồ sơ GV, hợp đồng giảng và chấm thi được hoàn tất đúng hạn.', 100, 'Hồ sơ đầy đủ, không phát sinh chậm trễ.'],
  [3, 'op3', 'I. Vận hành (50%)', 'Vận hành Lớp học', 'Tổ chức lớp học (Thông báo TKB cho GV & SV, tạo lớp Moodle/LMS, tạo account, enroll GV và SV đầy đủ)', '%', '5%', 100, 100, 100, '', 'Đã tạo đầy đủ các lớp trên hệ thống và enroll 100% sinh viên.', 100, 'Lớp học vận hành ổn định.'],
  [4, 'op4', 'I. Vận hành (50%)', 'Quản lý điểm', 'Theo dõi, đôn đốc tiến độ nhập điểm đúng hạn, rà soát bảng điểm trên hệ thống, xử lý điểm phúc khảo', '%', '5%', 100, 100, 100, '', 'Toàn bộ điểm thành phần và điểm tổng kết được cập nhật đúng hạn quy định.', 100, 'Hoàn thành tốt, không có sai sót bảng điểm.'],
  [5, 'op5_op', 'I. Vận hành (50%)', 'HĐ Ngoại khóa - Vận hành', 'Công tác tổ chức hậu cần, thủ tục, setup các buổi tọa đàm, hội thảo, guest speaker, field trip đúng tiến độ', 'Hoạt động', '5%', 4, 4, 100, '', 'Đã triển khai tổ chức thành công 4 buổi tọa đàm và field trip theo kế hoạch năm học.', 100, 'Khâu tổ chức chu đáo, chuyên nghiệp.'],
  [6, 'op6', 'I. Vận hành (50%)', 'Rà soát kết quả học tập', 'Rà soát kết quả học tập, lập file theo dõi học vụ và hồ sơ hoàn thành chương trình của sinh viên', '%', '5%', 100, 100, 100, '', 'Rà soát 100% kết quả học tập đúng biểu mẫu và gửi sinh viên đúng hạn.', 100, 'Hồ sơ rà soát chuẩn mực.'],
  [7, 'op7', 'I. Vận hành (50%)', 'Turnitin & Liêm chính', 'Giám sát liêm chính học thuật, tỷ lệ môn học có báo cáo kiểm tra trùng lặp qua Turnitin theo quy định', '%', '5%', 100, 100, 100, '', 'Tất cả bài tập lớn/tiểu luận đều được quét Turnitin và lập báo cáo đối soát.', 100, 'Giám sát nghiêm túc, đúng quy chế.'],
  [8, 'op8', 'I. Vận hành (50%)', 'Xử lý phản hồi SV & GV', 'Xử lý kiến nghị của sinh viên và giảng viên kịp thời (đảm bảo sinh viên KHÔNG phải phản ánh vượt cấp)', '%', '5%', 100, 100, 100, '', 'Mọi thắc mắc của sinh viên được phản hồi trong vòng 24h làm việc.', 100, 'Kịp thời, không có khiếu nại vượt cấp.'],
  [9, 'op9', 'I. Vận hành (50%)', 'Module report & Feedback', 'Hoàn thành module report và gửi báo cáo tổng kết feedback của sinh viên cho giảng viên bộ môn', '%', '5%', 100, 100, 100, '', 'Đã hoàn thành khảo sát và gửi feedback cho toàn bộ giảng viên cuối kỳ.', 100, 'Báo cáo feedback rõ ràng, khách quan.'],
  [10, 'op10', 'I. Vận hành (50%)', 'Quản lý Hồ sơ SV', 'Quản lý tiến trình học tập của SV (giấy xác nhận, đăng ký lớp học lại, bảo lưu, chuyển tiếp...) đồng bộ dữ liệu', '%', '5%', 100, 100, 100, '', '100% yêu cầu học vụ và cấp giấy tờ của SV được giải quyết đúng hẹn.', 100, 'Hồ sơ quản lý ngăn nắp, chính xác.'],
  
  // II. HỖ TRỢ HỌC TẬP (20%)
  [11, 'op5_as', 'II. Hỗ trợ học tập (20%)', 'HĐ Ngoại khóa - Hỗ trợ học tập', 'Đo lường hiệu quả học thuật và giá trị hỗ trợ sinh viên từ các hoạt động ngoại khóa (tỷ lệ tham gia, độ hài lòng SV)', '%', '20%', 100, 100, 100, 'https://drive.google.com/drive/folders/...', 'Các hội thảo học thuật mang lại giá trị thiết thực, tỷ lệ sinh viên tham dự đạt trên 85% và mức độ hài lòng đạt 94%.', 100, 'Chương trình có chiều sâu học thuật cao, nhận được phản hồi rất tích cực.'],
  
  // IV. HOẠT ĐỘNG KHÁC (10%)
  [12, 'other11', 'IV. Hoạt động khác (10%)', 'Công tác Tuyển sinh', 'Tham gia tích cực vào các hoạt động tư vấn, ngày hội tuyển sinh, open day, workshop định hướng của Viện', 'Hoạt động', '4%', 10, 10, 100, '', 'Đã tham gia tích cực 10 đợt tư vấn tuyển sinh và hỗ trợ truyền thông các chương trình.', 100, 'Nhiệt tình, trách nhiệm trong công tác tuyển sinh.'],
  [13, 'other12', 'IV. Hoạt động khác (10%)', 'Hỗ trợ Du học & Trao đổi', 'Tỷ lệ sinh viên có nguyện vọng du học, chuyển tiếp, trao đổi quốc tế được hướng dẫn hoàn thiện hồ sơ', '%', '3%', 100, 100, 100, '', 'Đã hỗ trợ thành công 100% hồ sơ sinh viên đăng ký chuyển tiếp và exchange kỳ này.', 100, 'Hỗ trợ chu đáo, hồ sơ chuẩn bị đầy đủ.'],
  [14, 'other13', 'IV. Hoạt động khác (10%)', 'Đóng góp phát triển chung', 'Tham gia các hoạt động phong trào, sự kiện lớn của Viện, hỗ trợ công tác đoàn thể, nghiên cứu khoa học...', 'Hoạt động', '3%', 5, 5, 100, '', 'Đóng góp tích cực vào các sự kiện chào tân sinh viên, kỷ niệm thành lập Viện và các hoạt động chung.', 100, 'Ý thức trách nhiệm tập thể rất tốt.']
];

const ws3 = XLSX.utils.aoa_to_sheet([...sheet3Headers, ...sheet3Rows]);
ws3['!cols'] = [
  { width: 6 },   // STT
  { width: 12 },  // Mã chỉ tiêu
  { width: 22 },  // Nhóm
  { width: 28 },  // Tên chỉ tiêu
  { width: 45 },  // Tiêu chí đo lường
  { width: 10 },  // Đơn vị
  { width: 16 },  // Trọng số
  { width: 16 },  // Kế hoạch
  { width: 16 },  // Thực hiện
  { width: 14 },  // Tự chấm (%)
  { width: 35 },  // Minh chứng
  { width: 35 },  // Tự nhận xét
  { width: 18 },  // Trưởng ban chấm
  { width: 35 }   // Nhận xét Trưởng ban
];
XLSX.utils.book_append_sheet(wb, ws3, '3. KPI_Van_Hanh_Ca_Nhan');

// ==========================================
// SHEET 4: DANH MỤC CHUẨN (LOOKUP MASTER DATA)
// ==========================================
const sheet4Data = [
  ['DANH MỤC CHUẨN HỆ THỐNG ISME OPS OS (DÙNG ĐỂ TRA CỨU & ĐỐI CHIẾU)'],
  [''],
  ['1. DANH MỤC CHƯƠNG TRÌNH ĐÀO TẠO'],
  ['Mã CT (Program Code)', 'Tên chương trình đầy đủ', 'Loại hình', 'Người phụ trách chính', 'Email liên hệ'],
  ['BBAE', 'Chương trình Cử nhân Khởi nghiệp & Phát triển kinh doanh (BBAE)', 'Degree (Chính quy)', 'Nguyễn Minh Tuấn', 'nguyen.tuan@isneu.org'],
  ['UWE', 'Chương trình Cử nhân Top-up ĐH West of England (UWE)', 'Degree (Liên kết)', 'Vũ Minh Nhật', 'vu.nhat@isneu.org'],
  ['NHTC', 'Chương trình Cử nhân Ngân hàng - Tài chính Quốc tế', 'Degree (Chính quy)', 'Trần Thị Bích Ngọc', 'tran.ngoc@isneu.org'],
  ['BTEC', 'Chương trình Cao đẳng Quốc tế BTEC HND', 'Certificate (Cao đẳng)', 'Trần Hương Thảo', 'tran.thao@isneu.org'],
  ['CU', 'Chương trình Cử nhân Top-up ĐH Coventry (CU)', 'Degree (Liên kết)', 'Nguyễn Giang Khánh Huyền', 'nguyen.huyen@isneu.org'],
  ['AU', 'Chương trình Cử nhân ĐH Andrews (AU)', 'Degree (Liên kết)', 'Đào Ngọc Diệp', 'dao.diep@isneu.org'],
  ['DM', 'Chương trình Cử nhân Digital Marketing', 'Degree (Chính quy)', 'Bùi Thu Trang', 'bui.thutrang@isneu.org'],
  ['NAM1', 'Ban Quản lý & Vận hành Chương trình Năm 1', 'Đào tạo cơ sở', 'Bùi Thị Quỳnh Trang', 'bui.trang@isneu.org'],
  [''],
  ['2. QUY CHUẨN HỌC KỲ (SEMESTER)'],
  ['Mã học kỳ chuẩn', 'Mô tả', 'Thời gian áp dụng'],
  ['SEM 1', 'Học kỳ 1 (Fall Semester)', 'Từ tháng 08 đến tháng 01 năm sau'],
  ['SEM 2', 'Học kỳ 2 (Spring Semester - Kỳ hiện tại)', 'Từ tháng 02 đến tháng 07'],
  ['SEM SUMMER', 'Học kỳ Hè (Summer Semester)', 'Từ tháng 06 đến tháng 08'],
  ['SEM SPRING', 'Học kỳ Mùa Xuân (Chương trình Năm 1)', 'Theo khung chương trình Năm 1'],
  ['SEM FALL & SPRING', 'Học kỳ trọn năm', 'Theo khung môn học kéo dài'],
  [''],
  ['3. THANG ĐO XẾP LOẠI KPI'],
  ['Mức hoàn thành (%)', 'Xếp loại', 'Quy định xử lý'],
  ['>= 100%', 'Xuất sắc (A+)', 'Khen thưởng hiệu suất cao, đạt vượt chỉ tiêu'],
  ['90% - 99%', 'Tốt (A)', 'Hoàn thành tốt nhiệm vụ được giao'],
  ['85% - 89%', 'Đạt yêu cầu (B)', 'Đạt ngưỡng sàn tối thiểu của Viện'],
  ['< 85%', 'Chưa đạt (Cần cải thiện)', 'Cảnh báo hiệu suất, yêu cầu lập kế hoạch khắc phục và báo cáo Trưởng ban']
];

const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
ws4['!cols'] = [
  { width: 25 },
  { width: 45 },
  { width: 25 },
  { width: 25 },
  { width: 30 }
];
XLSX.utils.book_append_sheet(wb, ws4, '4. Danh_Muc_Chuan');

// Xuất file
const fileName = 'Mau_Nhap_Lieu_KPI_Va_Mon_Hoc_ISME_2026.xlsx';
const outputPath = path.join(process.cwd(), fileName);
const publicPath = path.join(process.cwd(), 'public', fileName);
const artifactDir = '/Users/tungnguyen/.gemini/antigravity-ide/brain/cb94dea0-e2eb-4a79-b910-5d1fc1bbf464';
const artifactPath = path.join(artifactDir, fileName);

XLSX.writeFile(wb, outputPath);
console.log('Created file at:', outputPath);

// Đảm bảo thư mục public tồn tại
if (fs.existsSync(path.join(process.cwd(), 'public'))) {
  XLSX.writeFile(wb, publicPath);
  console.log('Created file at:', publicPath);
}

// Lưu vào thư mục artifacts
if (fs.existsSync(artifactDir)) {
  XLSX.writeFile(wb, artifactPath);
  console.log('Created file at:', artifactPath);
}
