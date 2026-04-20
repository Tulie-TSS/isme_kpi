'use client';
import { useApp } from '@/lib/context';
import { courses, programs, getUserById, createCourseEditRequest, getPendingCourseEditForField, getCourseEditRequests, subscribeCourseEditRequests, approveCourseEditRequest, rejectCourseEditRequest, semesterData } from '@/lib/mock-data';
import { CourseEditRequest, CourseEditField } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Download, Edit3, X, Clock, CheckCircle, XCircle, ChevronDown, ChevronRight, User, Settings, ShieldCheck } from 'lucide-react';


function getColor(val: number, target: number) {
  if (val >= target * 1.05) return '#047857';
  if (val >= target) return '#059669';
  if (val >= target * 0.9) return '#D97706';
  return '#DC2626';
}

// ── Inline edit cell dialog ──
interface EditCellProps {
  courseId: string; courseName: string; field: CourseEditField; fieldLabel: string;
  currentValue: number; userId: string; onDone: () => void;
}
function EditCellDialog({ courseId, courseName, field, fieldLabel, currentValue, userId, onDone }: EditCellProps) {
  const [val, setVal] = useState(currentValue);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const pending = getPendingCourseEditForField(courseId, field);

  const submit = () => {
    if (!reason.trim() || reason.trim().length < 10) { setErr('Lý do cần ít nhất 10 ký tự'); return; }
    if (val === currentValue) { setErr('Chưa có thay đổi'); return; }
    createCourseEditRequest({ courseId, userId, field, fieldLabel: `${courseName} — ${fieldLabel}`, oldValue: currentValue, newValue: val, reason: reason.trim() });
    onDone();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onDone}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Chỉnh sửa số liệu</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{courseName} — {fieldLabel}</div>
          </div>
          <button onClick={onDone} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><X size={16} color="white" /></button>
        </div>
        {pending ? (
          <div style={{ padding: 20 }}>
            <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: 14, display: 'flex', gap: 10 }}>
              <Clock size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>Đã có yêu cầu đang chờ duyệt</div>
                <div style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>
                  Thay đổi: <b>{pending.oldValue}%</b> → <b>{pending.newValue}%</b>
                </div>
                <div style={{ fontSize: 11, color: '#B45309', marginTop: 4, fontStyle: 'italic' }}>"{pending.reason}"</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>Giá trị hiện tại</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{currentValue}%</div>
              </div>
              <div style={{ fontSize: 20, color: 'var(--gray-300)', paddingTop: 18 }}>→</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>Giá trị mới</div>
                <input type="number" value={val} onChange={e => setVal(parseFloat(e.target.value) || 0)}
                  style={{ width: 100, padding: '8px 12px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 16, fontWeight: 700, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} />
              </div>
            </div>
            <textarea value={reason} onChange={e => { setReason(e.target.value); setErr(''); }}
              placeholder="Lý do chỉnh sửa (bắt buộc, ≥10 ký tự)..." rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 12 }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} />
            {err && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{err}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onDone} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Huỷ</button>
              <button onClick={submit} disabled={val === currentValue || !reason.trim()} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: val !== currentValue && reason.trim() ? 'pointer' : 'not-allowed',
                background: val !== currentValue && reason.trim() ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--gray-200)', color: val !== currentValue && reason.trim() ? 'white' : 'var(--gray-400)',
              }}>Gửi yêu cầu</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Course Approval Panel ──
