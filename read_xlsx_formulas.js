const xlsx = require('xlsx');
const filePath = '/Users/tungnguyen/Downloads/Bảng đánh giá kết quả CV (coordinator Ban ĐH) Sem 2 2026_Đào Ngọc Diệp.xlsx';

try {
  const workbook = xlsx.readFile(filePath, { cellFormula: true, cellHTML: false });
  const sheet = workbook.Sheets['KQ SV & KỶ LUẬT SV (20%)'];
  
  // Print some cells with formulas
  const cellAddressList = ['G4', 'H4', 'I4', 'J4', 'K4', 'L4', 'M4', 'N4', 'O4'];
  cellAddressList.forEach(addr => {
    const cell = sheet[addr];
    console.log(`${addr}: value=${cell ? cell.v : 'none'}, formula=${cell ? cell.f : 'none'}`);
  });
  
  // Let's print rows 3 and 4 with cell objects detail
  console.log('\n--- Row 3 Cell Details ---');
  for (let col = 0; col < 15; col++) {
    const colLetter = String.fromCharCode(65 + col);
    const cell = sheet[`${colLetter}4`];
    console.log(`${colLetter}4: val=${cell ? cell.v : 'null'}, formula=${cell ? cell.f : 'null'}`);
  }
} catch (err) {
  console.error(err);
}
