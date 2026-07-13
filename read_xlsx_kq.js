const xlsx = require('xlsx');
const filePath = '/Users/tungnguyen/Downloads/Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Đào Ngọc Diệp.xlsx';

try {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets['KQ SV & KỶ LUẬT SV (20%)'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  console.log('Total rows in sheet 1:', rows.length);
  for (let i = 22; i < rows.length; i++) {
    const row = rows[i];
    if (row && row.some(cell => cell !== null && cell !== '')) {
      console.log(`${i}: ${JSON.stringify(row)}`);
    }
  }
} catch (err) {
  console.error(err);
}
