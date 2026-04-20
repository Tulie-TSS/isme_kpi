import zipfile
import xml.etree.ElementTree as ET
import os

def parse_xlsx(file_path):
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            # Read shared strings
            shared_strings = []
            try:
                with zip_ref.open('xl/sharedStrings.xml') as f:
                    tree = ET.parse(f)
                    for si in tree.getroot().findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                        t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                        if t is not None:
                            shared_strings.append(t.text if t.text else "")
                        else:
                            res = []
                            for r in si.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}r'):
                                rt = r.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                                if rt is not None and rt.text:
                                    res.append(rt.text)
                            shared_strings.append("".join(res))
            except KeyError:
                pass # No shared strings

            # Read sheet1
            with zip_ref.open('xl/worksheets/sheet1.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                sheet_data = root.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')
                
                rows = []
                for row in sheet_data.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                    r_data = []
                    for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                        v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        if v is not None:
                            val = v.text
                            t = c.get('t')
                            if t == 's':
                                r_data.append(shared_strings[int(val)] if int(val) < len(shared_strings) else "")
                            else:
                                r_data.append(val)
                        else:
                            r_data.append("")
                    rows.append(r_data)
                return rows
    except Exception as e:
        return str(e)

path = "/Volumes/Tung's Data/Tulie/download 2/KPIs kỳ 2 năm 25.26"
files = [f for f in os.listdir(path) if f.endswith(".xlsx")]
for file in sorted(files):
    print(f"FILE: {file}")
    data = parse_xlsx(os.path.join(path, file))
    if isinstance(data, str):
        print(f"ERROR: {data}")
        continue
    
    # Simple heuristic to find data rows:
    # Look for rows that have numbers in columns that look like Numerator/Denominator
    for i, row in enumerate(data):
        # We look for rows that likely contain KPI data based on content
        row_str = " | ".join([str(c) for c in row if c])
        if row_str:
            print(f"R{i}: {row_str}")

