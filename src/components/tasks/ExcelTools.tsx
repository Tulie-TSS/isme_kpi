'use client';
import { courses, kpiDefinitions, kpiSnapshots, programs, tasks, users, taskTemplates, getProgramById, getUserById } from '@/lib/mock-data';
import { getTaskChildren } from '@/lib/mock-tasks';
import { Download, Upload, FileSpreadsheet, Table2, ClipboardList } from 'lucide-react';
import { useState, useRef } from 'react';
import type { Task } from '@/lib/types';

// ═══════════════════════════════════════════════════════
// TABLE 1: KPI Course Tracking — "Bảng theo dõi KPI môn học"
// Columns: CT, Lớp, Môn, GV, SV, targets, results, completion
// ═══════════════════════════════════════════════════════

function exportKPICourseTable() {
  const XLSX = require('xlsx');
  const wb = XLSX.utils.book_new();

  // Header rows (multi-level like the screenshot)
  const data: (string | number | null)[][] = [];

  // Row 0-2: merged headers
  data.push([
    'Chương trình', 'Lớp', 'Môn', 'Số lượng GV', 'Số lượng sinh viên',
    '', 'MỤC TIÊU ĐẦU KỲ 1.2526', '', '', '', '',
    '', 'KẾT QUẢ CUỐI KỲ 1.2526', '', '', '', '',
    '', 'MỨC ĐỘ HOÀN THÀNH CÔNG VIỆC', '', '', '',
    '', 'MỤC TIÊU ĐẦU KỲ MỚI KỲ 2.2526', '', '', '',
  ]);

  data.push([
    '', '', '', '', '',
    'Tỷ lệ SV đi điểm kiểm chuyên cần gần nhất', 'Mục tiêu chuyên cần', 'Tỷ lệ pass kỳ gần nhất', 'Tỷ lệ nộp bài làm đúng hạn', 'Mục tiêu học tập (tỉ lệ pass)', 'Kết quả chuyên cần',
    'Tỷ lệ nộp bài làm đúng hạn', 'Kết quả học tập (tỉ lệ pass)', 'Kỳ bài', 'Tỷ lệ nộp bài làm đúng hạn',
    'Học tập', 'Tỷ lệ SV đi điểm kiểm chuyên cần kỳ 2.2526', 'Mục tiêu chuyên cần',
    'Tỷ lệ pass kỳ gần nhất', 'Mục tiêu học tập (tỉ lệ pass) kỳ 2.2526',
  ]);

  // Data rows from courses
  const program = programs.find(p => p.id === 'p3')!; // BTEC
  courses.forEach(c => {
    const attendPct = Math.round(c.attendanceRate * 100 * 100) / 100;
    const passPct = Math.round(c.passRate * 100 * 100) / 100;
    const submitPct = Math.round(c.submitRate * 100 * 100) / 100;
    const attendTarget = Math.round(c.attendanceTarget * 100);
    const passTarget = Math.round(c.passTarget * 100);

    // Simulated completion rates
    const attendCompletion = Math.round((c.attendanceRate / c.attendanceTarget) * 100);
    const passCompletion = Math.round((c.passRate / c.passTarget) * 100);

    data.push([
      program.shortName, c.cohort, c.name, c.numLecturers, c.numStudents,
      `${attendPct}%`, `${attendTarget}%`, `${passPct}%`, `${submitPct}%`, `${passTarget}%`,
      `${Math.round(c.attendanceRate * 100)}%`, `${submitPct}%`, `${passPct}%`,
      `${attendCompletion}%`, `${passCompletion}%`,
      '', `${Math.round(c.attendanceRate * 100)}%`, `${attendTarget}%`,
      `${passPct}%`, `${passTarget}%`,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { width: 14 }, { width: 10 }, { width: 38 }, { width: 8 }, { width: 10 },
    { width: 14 }, { width: 12 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 14 },
    { width: 14 }, { width: 14 }, { width: 10 }, { width: 14 },
    { width: 10 }, { width: 14 }, { width: 12 }, { width: 14 }, { width: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'KPI Môn học');
  XLSX.writeFile(wb, 'KPI_MonHoc_BTEC_Ky2.2526.xlsx');
}

// ═══════════════════════════════════════════════════════
// TABLE 2: Task Checklist Matrix — "Phân công CV Ban ĐH"
// Rows: tasks (grouped by phase), Cols: programs with Check/Note
// ═══════════════════════════════════════════════════════

function exportTaskChecklistMatrix() {
  const XLSX = require('xlsx');
  const wb = XLSX.utils.book_new();

  const programList = programs.filter(p => p.status === 'active');
  const taskList = taskTemplates;
  const taskPhases = [
    { label: '1. Ít nhất 1 tuần trước khi kỳ học bắt đầu', templates: ['tt1', 'tt2', 'tt3'] },
    { label: '2. Trong 2 tuần học đầu tiên', templates: ['tt4'] },
    { label: '3. Giữa kỳ (sau 6 tuần học)', templates: ['tt5', 'tt6', 'tt7', 'tt8', 'tt9', 'tt10'] },
  ];

  const data: (string | boolean | null)[][] = [];

  // Header row 1: TT, Công việc, Check columns per program
  const header1 = ['TT', 'Công việc'];
  programList.forEach(p => {
    header1.push(`Check — ${p.shortName}`);
    header1.push(`Note — ${p.shortName}`);
  });
  data.push(header1);

  // Data rows grouped by phase
  let rowNum = 0;
  taskPhases.forEach(phase => {
    // Phase header row
    const phaseRow: (string | boolean | null)[] = [phase.label, ''];
    programList.forEach(() => { phaseRow.push(null); phaseRow.push(null); });
    data.push(phaseRow);

    phase.templates.forEach(ttId => {
      const tt = taskList.find(t => t.id === ttId);
      if (!tt) return;
      rowNum++;
      const row: (string | boolean | null)[] = [`${rowNum}`, tt.name];

      programList.forEach(p => {
        // Find actual task for this template + program
        const matchingTask = tasks.find(t =>
          t.templateId === ttId && t.programId === p.id
        );
        if (matchingTask) {
          row.push(matchingTask.status === 'DONE' ? 'TRUE' : 'FALSE');
          row.push(matchingTask.issueNote || (matchingTask.status === 'DONE' ? '' : `Tiến độ: ${matchingTask.progress}%`));
        } else {
          row.push('TRUE');
          row.push('');
        }
      });
      data.push(row);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  const cols = [{ width: 6 }, { width: 35 }];
  programList.forEach(() => { cols.push({ width: 10 }); cols.push({ width: 30 }); });
  ws['!cols'] = cols;

  XLSX.utils.book_append_sheet(wb, ws, 'Phân công CV Ban ĐH');
  XLSX.writeFile(wb, 'PhanCong_CV_BanDH_8.2025.xlsx');
}

// ═══════════════════════════════════════════════════════
// EXPORT: Full Task List with Hierarchy
// ═══════════════════════════════════════════════════════

function exportTaskHierarchy(userId?: string) {
  const XLSX = require('xlsx');
  const wb = XLSX.utils.book_new();

  const taskList = userId ? tasks.filter(t => t.ownerId === userId) : tasks;

  const data = [
    ['ID', 'Parent ID', 'Cấp', 'Tiêu đề', 'Mô tả', 'Người thực hiện', 'Chương trình', 'Trạng thái', 'Tiến độ %', 'Deadline', 'Loại', 'Tần suất', 'KPI liên kết', 'Ngày tạo', 'Ghi chú'],
    ...taskList.map(t => {
      const level = !t.parentId ? 'Nhiệm vụ lớn' : getTaskChildren(t.id).length > 0 ? 'Cụm nhiệm vụ' : 'Nhiệm vụ con';
      const prog = getProgramById(t.programId);
      const owner = getUserById(t.ownerId);
      const kpi = t.kpiDefinitionId ? kpiDefinitions.find(k => k.id === t.kpiDefinitionId) : null;
      return [
        t.id, t.parentId || '', level, t.title, t.description,
        owner?.name || '', prog?.shortName || '', t.status, t.progress,
        t.dueDate, t.category === 'kpi' ? 'KPI' : 'Phát sinh', t.frequency,
        kpi?.shortName || '', t.createdAt, t.issueNote,
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { width: 8 }, { width: 8 }, { width: 14 }, { width: 40 }, { width: 30 },
    { width: 20 }, { width: 10 }, { width: 12 }, { width: 8 }, { width: 12 },
    { width: 10 }, { width: 12 }, { width: 14 }, { width: 12 }, { width: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, `Tasks_${userId || 'ALL'}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ═══════════════════════════════════════════════════════
// IMPORT: Parse uploaded Excel back into tasks
// ═══════════════════════════════════════════════════════

interface ImportedTask {
  parentId: string;
  title: string;
  description: string;
  owner: string;
  program: string;
  status: string;
  progress: number;
  dueDate: string;
  category: string;
  frequency: string;
  kpi: string;
}

function parseImportedExcel(file: File): Promise<ImportedTask[]> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const XLSX = require('xlsx');
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

      const imported: ImportedTask[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (!row[3]) continue; // Skip empty titles
        imported.push({
          parentId: row[1] || '',
          title: row[3] || '',
          description: row[4] || '',
          owner: row[5] || '',
          program: row[6] || '',
          status: row[7] || 'TODO',
          progress: parseInt(row[8] as string) || 0,
          dueDate: row[9] || '',
          category: row[10] || 'kpi',
          frequency: row[11] || 'once',
          kpi: row[12] || '',
        });
      }
      resolve(imported);
    };
    reader.readAsArrayBuffer(file);
  });
}

// ═══════════════════════════════════════════════════════
// COMPONENT: ExcelTools Panel
// ═══════════════════════════════════════════════════════

interface Props {
  userId?: string;
  isManager: boolean;
}

export default function ExcelTools({ userId, isManager }: Props) {
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importedTasks, setImportedTasks] = useState<ImportedTask[]>([]);
  const [importFile, setImportFile] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file.name);
    const parsed = await parseImportedExcel(file);
    setImportedTasks(parsed);
    setShowImportPreview(true);
  };

  const confirmImport = () => {
    alert(`✅ Đã import ${importedTasks.length} tasks! (Demo mode — không ghi thực tế)`);
    setShowImportPreview(false);
    setImportedTasks([]);
    setImportFile('');
  };

  return (
    <div>
      {/* Export Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => exportKPICourseTable()} style={{ fontSize: 12 }}>
          <Table2 size={15} /> Export KPI Môn học
        </button>
        <button className="btn btn-secondary" onClick={() => exportTaskChecklistMatrix()} style={{ fontSize: 12 }}>
          <ClipboardList size={15} /> Export Phân công CV
        </button>
        <button className="btn btn-secondary" onClick={() => exportTaskHierarchy(isManager ? undefined : userId)} style={{ fontSize: 12 }}>
          <FileSpreadsheet size={15} /> Export Tasks (phân cấp)
        </button>

        <div style={{ borderLeft: '1px solid var(--gray-200)', margin: '0 4px' }} />

        <button className="btn btn-primary" onClick={() => fileRef.current?.click()} style={{ fontSize: 12 }}>
          <Upload size={15} /> Import Tasks từ Excel
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>

      {/* Import Preview */}
      {showImportPreview && importedTasks.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Preview Import</span>
              <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>{importFile} · {importedTasks.length} tasks</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-secondary" onClick={() => { setShowImportPreview(false); setImportedTasks([]); }}>Hủy</button>
              <button className="btn btn-sm btn-primary" onClick={confirmImport}>✓ Xác nhận Import</button>
            </div>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <table className="data-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ width: 30 }}>#</th>
                  <th>Parent</th>
                  <th>Tiêu đề</th>
                  <th>CT</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Deadline</th>
                  <th>Loại</th>
                </tr>
              </thead>
              <tbody>
                {importedTasks.slice(0, 20).map((t, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ fontSize: 10, color: 'var(--gray-400)' }}>{t.parentId || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{t.title}</td>
                    <td><span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--isme-red-50)', color: 'var(--isme-red)', fontWeight: 600 }}>{t.program}</span></td>
                    <td>{t.status}</td>
                    <td>{t.progress}%</td>
                    <td>{t.dueDate}</td>
                    <td style={{ fontSize: 10 }}>{t.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {importedTasks.length > 20 && (
              <div style={{ padding: 8, textAlign: 'center', fontSize: 12, color: 'var(--gray-400)' }}>
                ... và {importedTasks.length - 20} tasks khác
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
