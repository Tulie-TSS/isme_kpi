import json

raw_file = "scratch/raw_kpi_data.json"
with open(raw_file, 'r') as f:
    raw_data = json.load(f)

# The ones that were likely skipped or had different formats
missing_mapping = {
    "Bui T Quynh Trang": "u2",
    "Nguyen Giang Khanh Huyen": "u7",
    "Tran T Bich Ngoc": "u5"
}

output_lines = []

for name_prefix, user_id in missing_mapping.items():
    found_filename = None
    for filename in raw_data.keys():
        if filename.startswith(name_prefix):
            found_filename = filename
            break
    
    if not found_filename:
        print(f"// NOT FOUND: {name_prefix}")
        continue
    
    sheet = raw_data[found_filename]
    user_snapshots = []
    
    # Custom parsing logic for these different files
    if user_id == "u2":
        # Bui Thị Quỳnh Trang: Similar to others
        for r_idx_str, row in sorted(sheet.items(), key=lambda x: int(x[0])):
            stt = row.get("A", "")
            if stt and str(stt).replace(".0","").isdigit():
                kpi_num = int(float(stt))
                if kpi_num > 15: continue
                denom = row.get("G", "0")
                num = row.get("H", "0")
                try:
                    d_val = float(denom); n_val = float(num)
                    score = round(n_val / d_val * 100, 1) if d_val > 0 else 100
                except: d_val = 0.0; n_val = 0.0; score = 100
                user_snapshots.append({"id": f"ks_u{user_id[1:]}_2526_k{kpi_num}", "userId": user_id, "kpiDefinitionId": f"kpi{kpi_num}", "period": "Kỳ 2 2025-2026", "score": score, "rawNumerator": n_val, "rawDenominator": d_val})

    elif user_id == "u7":
        # Nguyen Giang Khánh Huyền: Semester 2 data starts from Row 9
        # Q: Mục tiêu chuyên cần, R: Mục tiêu học tập
        # Let's map Semester 2 targets (Q and R) as kpi1 and kpi2 for demo
        for r_idx in range(9, 20):
            row = sheet.get(str(r_idx), {})
            if row.get("C"): # has subject
                kpi_num = r_idx - 8
                if kpi_num > 10: break
                denom = row.get("Q", "0.95")
                # Since it's a target percentage, we'll map score directly
                try: score = float(denom) * 100
                except: score = 95.0
                user_snapshots.append({"id": f"ks_u{user_id[1:]}_2526_k{kpi_num}", "userId": user_id, "kpiDefinitionId": f"kpi{kpi_num}", "period": "Kỳ 2 2025-2026", "score": score, "rawNumerator": 0, "rawDenominator": 100})

    elif user_id == "u5":
        # Tran Thị Bích Ngọc: Starts row 6. G = Mục tiêu chuyên cần, J = Mục tiêu học tập
        for r_idx in range(6, 14):
            row = sheet.get(str(r_idx), {})
            if row.get("C"):
                kpi_num = r_idx - 5
                if kpi_num > 10: break
                denom = row.get("G", "0.85")
                try: score = float(denom) * 100
                except: score = 85.0
                user_snapshots.append({"id": f"ks_u{user_id[1:]}_2526_k{kpi_num}", "userId": user_id, "kpiDefinitionId": f"kpi{kpi_num}", "period": "Kỳ 2 2025-2026", "score": score, "rawNumerator": 0, "rawDenominator": 100})

    if user_snapshots:
        output_lines.append(f"  // {name_prefix} ({user_id})")
        for s in user_snapshots:
            output_lines.append(f"  {{ id: '{s['id']}', userId: '{s['userId']}', kpiDefinitionId: '{s['kpiDefinitionId']}', period: '{s['period']}', score: {s['score']}, rawNumerator: {s['rawNumerator']}, rawDenominator: {s['rawDenominator']}, calculatedAt: d(0) }},")

print("\n".join(output_lines))
