'use client';
import { useApp } from '@/lib/context';
import PortalModal from '@/components/common/PortalModal';
import { 
  courses, 
  programs, 
  getUserById, 
  createCourseEditRequest, 
  getPendingCourseEditForField, 
  getCourseEditRequests, 
  subscribeCourseEditRequests, 
  approveCourseEditRequest, 
  rejectCourseEditRequest, 
  semesterData,
  updateCourseValue,
  getSubmissionStatus,
  addAuditLog
} from '@/lib/mock-data';
import { CourseEditRequest, CourseEditField, Course } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Download, Edit3, X, Clock, CheckCircle, XCircle, ChevronDown, ChevronRight, User, Settings, ShieldCheck, HelpCircle, BookOpen, Award } from 'lucide-react';

function getScoreColor(val: number) {
  if (val >= 100) return '#047857'; // Excellent
  if (val >= 90) return '#059669';  // Good
  if (val >= 75) return '#D97706';  // Warning
  return '#DC2626';                 // Critical
}

function getBgColor(val: number) {
  if (val >= 100) return 'rgba(16,185,129,0.1)';
  if (val >= 90) return 'rgba(16,185,129,0.05)';
  if (val >= 75) return 'rgba(245,158,11,0.08)';
  return 'rgba(220,38,38,0.08)';
}

