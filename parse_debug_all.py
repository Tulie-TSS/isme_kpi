import json

raw_file = "scratch/raw_kpi_data.json"
with open(raw_file, 'r') as f:
    raw_data = json.load(f)

for filename, sheet in raw_data.items():
    print(f"\n--- {filename} ---")
    # find header
    header_row = -1
    for r_idx, row in sheet.items():
        if any("Số lượng được giao" in str(v) for v in row.values()):
            header_row = int(r_idx)
            print(f"Header at {r_idx}: {row}")
            break
    
    if header_row != -1:
        # print first data row
        for i in range(header_row+1, header_row+5):
            print(f"Data {i}: {sheet.get(str(i), {})}")

