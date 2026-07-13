const xlsx = require('xlsx');
const filePath = '/Users/tungnguyen/Downloads/Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Đào Ngọc Diệp.xlsx';

try {
  const workbook = xlsx.readFile(filePath);
  console.log('Detected Sheet Names:', workbook.SheetNames);
  
  workbook.SheetNames.forEach((name, idx) => {
    console.log(`\n================ SHEET ${idx}: ${name} ================`);
    const sheet = workbook.Sheets[name];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    console.log(`Rows: ${rows.length}`);
    rows.forEach((row, i) => {
      // Print row if it has any non-null elements
      const hasContent = row.some(cell => cell !== null && cell !== '');
      if (hasContent) {
        console.log(`${i}: ${JSON.stringify(row)}`);
      }
    });
  });
} catch (err) {
  console.error(err);
}