// ── Inline edit / request cell dialog ──
interface EditCellProps {
  course: Course;
  field: CourseEditField;
  fieldLabel: string;
  currentValue: number; // in percentage (0-100)
  userId: string;
  isDirectEdit: boolean;
  onDone: () => void;
}
function EditCellDialog({ course, field, fieldLabel, currentValue, userId, isDirectEdit, onDone }: EditCellProps) {
  const [val, setVal] = useState(currentValue);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const pending = getPendingCourseEditForField(course.id, field);

  const handleSubmit = () => {
    if (val < 0 || val > 100) {
      setErr('Giá trị phải nằm trong khoảng 0% - 100%');
      return;
    }
    if (val === currentValue) {
      setErr('Chưa có thay đổi về trị số');
      return;
    }

    if (isDirectEdit) {
      // Direct update for open status
      const valDecimal = val / 100;
      updateCourseValue(course.id, { [field]: valDecimal });
      addAuditLog(userId, 'Cập nhật Điểm môn học', `Đã cập nhật trực tiếp điểm môn ${course.name} (${fieldLabel}): ${currentValue}% -> ${val}%.`);
      onDone();
    } else {
      // Change request for submitted/approved status
      if (!reason.trim() || reason.trim().length < 10) {
        setErr('Lý do chỉnh sửa bắt buộc điền và cần ít nhất 10 ký tự');
        return;
      }
      createCourseEditRequest({
        courseId: course.id,
        userId,
        field,
        fieldLabel: `${course.name} — ${fieldLabel}`,
        oldValue: currentValue,
        newValue: val,
        reason: reason.trim()
      });
      onDone();
    }
  };

  return (
    <PortalModal isOpen={true} onClose={onDone} maxWidth={460}>
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, var(--isme-red), var(--isme-red-light))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
            {isDirectEdit ? 'Cập nhật trực tiếp số liệu' : 'Yêu cầu chỉnh sửa số liệu'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{course.name} — {fieldLabel}</div>
        </div>
        <button onClick={onDone} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
          <X size={16} color="white" />
        </button>
      </div>
      
      {pending ? (
        <div style={{ padding: 20 }}>
          <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: 14, display: 'flex', gap: 10 }}>
            <Clock size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>Đã có yêu cầu đang chờ phê duyệt</div>
              <div style={{ fontSize: 12, color: '#92400E', marginTop: 4 }}>
                Đang yêu cầu sửa: <b>{pending.oldValue}%</b> → <b>{pending.newValue}%</b>
              </div>
              <div style={{ fontSize: 11, color: '#B45309', marginTop: 4, fontStyle: 'italic' }}>"{pending.reason}"</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 20 }}>
          {!isDirectEdit && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', borderRadius: 10, padding: 12, fontSize: 12, marginBottom: 16 }}>
              💡 Bản tự đánh giá đã nộp hoặc được duyệt. Thay đổi này cần nêu rõ lý do và sẽ được áp dụng sau khi quản lý phê duyệt.
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>Giá trị hiện tại</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{currentValue}%</div>
            </div>
            <div style={{ fontSize: 20, color: 'var(--gray-300)', paddingTop: 18 }}>→</div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>Giá trị mới (%)</div>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={val} 
                onChange={e => setVal(parseFloat(e.target.value) || 0)}
                style={{ width: 110, padding: '8px 12px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 16, fontWeight: 700, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--isme-red)'} 
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} 
              />
            </div>
          </div>

          {!isDirectEdit && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>Lý do chỉnh sửa</div>
              <textarea 
                value={reason} 
                onChange={e => { setReason(e.target.value); setErr(''); }}
                placeholder="Nhập nội dung và lý do sửa điểm môn học (tối thiểu 10 ký tự)..." 
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'var(--isme-red)'} 
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} 
              />
            </div>
          )}

          {err && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{err}</div>}
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onDone} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Huỷ</button>
            <button 
              onClick={handleSubmit} 
              disabled={val === currentValue} 
              style={{
                padding: '8px 20px', 
                borderRadius: 8, 
                border: 'none', 
                fontSize: 12, 
                fontWeight: 700, 
                cursor: val !== currentValue ? 'pointer' : 'not-allowed',
                background: val !== currentValue ? 'var(--isme-red)' : 'var(--gray-200)', 
                color: val !== currentValue ? 'white' : 'var(--gray-400)',
              }}
            >
              {isDirectEdit ? 'Cập nhật' : 'Gửi yêu cầu'}
            </button>
          </div>
        </div>
      )}
    </PortalModal>
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
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(245,158,11,0.06))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Edit3 size={16} color="var(--isme-red)" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Yêu cầu sửa đổi điểm môn học</span>
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
              <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: st.bg, color: st.color, marginLeft: 8 }}>{st.label}</span>
            </div>
            {isOpen && (
              <div style={{ padding: '0 20px 14px 40px', background: 'var(--gray-50)' }}>
                <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--gray-100)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 4 }}>Lý do sửa đổi</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 8 }}>{r.reason}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Thời gian gửi: {r.requestedAt}</div>
                  {r.status !== 'pending' && (
                    <div style={{ borderRadius: 6, padding: 10, marginTop: 8, fontSize: 12, color: st.color, background: st.bg }}>
                      {r.status === 'approved' ? '✓ Đã phê duyệt' : '✗ Đã từ chối'} bởi {reviewer?.name} — {r.reviewedAt}
                      {r.reviewNote && <div style={{ fontStyle: 'italic', marginTop: 4 }}>Ghi chú: "{r.reviewNote}"</div>}
                    </div>
                  )}
                  {r.status === 'pending' && isManager && (
                    <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10, marginTop: 8 }}>
                      <textarea placeholder="Nhập ghi chú phản hồi (bắt buộc khi từ chối)..." value={notes[r.id] || ''} onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))} rows={2}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 12, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => { if (!notes[r.id]?.trim()) { alert('Nhập lý do từ chối'); return; } rejectCourseEditRequest(r.id, userId, notes[r.id]); }}
                          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <XCircle size={12} /> Từ chối
                        </button>
                        <button onClick={() => approveCourseEditRequest(r.id, userId, notes[r.id] || 'Phê duyệt.')}
                          style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircle size={12} /> Phê duyệt
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
function EditableCell({ course, field, fieldLabel, value, displayVal, isStaff, userId, isDirectEdit, onEdit }: {
  course: Course; field: CourseEditField; fieldLabel: string;
  value: number; displayVal: string; isStaff: boolean; userId: string; isDirectEdit: boolean;
  onEdit: (course: Course, field: CourseEditField, fieldLabel: string, value: number) => void;
}) {
  const pending = getPendingCourseEditForField(course.id, field);
  return (
    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)', position: 'relative', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <span style={{ fontWeight: 500 }}>{displayVal}</span>
        {isStaff && !pending && (
          <button onClick={() => onEdit(course, field, fieldLabel, value)} title={isDirectEdit ? 'Sửa trực tiếp' : 'Yêu cầu sửa'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.2, transition: 'opacity 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.2'}>
            <Edit3 size={11} color="var(--isme-red)" />
          </button>
        )}
      </div>
      {pending && (
        <div style={{ position: 'absolute', top: 2, right: 2 }} title={`Chờ duyệt: ${pending.oldValue}% → ${pending.newValue}%`}>
          <Clock size={10} color="#F59E0B" />
        </div>
      )}
    </td>
  );
}