function CourseApprovalPanel({ isManager, userId, selectedProgramId }: { isManager: boolean; userId: string; selectedProgramId: string }) {
  const [reqs, setReqs] = useState<CourseEditRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setReqs(getCourseEditRequests());
    const unsub = subscribeCourseEditRequests(() => setReqs(getCourseEditRequests()));
    return unsub;
  }, []);

  const filtered = (isManager ? reqs : reqs.filter(r => r.userId === userId)).filter(r => {
    if (selectedProgramId === 'all') return true;
    const course = courses.find(c => c.id === r.courseId);
    return course?.programId === selectedProgramId;
  });
  
  const pendingCount = filtered.filter(r => r.status === 'pending').length;
  if (filtered.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #3B82F610, #F59E0B10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Edit3 size={16} color="#3B82F6" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Yêu cầu sửa số liệu môn học</span>
          {pendingCount > 0 && <span style={{ background: '#F59E0B', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>}
        </div>
      </div>
      {filtered.map((r, i) => {
        const st = r.status === 'pending' ? { bg: '#FEF3C7', color: '#92400E', label: 'Chờ duyệt' } : r.status === 'approved' ? { bg: '#D1FAE5', color: '#065F46', label: 'Đã duyệt' } : { bg: '#FEE2E2', color: '#991B1B', label: 'Từ chối' };
        const user = getUserById(r.userId);
        const reviewer = r.reviewedBy ? getUserById(r.reviewedBy) : null;
        const isOpen = expandedId === r.id;
        return (
          <div key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
            <div onClick={() => setExpandedId(isOpen ? null : r.id)} style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {isOpen ? <ChevronDown size={13} color="var(--gray-400)" /> : <ChevronRight size={13} color="var(--gray-400)" />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.fieldLabel}</div>
                {isManager && <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 3 }}><User size={10} />{user?.name}</div>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: 'var(--gray-400)' }}>{r.oldValue}%</span>
                <span style={{ color: 'var(--gray-300)', margin: '0 4px' }}>→</span>
                <span style={{ color: r.newValue > r.oldValue ? '#10B981' : '#EF4444' }}>{r.newValue}%</span>
              </span>
              <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
            </div>
            {isOpen && (
              <div style={{ padding: '0 20px 14px 40px', background: 'var(--gray-50)' }}>
                <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--gray-100)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 4 }}>Lý do</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 8 }}>{r.reason}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Gửi: {r.requestedAt}</div>
                  {r.status !== 'pending' && (
                    <div style={{ background: st.bg, borderRadius: 6, padding: 10, marginTop: 8, fontSize: 12, color: st.color }}>
                      {r.status === 'approved' ? '✓ Đã duyệt' : '✗ Từ chối'} bởi {reviewer?.name} — {r.reviewedAt}
                      {r.reviewNote && <div style={{ fontStyle: 'italic', marginTop: 4 }}>"{r.reviewNote}"</div>}
                    </div>
                  )}
                  {r.status === 'pending' && isManager && (
                    <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10, marginTop: 8 }}>
                      <textarea placeholder="Ghi chú (bắt buộc khi từ chối)..." value={notes[r.id] || ''} onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))} rows={2}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 12, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => { if (!notes[r.id]?.trim()) { alert('Nhập lý do từ chối'); return; } rejectCourseEditRequest(r.id, userId, notes[r.id]); }}
                          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <XCircle size={12} /> Từ chối
                        </button>
                        <button onClick={() => approveCourseEditRequest(r.id, userId, notes[r.id] || 'Đồng ý.')}
                          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircle size={12} /> Duyệt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Editable cell component ──
