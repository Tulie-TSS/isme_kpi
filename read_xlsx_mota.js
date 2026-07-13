const xlsx = require('xlsx');
const filePath = '/Users/tungnguyen/Downloads/Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Đào Ngọc Diệp.xlsx';

try {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets['MÔ TẢ CÔNG VIỆC'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  console.log('Total rows:', rows.length);
  rows.forEach((row, i) => {
    // Print all rows regardless of empty cells
    console.log(`${i}: ${JSON.stringify(row)}`);
  });
} catch (err) {
  console.error(err);
}
