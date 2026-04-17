'use client';
import React from 'react';
import { useApp } from '@/lib/context';
import { programs, tasks, taskTemplates, getUserById, getProgramById } from '@/lib/mock-data';
import { getTaskChildren } from '@/lib/mock-tasks';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, CheckCircle, XCircle, MinusCircle, ChevronDown, ChevronRight, ExternalLink, Info } from 'lucide-react';

// Checklist CV — 3 giai đoạn thời gian, ~12 CV vận hành đầu kỳ
const phases = [
  {
    id: 'phase1',
    label: '1. Ít nhất 1 tuần trước khi kỳ học bắt đầu',
    tasks: [
      { id: 'cv1', name: 'Gửi DS lớp và TKB cho GV', templateId: 'tt1' },
      { id: 'cv2', name: 'Nhận đủ syllabus từ GV', templateId: 'tt2' },
      { id: 'cv3', name: 'Yêu cầu GV up syllabus và bài đầu tiên lên Moodle/BB', templateId: 'tt3' },
    ],
  },
  {
    id: 'phase2',
    label: '2. Trong 2 tuần học đầu tiên',
    tasks: [
      { id: 'cv4', name: 'GV up tài liệu/slides lên Moodle/BB', templateId: null },
      { id: 'cv5', name: 'GV gửi assessment plan', templateId: 'tt4' },
      { id: 'cv6', name: 'GV điểm danh SV đầy đủ', templateId: 'tt5' },
      { id: 'cv7', name: 'Chốt assessment plan', templateId: 'tt6' },
      { id: 'cv8', name: 'Lên assessment plan toàn bộ chương trình', templateId: null },
    ],
  },
  {
    id: 'phase3',
    label: '3. Giữa kỳ (sau 6 tuần học)',
    tasks: [
      { id: 'cv9', name: 'Tổng hợp tình hình kỷ luật nửa đầu kỳ', templateId: 'tt7' },
      { id: 'cv10', name: 'Nhắc nhở SV nghỉ quá phép', templateId: 'tt8' },
      { id: 'cv11', name: 'Tình hình tài liệu/slides trên Moodle/BB', templateId: 'tt9' },
      { id: 'cv12', name: 'Plan guest speaker/field trip', templateId: 'tt10' },
    ],
  },
];

// Check data matching the Excel — for each task × program combination
// TRUE = done, FALSE = not done, null = N/A, string = note
interface CheckData {
  check: boolean | null;
  note: string;
}

const generateCheckData = (): Record<string, Record<string, CheckData>> => {
  const data: Record<string, Record<string, CheckData>> = {};
  const progIds = ['p3', 'p4', 'p5', 'p6', 'p1', 'p2', 'p7', 'p8', 'p9'];

  phases.forEach(phase => {
    phase.tasks.forEach(cv => {
      data[cv.id] = {};
      progIds.forEach(pid => {
        // Find matching task in system
        const matchingTask = tasks.find(t =>
          t.templateId === cv.templateId && t.programId === pid
        );

        if (matchingTask) {
          data[cv.id][pid] = {
            check: matchingTask.status === 'DONE',
            note: matchingTask.issueNote || (matchingTask.status === 'IN_PROGRESS' ? `Tiến độ: ${matchingTask.progress}%` : ''),
          };
        } else {
          // Simulate data based on the Excel screenshot patterns
          const isEarlyPhase = phase.id === 'phase1';
          const random = Math.sin(cv.id.charCodeAt(2) * 7 + pid.charCodeAt(1) * 13) > -0.3;
          data[cv.id][pid] = {
            check: isEarlyPhase ? true : random,
            note: '',
          };
        }
      });
    });
  });

  // Override with specific data from actual checklist
  data['cv2']['p3'] = { check: true, note: 'Với TA, Phụ trách chương trình sẽ lên lịch trình giảng tổng thể và chi tiết theo từng kĩ năng gửi cho từng GV' };
  data['cv2']['p5'] = { check: false, note: 'Hiện còn PPD K66 (Hương Lan) và Softskills K67 (Thùy Dương) chưa gửi lại syllabus' };

  data['cv4']['p3'] = { check: true, note: 'GV in tài liệu theo tuần, và giao bài theo tuần kèm bài tập thêm online cho SV' };

  data['cv5']['p3'] = { check: true, note: 'Phụ trách chương trình TA lên assessment plan cả level, gửi cho GV và CNL, SV' };
  data['cv5']['p5'] = { check: false, note: 'UWE gửi CW brief, nhiều môn chưa có' };

  data['cv6']['p5'] = { check: false, note: 'Microeconomics - GV không điểm danh\nAccounting Principles - GV điểm danh giấy, đã nhắc nhưng chưa chuyển lại\nBiology - GV điểm danh giấy, đã nhắc nhưng chưa chuyển lại\nSoftskills - GV chưa update điểm danh, đã nhắc' };

  data['cv7']['p3'] = { check: false, note: '' };
  data['cv7']['p5'] = { check: false, note: '' };

  data['cv8']['p3'] = { check: false, note: '' };
  data['cv8']['p5'] = { check: null, note: 'N/A' };

  // Phase 3: Giữa kỳ — mostly not done
  ['p3', 'p4', 'p5', 'p6', 'p1', 'p2', 'p7', 'p8', 'p9'].forEach(pid => {
    data['cv9'][pid] = { check: false, note: pid === 'p3' ? 'Tổng hợp kỉ luật hàng tuần' : '' };
    data['cv10'][pid] = { check: false, note: pid === 'p3' ? 'Dựa trên bảng tổng hợp kỉ luật hàng tuần, CNL thông báo về gia đình' : '' };
    data['cv11'][pid] = { check: false, note: '' };
    data['cv12'][pid] = { check: pid === 'p9', note: '' };
  });

  return data;
};

