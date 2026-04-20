import json

raw_file = "scratch/raw_kpi_data.json"
with open(raw_file, 'r') as f:
    raw_data = json.load(f)

# Mapping files to UI User IDs
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

final_snapshots = []
snapshot_id_counter = 100 # start from 100 to avoid conflicts

for filename, sheet in raw_data.items():
    name_key = filename.split("_")[0]
    user_id = mapping.get(name_key)
    if not user_id: continue
    
    # Iterate through rows and find KPI numbers
    for row_idx, row in sheet.items():
        stt = row.get("A", "")
        # Look for KPIs like 1, 2, 3...
        if stt and (str(stt).replace(".0","").isdigit()):
            kpi_num = int(float(stt))
            if kpi_num > 20: continue # Likely not a KPI ID
            
            # Use columns G and H for Giao and Hoàn thành
            denom = row.get("G", "0")
            num = row.get("H", "0")
            
            # Clean numeric values
            try:
                denom_float = float(denom)
                num_float = float(num)
                score = (num_float / denom_float * 100) if denom_float > 0 else 100
            except:
                denom_float = 0.0
                num_float = 0.0
                score = 100
                
            final_snapshots.append({
                "id": f"ks_2526_{user_id}_{kpi_num}",
                "userId": user_id,
                "kpiDefinitionId": f"kpi{kpi_num}",
                "period": "Kỳ 2 2025-2026",
                "score": round(score, 1),
                "rawNumerator": num_float,
                "rawDenominator": denom_float,
                "calculatedAt": "new Date()"
            })

print(json.dumps(final_snapshots, indent=2, ensure_ascii=False))

