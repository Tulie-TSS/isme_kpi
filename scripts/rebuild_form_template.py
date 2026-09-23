import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os

def create_kpi_form():
    wb = openpyxl.Workbook()
    
    FONT_FAMILY = 'Segoe UI'
    
    # Fonts
    f_main_title = Font(name=FONT_FAMILY, size=14, bold=True, color='FFFFFF')
    f_org_title = Font(name=FONT_FAMILY, size=10, bold=True, color='94A3B8')
    f_subtitle = Font(name=FONT_FAMILY, size=9, italic=True, color='E2E8F0')
    
    f_meta_label = Font(name=FONT_FAMILY, size=9, bold=True, color='334155')
    f_meta_val = Font(name=FONT_FAMILY, size=9, color='0F172A')
    
    f_sec_title = Font(name=FONT_FAMILY, size=10, bold=True, color='FFFFFF')
    f_th = Font(name=FONT_FAMILY, size=9, bold=True, color='FFFFFF')
    f_th_dark = Font(name=FONT_FAMILY, size=9, bold=True, color='1E293B')
    
    f_row = Font(name=FONT_FAMILY, size=9, color='1E293B')
    f_row_bold = Font(name=FONT_FAMILY, size=9, bold=True, color='0F172A')
    f_row_code = Font(name=FONT_FAMILY, size=9, bold=True, color='1D4ED8')
    f_formula = Font(name=FONT_FAMILY, size=9, bold=True, color='166534') # Dark green
    f_eval = Font(name=FONT_FAMILY, size=9, bold=True, color='9A3412') # Dark orange
    f_summary = Font(name=FONT_FAMILY, size=9, bold=True, color='0F172A')
    
    # Fills
    fill_dark_navy = PatternFill(start_color='0F172A', end_color='0F172A', fill_type='solid') # Slate 900
    fill_header_navy = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid') # Blue 900
    fill_th = PatternFill(start_color='334155', end_color='334155', fill_type='solid') # Slate 700
    fill_th_light = PatternFill(start_color='E2E8F0', end_color='E2E8F0', fill_type='solid') # Slate 200
    
    fill_sec_op = PatternFill(start_color='1E40AF', end_color='1E40AF', fill_type='solid') # Blue 800 (50%)
    fill_sec_as = PatternFill(start_color='0F766E', end_color='0F766E', fill_type='solid') # Teal 700 (20%)
    fill_sec_other = PatternFill(start_color='6D28D9', end_color='6D28D9', fill_type='solid') # Purple 700 (10%)
    fill_sec_summary = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid') # Slate 800 (Overview)
    
    fill_yellow_input = PatternFill(start_color='FEF9C3', end_color='FEF9C3', fill_type='solid') # Yellow 100 (Input)
    fill_green_formula = PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid') # Green 100 (Formula)
    fill_orange_eval = PatternFill(start_color='FFEDD5', end_color='FFEDD5', fill_type='solid') # Orange 100 (Manager)
    fill_zebra = PatternFill(start_color='F8FAFC', end_color='F8FAFC', fill_type='solid') # Slate 50
    fill_highlight = PatternFill(start_color='F1F5F9', end_color='F1F5F9', fill_type='solid') # Slate 100
    
    # Borders
    b_thin = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    b_double = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='475569'),
        bottom=Side(style='double', color='0F172A')
    )
    b_header = Border(
        left=Side(style='thin', color='475569'),
        right=Side(style='thin', color='475569'),
        top=Side(style='thin', color='475569'),
        bottom=Side(style='medium', color='0F172A')
    )
    
    # Alignments
    al_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
    al_left = Alignment(horizontal='left', vertical='center', wrap_text=True)
    al_right = Alignment(horizontal='right', vertical='center')

    # =========================================================================
    # SHEET 1: OPERATION (50%) & HĐ HTHT (20%)
    # =========================================================================
    ws1 = wb.active
    ws1.title = 'OPERATION (50%) & HĐ HTHT (20%)'
    ws1.views.sheetView[0].showGridLines = True
    
    col_widths_1 = {
        'A': 6,   # STT
        'B': 24,  # Đầu mục CV
        'C': 34,  # Mô tả chi tiết
        'D': 46,  # Tiêu chí đánh giá
        'E': 10,  # ĐVT
        'F': 12,  # Mục tiêu
        'G': 14,  # SL giao
        'H': 15,  # SL hoàn thành (tự ĐG)
        'I': 14,  # Tỉ lệ hoàn thành (%)
        'J': 15,  # Điểm QL đánh giá (1-100)
        'K': 32   # Ghi chú / Minh chứng
    }
    for col, width in col_widths_1.items():
        ws1.column_dimensions[col].width = width

    # Row 1-3: Header Banner
    ws1.merge_cells('A1:K1')
    c1 = ws1['A1']
    c1.value = 'VIỆN ĐÀO TẠO QUỐC TẾ (ISME) — TRƯỜNG ĐẠI HỌC KINH TẾ QUỐC DÂN'
    c1.font = f_org_title
    c1.fill = fill_dark_navy
    c1.alignment = al_center
    ws1.row_dimensions[1].height = 24

    ws1.merge_cells('A2:K2')
    c2 = ws1['A2']
    c2.value = 'BẢNG TỰ ĐÁNH GIÁ & THEO DÕI KPI CHUYÊN VIÊN ĐIỀU PHỐI (COORDINATOR)'
    c2.font = f_main_title
    c2.fill = fill_header_navy
    c2.alignment = al_center
    ws1.row_dimensions[2].height = 34

    ws1.merge_cells('A3:K3')
    c3 = ws1['A3']
    c3.value = 'Cơ cấu 4 nhóm trọng số: Vận hành (50%) · Hỗ trợ học tập (20%) · Kết quả sinh viên & Kỷ luật (20%) · Hoạt động khác (10%)'
    c3.font = f_subtitle
    c3.fill = fill_header_navy
    c3.alignment = al_center
    ws1.row_dimensions[3].height = 20

    # Row 4: Spacer
    ws1.row_dimensions[4].height = 8

    # Row 5-7: Meta Information (Thẻ thông tin)
    meta_rows = [
        ('Họ và tên Coordinator:', '', 'Kỳ đánh giá:', 'Kỳ 2 2025-2026', 'Năm học:', '2025 - 2026'),
        ('Chức danh công việc:', 'Chuyên viên điều phối chương trình', 'Chương trình phụ trách:', '[Điền tên CT: BBAE, BTEC, UWE, CU, NHTc, Năm 1...]', '', ''),
        ('Cán bộ quản lý trực tiếp:', 'Hồ Hoàng Lan - Trưởng Ban Đào tạo ĐH', 'Mã nhân viên / Email:', '', 'Ngày hoàn thành:', '')
    ]
    for idx, (lbl1, val1, lbl2, val2, lbl3, val3) in enumerate(meta_rows, start=5):
        ws1.row_dimensions[idx].height = 24
        ws1[f'B{idx}'].value = lbl1
        ws1[f'B{idx}'].font = f_meta_label
        ws1[f'B{idx}'].alignment = Alignment(horizontal='right', vertical='center')
        
        ws1.merge_cells(f'C{idx}:D{idx}')
        c_val1 = ws1[f'C{idx}']
        c_val1.value = val1
        c_val1.font = f_meta_val
        c_val1.alignment = al_left
        c_val1.border = b_thin
        if not val1:
            c_val1.fill = fill_yellow_input
            
        ws1[f'F{idx}'].value = lbl2
        ws1[f'F{idx}'].font = f_meta_label
        ws1[f'F{idx}'].alignment = Alignment(horizontal='right', vertical='center')
        
        if lbl3:
            ws1.merge_cells(f'G{idx}:H{idx}')
            c_val2 = ws1[f'G{idx}']
            c_val2.value = val2
            c_val2.font = f_meta_val
            c_val2.alignment = al_left
            c_val2.border = b_thin
            c_val2.fill = fill_yellow_input
            
            ws1[f'I{idx}'].value = lbl3
            ws1[f'I{idx}'].font = f_meta_label
            ws1[f'I{idx}'].alignment = Alignment(horizontal='right', vertical='center')
            
            ws1.merge_cells(f'J{idx}:K{idx}')
            c_val3 = ws1[f'J{idx}']
            c_val3.value = val3
            c_val3.font = f_meta_val
            c_val3.alignment = al_left
            c_val3.border = b_thin
            c_val3.fill = fill_yellow_input
        else:
            ws1.merge_cells(f'G{idx}:K{idx}')
            c_val2 = ws1[f'G{idx}']
            c_val2.value = val2
            c_val2.font = f_meta_val
            c_val2.alignment = al_left
            c_val2.border = b_thin
            c_val2.fill = fill_yellow_input

    # Row 8: Spacer
    ws1.row_dimensions[8].height = 10

    # =========================================================================
    # BẢNG TỔNG HỢP KPI TOÀN DIỆN (100%) - TỰ ĐỘNG TÍNH THEO TRỌNG SỐ
    # =========================================================================
    ws1.merge_cells('B9:K9')
    c_sum_title = ws1['B9']
    c_sum_title.value = 'BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ KPI TOÀN DIỆN (TỰ ĐỘNG TÍNH THEO TRỌNG SỐ)'
    c_sum_title.font = f_sec_title
    c_sum_title.fill = fill_sec_summary
    c_sum_title.alignment = al_center
    ws1.row_dimensions[9].height = 26

    sum_headers = [
        ('B10:E10', 'NHÓM TIÊU CHUẨN ĐÁNH GIÁ KPI'),
        ('F10', 'TRỌNG SỐ'),
        ('G10:H10', 'ĐIỂM TỰ ĐÁNH GIÁ'),
        ('I10', 'ĐIỂM QUẢN LÝ'),
        ('J10:K10', 'ĐIỂM QUY ĐỔI TRỌNG SỐ')
    ]
    ws1.row_dimensions[10].height = 24
    for cell_range, text in sum_headers:
        if ':' in cell_range:
            ws1.merge_cells(cell_range)
            first_cell = ws1[cell_range.split(':')[0]]
        else:
            first_cell = ws1[cell_range]
        first_cell.value = text
        first_cell.font = f_th_dark
        first_cell.fill = fill_th_light
        first_cell.alignment = al_center
        first_cell.border = b_thin

    # Summary table rows (Rows 11 to 14)
    # References:
    # Operations (50%): Subtotal is at Row 29 (I29 for self, J29 for mgr)
    # Academic Support (20%): Subtotal is at Row 33 (I33 for self, J33 for mgr)
    # Student Results (20%): Average is at Sheet 2 Row 32 (Q32)
    # Other Activities (10%): Subtotal is at Row 39 (I39 for self, J39 for mgr)
    summary_rows_def = [
        (11, 'Nhóm I: Vận hành công việc theo mô tả CV (Operations)', 0.50, '=I29', '=IF(J29>1,J29/100,J29)', '=G11*F11'),
        (12, 'Nhóm II: Hoạt động hỗ trợ học tập (Academic Support)', 0.20, '=I33', '=IF(J33>1,J33/100,J33)', '=G12*F12'),
        (13, 'Nhóm III: Kết quả học tập & Kỷ luật của SV (Sheet 2)', 0.20, "='KQ SV & KỶ LUẬT SV (20%)'!Q32", "='KQ SV & KỶ LUẬT SV (20%)'!Q32", '=G13*F13'),
        (14, 'Nhóm IV: Các hoạt động khác (Tuyển sinh, Du học, Ban/Viện)', 0.10, '=I39', '=IF(J39>1,J39/100,J39)', '=G14*F14'),
    ]

    for r_idx, label, weight, f_self, f_mgr, f_weighted in summary_rows_def:
        ws1.row_dimensions[r_idx].height = 24
        ws1.merge_cells(f'B{r_idx}:E{r_idx}')
        c_lbl = ws1[f'B{r_idx}']
        c_lbl.value = label
        c_lbl.font = f_row_bold
        c_lbl.alignment = Alignment(horizontal='left', vertical='center', indent=1)
        c_lbl.border = b_thin
        
        c_w = ws1[f'F{r_idx}']
        c_w.value = weight
        c_w.number_format = '0%'
        c_w.font = f_row_bold
        c_w.alignment = al_center
        c_w.border = b_thin
        
        ws1.merge_cells(f'G{r_idx}:H{r_idx}')
        c_self = ws1[f'G{r_idx}']
        c_self.value = f_self
        c_self.number_format = '0.0%'
        c_self.font = f_formula
        c_self.fill = fill_green_formula
        c_self.alignment = al_center
        c_self.border = b_thin
        
        c_mgr = ws1[f'I{r_idx}']
        c_mgr.value = f_mgr
        c_mgr.number_format = '0.0%'
        c_mgr.font = f_eval
        c_mgr.fill = fill_orange_eval
        c_mgr.alignment = al_center
        c_mgr.border = b_thin
        
        ws1.merge_cells(f'J{r_idx}:K{r_idx}')
        c_wtd = ws1[f'J{r_idx}']
        c_wtd.value = f_weighted
        c_wtd.number_format = '0.0%'
        c_wtd.font = f_formula
        c_wtd.fill = fill_green_formula
        c_wtd.alignment = al_center
        c_wtd.border = b_thin

    # Row 15: Grand Total Row
    ws1.row_dimensions[15].height = 28
    ws1.merge_cells('B15:E15')
    c_tot_lbl = ws1['B15']
    c_tot_lbl.value = 'TỔNG ĐIỂM KPI CHUNG TOÀN DIỆN CUỐI KỲ'
    c_tot_lbl.font = f_summary
    c_tot_lbl.alignment = Alignment(horizontal='left', vertical='center', indent=1)
    c_tot_lbl.fill = fill_highlight
    c_tot_lbl.border = b_double
    
    c_tot_w = ws1['F15']
    c_tot_w.value = '=SUM(F11:F14)'
    c_tot_w.number_format = '0%'
    c_tot_w.font = f_summary
    c_tot_w.alignment = al_center
    c_tot_w.fill = fill_highlight
    c_tot_w.border = b_double

    ws1.merge_cells('G15:H15')
    c_tot_self = ws1['G15']
    c_tot_self.value = '=SUM(J11:J14)'
    c_tot_self.number_format = '0.0%'
    c_tot_self.font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    c_tot_self.alignment = al_center
    c_tot_self.fill = fill_green_formula
    c_tot_self.border = b_double

    c_tot_mgr = ws1['I15']
    c_tot_mgr.value = '=SUMPRODUCT(I11:I14, F11:F14)'
    c_tot_mgr.number_format = '0.0%'
    c_tot_mgr.font = Font(name=FONT_FAMILY, size=10, bold=True, color='9A3412')
    c_tot_mgr.alignment = al_center
    c_tot_mgr.fill = fill_orange_eval
    c_tot_mgr.border = b_double

    ws1.merge_cells('J15:K15')
    c_tot_wtd = ws1['J15']
    c_tot_wtd.value = '=G15'
    c_tot_wtd.number_format = '0.0%'
    c_tot_wtd.font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    c_tot_wtd.alignment = al_center
    c_tot_wtd.fill = fill_green_formula
    c_tot_wtd.border = b_double

    # Row 16: Spacer
    ws1.row_dimensions[16].height = 14

    # =========================================================================
    # CHI TIẾT CÁC CHỈ TIÊU ĐÁNH GIÁ (DETAIL TABLE HEADERS - ROW 17)
    # =========================================================================
    ws1.row_dimensions[17].height = 36
    th_items = [
        ('A', 'STT'),
        ('B', 'Đầu mục công việc'),
        ('C', 'Mô tả chi tiết vị trí CV'),
        ('D', 'Tiêu chí đánh giá chất lượng & tiến độ'),
        ('E', 'Đơn vị đo'),
        ('F', 'Mục tiêu KPI'),
        ('G', 'Số lượng được giao'),
        ('H', 'SL hoàn thành\n(Tự đánh giá)'),
        ('I', 'Tỉ lệ hoàn thành\n(Tự đánh giá)'),
        ('J', 'Điểm Quản lý\n(Thang 1-100)'),
        ('K', 'Ghi chú / Giải trình minh chứng')
    ]
    for col_letter, text in th_items:
        cell = ws1[f'{col_letter}17']
        cell.value = text
        cell.font = f_th
        cell.fill = fill_th
        cell.alignment = al_center
        cell.border = b_header

    # =========================================================================
    # PHẦN I: OPERATIONS (50%) - ROWS 18 TO 29
    # =========================================================================
    ws1.merge_cells('A18:K18')
    c_sec1 = ws1['A18']
    c_sec1.value = 'PHẦN I: NHÓM KPI THEO MÔ TẢ CÔNG VIỆC — VẬN HÀNH (OPERATIONS) — TRỌNG SỐ: 50%'
    c_sec1.font = f_sec_title
    c_sec1.fill = fill_sec_op
    c_sec1.alignment = Alignment(horizontal='left', vertical='center', indent=1)
    ws1.row_dimensions[18].height = 28

    op_items = [
        ('1.1', 'Quản lý nội dung giảng dạy', 'Làm việc với nhóm GV từng môn về nội dung giảng dạy', 'Tỷ lệ các môn học có đầy đủ các tài liệu (SoW, Assessment Plan, Assignment Brief) theo yêu cầu và đúng tiến độ', '%', 1.0, 6, 6, 100),
        ('1.2', 'Quản lý tài liệu môn học', 'Cập nhật tài liệu giảng dạy trong quá trình đào tạo', 'Tỷ lệ các môn có đầy đủ tài liệu môn học trong quá trình đúng hạn', '%', 1.0, 6, 6, 100),
        ('2', 'Quản lý tài liệu GV', 'Cung cấp thông tin hoàn thiện hợp đồng, thanh lý, thanh toán tiền giảng/trợ giảng/chấm bài', 'Tỷ lệ giảng viên được cập nhật thông tin theo đúng tiến độ và kế hoạch vận hành', '%', 1.0, 10, 10, 100),
        ('3', 'Vận hành Lớp học', 'Tổ chức lớp học, làm & thông báo TKB, tạo lớp Moodle, cấp account GV & SV, enroll môn', 'Tỷ lệ các lớp được set up theo kế hoạch (Làm & TB TKB, Moodle, accounts, enroll GV/SV)', '%', 1.0, 16, 16, 100),
        ('4', 'Quản lý điểm', 'Quản lý điểm và quá trình đánh giá sinh viên theo quy chế', 'Tỷ lệ các môn học hoàn thành điểm theo đúng kế hoạch', '%', 1.0, 6, 6, 100),
        ('5', 'Rà soát kết quả học tập', 'Rà soát kết quả học tập, hồ sơ hoàn thành chương trình, xét điều kiện', 'Tỷ lệ các môn học có file kết quả rà soát theo yêu cầu', '%', 1.0, 6, 6, 100),
        ('6', 'Giám sát Turnitin', 'Giám sát liêm chính học thuật, kiểm tra trùng lặp bài tập/tiểu luận', 'Tỷ lệ các môn học có báo cáo kết quả rà soát Turnitin theo yêu cầu', '%', 1.0, 4, 4, 100),
        ('7', 'Phản hồi GV & SV', 'Tiếp nhận và xử lý các phản hồi, giải đáp thắc mắc của SV & GV', 'Số lượng kiến nghị của sinh viên được xử lý kịp thời (SV KHÔNG phải phản hồi lên cấp cao hơn)', '%', 1.0, 5, 5, 100),
        ('8', 'Module report & Khảo sát', 'Hoàn thành module report và gửi báo cáo phản hồi của SV cho GV', 'Tỉ lệ số môn học đã làm feedback và gửi report xử lý số liệu cho GV', '%', 1.0, 7, 7, 100),
        ('9', 'Quản lý tiến trình học tập SV', 'Quản lý tiến trình học tập, hồ sơ SV, giải quyết thủ tục (giấy xác nhận, học lại...)', 'Tỷ lệ hồ sơ sinh viên được cập nhật & giải quyết, đồng bộ thông tin chính xác theo các mốc tiến độ', '%', 1.0, 125, 125, 100),
    ]

    for idx, (stt, task, desc, criteria, unit, target, assigned, completed, mgr_score) in enumerate(op_items, start=19):
        ws1.row_dimensions[idx].height = 36
        is_even = (idx % 2 == 0)
        row_fill = fill_zebra if is_even else PatternFill(fill_type=None)

        ws1[f'A{idx}'].value = stt
        ws1[f'A{idx}'].font = f_row_code
        ws1[f'A{idx}'].alignment = al_center
        ws1[f'A{idx}'].border = b_thin
        ws1[f'A{idx}'].fill = row_fill

        ws1[f'B{idx}'].value = task
        ws1[f'B{idx}'].font = f_row_bold
        ws1[f'B{idx}'].alignment = al_left
        ws1[f'B{idx}'].border = b_thin
        ws1[f'B{idx}'].fill = row_fill

        ws1[f'C{idx}'].value = desc
        ws1[f'C{idx}'].font = f_row
        ws1[f'C{idx}'].alignment = al_left
        ws1[f'C{idx}'].border = b_thin
        ws1[f'C{idx}'].fill = row_fill

        ws1[f'D{idx}'].value = criteria
        ws1[f'D{idx}'].font = f_row
        ws1[f'D{idx}'].alignment = al_left
        ws1[f'D{idx}'].border = b_thin
        ws1[f'D{idx}'].fill = row_fill

        ws1[f'E{idx}'].value = unit
        ws1[f'E{idx}'].font = f_row
        ws1[f'E{idx}'].alignment = al_center
        ws1[f'E{idx}'].border = b_thin
        ws1[f'E{idx}'].fill = row_fill

        ws1[f'F{idx}'].value = target
        ws1[f'F{idx}'].number_format = '0%'
        ws1[f'F{idx}'].font = f_row_bold
        ws1[f'F{idx}'].alignment = al_center
        ws1[f'F{idx}'].border = b_thin
        ws1[f'F{idx}'].fill = row_fill

        ws1[f'G{idx}'].value = assigned
        ws1[f'G{idx}'].number_format = '#,##0'
        ws1[f'G{idx}'].font = f_row
        ws1[f'G{idx}'].alignment = al_center
        ws1[f'G{idx}'].fill = fill_yellow_input
        ws1[f'G{idx}'].border = b_thin

        ws1[f'H{idx}'].value = completed
        ws1[f'H{idx}'].number_format = '#,##0'
        ws1[f'H{idx}'].font = f_row
        ws1[f'H{idx}'].alignment = al_center
        ws1[f'H{idx}'].fill = fill_yellow_input
        ws1[f'H{idx}'].border = b_thin

        ws1[f'I{idx}'].value = f'=IF(OR(G{idx}=0,G{idx}=""),"",H{idx}/G{idx})'
        ws1[f'I{idx}'].number_format = '0.0%'
        ws1[f'I{idx}'].font = f_formula
        ws1[f'I{idx}'].fill = fill_green_formula
        ws1[f'I{idx}'].alignment = al_center
        ws1[f'I{idx}'].border = b_thin

        ws1[f'J{idx}'].value = mgr_score
        ws1[f'J{idx}'].number_format = '#,##0'
        ws1[f'J{idx}'].font = f_eval
        ws1[f'J{idx}'].fill = fill_orange_eval
        ws1[f'J{idx}'].alignment = al_center
        ws1[f'J{idx}'].border = b_thin

        ws1[f'K{idx}'].value = ''
        ws1[f'K{idx}'].font = f_row
        ws1[f'K{idx}'].alignment = al_left
        ws1[f'K{idx}'].border = b_thin

    # Subtotal Row for Part I (Row 29)
    ws1.row_dimensions[29].height = 28
    ws1.merge_cells('A29:H29')
    c_sub1 = ws1['A29']
    c_sub1.value = 'ĐIỂM TRUNG BÌNH NHÓM VẬN HÀNH (OPERATIONS — 50%)'
    c_sub1.font = f_summary
    c_sub1.alignment = Alignment(horizontal='right', vertical='center', indent=1)
    c_sub1.fill = fill_highlight
    c_sub1.border = b_double

    ws1['I29'].value = '=AVERAGE(I19:I28)'
    ws1['I29'].number_format = '0.0%'
    ws1['I29'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    ws1['I29'].alignment = al_center
    ws1['I29'].fill = fill_green_formula
    ws1['I29'].border = b_double

    ws1['J29'].value = '=AVERAGE(J19:J28)'
    ws1['J29'].number_format = '0.0'
    ws1['J29'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='9A3412')
    ws1['J29'].alignment = al_center
    ws1['J29'].fill = fill_orange_eval
    ws1['J29'].border = b_double

    ws1['K29'].value = 'Tự động tính trung bình cộng 10 chỉ tiêu trên'
    ws1['K29'].font = f_meta_label
    ws1['K29'].alignment = al_left
    ws1['K29'].border = b_double

    # Row 30: Spacer
    ws1.row_dimensions[30].height = 10

    # =========================================================================
    # PHẦN II: ACADEMIC SUPPORT (20%) - ROWS 31 TO 33
    # =========================================================================
    ws1.merge_cells('A31:K31')
    c_sec2 = ws1['A31']
    c_sec2.value = 'PHẦN II: NHÓM KPI HOẠT ĐỘNG HỖ TRỢ HỌC TẬP (ACADEMIC SUPPORT) — TRỌNG SỐ: 20%'
    c_sec2.font = f_sec_title
    c_sec2.fill = fill_sec_as
    c_sec2.alignment = Alignment(horizontal='left', vertical='center', indent=1)
    ws1.row_dimensions[31].height = 28

    # Row 32: Item 10
    ws1.row_dimensions[32].height = 36
    ws1['A32'].value = '10'
    ws1['A32'].font = f_row_code
    ws1['A32'].alignment = al_center
    ws1['A32'].border = b_thin

    ws1['B32'].value = 'Hoạt động ngoại khóa học tập'
    ws1['B32'].font = f_row_bold
    ws1['B32'].alignment = al_left
    ws1['B32'].border = b_thin

    ws1['C32'].value = 'Tổ chức hoạt động Tọa đàm, hội thảo chuyên đề, guest speaker, field trip, academic workshops'
    ws1['C32'].font = f_row
    ws1['C32'].alignment = al_left
    ws1['C32'].border = b_thin

    ws1['D32'].value = 'Số lượng các hoạt động hỗ trợ học tập được triển khai theo kế hoạch'
    ws1['D32'].font = f_row
    ws1['D32'].alignment = al_left
    ws1['D32'].border = b_thin

    ws1['E32'].value = '%'
    ws1['E32'].font = f_row
    ws1['E32'].alignment = al_center
    ws1['E32'].border = b_thin

    ws1['F32'].value = 1.0
    ws1['F32'].number_format = '0%'
    ws1['F32'].font = f_row_bold
    ws1['F32'].alignment = al_center
    ws1['F32'].border = b_thin

    ws1['G32'].value = 5
    ws1['G32'].number_format = '#,##0'
    ws1['G32'].font = f_row
    ws1['G32'].alignment = al_center
    ws1['G32'].fill = fill_yellow_input
    ws1['G32'].border = b_thin

    ws1['H32'].value = 5
    ws1['H32'].number_format = '#,##0'
    ws1['H32'].font = f_row
    ws1['H32'].alignment = al_center
    ws1['H32'].fill = fill_yellow_input
    ws1['H32'].border = b_thin

    ws1['I32'].value = '=IF(OR(G32=0,G32=""),"",H32/G32)'
    ws1['I32'].number_format = '0.0%'
    ws1['I32'].font = f_formula
    ws1['I32'].fill = fill_green_formula
    ws1['I32'].alignment = al_center
    ws1['I32'].border = b_thin

    ws1['J32'].value = 100
    ws1['J32'].number_format = '#,##0'
    ws1['J32'].font = f_eval
    ws1['J32'].fill = fill_orange_eval
    ws1['J32'].alignment = al_center
    ws1['J32'].border = b_thin

    ws1['K32'].value = ''
    ws1['K32'].font = f_row
    ws1['K32'].alignment = al_left
    ws1['K32'].border = b_thin

    # Subtotal Row for Part II (Row 33)
    ws1.row_dimensions[33].height = 28
    ws1.merge_cells('A33:H33')
    c_sub2 = ws1['A33']
    c_sub2.value = 'ĐIỂM NHÓM HOẠT ĐỘNG HỖ TRỢ HỌC TẬP (ACADEMIC SUPPORT — 20%)'
    c_sub2.font = f_summary
    c_sub2.alignment = Alignment(horizontal='right', vertical='center', indent=1)
    c_sub2.fill = fill_highlight
    c_sub2.border = b_double

    ws1['I33'].value = '=I32'
    ws1['I33'].number_format = '0.0%'
    ws1['I33'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    ws1['I33'].alignment = al_center
    ws1['I33'].fill = fill_green_formula
    ws1['I33'].border = b_double

    ws1['J33'].value = '=J32'
    ws1['J33'].number_format = '0.0'
    ws1['J33'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='9A3412')
    ws1['J33'].alignment = al_center
    ws1['J33'].fill = fill_orange_eval
    ws1['J33'].border = b_double

    ws1['K33'].value = 'Trọng số 20% trong tổng điểm KPI toàn viện'
    ws1['K33'].font = f_meta_label
    ws1['K33'].alignment = al_left
    ws1['K33'].border = b_double

    # Row 34: Spacer
    ws1.row_dimensions[34].height = 10

    # =========================================================================
    # PHẦN III: OTHER ACTIVITIES (10%) - ROWS 35 TO 39
    # =========================================================================
    ws1.merge_cells('A35:K35')
    c_sec3 = ws1['A35']
    c_sec3.value = 'PHẦN III: NHÓM KPI CÁC HOẠT ĐỘNG KHÁC (OTHER ACTIVITIES) — TRỌNG SỐ: 10%'
    c_sec3.font = f_sec_title
    c_sec3.fill = fill_sec_other
    c_sec3.alignment = Alignment(horizontal='left', vertical='center', indent=1)
    ws1.row_dimensions[35].height = 28

    other_items = [
        ('11', 'Tuyển sinh', 'Tham gia công tác tuyển sinh, trực tư vấn, Open Day, đón tiếp thí sinh/phụ huynh', 'Số lượng hoạt động tuyển sinh đã tham gia tích cực', '%', 1.0, 11, 11, 100),
        ('12', 'Hỗ trợ SV du học & exchange', 'Quản lý & hỗ trợ sinh viên chuyển tiếp, trao đổi quốc tế', 'Tỷ lệ sinh viên có nhu cầu chuyển tiếp/trao đổi được hỗ trợ hoàn thiện hồ sơ và xuất bảng điểm kịp thời', '%', 1.0, 1, 1, 100),
        ('13', 'Hoạt động chung của Viện', 'Tham gia các hoạt động phong trào, sự kiện, hỗ trợ các ban chuyên môn của Viện', 'Số lượng hoạt động chung đã tham gia đóng góp', '%', 1.0, 5, 5, 100),
    ]

    for idx, (stt, task, desc, criteria, unit, target, assigned, completed, mgr_score) in enumerate(other_items, start=36):
        ws1.row_dimensions[idx].height = 36
        is_even = (idx % 2 == 0)
        row_fill = fill_zebra if is_even else PatternFill(fill_type=None)

        ws1[f'A{idx}'].value = stt
        ws1[f'A{idx}'].font = f_row_code
        ws1[f'A{idx}'].alignment = al_center
        ws1[f'A{idx}'].border = b_thin
        ws1[f'A{idx}'].fill = row_fill

        ws1[f'B{idx}'].value = task
        ws1[f'B{idx}'].font = f_row_bold
        ws1[f'B{idx}'].alignment = al_left
        ws1[f'B{idx}'].border = b_thin
        ws1[f'B{idx}'].fill = row_fill

        ws1[f'C{idx}'].value = desc
        ws1[f'C{idx}'].font = f_row
        ws1[f'C{idx}'].alignment = al_left
        ws1[f'C{idx}'].border = b_thin
        ws1[f'C{idx}'].fill = row_fill

        ws1[f'D{idx}'].value = criteria
        ws1[f'D{idx}'].font = f_row
        ws1[f'D{idx}'].alignment = al_left
        ws1[f'D{idx}'].border = b_thin
        ws1[f'D{idx}'].fill = row_fill

        ws1[f'E{idx}'].value = unit
        ws1[f'E{idx}'].font = f_row
        ws1[f'E{idx}'].alignment = al_center
        ws1[f'E{idx}'].border = b_thin
        ws1[f'E{idx}'].fill = row_fill

        ws1[f'F{idx}'].value = target
        ws1[f'F{idx}'].number_format = '0%'
        ws1[f'F{idx}'].font = f_row_bold
        ws1[f'F{idx}'].alignment = al_center
        ws1[f'F{idx}'].border = b_thin
        ws1[f'F{idx}'].fill = row_fill

        ws1[f'G{idx}'].value = assigned
        ws1[f'G{idx}'].number_format = '#,##0'
        ws1[f'G{idx}'].font = f_row
        ws1[f'G{idx}'].alignment = al_center
        ws1[f'G{idx}'].fill = fill_yellow_input
        ws1[f'G{idx}'].border = b_thin

        ws1[f'H{idx}'].value = completed
        ws1[f'H{idx}'].number_format = '#,##0'
        ws1[f'H{idx}'].font = f_row
        ws1[f'H{idx}'].alignment = al_center
        ws1[f'H{idx}'].fill = fill_yellow_input
        ws1[f'H{idx}'].border = b_thin

        ws1[f'I{idx}'].value = f'=IF(OR(G{idx}=0,G{idx}=""),"",H{idx}/G{idx})'
        ws1[f'I{idx}'].number_format = '0.0%'
        ws1[f'I{idx}'].font = f_formula
        ws1[f'I{idx}'].fill = fill_green_formula
        ws1[f'I{idx}'].alignment = al_center
        ws1[f'I{idx}'].border = b_thin

        ws1[f'J{idx}'].value = mgr_score
        ws1[f'J{idx}'].number_format = '#,##0'
        ws1[f'J{idx}'].font = f_eval
        ws1[f'J{idx}'].fill = fill_orange_eval
        ws1[f'J{idx}'].alignment = al_center
        ws1[f'J{idx}'].border = b_thin

        ws1[f'K{idx}'].value = ''
        ws1[f'K{idx}'].font = f_row
        ws1[f'K{idx}'].alignment = al_left
        ws1[f'K{idx}'].border = b_thin

    # Subtotal Row for Part III (Row 39)
    ws1.row_dimensions[39].height = 28
    ws1.merge_cells('A39:H39')
    c_sub3 = ws1['A39']
    c_sub3.value = 'ĐIỂM TRUNG BÌNH CÁC HOẠT ĐỘNG KHÁC (OTHER ACTIVITIES — 10%)'
    c_sub3.font = f_summary
    c_sub3.alignment = Alignment(horizontal='right', vertical='center', indent=1)
    c_sub3.fill = fill_highlight
    c_sub3.border = b_double

    ws1['I39'].value = '=AVERAGE(I36:I38)'
    ws1['I39'].number_format = '0.0%'
    ws1['I39'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    ws1['I39'].alignment = al_center
    ws1['I39'].fill = fill_green_formula
    ws1['I39'].border = b_double

    ws1['J39'].value = '=AVERAGE(J36:J38)'
    ws1['J39'].number_format = '0.0'
    ws1['J39'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='9A3412')
    ws1['J39'].alignment = al_center
    ws1['J39'].fill = fill_orange_eval
    ws1['J39'].border = b_double

    ws1['K39'].value = 'Trọng số 10% trong tổng điểm KPI toàn viện'
    ws1['K39'].font = f_meta_label
    ws1['K39'].alignment = al_left
    ws1['K39'].border = b_double

    # Row 40: Spacer
    ws1.row_dimensions[40].height = 14

    # Row 41: Legend bar (NO SIGNATURES AT ALL!)
    ws1.row_dimensions[41].height = 26
    ws1.merge_cells('A41:B41')
    ws1['A41'].value = 'QUY ƯỚC MÀU SẮC:'
    ws1['A41'].font = f_meta_label
    ws1['A41'].alignment = al_center

    ws1.merge_cells('C41:D41')
    ws1['C41'].value = 'Ô màu vàng: Coordinator tự nhập số liệu thực tế'
    ws1['C41'].font = f_meta_val
    ws1['C41'].fill = fill_yellow_input
    ws1['C41'].alignment = al_center
    ws1['C41'].border = b_thin

    ws1.merge_cells('E41:G41')
    ws1['E41'].value = 'Ô màu xanh lá: Công thức tự động tính toán (KHÔNG SỬA)'
    ws1['E41'].font = f_formula
    ws1['E41'].fill = fill_green_formula
    ws1['E41'].alignment = al_center
    ws1['E41'].border = b_thin

    ws1.merge_cells('H41:K41')
    ws1['H41'].value = 'Ô màu cam: Điểm đánh giá của Quản lý / Trưởng Ban (Thang 1-100)'
    ws1['H41'].font = f_eval
    ws1['H41'].fill = fill_orange_eval
    ws1['H41'].alignment = al_center
    ws1['H41'].border = b_thin

    # =========================================================================
    # SHEET 2: KQ SV & KỶ LUẬT SV (20%)
    # =========================================================================
    ws2 = wb.create_sheet('KQ SV & KỶ LUẬT SV (20%)')
    ws2.views.sheetView[0].showGridLines = True
    
    col_widths_2 = {
        'A': 14, # Chương trình
        'B': 12, # Kỳ học
        'C': 12, # Khóa
        'D': 36, # Môn học
        'E': 10, # SL GV
        'F': 12, # SL SV
        'G': 14, # MT Đi học
        'H': 14, # MT Pass 1st
        'I': 14, # MT Nộp bài
        'J': 14, # TT Đi học
        'K': 14, # TT Pass 1st
        'L': 14, # TT Pass Resit
        'M': 14, # TT Nộp bài
        'N': 16, # HT Đi học (%)
        'O': 18, # Hiệu suất học tập (%)
        'P': 16, # HT Nộp bài (%)
        'Q': 16  # TB Môn (%)
    }
    for col, width in col_widths_2.items():
        ws2.column_dimensions[col].width = width

    # Row 1: Sheet Title
    ws2.merge_cells('A1:Q1')
    s2_c1 = ws2['A1']
    s2_c1.value = 'PHẦN IV: KẾT QUẢ HỌC TẬP VÀ KỶ LUẬT CỦA SINH VIÊN (STUDENT RESULTS & DISCIPLINE) — TRỌNG SỐ: 20%'
    s2_c1.font = f_main_title
    s2_c1.fill = fill_header_navy
    s2_c1.alignment = al_center
    ws2.row_dimensions[1].height = 34

    ws2.merge_cells('A2:Q2')
    s2_c2 = ws2['A2']
    s2_c2.value = 'Bảng theo dõi và thống kê chi tiết theo từng lớp/môn học do Coordinator trực tiếp phụ trách trong kỳ học'
    s2_c2.font = f_subtitle
    s2_c2.fill = fill_header_navy
    s2_c2.alignment = al_center
    ws2.row_dimensions[2].height = 20

    # Row 3: Main Group Headers
    ws2.row_dimensions[3].height = 26
    s2_groups = [
        ('A3:F3', 'THÔNG TIN LỚP HỌC & MÔN HỌC', fill_dark_navy),
        ('G3:I3', 'MỤC TIÊU ĐẦU KỲ (KẾ HOẠCH)', fill_sec_op),
        ('J3:M3', 'KẾT QUẢ THỰC TẾ CUỐI KỲ', fill_sec_as),
        ('N3:Q3', 'MỨC ĐỘ HOÀN THÀNH (%) (TỰ ĐỘNG TÍNH)', fill_sec_summary)
    ]
    for rng, text, fill in s2_groups:
        ws2.merge_cells(rng)
        first_c = ws2[rng.split(':')[0]]
        first_c.value = text
        first_c.font = f_sec_title
        first_c.fill = fill
        first_c.alignment = al_center

    # Row 4: Column Headers
    ws2.row_dimensions[4].height = 32
    s2_headers = [
        ('A4', 'Chương trình'),
        ('B4', 'Kỳ học'),
        ('C4', 'Khóa SV'),
        ('D4', 'Tên môn học'),
        ('E4', 'Số GV'),
        ('F4', 'Số SV'),
        ('G4', 'Kỷ luật\n(Chuyên cần)'),
        ('H4', 'Học tập\n(Pass lần 1)'),
        ('I4', 'Học tập\n(Nộp bài hạn 1)'),
        ('J4', 'Kỷ luật\n(Chuyên cần TT)'),
        ('K4', 'Học tập\n(Pass lần 1 TT)'),
        ('L4', 'Học tập\n(Pass Resit TT)'),
        ('M4', 'Học tập\n(Nộp bài TT)'),
        ('N4', 'Hoàn thành\nChuyên cần (%)'),
        ('O4', 'Hiệu suất học tập\n(Có bù Resit) (%)'),
        ('P4', 'Hoàn thành\nNộp bài (%)'),
        ('Q4', 'ĐIỂM TRUNG BÌNH\nMÔN HỌC (%)')
    ]
    for cell_pos, text in s2_headers:
        c = ws2[cell_pos]
        c.value = text
        c.font = f_th_dark
        c.fill = fill_th_light
        c.alignment = al_center
        c.border = b_thin

    # Course sample data from Bùi Thị Quỳnh Trang (6 courses) + blank rows for entry
    sample_courses = [
        ('Năm 1', 'SEM 2', 'I21 MT', 'ENGLISH (Upper -Intermediate Level 3)', 13, 85, 0.90, 0.70, 1.00, '=83/85', '=57/71', '=13/26', 1.00),
        ('Năm 1', 'SEM 2', 'I21 MT', 'ENGLISH (Advanced Level 4)', 11, 92, 0.90, 0.50, 0.95, '=91/92', '=36/77', '=33/55', '=90/91'),
        ('Năm 1', 'SEM 2', 'I21 MT', 'Basic Economics', 2, 83, 0.85, 0.70, 0.95, 0.94, '=65/(83-5)', '=7/15', 0.97),
        ('Năm 1', 'SEM 2', 'I22 MX', 'ENGLISH (Intermediate Level 2)', 2, 32, 0.90, 0.70, 1.00, '=32/32', '=16/19', '=11/14', 1.00),
        ('Năm 1', 'SEM 2', 'I22 MX', 'ENGLISH (Upper -Intermediate Level 3)', 2, 37, 0.90, 0.70, 0.95, '=36/37', '=23/36', '=2/5', '=37/37'),
        ('Năm 1', 'SEM 2', 'I22 MX', 'Study skills', 2, 75, 0.85, 0.70, 0.95, 0.88, '=31/64', 0.78, 0.96),
    ]

    total_course_rows = 26 # rows 5 to 30
    for idx in range(5, 5 + total_course_rows):
        r_num = idx
        ws2.row_dimensions[r_num].height = 24
        is_sample = (idx - 5) < len(sample_courses)
        is_even = (r_num % 2 == 0)
        base_fill = fill_zebra if is_even else PatternFill(fill_type=None)

        if is_sample:
            prog, sem, cohort, c_name, num_gv, num_sv, mt_cc, mt_p1, mt_nb, tt_cc, tt_p1, tt_resit, tt_nb = sample_courses[idx - 5]
            ws2[f'A{r_num}'].value = prog
            ws2[f'B{r_num}'].value = sem
            ws2[f'C{r_num}'].value = cohort
            ws2[f'D{r_num}'].value = c_name
            ws2[f'E{r_num}'].value = num_gv
            ws2[f'F{r_num}'].value = num_sv
            ws2[f'G{r_num}'].value = mt_cc
            ws2[f'H{r_num}'].value = mt_p1
            ws2[f'I{r_num}'].value = mt_nb
            ws2[f'J{r_num}'].value = tt_cc
            ws2[f'K{r_num}'].value = tt_p1
            ws2[f'L{r_num}'].value = tt_resit
            ws2[f'M{r_num}'].value = tt_nb
        else:
            ws2[f'A{r_num}'].value = ''
            ws2[f'B{r_num}'].value = ''
            ws2[f'C{r_num}'].value = ''
            ws2[f'D{r_num}'].value = ''
            ws2[f'E{r_num}'].value = None
            ws2[f'F{r_num}'].value = None
            ws2[f'G{r_num}'].value = None
            ws2[f'H{r_num}'].value = None
            ws2[f'I{r_num}'].value = None
            ws2[f'J{r_num}'].value = None
            ws2[f'K{r_num}'].value = None
            ws2[f'L{r_num}'].value = None
            ws2[f'M{r_num}'].value = None

        # Columns A-F
        for col in ['A', 'B', 'C']:
            c = ws2[f'{col}{r_num}']
            c.font = f_row_bold
            c.alignment = al_center
            c.border = b_thin
            c.fill = fill_yellow_input if not is_sample else base_fill

        c_d = ws2[f'D{r_num}']
        c_d.font = f_row_bold if is_sample else f_row
        c_d.alignment = al_left
        c_d.border = b_thin
        c_d.fill = fill_yellow_input if not is_sample else base_fill

        for col in ['E', 'F']:
            c = ws2[f'{col}{r_num}']
            c.font = f_row
            c.number_format = '#,##0'
            c.alignment = al_center
            c.border = b_thin
            c.fill = fill_yellow_input if not is_sample else base_fill

        # Columns G-I: Target (Input)
        for col in ['G', 'H', 'I']:
            c = ws2[f'{col}{r_num}']
            c.font = f_row_bold
            c.number_format = '0%'
            c.alignment = al_center
            c.border = b_thin
            c.fill = fill_yellow_input if not is_sample else fill_highlight

        # Columns J-M: Actual Results (Input)
        for col in ['J', 'K', 'L', 'M']:
            c = ws2[f'{col}{r_num}']
            c.font = f_row
            c.number_format = '0.0%'
            c.alignment = al_center
            c.border = b_thin
            c.fill = fill_yellow_input

        # Columns N-Q: Formulas
        c_n = ws2[f'N{r_num}']
        c_n.value = f'=IF(OR(G{r_num}=0,G{r_num}="",J{r_num}=""),"",J{r_num}/G{r_num})'
        c_n.number_format = '0.0%'
        c_n.font = f_formula
        c_n.fill = fill_green_formula
        c_n.alignment = al_center
        c_n.border = b_thin

        c_o = ws2[f'O{r_num}']
        c_o.value = f'=IF(OR(H{r_num}=0,H{r_num}="",K{r_num}=""),"",IF((K{r_num}/H{r_num})>=1,K{r_num}/H{r_num},MIN(1,(K{r_num}/H{r_num})+((L{r_num}/H{r_num})*1))))'
        c_o.number_format = '0.0%'
        c_o.font = f_formula
        c_o.fill = fill_green_formula
        c_o.alignment = al_center
        c_o.border = b_thin

        c_p = ws2[f'P{r_num}']
        c_p.value = f'=IF(OR(I{r_num}=0,I{r_num}="",M{r_num}=""),"",M{r_num}/I{r_num})'
        c_p.number_format = '0.0%'
        c_p.font = f_formula
        c_p.fill = fill_green_formula
        c_p.alignment = al_center
        c_p.border = b_thin

        c_q = ws2[f'Q{r_num}']
        c_q.value = f'=IF(N{r_num}="","",AVERAGE(N{r_num}:P{r_num}))'
        c_q.number_format = '0.0%'
        c_q.font = Font(name=FONT_FAMILY, size=9, bold=True, color='166534')
        c_q.fill = fill_green_formula
        c_q.alignment = al_center
        c_q.border = b_thin

    # Row 31: Spacer
    ws2.row_dimensions[31].height = 10

    # Row 32: Grand Average Row (NHÓM 20% - LIÊN KẾT TRỰC TIẾP VỀ SHEET 1)
    ws2.row_dimensions[32].height = 30
    ws2.merge_cells('A32:M32')
    c_s2_tot = ws2['A32']
    c_s2_tot.value = 'ĐIỂM TRUNG BÌNH TOÀN BỘ CÁC MÔN HỌC — KẾT QUẢ SV & KỶ LUẬT (TRỌNG SỐ: 20%):'
    c_s2_tot.font = Font(name=FONT_FAMILY, size=10, bold=True, color='0F172A')
    c_s2_tot.alignment = Alignment(horizontal='right', vertical='center', indent=1)
    c_s2_tot.fill = fill_highlight
    c_s2_tot.border = b_double

    ws2['N32'].value = '=AVERAGE(N5:N30)'
    ws2['N32'].number_format = '0.0%'
    ws2['N32'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    ws2['N32'].fill = fill_green_formula
    ws2['N32'].alignment = al_center
    ws2['N32'].border = b_double

    ws2['O32'].value = '=AVERAGE(O5:O30)'
    ws2['O32'].number_format = '0.0%'
    ws2['O32'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    ws2['O32'].fill = fill_green_formula
    ws2['O32'].alignment = al_center
    ws2['O32'].border = b_double

    ws2['P32'].value = '=AVERAGE(P5:P30)'
    ws2['P32'].number_format = '0.0%'
    ws2['P32'].font = Font(name=FONT_FAMILY, size=10, bold=True, color='166534')
    ws2['P32'].fill = fill_green_formula
    ws2['P32'].alignment = al_center
    ws2['P32'].border = b_double

    ws2['Q32'].value = '=AVERAGE(Q5:Q30)'
    ws2['Q32'].number_format = '0.0%'
    ws2['Q32'].font = Font(name=FONT_FAMILY, size=11, bold=True, color='166534')
    ws2['Q32'].fill = fill_green_formula
    ws2['Q32'].alignment = al_center
    ws2['Q32'].border = b_double

    # Row 34: Legend (NO SIGNATURES AT ALL!)
    ws2.row_dimensions[34].height = 24
    ws2.merge_cells('A34:C34')
    ws2['A34'].value = 'HƯỚNG DẪN ĐIỀN BẢNG:'
    ws2['A34'].font = f_meta_label
    ws2['A34'].alignment = al_center

    ws2.merge_cells('D34:F34')
    ws2['D34'].value = 'Ô vàng: Điền số hoặc phân số (VD: =83/85 hoặc =57/71)'
    ws2['D34'].font = f_meta_val
    ws2['D34'].fill = fill_yellow_input
    ws2['D34'].alignment = al_center
    ws2['D34'].border = b_thin

    ws2.merge_cells('G34:J34')
    ws2['G34'].value = 'Ô xanh lá: Công thức tự động tính mức độ hoàn thành & hiệu suất'
    ws2['G34'].font = f_formula
    ws2['G34'].fill = fill_green_formula
    ws2['G34'].alignment = al_center
    ws2['G34'].border = b_thin

    ws2.merge_cells('K34:Q34')
    ws2['K34'].value = 'Hiệu suất học tập (Cột O) tự động tính bù điểm Pass Resit vào tỷ lệ chung'
    ws2['K34'].font = f_meta_label
    ws2['K34'].alignment = al_left

    # =========================================================================
    # SHEET 3: DANH MỤC MÔN HỌC (LỘ TRÌNH ĐÀO TẠO)
    # =========================================================================
    ws3 = wb.create_sheet('list các môn học')
    ws3.views.sheetView[0].showGridLines = True
    
    col_widths_3 = {
        'A': 6,   # STT
        'B': 20,  # Kỳ học
        'C': 16,  # Khóa
        'D': 16,  # Năm học
        'E': 14,  # Mã môn
        'F': 44,  # Tên tiếng Anh
        'G': 32,  # Tên tiếng Việt
        'H': 22,  # Nhóm môn / Level
        'I': 10,  # Tín chỉ
        'J': 24   # Ghi chú
    }
    for col, width in col_widths_3.items():
        ws3.column_dimensions[col].width = width

    ws3.merge_cells('A1:J1')
    ws3['A1'].value = 'LỘ TRÌNH VÀ DANH MỤC MÔN HỌC TOÀN CHƯƠNG TRÌNH ĐÀO TẠO (ISME)'
    ws3['A1'].font = f_main_title
    ws3['A1'].fill = fill_header_navy
    ws3['A1'].alignment = al_center
    ws3.row_dimensions[1].height = 34

    ws3.merge_cells('A2:J2')
    ws3['A2'].value = 'Danh mục chuẩn hóa dùng để tra cứu mã môn, tên tiếng Anh, số tín chỉ và phân bổ kỳ học'
    ws3['A2'].font = f_subtitle
    ws3['A2'].fill = fill_header_navy
    ws3['A2'].alignment = al_center
    ws3.row_dimensions[2].height = 20

    s3_th = [
        ('A3', 'STT'), ('B3', 'Kỳ học'), ('C3', 'Khóa học (Cohort)'), ('D3', 'Năm học'),
        ('E3', 'Mã môn học'), ('F3', 'Tên môn học (Tiếng Anh)'), ('G3', 'Tên môn học (Tiếng Việt)'),
        ('H3', 'Khối kiến thức / Level'), ('I3', 'Tín chỉ'), ('J3', 'Ghi chú / Đơn vị phụ trách')
    ]
    ws3.row_dimensions[3].height = 28
    for pos, text in s3_th:
        c = ws3[pos]
        c.value = text
        c.font = f_th
        c.fill = fill_th
        c.alignment = al_center
        c.border = b_header

    courses_sample = [
        (1, 'SEM FALL', 'I21 MT, I22 MX', '2025 - 2026', 'ENG101', 'ENGLISH (Elementary - Pre-Intermediate Level 1)', 'Tiếng Anh Cấp độ 1', 'Tiếng Anh chuẩn bị', 3, 'Bắt buộc Năm 1'),
        (2, 'SEM FALL & SPRING', 'I21 MT, I22 MX', '2025 - 2026', 'ENG102', 'ENGLISH (Intermediate Level 2)', 'Tiếng Anh Cấp độ 2', 'Tiếng Anh chuẩn bị', 3, 'Bắt buộc Năm 1'),
        (3, 'SEM SPRING', 'I21 MT, I22 MX', '2025 - 2026', 'ENG103', 'ENGLISH (Upper - Intermediate Level 3)', 'Tiếng Anh Cấp độ 3', 'Tiếng Anh học thuật', 3, 'Bắt buộc Năm 1'),
        (4, 'SEM FALL & SPRING', 'I21 MT, I22 MX', '2025 - 2026', 'ENG104', 'ENGLISH (Advanced Level 4)', 'Tiếng Anh Cấp độ 4', 'Tiếng Anh học thuật', 3, 'Điều kiện vào chuyên ngành'),
        (5, 'SEM FALL & SPRING', 'I21 MT', '2025 - 2026', 'ECO101', 'Basic Economics', 'Kinh tế học cơ bản', 'Kiến thức cơ sở khối ngành', 3, 'Môn đại cương'),
        (6, 'SEM FALL & SPRING', 'I21 MT, I22 MX', '2025 - 2026', 'SKL101', 'Study skills', 'Kỹ năng học tập đại học', 'Kỹ năng bổ trợ', 2, 'Kỹ năng mềm'),
        (7, 'SEM FALL', 'I22 MT', '2026 - 2027', 'WEL101', 'Welcome to University', 'Nhập môn đại học', 'Kỹ năng bổ trợ', 1, 'Định hướng tân sinh viên'),
        (8, 'SEM SUMMER', 'I21 MT', '2025 - 2026', 'MTH102', 'Maths in Economic', 'Toán trong kinh tế', 'Kiến thức cơ sở', 3, 'Học kỳ hè'),
        (9, 'SEM SPRING', 'I21 MT', '2025 - 2026', 'DAT101', 'Data Analysis and AI', 'Phân tích dữ liệu & Trí tuệ nhân tạo', 'Ứng dụng công nghệ', 3, 'Môn tích hợp mới'),
        (10, 'SEM 1', 'I19 MX, I20 MT', '2025 - 2026', 'MGT201', 'Principles of Management', 'Nguyên lý Quản trị', 'Cơ sở ngành', 3, 'Giai đoạn chuyên ngành'),
        (11, 'SEM 2', 'I19 MX, I20 MT', '2025 - 2026', 'MKT201', 'Marketing Management', 'Quản trị Marketing', 'Chuyên ngành', 3, 'Giai đoạn chuyên ngành'),
        (12, 'SEM 2', 'I18 MT', '2025 - 2026', 'FIN301', 'Financial Markets and Institutions', 'Thị trường & Định chế tài chính', 'Chuyên ngành nâng cao', 3, 'Năm cuối Top-up'),
    ]

    for idx, (stt, sem, cohort, yr, code, name_en, name_vi, grp, creds, note) in enumerate(courses_sample, start=4):
        ws3.row_dimensions[idx].height = 24
        is_even = (idx % 2 == 0)
        row_fill = fill_zebra if is_even else PatternFill(fill_type=None)

        ws3[f'A{idx}'].value = stt
        ws3[f'A{idx}'].font = f_row_code
        ws3[f'A{idx}'].alignment = al_center
        ws3[f'A{idx}'].border = b_thin
        ws3[f'A{idx}'].fill = row_fill

        ws3[f'B{idx}'].value = sem
        ws3[f'B{idx}'].font = f_row_bold
        ws3[f'B{idx}'].alignment = al_center
        ws3[f'B{idx}'].border = b_thin
        ws3[f'B{idx}'].fill = row_fill

        ws3[f'C{idx}'].value = cohort
        ws3[f'C{idx}'].font = f_row
        ws3[f'C{idx}'].alignment = al_center
        ws3[f'C{idx}'].border = b_thin
        ws3[f'C{idx}'].fill = row_fill

        ws3[f'D{idx}'].value = yr
        ws3[f'D{idx}'].font = f_row
        ws3[f'D{idx}'].alignment = al_center
        ws3[f'D{idx}'].border = b_thin
        ws3[f'D{idx}'].fill = row_fill

        ws3[f'E{idx}'].value = code
        ws3[f'E{idx}'].font = f_row_code
        ws3[f'E{idx}'].alignment = al_center
        ws3[f'E{idx}'].border = b_thin
        ws3[f'E{idx}'].fill = row_fill

        ws3[f'F{idx}'].value = name_en
        ws3[f'F{idx}'].font = f_row_bold
        ws3[f'F{idx}'].alignment = al_left
        ws3[f'F{idx}'].border = b_thin
        ws3[f'F{idx}'].fill = row_fill

        ws3[f'G{idx}'].value = name_vi
        ws3[f'G{idx}'].font = f_row
        ws3[f'G{idx}'].alignment = al_left
        ws3[f'G{idx}'].border = b_thin
        ws3[f'G{idx}'].fill = row_fill

        ws3[f'H{idx}'].value = grp
        ws3[f'H{idx}'].font = f_row
        ws3[f'H{idx}'].alignment = al_left
        ws3[f'H{idx}'].border = b_thin
        ws3[f'H{idx}'].fill = row_fill

        ws3[f'I{idx}'].value = creds
        ws3[f'I{idx}'].font = f_row
        ws3[f'I{idx}'].alignment = al_center
        ws3[f'I{idx}'].border = b_thin
        ws3[f'I{idx}'].fill = row_fill

        ws3[f'J{idx}'].value = note
        ws3[f'J{idx}'].font = f_row
        ws3[f'J{idx}'].alignment = al_left
        ws3[f'J{idx}'].border = b_thin
        ws3[f'J{idx}'].fill = row_fill

    for idx in range(16, 45):
        ws3.row_dimensions[idx].height = 22
        ws3[f'A{idx}'].value = idx - 3
        ws3[f'A{idx}'].font = f_row_code
        ws3[f'A{idx}'].alignment = al_center
        ws3[f'A{idx}'].border = b_thin
        for col in ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']:
            c = ws3[f'{col}{idx}']
            c.border = b_thin
            c.fill = fill_yellow_input

    # =========================================================================
    # SHEET 4: HƯỚNG DẪN ĐIỀN (USER GUIDE & FAQ)
    # =========================================================================
    ws4 = wb.create_sheet('HƯỚNG DẪN ĐIỀN')
    ws4.views.sheetView[0].showGridLines = True
    
    ws4.column_dimensions['A'].width = 5
    ws4.column_dimensions['B'].width = 30
    ws4.column_dimensions['C'].width = 80

    ws4.merge_cells('A1:C1')
    ws4['A1'].value = 'HƯỚNG DẪN SỬ DỤNG VÀ QUY CHUẨN ĐIỀN FORM ĐÁNH GIÁ KPI'
    ws4['A1'].font = f_main_title
    ws4['A1'].fill = fill_header_navy
    ws4['A1'].alignment = al_center
    ws4.row_dimensions[1].height = 34

    guide_items = [
        ('1. MỤC TIÊU VÀ PHẠM VI ÁP DỤNG', 'Áp dụng cho toàn bộ Chuyên viên điều phối chương trình (Coordinator) thuộc Ban Đào tạo Đại học, Viện Đào tạo Quốc tế (ISME).'),
        ('2. CƠ CẤU 4 NHÓM TRỌNG SỐ KPI CHUẨN', 'Hệ thống đánh giá KPI được phân định thành 4 nhóm độc lập với tổng trọng số 100%:'),
        ('   • Nhóm I: Vận hành theo mô tả CV (Operations) — 50%', 'Gồm 10 chỉ tiêu cốt lõi: Quản lý nội dung môn học, tài liệu GV, vận hành lớp học, điểm thi, rà soát kết quả, Turnitin, xử lý phản hồi SV/GV, module report, quản lý tiến trình SV.'),
        ('   • Nhóm II: Hoạt động hỗ trợ học tập (Academic Support) — 20%', 'Đánh giá việc tổ chức các hoạt động ngoại khóa học tập: Tọa đàm, workshop chuyên đề, guest speaker, field trip, seminar nâng cao kỹ năng cho sinh viên.'),
        ('   • Nhóm III: Kết quả học tập & Kỷ luật SV — 20%', 'Đánh giá tại Sheet 2 theo từng môn học/lớp: Tỷ lệ chuyên cần (kỷ luật), tỷ lệ pass lần 1, tỷ lệ pass sau Resit, tỷ lệ nộp bài đúng hạn.'),
        ('   • Nhóm IV: Các hoạt động khác — 10%', 'Đánh giá việc tham gia công tác tuyển sinh, hỗ trợ SV du học/trao đổi quốc tế và các hoạt động chung do Viện/Trường tổ chức.'),
        ('3. QUY ƯỚC MÀU SẮC Ô TÍNH TRONG FILE', ''),
        ('   • Ô MÀU VÀNG NHẠT (Soft Pale Yellow)', 'Coordinator TỰ ĐIỀN số liệu thực tế được giao và đã hoàn thành cuối kỳ.'),
        ('   • Ô MÀU XANH LÁ NHẠT (Soft Mint Green)', 'Ô CÔNG THỨC TỰ ĐỘNG TÍNH TOÁN tỷ lệ và điểm trung bình — TUYỆT ĐỐI KHÔNG GÕ ĐÈ HAY SỬA.'),
        ('   • Ô MÀU CAM NHẠT (Soft Warm Peach)', 'Dành cho Cán bộ quản lý trực tiếp / Trưởng Ban chấm điểm đánh giá (Thang điểm 1 đến 100).'),
        ('   • Ô MÀU XANH DƯƠNG NHẠT (Soft Blue)', 'Mục tiêu kế hoạch đầu kỳ được giao.'),
        ('4. CÁCH ĐIỀN SHEET 2 (KẾT QUẢ SV & KỶ LUẬT)', 'Tại các cột Kết quả cuối kỳ (Cột J, K, L, M), Coordinator có thể nhập trực tiếp số thập phân (VD: 0.95 = 95%) hoặc nhập công thức phân số (VD: =83/85; =57/71) để Excel tự tính chính xác.'),
        ('5. CÔNG THỨC HIỆU SUẤT HỌC TẬP (CỘT O SHEET 2)', 'Hiệu suất học tập được tính có cộng bù điểm thi lại (Resit): Nếu Tỉ lệ Pass lần 1 >= Mục tiêu, điểm = Pass 1st / Mục tiêu. Nếu chưa đạt, được cộng thêm tỉ lệ Pass sau Resit (tối đa 100%).'),
        ('6. KHÔNG CẦN CHỮ KÝ DUYỆT TRÊN FORM', 'File Excel này là biểu mẫu nhập liệu và tính toán điện tử. Việc lưu trữ, gửi duyệt và phê duyệt chính thức được thực hiện trực tiếp trên hệ thống Web Dashboard của Viện.')
    ]

    for idx, (title, content) in enumerate(guide_items, start=3):
        ws4.row_dimensions[idx].height = 24 if not content else 30
        c_title = ws4[f'B{idx}']
        c_title.value = title
        c_title.font = f_row_bold if not title.startswith('   •') else f_row
        c_title.alignment = al_left
        c_title.border = b_thin
        if 'QUY ƯỚC MÀU SẮC' in title:
            c_title.fill = fill_th_light
        elif 'Ô MÀU VÀNG' in title:
            c_title.fill = fill_yellow_input
        elif 'Ô MÀU XANH LÁ' in title:
            c_title.fill = fill_green_formula
        elif 'Ô MÀU CAM' in title:
            c_title.fill = fill_orange_eval
        elif 'Ô MÀU XANH DƯƠNG' in title:
            c_title.fill = fill_highlight

        c_content = ws4[f'C{idx}']
        c_content.value = content
        c_content.font = f_row
        c_content.alignment = al_left
        c_content.border = b_thin

    # Save to all target paths
    target_paths = [
        '/Users/tungnguyen/Downloads/Mau_Form_Danh_Gia_KPI_Coordinator_CHUNG.xlsx',
        'public/templates_per_person/Mau_Form_Danh_Gia_KPI_Coordinator_CHUNG.xlsx',
        'templates_per_person/Mau_Form_Danh_Gia_KPI_Coordinator_CHUNG.xlsx'
    ]

    for p in target_paths:
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
        wb.save(p)
        print(f'✅ Successfully saved to: {p}')

if __name__ == '__main__':
    create_kpi_form()
