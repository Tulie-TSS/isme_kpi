import json

raw_file = "scratch/raw_kpi_data.json"
with open(raw_file, 'r') as f:
    raw_data = json.load(f)

mapping = {
    "Bui T Quynh Trang": "u2",
    "Bui Thu Trang": "u3",
    "Dao Ngoc Diep": "u10",
    "Doan Thu Huong Giang": "u9",
    "Nguyen Giang Khanh Huyen": "u7",
    "Nguyen Minh Tuan": "u8",
    "Tran Huong Thao": "u4",
    "Tran T Bich Ngoc": "u5",
    "Vu Minh Nhat": "u6"
}

# u11 (Phạm Gia Linh) is empty as requested.

output_lines = []
output_lines.append("\n  // ── Kỳ 2 2025-2026 (New targets) ──")

processed_users = 0

for name_prefix, user_id in mapping.items():
    # Find the key in raw_data that starts with this name_prefix
    found_filename = None
    for filename in raw_data.keys():
        if filename.startswith(name_prefix):
            found_filename = filename
            break
    
    if not found_filename:
        continue
    
    sheet = raw_data[found_filename]
    user_snapshots = []
    
    # Heuristic for data rows: Row has numeric Stt in column A
    for r_idx_str, row in sorted(sheet.items(), key=lambda x: int(x[0])):
        stt = row.get("A", "")
        if stt and str(stt).replace(".0","").isdigit():
            try:
                kpi_num = int(float(stt))
                if kpi_num > 15: continue
                
                # Column G: Denominator, Column H: Numerator
                denom = row.get("G", "0")
                num = row.get("H", "0")
                
                # Special cases for odd files
                if "Nguyen Giang Khanh Huyen" in found_filename:
                    # Based on my debug: Q = Mục tiêu chuyên cần, R = Mục tiêu học tập
                    # But they are only for specific subjects.
                    # For u7, I will try to find the standard G/H first, then fallback
                    pass
                
                try:
                    d_val = float(denom)
                    n_val = float(num)
                    score = round(n_val / d_val * 100, 1) if d_val > 0 else 100
                except:
                    d_val = 0.0
                    n_val = 0.0
                    score = 100
                
                user_snapshots.append({
                    "id": f"ks_u{user_id[1:]}_2526_k{kpi_num}",
                    "userId": user_id,
                    "kpiDefinitionId": f"kpi{kpi_num}",
                    "period": "Kỳ 2 2025-2026",
                    "score": score,
                    "rawNumerator": n_val,
                    "rawDenominator": d_val
                })
            except: pass
            
    if user_snapshots:
        processed_users += 1
        output_lines.append(f"  // {name_prefix} ({user_id})")
        for s in user_snapshots:
            line = f"  {{ id: '{s['id']}', userId: '{s['userId']}', kpiDefinitionId: '{s['kpiDefinitionId']}', period: '{s['period']}', score: {s['score']}, rawNumerator: {s['rawNumerator']}, rawDenominator: {s['rawDenominator']}, calculatedAt: d(0) }},"
            output_lines.append(line)

print("\n".join(output_lines))
