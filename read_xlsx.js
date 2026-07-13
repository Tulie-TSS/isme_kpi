const xlsx = require('xlsx');
const path = require('path');

const filePath = '/Users/tungnguyen/Downloads/Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Đào Ngọc Diệp.xlsx';

try {
  const workbook = xlsx.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    // Convert to JSON / rows
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`Total rows: ${rows.length}`);
    // Print first 50 rows
    rows.slice(0, 80).forEach((row, i) => {
      console.log(`${i}: ${JSON.stringify(row)}`);
    });
  });
} catch (err) {
  console.error('Error reading file:', err);
}