// ── Main page ──
export default function KPICoursePage() {
  const { currentRole, currentUserId, selectedProgramId, setSelectedProgramId } = useApp();
  const [selectedProgram, setSelectedProgram] = useState(selectedProgramId !== 'all' ? selectedProgramId : 'p_au');
  const [filterSemester, setFilterSemester] = useState<'current' | 'year1' | 'year2' | 'year3' | 'year4' | 'all'>('current');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [editTarget, setEditTarget] = useState<{ course: Course; field: CourseEditField; fieldLabel: string; value: number } | null>(null);
  const [, forceUpdate] = useState(0);

  // Sync with global program filter
  useEffect(() => {
    if (selectedProgramId !== 'all' && selectedProgramId !== selectedProgram) {
      setSelectedProgram(selectedProgramId);
    }
  }, [selectedProgramId]);

  useEffect(() => {
    setSelectedCohort('all');
  }, [selectedProgram]);

  useEffect(() => {
    const unsub = subscribeCourseEditRequests(() => forceUpdate((n: number) => n + 1));
    return unsub;
  }, []);

  const program = programs.find(p => p.id === selectedProgram);
  const coordinator = program ? getUserById(program.managerId) : null;

  // Cohort academic status helpers
  const checkCourseFuture = (c: Course): boolean => {
    if (c.cohort.includes('AU1')) return c.year > 2;
    if (c.cohort.includes('AU2')) return c.year > 1; // AU2 is currently in Year 1 (2025-2026)
    if (c.cohort.includes('AU3')) return true; // AU3 starts 2026-2027
    return c.year > 1;
  };

  const checkCourseCurrent = (c: Course): boolean => {
    if (c.cohort.includes('AU1')) return c.year === 2 && c.semester === 'SEM 2';
    if (c.cohort.includes('AU2')) return c.year === 1 && c.semester === 'SEM 2';
    if (c.cohort.includes('AU3')) return false;
    return c.year === 1 && c.semester === 'SEM 2';
  };

  // Get unique cohorts in this program
  const uniqueCohorts = Array.from(new Set(courses.filter(c => c.programId === selectedProgram).map(c => c.cohort))).sort();
  
  // Filter courses by program
  let programCourses = courses.filter(c => c.programId === selectedProgram);
  
  // Apply year/semester filter
  if (filterSemester === 'current') {
    programCourses = programCourses.filter(c => checkCourseCurrent(c));
  } else if (filterSemester.startsWith('year')) {
    const yearNum = parseInt(filterSemester.replace('year', ''));
    programCourses = programCourses.filter(c => c.year === yearNum);
  }

  // Calculate averages for each cohort (only for started/active courses, ignore future ones)
  const cohortAverages = uniqueCohorts.map(coh => {
    const activeCourses = courses.filter(c => c.programId === selectedProgram && c.cohort === coh && !checkCourseFuture(c));
    const isUnstarted = activeCourses.length === 0;
    const avg = !isUnstarted
      ? Math.round(activeCourses.reduce((sum, c) => {
          const attendComp = Math.min((c.attendanceRate / c.attendanceTarget) * 100, 100);
          const passComp = Math.min((c.passRate / c.passTarget) * 100, 100);
          const submitComp = Math.min((c.submitRate / c.submitTarget) * 100, 100);
          return sum + (attendComp + passComp + submitComp) / 3;
        }, 0) / activeCourses.length)
      : 0;
    return { cohort: coh, avg, isUnstarted };
  });

  // Apply cohort filter
  if (selectedCohort !== 'all') {
    programCourses = programCourses.filter(c => c.cohort === selectedCohort);
  }

  // Calculate average completion rate of the currently filtered courses (only active ones)
  const completedCourses = programCourses.filter(c => !checkCourseFuture(c));
  const totalAvgScore = completedCourses.length > 0
    ? Math.round(completedCourses.reduce((sum, c) => {
        const attendComp = Math.min((c.attendanceRate / c.attendanceTarget) * 100, 100);
        const passComp = Math.min((c.passRate / c.passTarget) * 100, 100);
        const submitComp = Math.min((c.submitRate / c.submitTarget) * 100, 100);
        return sum + (attendComp + passComp + submitComp) / 3;
      }, 0) / completedCourses.length)
    : 0;

  // Sort by year, semester order, then name
  const semesterOrder: Record<string, number> = {
    'SEM 1': 1,
    'SEM 2': 2,
    'SEM AU': 3,
    'SEM SP': 4,
    'SEM SU': 5
  };

  programCourses.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const semA = semesterOrder[a.semester] || 9;
    const semB = semesterOrder[b.semester] || 9;
    if (semA !== semB) return semA - semB;
    return a.name.localeCompare(b.name);
  });

  const isStaff = currentRole === 'staff';
  const isManager = currentRole === 'manager' || currentRole === 'admin';

  // Check if coordinator has submitted or approved their self-assessment
  const activeSemester = semesterData.currentSemester;
  const assessmentStatus = coordinator ? getSubmissionStatus(coordinator.id, activeSemester) : 'open';
  const isDirectEdit = assessmentStatus === 'open';

  const handleEdit = (course: Course, field: CourseEditField, fieldLabel: string, value: number) => {
    setEditTarget({ course, field, fieldLabel, value });
  };

  const exportToExcel = () => {
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const header = [
      'Chương trình', 'Lớp', 'Kỳ', 'Môn học', 'Số GV', 'Số SV', 
      'Mục tiêu Chuyên cần (%)', 'Mục tiêu Điểm đạt (%)', 'Mục tiêu Nộp bài đúng hạn (%)',
      'Kết quả Chuyên cần (%)', 'Kết quả Điểm đạt (%)', 'Kết quả Nộp bài đúng hạn (%)',
      'Mức hoàn thành Chuyên cần (%)', 'Mức hoàn thành Điểm đạt (%)', 'Mức hoàn thành Nộp bài (%)',
      'Mức hoàn thành trung bình môn (%)'
    ];
    
    const rows = programCourses.map(c => {
      const attendComp = Math.round((c.attendanceRate / c.attendanceTarget) * 100);
      const passComp = Math.round((c.passRate / c.passTarget) * 100);
      const submitComp = Math.round((c.submitRate / c.submitTarget) * 100);
      const avgComp = Math.round((attendComp + passComp + submitComp) / 3);

      return [
        program?.shortName,
        c.cohort,
        c.semester,
        c.name,
        c.numLecturers,
        c.numStudents,
        c.attendanceTarget * 100,
        c.passTarget * 100,
        c.submitTarget * 100,
        c.attendanceRate * 100,
        c.passRate * 100,
        c.submitRate * 100,
        attendComp,
        passComp,
        submitComp,
        avgComp
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws['!cols'] = header.map(() => ({ width: 16 })); 
    ws['!cols'][3] = { width: 38 }; // Course name width
    XLSX.utils.book_append_sheet(wb, ws, 'KPI Môn học');
    XLSX.writeFile(wb, `KPI_MonHoc_${program?.shortName}_${filterSemester === 'current' ? 'KyHienTai' : 'ToanKhoa'}.xlsx`);
  };

  return (
    <div className="animate-fade-in" style={{ position: 'relative', paddingBottom: 40 }}>
      {/* Compact Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>Bảng KPI Môn học</h1>
          {coordinator && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gray-100)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>Coordinator: {coordinator.name}</span>
              <span style={{ 
                fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, 
                background: assessmentStatus === 'approved' ? '#D1FAE5' : assessmentStatus === 'submitted' ? '#FEF3C7' : '#F3F4F6',
                color: assessmentStatus === 'approved' ? '#065F46' : assessmentStatus === 'submitted' ? '#B45309' : '#374151'
              }}>
                {assessmentStatus === 'approved' ? 'Đã duyệt' : assessmentStatus === 'submitted' ? 'Chờ duyệt' : 'Chưa nộp'}
              </span>
            </div>
          )}
        </div>

        {/* Top Right Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Cohort / Class Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '2px 4px 2px 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)' }}>Lớp:</span>
            <select 
              value={selectedCohort} 
              onChange={e => setSelectedCohort(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: 'var(--gray-800)', cursor: 'pointer', outline: 'none', padding: '6px 4px' }}
            >
              <option value="all">Tất cả các lớp</option>
              {uniqueCohorts.map(coh => (
                <option key={coh} value={coh}>Lớp {coh}</option>
              ))}
            </select>
          </div>

          {/* Program Select */}
          <select 
            value={selectedProgram} 
            onChange={e => setSelectedProgram(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'white', color: 'var(--gray-900)' }}
          >
            {programs.filter(p => p.status === 'active').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Export button */}
          <button className="btn btn-secondary" onClick={exportToExcel} style={{ fontSize: 12, padding: '7px 14px' }}>
            <Download size={13} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Unified Compact Toolbar: Mode Tabs + Inline Stat Badges */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'white', border: '1px solid var(--gray-200)' }}>
        {/* Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--gray-100)', padding: 3, borderRadius: 8 }}>
          {[
            { id: 'current', label: 'Kỳ 2 (2025-2026)' },
            { id: 'year1', label: 'Năm 1' },
            { id: 'year2', label: 'Năm 2' },
            { id: 'year3', label: 'Năm 3' },
            { id: 'year4', label: 'Năm 4' },
            { id: 'all', label: 'Toàn khóa' },
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-item ${filterSemester === tab.id ? 'active' : ''}`}
              onClick={() => setFilterSemester(tab.id as any)}
              style={{
                padding: '5px 11px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: filterSemester === tab.id ? 'white' : 'transparent',
                color: filterSemester === tab.id ? 'var(--isme-red)' : 'var(--gray-600)',
                boxShadow: filterSemester === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inline Compact Stat Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, 
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' 
          }}>
            <BookOpen size={14} color="var(--isme-red)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>TB Bảng đang chọn:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--isme-red)' }}>
              {isNaN(totalAvgScore) ? 0 : totalAvgScore}%
            </span>
          </div>

          {cohortAverages.map((cohAvg, cIdx) => {
            const colors = ['#2563EB', '#10B981', '#7C3AED', '#F59E0B'];
            const bgs = ['rgba(59,130,246,0.06)', 'rgba(16,185,129,0.06)', 'rgba(124,58,237,0.06)', 'rgba(245,158,11,0.06)'];
            const color = colors[cIdx % colors.length];
            const bg = bgs[cIdx % bgs.length];
            const displayScore = isNaN(cohAvg.avg) ? 0 : cohAvg.avg;

            return (
              <div key={cohAvg.cohort} style={{ 
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, 
                background: cohAvg.isUnstarted ? 'var(--gray-50)' : bg, border: `1px solid ${cohAvg.isUnstarted ? 'var(--gray-200)' : color + '25'}` 
              }}>
                <Award size={14} color={cohAvg.isUnstarted ? 'var(--gray-400)' : color} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>
                  {cohAvg.isUnstarted ? `${cohAvg.cohort}:` : `TB Tích lũy ${cohAvg.cohort}:`}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: cohAvg.isUnstarted ? 'var(--gray-400)' : color }}>
                  {cohAvg.isUnstarted ? 'Chưa diễn ra' : `${displayScore}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>


      {/* Course Edit Approval Panel */}
      <CourseApprovalPanel isManager={isManager} userId={currentUserId} selectedProgramId={selectedProgram} />

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1400 }}>
          <thead>
            <tr style={{ background: '#1E293B', color: 'white' }}>
              <th rowSpan={2} style={thStyle}>Lớp</th>
              <th rowSpan={2} style={thStyle}>Kỳ</th>
              <th rowSpan={2} style={{ ...thStyle, minWidth: 200, textAlign: 'left' }}>Môn học</th>
              <th rowSpan={2} style={thStyle}>Số GV</th>
              <th rowSpan={2} style={thStyle}>Số SV</th>
              <th colSpan={3} style={{ ...thStyle, background: '#1E3A8A' }}>Mục tiêu đầu kỳ (%)</th>
              <th colSpan={3} style={{ ...thStyle, background: '#065F46' }}>Kết quả thực tế (%)</th>
              <th colSpan={3} style={{ ...thStyle, background: '#5B21B6' }}>Mức độ hoàn thành (%)</th>
              <th rowSpan={2} style={{ ...thStyle, background: '#475569' }}>Mức hoàn thành chung</th>
            </tr>
            <tr style={{ background: '#334155', color: 'white' }}>
              <th style={subThStyle}>Chuyên cần</th>
              <th style={subThStyle}>Pass lần 1</th>
              <th style={subThStyle}>Nộp bài đúng hạn</th>
              
              <th style={subThStyle}>Chuyên cần</th>
              <th style={subThStyle}>Pass lần 1</th>
              <th style={subThStyle}>Nộp bài đúng hạn</th>
              
              <th style={subThStyle}>Chuyên cần</th>
              <th style={subThStyle}>Pass lần 1</th>
              <th style={subThStyle}>Nộp bài đúng hạn</th>
            </tr>
          </thead>
          <tbody>
            {programCourses.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>
                  Không có môn học nào được ghi nhận cho chương trình này trong bộ lọc đã chọn.
                </td>
              </tr>
            ) : (
              programCourses.map((c, ci) => {
                const isFuture = checkCourseFuture(c);
                const isCurrent = checkCourseCurrent(c);

                const attendComp = isFuture ? null : Math.round((c.attendanceRate / c.attendanceTarget) * 100);
                const passComp = isFuture ? null : Math.round((c.passRate / c.passTarget) * 100);
                const submitComp = isFuture ? null : Math.round((c.submitRate / c.submitTarget) * 100);
                const avgComp = isFuture ? null : Math.round((attendComp! + passComp! + submitComp!) / 3);

                return (
                  <tr key={c.id} style={{ background: isCurrent ? 'rgba(59,130,246,0.02)' : ci % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--gray-700)' }}>
                      {c.cohort}
                      {isCurrent && <span style={{ display: 'block', fontSize: 9, color: '#2563EB', background: '#DBEAFE', padding: '1px 4px', borderRadius: 4, marginTop: 2, fontWeight: 600 }}>Kỳ này</span>}
                      {isFuture && <span style={{ display: 'block', fontSize: 9, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '1px 4px', borderRadius: 4, marginTop: 2, fontWeight: 500 }}>Chưa học</span>}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--gray-500)', fontWeight: 600 }}>{c.semester}</td>
                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500, paddingLeft: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: isFuture ? 'var(--gray-400)' : 'var(--gray-800)', fontSize: 13, fontWeight: isCurrent ? 700 : 500 }}>{c.name}</span>
                        {c.code && <span style={{ color: 'var(--gray-400)', fontSize: 10 }}>Mã: {c.code} · Năm {c.year}</span>}
                      </div>
                    </td>
                    <td style={tdStyle}>{isFuture ? '-' : c.numLecturers}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: isFuture ? 'var(--gray-300)' : 'var(--gray-700)' }}>{isFuture ? '-' : c.numStudents}</td>
                    
                    {/* Targets */}
                    <td style={{ ...tdStyle, background: '#F8FAFC' }}>{isFuture ? '-' : `${c.attendanceTarget * 100}%`}</td>
                    <td style={{ ...tdStyle, background: '#F8FAFC' }}>{isFuture ? '-' : `${c.passTarget * 100}%`}</td>
                    <td style={{ ...tdStyle, background: '#F8FAFC' }}>{isFuture ? '-' : `${c.submitTarget * 100}%`}</td>
                    
                    {/* Actuals - Editable */}
                    <EditableCell 
                      course={c} 
                      field="attendanceRate" 
                      fieldLabel="Tỉ lệ đi học đầy đủ" 
                      value={Math.round(c.attendanceRate * 100)} 
                      displayVal={isFuture ? '-' : `${Math.round(c.attendanceRate * 100)}%`} 
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />
                    <EditableCell 
                      course={c} 
                      field="passRate" 
                      fieldLabel="Tỉ lệ pass lần 1" 
                      value={Math.round(c.passRate * 100)} 
                      displayVal={isFuture ? '-' : `${Math.round(c.passRate * 100)}%`} 
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />
                    <EditableCell 
                      course={c} 
                      field="submitRate" 
                      fieldLabel="Tỉ lệ nộp bài/thi đúng hạn" 
                      value={Math.round(c.submitRate * 100)} 
                      displayVal={isFuture ? '-' : `${Math.round(c.submitRate * 100)}%`} 
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />
                    
                    {/* Completion Rates */}
                    <td style={{ ...tdStyle, color: isFuture ? 'var(--gray-300)' : getScoreColor(attendComp!), fontWeight: 700, background: isFuture ? 'transparent' : getBgColor(attendComp!) }}>{isFuture ? '-' : `${attendComp}%`}</td>
                    <td style={{ ...tdStyle, color: isFuture ? 'var(--gray-300)' : getScoreColor(passComp!), fontWeight: 700, background: isFuture ? 'transparent' : getBgColor(passComp!) }}>{isFuture ? '-' : `${passComp}%`}</td>
                    <td style={{ ...tdStyle, color: isFuture ? 'var(--gray-300)' : getScoreColor(submitComp!), fontWeight: 700, background: isFuture ? 'transparent' : getBgColor(submitComp!) }}>{isFuture ? '-' : `${submitComp}%`}</td>
                    
                    {/* Course Avg Completion */}
                    <td style={{ ...tdStyle, background: isFuture ? 'transparent' : '#F1F5F9', color: isFuture ? 'var(--gray-300)' : getScoreColor(avgComp!), fontWeight: 700, fontSize: 13 }}>
                      {isFuture ? (
                        <span style={{ fontSize: 10, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>Chưa bắt đầu</span>
                      ) : (
                        `${avgComp}%`
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend Guidance */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#047857', bg: 'rgba(16,185,129,0.1)', label: 'Đạt / Vượt mục tiêu (≥100%)' },
          { color: '#D97706', bg: 'rgba(245,158,11,0.08)', label: 'Gần đạt (90% - 99%)' },
          { color: '#DC2626', bg: 'rgba(220,38,38,0.08)', label: 'Chưa đạt (<90%)' },
          { color: 'var(--isme-red)', bg: 'white', label: '✏️ Bấm bút để sửa số liệu (sửa trực tiếp khi chưa nộp, gửi yêu cầu duyệt khi đã nộp)' },
          { color: '#F59E0B', bg: 'white', label: '⏳ Có yêu cầu thay đổi đang chờ duyệt' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-600)' }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: l.bg, border: `1px solid ${l.color}`, display: 'inline-block' }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      {editTarget && (
        <EditCellDialog
          course={editTarget.course}
          field={editTarget.field}
          fieldLabel={editTarget.fieldLabel}
          currentValue={editTarget.value}
          userId={currentUserId}
          isDirectEdit={isDirectEdit}
          onDone={() => { setEditTarget(null); forceUpdate((n: number) => n + 1); }}
        />
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  border: '1px solid rgba(255,255,255,0.12)', textAlign: 'center', minWidth: 60,
};

const subThStyle: React.CSSProperties = {
  padding: '8px 10px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
  border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: 'rgba(255,255,255,0.8)',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: 12, textAlign: 'center',
  borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap',
};
