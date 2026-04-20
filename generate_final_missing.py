import json

raw_file = "scratch/raw_kpi_data.json"
with open(raw_file, 'r') as f:
    raw_data = json.load(f)

snapshots = []

# u2: Bui T Quynh Trang (Rows 6-9, cols I and L)
u2_file = "Bui T Quynh Trang_Báo cáo mục tiêu HK2 Y2025-2026 (1).xlsx"
u2_sheet = raw_data.get(u2_file, {})
for i, r_idx in enumerate(range(6, 10)):
    row = u2_sheet.get(str(r_idx), {})
    if row.get("D"):
        kpi_num = i + 1
        val = row.get("I", "0.9")
        try: score = float(val) * 100
        except: score = 90.0
        snapshots.append({"id": f"ks_u2_2526_k{kpi_num}", "userId": "u2", "kpiDefinitionId": f"kpi{kpi_num}", "period": "Kỳ 2 2025-2026", "score": score, "rawNumerator": 0, "rawDenominator": 100})

# u7: Nguyen Giang Khanh Huyen (Rows 9-13, cols Q and R)
u7_file = "Nguyen Giang Khanh Huyen_KPIs top up CU - Kỳ 2.2526 - Huyen.xlsx"
u7_sheet = raw_data.get(u7_file, {})
for i, r_idx in enumerate(range(9, 14)):
    row = u7_sheet.get(str(r_idx), {})
    if row.get("C"):
        kpi_num = i + 1
        val = row.get("Q", "0.98")
        try: score = float(val) * 100
        except: score = 98.0
        snapshots.append({"id": f"ks_u7_2526_k{kpi_num}", "userId": "u7", "kpiDefinitionId": f"kpi{kpi_num}", "period": "Kỳ 2 2025-2026", "score": score, "rawNumerator": 0, "rawDenominator": 100})

# u5: Tran T Bich Ngoc (Rows 6-13, cols G and J)
u5_file = "Tran T Bich Ngoc_NHTC_Kpi Kỳ 2, 2526 (1).xlsx"
u5_sheet = raw_data.get(u5_file, {})
for i, r_idx in enumerate(range(6, 14)):
    row = u5_sheet.get(str(r_idx), {})
    if row.get("C"):
        kpi_num = i + 1
        val = row.get("G", "0.85")
        try: score = float(val) * 100
        except: score = 85.0
        snapshots.append({"id": f"ks_u5_2526_k{kpi_num}", "userId": "u5", "kpiDefinitionId": f"kpi{kpi_num}", "period": "Kỳ 2 2025-2026", "score": score, "rawNumerator": 0, "rawDenominator": 100})

for s in snapshots:
    print(f"  {{ id: '{s['id']}', userId: '{s['userId']}', kpiDefinitionId: '{s['kpiDefinitionId']}', period: '{s['period']}', score: {s['score']}, rawNumerator: {s['rawNumerator']}, rawDenominator: {s['rawDenominator']}, calculatedAt: d(0) }},")