const checkData = generateCheckData();

export default function TaskChecklistPage() {
  const { currentRole, currentUserId } = useApp();
  const router = useRouter();
  const [selectedCell, setSelectedCell] = useState<{ cvId: string; cvName: string; progId: string; progName: string; cd: CheckData; phase: string } | null>(null);

  const isManager = currentRole === 'manager' || currentRole === 'admin';
  const programList = programs.filter(p => p.status === 'active');

  // Calculate summary stats
  let totalChecks = 0, trueChecks = 0;
  Object.values(checkData).forEach(progData => {
    Object.values(progData).forEach(cd => {
      if (cd.check !== null) { totalChecks++; if (cd.check) trueChecks++; }
    });
  });

  const exportToExcel = () => {
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();

    const header = ['TT', 'Công việc'];
    programList.forEach(p => { header.push(`Check — ${p.shortName}`); header.push(`Note — ${p.shortName}`); });

    const rows: (string | boolean | null)[][] = [header];
    let num = 0;
    phases.forEach(phase => {
      const phaseRow: (string | null)[] = [phase.label, ''];
      programList.forEach(() => { phaseRow.push(null); phaseRow.push(null); });
      rows.push(phaseRow);

      phase.tasks.forEach(cv => {
        num++;
        const row: (string | boolean | null)[] = [`${num}`, cv.name];
        programList.forEach(p => {
          const cd = checkData[cv.id]?.[p.id];
          row.push(cd?.check === true ? 'TRUE' : cd?.check === false ? 'FALSE' : 'N/A');
          row.push(cd?.note || '');
        });
        rows.push(row);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ width: 6 }, { width: 40 }, ...programList.flatMap(() => [{ width: 10 }, { width: 28 }])];
    XLSX.utils.book_append_sheet(wb, ws, 'Phân công CV');
    XLSX.writeFile(wb, 'PhanCong_CV_BanDH.xlsx');
  };

  const handleCellClick = (cvId: string, cvName: string, progId: string, cd: CheckData, phaseName: string) => {
    const prog = programList.find(p => p.id === progId);
    setSelectedCell({ cvId, cvName, progId, progName: prog?.shortName || '', cd, phase: phaseName });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Checklist phân công CV Ban ĐH</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>
            Check-list các CV chính đầu kỳ tất cả chương trình đều phải chỉnh ·
            <span style={{ fontWeight: 600, color: trueChecks / totalChecks >= 0.8 ? '#047857' : '#D97706', marginLeft: 4 }}>
              {trueChecks}/{totalChecks} hoàn thành ({Math.round(trueChecks / totalChecks * 100)}%)
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>

          <button className="btn btn-secondary" onClick={exportToExcel} style={{ fontSize: 12 }}>
            <Download size={14} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1200 }}>
          <thead>
            <tr style={{ background: 'var(--gray-800)', color: 'white' }}>
              <th style={{ ...thStyle, width: 36, position: 'sticky', left: 0, top: 0, zIndex: 4, background: 'var(--gray-800)' }}>TT</th>
              <th style={{ ...thStyle, minWidth: 260, textAlign: 'left', position: 'sticky', left: 36, top: 0, zIndex: 4, background: 'var(--gray-800)' }}>Công việc</th>
              {programList.map((p, pi) => {
                const colors = ['#9B1B30', '#1E40AF', '#047857', '#7C3AED', '#0891B2', '#D97706', '#6D28D9', '#0E7490', '#DC2626'];
                return (
                  <th key={p.id} colSpan={2} style={{ ...thStyle, background: colors[pi % colors.length], textAlign: 'center', position: 'sticky', top: 0, zIndex: 3 }}>
                    {p.shortName}
                  </th>
                );
              })}
            </tr>
            <tr style={{ background: 'var(--gray-100)' }}>
              <th style={{ ...th2Style, position: 'sticky', left: 0, top: 34, zIndex: 4, background: 'var(--gray-100)' }}></th>
              <th style={{ ...th2Style, textAlign: 'left', position: 'sticky', left: 36, top: 34, zIndex: 4, background: 'var(--gray-100)' }}></th>
              {programList.map(p => (
                <React.Fragment key={p.id}>
                  <th style={{ ...th2Style, position: 'sticky', top: 34, zIndex: 3, background: 'var(--gray-100)' }}>Check</th>
                  <th style={{ ...th2Style, minWidth: 120, position: 'sticky', top: 34, zIndex: 3, background: 'var(--gray-100)' }}>Note</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {phases.map(phase => (
              <React.Fragment key={phase.id}>
                {/* Phase Header */}
                <tr style={{ background: 'var(--gray-50)' }}>
                  <td colSpan={2 + programList.length * 2} style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13, color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-200)' }}>
                    {phase.label}
                  </td>
                </tr>

                {/* Task Rows */}
                {phase.tasks.map((cv, ci) => {
                  const checks = programList.map(p => checkData[cv.id]?.[p.id]);
                  const done = checks.filter(c => c?.check === true).length;
                  const total = checks.filter(c => c?.check !== null).length;

                  return (
                    <tr key={cv.id} style={{ background: ci % 2 === 1 ? 'rgba(241,245,249,0.5)' : 'white', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => { Array.from(e.currentTarget.cells).forEach(c => (c as HTMLElement).style.background = 'rgba(155,27,48,0.02)'); }}
                      onMouseLeave={e => { Array.from(e.currentTarget.cells).forEach((c, i) => { const bg = ci % 2 === 1 ? 'rgba(241,245,249,0.5)' : 'white'; (c as HTMLElement).style.background = ''; }); }}
                    >
                      <td style={{ ...tdStyle, position: 'sticky', left: 0, zIndex: 1, background: ci % 2 === 1 ? 'var(--gray-50)' : 'white', fontWeight: 600, color: 'var(--gray-400)' }}></td>
                      <td style={{ ...tdStyle, textAlign: 'left', position: 'sticky', left: 36, zIndex: 1, background: ci % 2 === 1 ? 'var(--gray-50)' : 'white', whiteSpace: 'normal', wordBreak: 'break-word', minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 500 }}>{cv.name}</span>
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, marginLeft: 8, fontWeight: 700, whiteSpace: 'nowrap', background: done === total ? 'rgba(16,185,129,0.1)' : 'rgba(217,119,6,0.1)', color: done === total ? '#047857' : '#D97706' }}>
                            {done}/{total}
                          </span>
                        </div>
                      </td>

                      {/* Program Check + Note columns */}
                      {programList.map(p => {
                        const cd = checkData[cv.id]?.[p.id] || { check: null, note: '' };
                        const isClickable = cd.check === false;
                        const isSelected = selectedCell?.cvId === cv.id && selectedCell?.progId === p.id;
                        return (
                          <React.Fragment key={p.id}>
                            {/* Check column */}
                            <td
                              onClick={isClickable ? () => handleCellClick(cv.id, cv.name, p.id, cd, phase.label) : undefined}
                              style={{
                                ...tdStyle,
                                background: isSelected ? 'rgba(59,130,246,0.15)' : cd.check === true ? 'rgba(16,185,129,0.06)' : cd.check === false ? 'rgba(220,38,38,0.04)' : 'var(--gray-50)',
                                cursor: isClickable ? 'pointer' : 'default',
                                outline: isSelected ? '2px solid #3B82F6' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cd.check === true ? (
                                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle size={14} color="#10B981" />
                                  </div>
                                ) : cd.check === false ? (
                                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <XCircle size={14} color="#EF4444" />
                                  </div>
                                ) : (
                                  <MinusCircle size={14} color="#9CA3AF" />
                                )}
                              </div>
                            </td>
                            {/* Note column */}
                            <td
                              onClick={isClickable ? () => handleCellClick(cv.id, cv.name, p.id, cd, phase.label) : undefined}
                              style={{
                                ...tdStyle,
                                whiteSpace: 'normal',
                                verticalAlign: 'top',
                                textAlign: 'left',
                                fontSize: 10,
                                color: 'var(--gray-500)',
                                lineHeight: 1.4,
                                minWidth: 120,
                                background: isSelected ? 'rgba(59,130,246,0.08)' : cd.check === true ? 'rgba(16,185,129,0.03)' : cd.check === false ? 'rgba(220,38,38,0.02)' : 'var(--gray-50)',
                                cursor: isClickable ? 'pointer' : 'default',
                                outline: isSelected ? '2px solid #3B82F6' : 'none',
                              }}
                            >
                              {cd.note || ''}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel - slide from right */}
      {selectedCell && (
        <div className="slide-over" style={{ width: 420, zIndex: 100 }}>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'white', background: '#EF4444', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 8 }}>
                Chưa hoàn thành
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{selectedCell.cvName}</h2>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '4px 0 0' }}>{selectedCell.phase}</p>
            </div>
            <button onClick={() => setSelectedCell(null)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--gray-500)' }}>
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto' }}>
            {/* Program */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Chương trình</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--isme-red)' }}>{selectedCell.progName}</div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trạng thái</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={18} color="#EF4444" />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#EF4444' }}>Chưa hoàn thành</span>
              </div>
            </div>

            {/* Note */}
            {selectedCell.cd.note && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ghi chú</div>
                <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, background: 'var(--gray-50)', padding: '12px 16px', borderRadius: 8, whiteSpace: 'pre-line' }}>
                  {selectedCell.cd.note}
                </div>
              </div>
            )}

            {/* Related tasks in system */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Công việc liên quan trong hệ thống</div>
              {(() => {
                const cvData = phases.flatMap(ph => ph.tasks).find(t => t.id === selectedCell.cvId);
                const relatedTasks = tasks.filter(t =>
                  t.templateId === cvData?.templateId && t.programId === selectedCell.progId
                );
                if (relatedTasks.length === 0) return (
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>Chưa có task nào được tạo cho công việc này</div>
                );
                return relatedTasks.map(t => (
                  <div key={t.id}
                    onClick={() => router.push(`/tasks/${t.id}`)}
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gray-100)', marginBottom: 6, cursor: 'pointer', background: 'white', transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</span>
                      <ExternalLink size={12} color="var(--gray-400)" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: t.status === 'DONE' ? 'rgba(16,185,129,0.1)' : t.status === 'IN_PROGRESS' ? 'rgba(59,130,246,0.1)' : 'rgba(220,38,38,0.1)', color: t.status === 'DONE' ? '#047857' : t.status === 'IN_PROGRESS' ? '#2563EB' : '#DC2626' }}>
                        {t.status === 'DONE' ? 'Hoàn thành' : t.status === 'IN_PROGRESS' ? 'Đang làm' : 'Chưa làm'}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>
                        {t.ownerId ? getUserById(t.ownerId)?.name : 'Chưa giao'}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Other programs status for same task */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tình hình các chương trình khác</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {programList.map(p => {
                  const cd = checkData[selectedCell.cvId]?.[p.id];
                  if (!cd || cd.check === null) return null;
                  return (
                    <div key={p.id} style={{
                      padding: '6px 10px', borderRadius: 6, fontSize: 11, textAlign: 'center',
                      background: cd.check ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)',
                      color: cd.check ? '#047857' : '#DC2626',
                      fontWeight: p.id === selectedCell.progId ? 800 : 500,
                      border: p.id === selectedCell.progId ? '2px solid #3B82F6' : '1px solid transparent',
                    }}>
                      {cd.check ? '✓' : '✗'} {p.shortName}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: 12 }} onClick={() => { router.push('/tasks'); setSelectedCell(null); }}>
              Mở trang Task
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setSelectedCell(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {selectedCell && (
        <div className="overlay" onClick={() => setSelectedCell(null)} style={{ zIndex: 99 }} />
      )}

      {/* Summary per Program */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(programList.length, 6)}, 1fr)`, gap: 8, marginTop: 16 }}>
        {programList.slice(0, 6).map(p => {
          let pDone = 0, pTotal = 0;
          phases.forEach(phase => {
            phase.tasks.forEach(cv => {
              const cd = checkData[cv.id]?.[p.id];
              if (cd && cd.check !== null) { pTotal++; if (cd.check) pDone++; }
            });
          });
          const pct = pTotal > 0 ? Math.round(pDone / pTotal * 100) : 0;
          return (
            <div key={p.id} className="card card-compact" style={{ textAlign: 'center', padding: '12px 8px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: pct >= 80 ? '#047857' : pct >= 50 ? '#D97706' : '#DC2626' }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{p.shortName}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{pDone}/{pTotal}</div>
            </div>
          );
        })}
      </div>


    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center',
};

const th2Style: React.CSSProperties = {
  padding: '6px 8px', fontSize: 10, fontWeight: 600,
  border: '1px solid var(--gray-200)', textAlign: 'center', color: 'var(--gray-500)',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 8px', fontSize: 12, textAlign: 'center',
  border: '1px solid var(--gray-100)', whiteSpace: 'nowrap',
};