function EditableCell({ courseId, courseName, field, fieldLabel, value, displayVal, style, isStaff, userId, onEdit }: {
  courseId: string; courseName: string; field: CourseEditField; fieldLabel: string;
  value: number; displayVal: string; style: React.CSSProperties; isStaff: boolean; userId: string;
  onEdit: (courseId: string, courseName: string, field: CourseEditField, fieldLabel: string, value: number) => void;
}) {
  const pending = getPendingCourseEditForField(courseId, field);
  return (
    <td style={{ ...style, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <span>{displayVal}</span>
        {isStaff && !pending && (
          <button onClick={() => onEdit(courseId, courseName, field, fieldLabel, value)} title="Sửa"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, opacity: 0.3, transition: 'opacity 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}>
            <Edit3 size={10} color="#3B82F6" />
          </button>
        )}
      </div>
      {pending && (
        <div style={{ position: 'absolute', top: 1, right: 1 }} title={`Chờ duyệt: ${pending.oldValue}% → ${pending.newValue}%`}>
          <Clock size={10} color="#F59E0B" />
        </div>
      )}
    </td>
  );
}

// ── Target Configuration Dialog (Manager ONLY) ──
function TargetConfigDialog({ programName, currentData = {}, onClose, onSave }: { programName: string, currentData: any, onClose: () => void, onSave: (data: any) => void }) {
  const [attendTarget, setAttendTarget] = useState(currentData.attendTarget || 85);
  const [passTarget, setPassTarget] = useState(currentData.passTargetStart || 75);
  const [attendNext, setAttendNext] = useState(currentData.attendTargetNext || 90);
  const [passNext, setPassNext] = useState(currentData.passTargetNext || 80);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Cấu hình Mục tiêu KPI</h3>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Áp dụng chung cho chương trình: <strong style={{ color: 'var(--isme-red)' }}>{programName}</strong></div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color="var(--gray-600)" /></button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 16, background: 'var(--gray-50)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 12 }}>KỲ HIỆN TẠI (1.2526)</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Chuyên cần (%)</label>
                <input type="number" value={attendTarget} onChange={e => setAttendTarget(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 14, fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Học tập - Pass (%)</label>
                <input type="number" value={passTarget} onChange={e => setPassTarget(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 14, fontWeight: 700 }} />
              </div>
            </div>
            <div className="card" style={{ padding: 16, background: 'var(--info-light)', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8', marginBottom: 12 }}>KỲ MỚI (2.2526)</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Chuyên cần (%)</label>
                <input type="number" value={attendNext} onChange={e => setAttendNext(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #BFDBFE', background: 'white', fontSize: 14, fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Học tập - Pass (%)</label>
                <input type="number" value={passNext} onChange={e => setPassNext(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #BFDBFE', background: 'white', fontSize: 14, fontWeight: 700 }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', background: 'white' }}>Huỷ bỏ</button>
            <button className="btn btn-primary" onClick={() => onSave({ attendTarget, passTarget, attendNext, passNext })} style={{ padding: '8px 16px' }}>Lưu cấu hình</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──
export default function KPICoursePage() {
  const { currentRole, currentUserId, selectedProgramId, setSelectedProgramId } = useApp();
  const [selectedProgram, setSelectedProgram] = useState(selectedProgramId !== 'all' ? selectedProgramId : 'p3');
  const [editTarget, setEditTarget] = useState<{ courseId: string; courseName: string; field: CourseEditField; fieldLabel: string; value: number } | null>(null);
  const [, forceUpdate] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  
  // Sync with global filter
  useEffect(() => {
    if (selectedProgramId !== 'all' && selectedProgramId !== selectedProgram) {
      setSelectedProgram(selectedProgramId);
    }
  }, [selectedProgramId]);

  const program = programs.find(p => p.id === selectedProgram);
  const coordinator = program ? getUserById(program.managerId) : null;
  const programCourses = courses.filter(c => c.programId === selectedProgram);
  const isStaff = currentRole === 'staff';
  const isManager = currentRole === 'manager' || currentRole === 'admin';

  useEffect(() => {
    const unsub = subscribeCourseEditRequests(() => forceUpdate((n: number) => n + 1));
    return unsub;
  }, []);

  const handleEdit = (courseId: string, courseName: string, field: CourseEditField, fieldLabel: string, value: number) => {
    setEditTarget({ courseId, courseName, field, fieldLabel, value });
  };

  const currentProgramData = programCourses.length > 0 ? semesterData[programCourses[0].id] : {};

  const handleSaveConfig = (data: any) => {
    programCourses.forEach(c => {
      if (!semesterData[c.id]) return;
      semesterData[c.id].attendTarget = data.attendTarget;
      semesterData[c.id].passTargetStart = data.passTarget;
      semesterData[c.id].attendTargetNext = data.attendNext;
      semesterData[c.id].passTargetNext = data.passNext;
    });
    setShowConfig(false);
    forceUpdate((n: number) => n + 1);
  };

  const exportToExcel = () => {
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const header = ['Chương trình', 'Lớp', 'Môn', 'Số GV', 'Số SV', 'ĐK CC (%)', 'MT CC (%)', 'ĐK Pass (%)', 'ĐK Nộp bài (%)', 'MT Pass (%)', 'KQ CC (%)', 'KQ Nộp bài (%)', 'KQ Pass (%)'];
    const rows = programCourses.map(c => {
      const d = semesterData[c.id];
      if (!d) return [program?.shortName, c.cohort, c.name, c.numLecturers, c.numStudents, ...Array(8).fill('')];
      return [program?.shortName, c.cohort, c.name, c.numLecturers, c.numStudents, d.attendStart, d.attendTarget, d.passStart, d.submitStart, d.passTargetStart, d.attendEnd, d.submitEnd, d.passEnd];
    });
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws['!cols'] = header.map(() => ({ width: 14 })); ws['!cols'][2] = { width: 38 };
    XLSX.utils.book_append_sheet(wb, ws, 'KPI Môn học');
    XLSX.writeFile(wb, `KPI_MonHoc_${program?.shortName}_Ky2.2526.xlsx`);
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {showConfig && program && (
        <TargetConfigDialog programName={program.name} currentData={currentProgramData} onClose={() => setShowConfig(false)} onSave={handleSaveConfig} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Bảng theo dõi KPI Môn học</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>Số liệu chuyên cần, học tập, nộp bài theo từng môn · Kỳ 2.2526 </p>
            {coordinator && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gray-100)', padding: '4px 12px', borderRadius: 8 }}>
                <ShieldCheck size={14} color="var(--gray-500)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' }}>Phụ trách hệ: {coordinator.name}</span>
              </div>
            )}
          </div>
          {isStaff && <div style={{ color: '#3B82F6', fontSize: 12, fontWeight: 500 }}>· Bấm ✏️ để sửa số liệu</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isManager && (
            <button className="btn btn-secondary" onClick={() => setShowConfig(true)} style={{ fontSize: 12 }}>
              <Settings size={14} /> Cấu hình mục tiêu
            </button>
          )}
          <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'white' }}>
            {programs.filter(p => p.status === 'active').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={exportToExcel} style={{ fontSize: 12 }}>
            <Download size={14} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Course Edit Approval Panel */}
      <CourseApprovalPanel isManager={isManager} userId={currentUserId} selectedProgramId={selectedProgram} />

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1400 }}>
          <thead>
            <tr style={{ background: 'var(--gray-800)', color: 'white' }}>
              <th rowSpan={3} style={thStyle}>Chương trình</th>
              <th rowSpan={3} style={thStyle}>Lớp</th>
              <th rowSpan={3} style={{ ...thStyle, minWidth: 200 }}>Môn</th>
              <th rowSpan={3} style={thStyle}>Số GV</th>
              <th rowSpan={3} style={thStyle}>Số SV</th>
              <th colSpan={6} style={{ ...thStyle, background: '#1E40AF', textAlign: 'center' }}>MỤC TIÊU ĐẦU KỲ 1.2526</th>
              <th colSpan={4} style={{ ...thStyle, background: '#047857', textAlign: 'center' }}>KẾT QUẢ CUỐI KỲ 1.2526</th>
              <th colSpan={3} style={{ ...thStyle, background: '#7C3AED', textAlign: 'center' }}>MỨC ĐỘ HOÀN THÀNH</th>
              <th colSpan={4} style={{ ...thStyle, background: '#0891B2', textAlign: 'center' }}>MỤC TIÊU KỲ MỚI 2.2526</th>
            </tr>
            <tr style={{ background: 'var(--gray-700)', color: 'white' }}>
              <th colSpan={3} style={{ ...thStyle, textAlign: 'center', background: '#1E3A8A' }}>Chuyên cần</th>
              <th colSpan={3} style={{ ...thStyle, textAlign: 'center', background: '#1E3A8A' }}>Học tập</th>
              <th colSpan={2} style={{ ...thStyle, textAlign: 'center', background: '#065F46' }}>Chuyên cần</th>
              <th colSpan={2} style={{ ...thStyle, textAlign: 'center', background: '#065F46' }}>Học tập</th>
              <th style={{ ...thStyle, textAlign: 'center', background: '#6D28D9' }}>CC</th>
              <th style={{ ...thStyle, textAlign: 'center', background: '#6D28D9' }}>Pass</th>
              <th style={{ ...thStyle, textAlign: 'center', background: '#6D28D9' }}>Nộp bài</th>
              <th colSpan={2} style={{ ...thStyle, textAlign: 'center', background: '#0E7490' }}>Chuyên cần</th>
              <th colSpan={2} style={{ ...thStyle, textAlign: 'center', background: '#0E7490' }}>Học tập</th>
            </tr>
            <tr style={{ background: 'var(--gray-100)' }}>
              <th style={th2Style}>Tỷ lệ SV đi điểm</th><th style={th2Style}>Mục tiêu</th><th style={th2Style}>Pass kỳ trước</th>
              <th style={th2Style}>Nộp bài đúng hạn</th><th style={th2Style}>Mục tiêu (pass)</th><th style={th2Style}>KQ chuyên cần</th>
              <th style={th2Style}>Nộp bài</th><th style={th2Style}>KQ học tập</th><th style={th2Style}>Kỳ bài</th><th style={th2Style}>Nộp bài</th>
              <th style={th2Style}>%</th><th style={th2Style}>%</th><th style={th2Style}>%</th>
              <th style={th2Style}>Tỷ lệ SV</th><th style={th2Style}>Mục tiêu</th><th style={th2Style}>Pass kỳ trước</th><th style={th2Style}>Mục tiêu (pass)</th>
            </tr>
          </thead>
          <tbody>
            {programCourses.map((c, ci) => {
              const d = semesterData[c.id] || {
                attendStart: c.attendanceRate * 100,
                attendTarget: c.attendanceTarget * 100,
                passStart: c.passRate * 100,
                submitStart: c.submitRate * 100,
                passTargetStart: c.passTarget * 100,
                attendEnd: c.attendanceRate * 100,
                submitEnd: c.submitRate * 100,
                passEnd: c.passRate * 100,
                attendCompletion: 100,
                passCompletion: 100,
                submitCompletion: 100,
                attendNext: c.attendanceRate * 100,
                attendTargetNext: c.attendanceTarget * 100,
                passNext: c.passRate * 100,
                passTargetNext: c.passTarget * 100
              };
              return (
                <tr key={c.id} style={{ background: ci % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                  {ci === 0 && <td rowSpan={programCourses.length} style={{ ...tdStyle, fontWeight: 700, color: 'var(--isme-red)', verticalAlign: 'middle', fontSize: 13, background: 'var(--isme-red-50)', padding: '16px 12px', whiteSpace: 'normal', minWidth: 80 }}>{program?.name}</td>}
                  <td style={tdStyle}>{c.cohort}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{c.name}</td>
                  <td style={tdStyle}>{c.numLecturers}</td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{c.numStudents}</td>
                  {/* Mục tiêu đầu kỳ — editable cells */}
                  <EditableCell courseId={c.id} courseName={c.name} field="attendanceRate" fieldLabel="Tỷ lệ chuyên cần" value={d.attendStart} displayVal={d.attendStart > 0 ? `${d.attendStart}%` : ''} style={{ ...tdStyle, color: getColor(d.attendStart, d.attendTarget), fontWeight: 600 }} isStaff={isStaff} userId={currentUserId} onEdit={handleEdit} />
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{d.attendTarget}%</td>
                  <EditableCell courseId={c.id} courseName={c.name} field="passRate" fieldLabel="Tỷ lệ pass" value={d.passStart} displayVal={d.passStart > 0 ? `${d.passStart}%` : ''} style={tdStyle} isStaff={isStaff} userId={currentUserId} onEdit={handleEdit} />
                  <EditableCell courseId={c.id} courseName={c.name} field="submitRate" fieldLabel="Nộp bài đúng hạn" value={d.submitStart} displayVal={`${d.submitStart}%`} style={tdStyle} isStaff={isStaff} userId={currentUserId} onEdit={handleEdit} />
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{d.passTargetStart}%</td>
                  <td style={{ ...tdStyle, color: getColor(d.attendEnd, d.attendTarget), fontWeight: 600 }}>{`${d.attendEnd}%`}</td>
                  <td style={tdStyle}>{d.submitEnd}%</td>
                  <td style={{ ...tdStyle, color: getColor(d.passEnd, d.passTargetStart), fontWeight: 600 }}>{d.passEnd}%</td>
                  <td style={tdStyle}>{d.attendCompletion > 0 ? `${d.attendCompletion}%` : ''}</td>
                  <td style={tdStyle}>{d.passCompletion > 0 ? `${d.passCompletion}%` : ''}</td>
                  <td style={{ ...tdStyle, background: d.attendCompletion >= 100 ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.08)', fontWeight: 700, color: d.attendCompletion >= 100 ? '#047857' : '#DC2626' }}>{d.attendCompletion > 0 ? `${d.attendCompletion}%` : ''}</td>
                  <td style={{ ...tdStyle, background: d.passCompletion >= 100 ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.08)', fontWeight: 700, color: d.passCompletion >= 100 ? '#047857' : '#DC2626' }}>{d.passCompletion > 0 ? `${d.passCompletion}%` : ''}</td>
                  <td style={{ ...tdStyle, background: d.submitCompletion >= 100 ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.08)', fontWeight: 700, color: d.submitCompletion >= 100 ? '#047857' : '#DC2626' }}>{d.submitCompletion > 0 ? `${d.submitCompletion}%` : ''}</td>
                  <td style={{ ...tdStyle, color: 'var(--info)', fontWeight: 600 }}>{d.attendNext}%</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{d.attendTargetNext}%</td>
                  <td style={{ ...tdStyle, color: 'var(--info)', fontWeight: 600 }}>{d.passNext}%</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{d.passTargetNext}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { color: '#047857', bg: 'rgba(16,185,129,0.1)', label: 'Đạt / Vượt mục tiêu' },
          { color: '#D97706', bg: 'rgba(217,119,6,0.1)', label: 'Gần đạt (≥90%)' },
          { color: '#DC2626', bg: 'rgba(220,38,38,0.1)', label: 'Chưa đạt' },
          { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', label: '✏️ Có thể chỉnh sửa (hover để thấy)' },
          { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: '⏳ Đang chờ duyệt' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--gray-500)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.color}` }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      {editTarget && (
        <EditCellDialog
          courseId={editTarget.courseId} courseName={editTarget.courseName}
          field={editTarget.field} fieldLabel={editTarget.fieldLabel}
          currentValue={editTarget.value} userId={currentUserId}
          onDone={() => { setEditTarget(null); forceUpdate((n: number) => n + 1); }}
        />
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', minWidth: 60,
};

const th2Style: React.CSSProperties = {
  padding: '6px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
  border: '1px solid var(--gray-200)', textAlign: 'center', color: 'var(--gray-600)',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px', fontSize: 12, textAlign: 'center',
  border: '1px solid var(--gray-100)', whiteSpace: 'nowrap',
};
