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
  addAuditLog,
  formatSemester
} from '@/lib/mock-data';
import { CourseEditRequest, CourseEditField, Course } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Download, Edit3, X, Clock, CheckCircle, XCircle, ChevronDown, ChevronRight, User, Settings, ShieldCheck, HelpCircle, BookOpen, Award } from 'lucide-react';

function getScoreColor(val: number) {
  if (val >= 100) return '#059669'; // Clean Emerald
  if (val >= 90) return '#0D9488';  // Teal
  if (val >= 75) return '#D97706';  // Amber
  return '#DC2626';                 // Red
}

function getBgColor(val: number) {
  if (val >= 90) return 'transparent'; // Clean transparent for good grades
  if (val >= 75) return 'rgba(245,158,11,0.08)'; // Subtle warning
  return 'rgba(220,38,38,0.08)'; // Subtle critical
}

function formatRate(val: number, isNA?: boolean): string {
  if (isNA) return 'N/A';
  if (val === undefined || val === null) return '-';
  const pct = Math.round(val * 1000) / 10;
  return `${pct}%`;
}

// ── Inline edit / request cell dialog ──
interface EditCellProps {
  course: Course;
  field: CourseEditField;
  fieldLabel: string;
  currentValue: number;
  isNA?: boolean;
  userId: string;
  isDirectEdit: boolean;
  onDone: () => void;
}

function EditCellDialog({ course, field, fieldLabel, currentValue, isNA = false, userId, isDirectEdit, onDone }: EditCellProps) {
  const isCountField = field === 'numLecturers' || field === 'numStudents';
  const [val, setVal] = useState<number>(currentValue);
  const [isNAChecked, setIsNAChecked] = useState<boolean>(isNA);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const pending = getPendingCourseEditForField(course.id, field);

  const handleSubmit = () => {
    if (!isCountField && !isNAChecked) {
      if (val < 0 || val > 100) {
        setErr('Giá trị phải nằm trong khoảng 0% - 100%');
        return;
      }
    }
    if (isCountField && val < 0) {
      setErr('Số lượng phải lớn hơn hoặc bằng 0');
      return;
    }
    if (val === currentValue && isNAChecked === isNA) {
      setErr('Chưa có thay đổi về trị số hoặc trạng thái');
      return;
    }

    if (isDirectEdit) {
      if (isCountField) {
        const intVal = Math.max(0, Math.floor(val));
        updateCourseValue(course.id, { [field]: intVal });
        addAuditLog(userId, 'Cập nhật môn học', `Đã cập nhật số lượng ${fieldLabel} môn ${course.name}: ${currentValue} -> ${intVal}.`);
      } else if (isNAChecked) {
        const naField = field === 'attendanceRate' ? 'isAttendanceNA' : field === 'passRate' ? 'isPassNA' : 'isSubmitNA';
        updateCourseValue(course.id, { [naField]: true, [field]: 0 });
        addAuditLog(userId, 'Cập nhật Điểm môn học', `Đã chuyển ${fieldLabel} môn ${course.name} sang trạng thái N/A.`);
      } else {
        const naField = field === 'attendanceRate' ? 'isAttendanceNA' : field === 'passRate' ? 'isPassNA' : 'isSubmitNA';
        const valDecimal = val / 100;
        updateCourseValue(course.id, { [field]: valDecimal, [naField]: false });
        addAuditLog(userId, 'Cập nhật Điểm môn học', `Đã cập nhật trực tiếp điểm môn ${course.name} (${fieldLabel}): ${isNA ? 'N/A' : currentValue + '%'} -> ${val}%.`);
      }
      onDone();
    } else {
      if (!reason.trim() || reason.trim().length < 10) {
        setErr('Lý do chỉnh sửa bắt buộc điền và cần ít nhất 10 ký tự');
        return;
      }
      createCourseEditRequest({
        courseId: course.id,
        userId,
        field,
        fieldLabel: `${course.name} — ${fieldLabel}`,
        oldValue: isNA ? 'N/A' : currentValue,
        newValue: isNAChecked ? 'N/A' : isCountField ? Math.max(0, Math.floor(val)) : val,
        isNA: isNAChecked,
        reason: reason.trim()
      });
      onDone();
    }
  };

  return (
    <PortalModal isOpen={true} onClose={onDone} maxWidth={480}>
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, var(--isme-red), var(--isme-red-light))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>
            {isDirectEdit ? 'Cập nhật trực tiếp số liệu' : 'Yêu cầu chỉnh sửa số liệu'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{course.name} — {fieldLabel}</div>
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
              <div style={{ fontSize: 13, color: '#92400E', marginTop: 4 }}>
                Đang yêu cầu sửa: <b>{pending.oldValue}</b> → <b>{pending.newValue}</b>
              </div>
              <div style={{ fontSize: 11, color: '#B45309', marginTop: 4, fontStyle: 'italic' }}>"{pending.reason}"</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 20 }}>
          {!isDirectEdit && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', borderRadius: 10, padding: 12, fontSize: 13, marginBottom: 16 }}>
              💡 Bản tự đánh giá đã nộp hoặc được duyệt. Thay đổi này cần nêu rõ lý do và sẽ được áp dụng sau khi quản lý phê duyệt.
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>Giá trị hiện tại</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {isNA ? 'N/A' : isCountField ? currentValue : `${currentValue}%`}
                </div>
              </div>
              <div style={{ fontSize: 18, color: 'var(--gray-300)', paddingTop: 18 }}>→</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>
                  {isCountField ? 'Giá trị mới (Số lượng)' : 'Giá trị mới (%)'}
                </div>
                <input 
                  type="number" 
                  min="0" 
                  max={isCountField ? undefined : 100}
                  step={isCountField ? 1 : 0.1}
                  disabled={isNAChecked}
                  value={isNAChecked ? '' : val} 
                  placeholder={isNAChecked ? 'N/A' : '0'}
                  onChange={e => setVal(parseFloat(e.target.value) || 0)}
                  style={{ 
                    width: 130, padding: '8px 12px', borderRadius: 8, 
                    border: '2px solid var(--gray-200)', fontSize: 13, fontWeight: 700, 
                    outline: 'none', background: isNAChecked ? 'var(--gray-100)' : 'white'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--isme-red)'} 
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} 
                />
              </div>
            </div>

            {!isCountField && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', userSelect: 'none', background: '#F8FAFC', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <input 
                  type="checkbox" 
                  checked={isNAChecked} 
                  onChange={e => setIsNAChecked(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--isme-red)' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
                  Đánh dấu N/A (Không áp dụng tiêu chí này cho môn học)
                </span>
              </label>
            )}
          </div>

          {!isDirectEdit && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>Lý do chỉnh sửa</div>
              <textarea 
                value={reason} 
                onChange={e => { setReason(e.target.value); setErr(''); }}
                placeholder="Nhập nội dung và lý do sửa thông tin môn học (tối thiểu 10 ký tự)..." 
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'var(--isme-red)'} 
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} 
              />
            </div>
          )}

          {err && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{err}</div>}
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onDone} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Huỷ</button>
            <button 
              onClick={handleSubmit} 
              disabled={val === currentValue && isNAChecked === isNA} 
              style={{
                padding: '8px 20px', 
                borderRadius: 8, 
                border: 'none', 
                fontSize: 13, 
                fontWeight: 700, 
                cursor: (val !== currentValue || isNAChecked !== isNA) ? 'pointer' : 'not-allowed',
                background: (val !== currentValue || isNAChecked !== isNA) ? 'var(--isme-red)' : 'var(--gray-200)', 
                color: (val !== currentValue || isNAChecked !== isNA) ? 'white' : 'var(--gray-400)',
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
          <span style={{ fontWeight: 700, fontSize: 13 }}>Yêu cầu sửa đổi thông tin môn học</span>
          {pendingCount > 0 && <span style={{ background: '#F59E0B', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>}
        </div>
      </div>
      {filtered.map((r, i) => {
        const st = r.status === 'pending' ? { bg: '#FEF3C7', color: '#92400E', label: 'Chờ duyệt' } : r.status === 'approved' ? { bg: '#D1FAE5', color: '#065F46', label: 'Đã duyệt' } : { bg: '#FEE2E2', color: '#991B1B', label: 'Từ chối' };
        const user = getUserById(r.userId);
        const reviewer = r.reviewedBy ? getUserById(r.reviewedBy) : null;
        const isOpen = expandedId === r.id;
        const isCount = r.field === 'numLecturers' || r.field === 'numStudents';
        const oldDisplay = r.oldValue === 'N/A' ? 'N/A' : isCount ? r.oldValue : `${r.oldValue}%`;
        const newDisplay = r.newValue === 'N/A' ? 'N/A' : isCount ? r.newValue : `${r.newValue}%`;

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
                <span style={{ color: 'var(--gray-400)' }}>{oldDisplay}</span>
                <span style={{ color: 'var(--gray-300)', margin: '0 4px' }}>→</span>
                <span style={{ color: '#2563EB' }}>{newDisplay}</span>
              </span>
              <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, marginLeft: 8 }}>{st.label}</span>
            </div>
            {isOpen && (
              <div style={{ padding: '0 20px 14px 40px', background: 'var(--gray-50)' }}>
                <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--gray-100)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>Lý do sửa đổi:</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 8 }}>{r.reason}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Thời gian gửi: {r.requestedAt}</div>
                  {r.status !== 'pending' && (
                    <div style={{ borderRadius: 6, padding: 10, marginTop: 8, fontSize: 13, color: st.color, background: st.bg }}>
                      {r.status === 'approved' ? '✓ Đã phê duyệt' : '✗ Đã từ chối'} bởi {reviewer?.name} — {r.reviewedAt}
                      {r.reviewNote && <div style={{ fontStyle: 'italic', marginTop: 4 }}>Ghi chú: "{r.reviewNote}"</div>}
                    </div>
                  )}
                  {r.status === 'pending' && isManager && (
                    <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10, marginTop: 8 }}>
                      <textarea placeholder="Nhập ghi chú phản hồi (bắt buộc khi từ chối)..." value={notes[r.id] || ''} onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))} rows={2}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 8 }} />
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
function EditableCell({ course, field, fieldLabel, value, displayVal, isNA, isStaff, userId, isDirectEdit, onEdit }: {
  course: Course; field: CourseEditField; fieldLabel: string;
  value: number; displayVal?: string; isNA?: boolean; isStaff: boolean; userId: string; isDirectEdit: boolean;
  onEdit: (course: Course, field: CourseEditField, fieldLabel: string, value: number, isNA?: boolean) => void;
}) {
  const pending = getPendingCourseEditForField(course.id, field);
  const isCount = field === 'numLecturers' || field === 'numStudents';
  const showText = isNA ? 'N/A' : displayVal !== undefined ? displayVal : isCount ? String(value) : `${Math.round(value * 10) / 10}%`;

  return (
    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--gray-100)', position: 'relative', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {isNA ? (
          <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: 4 }}>N/A</span>
        ) : (
          <span style={{ fontWeight: isCount ? 700 : 500 }}>{showText}</span>
        )}
        {isStaff && !pending && (
          <button onClick={() => onEdit(course, field, fieldLabel, value, isNA)} title={isDirectEdit ? 'Sửa trực tiếp' : 'Yêu cầu sửa'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.25, transition: 'opacity 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.25'}>
            <Edit3 size={11} color="var(--isme-red)" />
          </button>
        )}
      </div>
      {pending && (
        <div style={{ position: 'absolute', top: 2, right: 2 }} title={`Chờ duyệt: ${pending.oldValue} → ${pending.newValue}`}>
          <Clock size={10} color="#F59E0B" />
        </div>
      )}
    </td>
  );
}

// ── Main page ──
export default function KPICoursePage() {
  const { currentRole, currentUserId, selectedProgramId, setSelectedProgramId } = useApp();
  const [selectedHe, setSelectedHe] = useState<string>('all'); // 'all' | 'degree' | 'topup' | 'certificate'
  const [selectedProgram, setSelectedProgram] = useState(selectedProgramId !== 'all' ? selectedProgramId : 'p_au');
  const [filterSemester, setFilterSemester] = useState<'current' | 'year1' | 'year2' | 'year3' | 'year4' | 'all'>('current');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [uweSubFilter, setUweSubFilter] = useState<'all' | 'IBM' | 'BM'>('all');
  const [editTarget, setEditTarget] = useState<{ course: Course; field: CourseEditField; fieldLabel: string; value: number; isNA?: boolean } | null>(null);
  const [, forceUpdate] = useState(0);

  // List of active programs filtered by Hệ
  const filteredPrograms = programs.filter(p => p.status === 'active' && (selectedHe === 'all' || p.type === selectedHe));

  // List of coordinators
  const coordinatorList = [
    { id: 'u11', name: 'Bùi Thị Quỳnh Trang', programId: 'p_nam1', programName: 'Năm 1', he: 'degree' },
    { id: 'u6', name: 'Nguyễn Giang Khánh Huyền', programId: 'p_cu', programName: 'Top-up CU', he: 'topup' },
    { id: 'u2', name: 'Vũ Minh Nhật', programId: 'p_uwe', programName: 'Top-up UWE', he: 'topup' },
    { id: 'u4', name: 'Trần Thị Bích Ngọc', programId: 'p_nhtc', programName: 'NHTC', he: 'degree' },
    { id: 'u5', name: 'Trần Hương Thảo', programId: 'p3', programName: 'BTEC', he: 'certificate' },
    { id: 'u7', name: 'Đào Ngọc Diệp', programId: 'p_au', programName: 'Andrews', he: 'degree' },
    { id: 'u8', name: 'Nguyễn Minh Tuấn', programId: 'p7', programName: 'BBAE', he: 'degree' },
    { id: 'u10', name: 'Bùi Thu Trang', programId: 'p_dm', programName: 'DM', he: 'degree' },
  ];

  const filteredCoordinators = coordinatorList.filter(c => selectedHe === 'all' || c.he === selectedHe);

  // Auto-detect user's managed program when currentUserId changes (support instant test view)
  useEffect(() => {
    const userProg = programs.find(p => p.managerId === currentUserId || p.secondaryManagerId === currentUserId);
    if (userProg) {
      setSelectedProgram(userProg.id);
      if (userProg.type) setSelectedHe(userProg.type);
    }
  }, [currentUserId]);

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

  type CohortPlan = {
    label: string;
    sourceCohort?: string;
    activeYear?: number;
    activeSemester?: string;
    expected?: boolean;
    specialization?: string;
    academicYear?: string;
    targetSemester?: string;
  };

  const programCohortPlans: Record<string, CohortPlan[]> = {
    p7: [
      { label: 'BBAE K67', sourceCohort: 'BBAE', activeYear: 1, activeSemester: 'SEM 2' },
      { label: 'BBAE K66', sourceCohort: 'BBAE', activeYear: 2, activeSemester: 'SEM 2' },
      { label: 'BBAE K65', sourceCohort: 'BBAE', activeYear: 3, activeSemester: 'SEM 2' },
      { label: 'BBAE K64', sourceCohort: 'BBAE', activeYear: 4, activeSemester: 'SEM 2' },
    ],
    p_dm: [
      { label: 'I21 - DM', sourceCohort: 'DM', activeYear: 1, activeSemester: 'SEM 2' },
      { label: 'I20 - DM', sourceCohort: 'DM', activeYear: 2, activeSemester: 'SEM 2' },
      { label: 'I19 - DM', sourceCohort: 'DM', activeYear: 3, activeSemester: 'SEM 2' },
    ],
    p_au: [
      { label: 'AU 2', sourceCohort: 'AU', activeYear: 1, activeSemester: 'SEM 2' },
      { label: 'AU 1', sourceCohort: 'AU', activeYear: 2, activeSemester: 'SEM 2' },
      { label: 'AU 3 (dự kiến)', expected: true },
    ],
    p_nhtc: [
      { label: 'BScBF I19', sourceCohort: 'BScBF I19', activeYear: 3, activeSemester: 'SEM 2' },
      { label: 'BScBF I18', sourceCohort: 'BScBF I18', activeYear: 4, activeSemester: 'SEM 2' },
      { label: 'BScBF I20 (dự kiến 26-27)', sourceCohort: 'BScBF I20', expected: false },
      { label: 'BScBF I21 (dự kiến)', expected: true },
    ],
    p_uwe: [
      { 
        label: 'I18 MT - IBM (2025-2026 Kỳ 2)', 
        sourceCohort: 'I18 MT - IBM', 
        activeYear: 4, 
        activeSemester: 'SEM 2', 
        specialization: 'IBM',
        academicYear: '2025 - 2026',
        targetSemester: 'SEM 2'
      },
      { 
        label: 'I19 MX - IBM (2025-2026 Kỳ 1)', 
        sourceCohort: 'I19 MX - IBM', 
        activeYear: 4, 
        activeSemester: 'SEM 1', 
        specialization: 'IBM',
        academicYear: '2025 - 2026',
        targetSemester: 'SEM 1'
      },
      { 
        label: 'I19 MX - IBM (dự kiến 2026-2027 Kỳ 2)', 
        sourceCohort: 'I19 MX - IBM', 
        expected: true, 
        specialization: 'IBM',
        academicYear: '2026 - 2027',
        targetSemester: 'SEM 2'
      },
      { 
        label: 'I19 MT - BM (dự kiến 2026-2027 Kỳ 1)', 
        sourceCohort: 'I19 MT - BM', 
        expected: true, 
        specialization: 'BM',
        academicYear: '2026 - 2027',
        targetSemester: 'SEM 1'
      },
      { 
        label: 'I19 MT - BM (dự kiến 2026-2027 Kỳ 2)', 
        sourceCohort: 'I19 MT - BM', 
        expected: true, 
        specialization: 'BM',
        academicYear: '2026 - 2027',
        targetSemester: 'SEM 2'
      },
      { 
        label: 'I20 MX - IBM (dự kiến 2026-2027 Kỳ 1)', 
        sourceCohort: 'I20 MX - IBM', 
        expected: true, 
        specialization: 'IBM',
        academicYear: '2026 - 2027',
        targetSemester: 'SEM 1'
      },
      { 
        label: 'I20 MX - IBM (dự kiến 2027-2028 Kỳ 2)', 
        sourceCohort: 'I20 MX - IBM', 
        expected: true, 
        specialization: 'IBM',
        academicYear: '2027 - 2028',
        targetSemester: 'SEM 2'
      },
    ],
    p_cu: [
      { label: 'I19 MX', sourceCohort: 'I19 MX', activeYear: 4, activeSemester: 'SEM 2' },
      { label: 'I19 MT (dự kiến)', sourceCohort: 'I19 MT', expected: true },
      { label: 'I20 MX (dự kiến)', sourceCohort: 'I20 MX', expected: true },
      { label: 'I20 MT (dự kiến)', sourceCohort: 'I20 MT', expected: true },
    ],
    p3: [
      { label: 'BTEC HND', sourceCohort: 'BTEC HND', activeYear: 1, activeSemester: 'SEM 2' },
    ],
    p_nam1: [
      { label: 'I21 MT', sourceCohort: 'I21 MT', activeYear: 1, activeSemester: 'SEM SPRING' },
      { label: 'I22 MX', sourceCohort: 'I22 MX', activeYear: 1, activeSemester: 'SEM SPRING' },
      { label: 'I22 MT (dự kiến)', sourceCohort: 'I22 MT', expected: true },
      { label: 'I23 MX (dự kiến)', sourceCohort: 'I23 MX', expected: true },
    ],
  };

  const rawCurriculum = courses.filter(c => c.programId === selectedProgram);
  const fallbackPlans: CohortPlan[] = Array.from(new Set(rawCurriculum.map(c => c.cohort)))
    .sort()
    .map(coh => ({ label: coh, sourceCohort: coh }));
  const allCohortPlans = programCohortPlans[selectedProgram] || fallbackPlans;
  const cohortPlans = selectedProgram === 'p_uwe' && uweSubFilter !== 'all'
    ? allCohortPlans.filter(plan => !plan.specialization || plan.specialization === uweSubFilter)
    : allCohortPlans;
  const selectedPlans = selectedCohort === 'all'
    ? cohortPlans
    : cohortPlans.filter(plan => plan.label === selectedCohort);
  const uniqueCohorts = cohortPlans.map(plan => plan.label);

  type DisplayCourse = Course & { displayCohort: string; isCurrent: boolean; isFuture: boolean };

  const semesterOrder: Record<string, number> = {
    'SEM 1': 1,
    'Kỳ 1': 1,
    'SEM FALL': 1,
    'SEM 2': 2,
    'Kỳ 2': 2,
    'SEM SPRING': 2,
    'SEM FALL & SPRING': 2,
    'SEM AU': 3,
    'SEM SP': 4,
    'SEM SU': 5,
    'SEM SUMMER': 5,
  };

  const courseMatchesPlan = (course: Course, plan: CohortPlan): boolean => {
    const cleanPlan = (plan.sourceCohort || plan.label).replace(/\s*\(dự kiến.*?\)/, '').replace(/\s*\(.*?\)/, '').trim();
    const cleanCourse = course.cohort.replace(/\s*\(dự kiến.*?\)/, '').replace(/\s*\(.*?\)/, '').trim();
    if (cleanCourse !== cleanPlan) return false;
    if (plan.targetSemester && course.semester !== plan.targetSemester) return false;
    return true;
  };

  const isCurrentCourse = (course: Course, plan: CohortPlan): boolean => {
    if (plan.expected) return false;
    if (!plan.activeYear || !plan.activeSemester) return false;
    if (course.year !== plan.activeYear) return false;
    if (plan.activeSemester === 'SEM SPRING') {
      return course.semester === 'SEM SPRING' || course.semester === 'SEM FALL & SPRING' || course.semester === 'SEM 2';
    }
    return course.semester === plan.activeSemester;
  };

  const isFutureCourse = (course: Course, plan: CohortPlan): boolean => {
    if (plan.expected) return true;
    if (!plan.activeYear || !plan.activeSemester) return true;
    if (course.year > plan.activeYear) return true;
    if (course.year < plan.activeYear) return false;
    return (semesterOrder[course.semester] || 99) > (semesterOrder[plan.activeSemester] || 99);
  };

  const mapDisplayCourse = (course: Course, plan: CohortPlan): DisplayCourse => ({
    ...course,
    displayCohort: plan.label,
    isCurrent: isCurrentCourse(course, plan),
    isFuture: isFutureCourse(course, plan),
  });

  let displayCourses: DisplayCourse[] = [];

  selectedPlans.forEach(plan => {
    let planCourses = rawCurriculum.filter(c => courseMatchesPlan(c, plan));

    if (filterSemester === 'current') {
      planCourses = planCourses.filter(c => isCurrentCourse(c, plan));
    } else if (filterSemester.startsWith('year')) {
      const targetYear = parseInt(filterSemester.replace('year', ''));
      planCourses = planCourses.filter(c => c.year === targetYear);
    }

    displayCourses.push(...planCourses.map(c => mapDisplayCourse(c, plan)));
  });

  const cohortAverages = cohortPlans.map(plan => {
    const activeCourses = rawCurriculum
      .filter(c => courseMatchesPlan(c, plan))
      .map(c => mapDisplayCourse(c, plan))
      .filter(c => !c.isFuture);
    const isUnstarted = activeCourses.length === 0;
    
    let totalScore = 0;
    let validCount = 0;
    activeCourses.forEach(c => {
      let sum = 0;
      let count = 0;
      if (!c.isAttendanceNA && c.attendanceTarget > 0) {
        sum += Math.min((c.attendanceRate / c.attendanceTarget) * 100, 100);
        count++;
      }
      if (!c.isPassNA && c.passTarget > 0) {
        sum += Math.min((c.passRate / c.passTarget) * 100, 100);
        count++;
      }
      if (!c.isSubmitNA && c.submitTarget > 0) {
        sum += Math.min((c.submitRate / c.submitTarget) * 100, 100);
        count++;
      }
      if (count > 0) {
        totalScore += sum / count;
        validCount++;
      }
    });

    const avg = !isUnstarted && validCount > 0
      ? Math.round(totalScore / validCount)
      : 0;
    return { cohort: plan.label, avg, isUnstarted };
  });

  const currentActiveCourses = displayCourses.filter(c => !c.isFuture);
  let curTotal = 0;
  let curCount = 0;
  currentActiveCourses.forEach(c => {
    let sum = 0;
    let count = 0;
    if (!c.isAttendanceNA && c.attendanceTarget > 0) {
      sum += Math.min((c.attendanceRate / c.attendanceTarget) * 100, 100);
      count++;
    }
    if (!c.isPassNA && c.passTarget > 0) {
      sum += Math.min((c.passRate / c.passTarget) * 100, 100);
      count++;
    }
    if (!c.isSubmitNA && c.submitTarget > 0) {
      sum += Math.min((c.submitRate / c.submitTarget) * 100, 100);
      count++;
    }
    if (count > 0) {
      curTotal += sum / count;
      curCount++;
    }
  });
  const totalAvgScore = curCount > 0 ? Math.round(curTotal / curCount) : 100;

  const programCourses = displayCourses;

  const program = programs.find(p => p.id === selectedProgram);
  const coordinator = program ? getUserById(program.managerId) : null;

  const isStaff = currentRole === 'staff';
  const isManager = currentRole === 'manager' || currentRole === 'admin';

  const activeSemester = semesterData.currentSemester;
  const assessmentStatus = coordinator ? getSubmissionStatus(coordinator.id, activeSemester) : 'open';
  const isDirectEdit = assessmentStatus === 'open';

  const handleEdit = (course: Course, field: CourseEditField, fieldLabel: string, value: number, isNA?: boolean) => {
    setEditTarget({ course, field, fieldLabel, value, isNA });
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
      const isFuture = c.isFuture;
      const attendComp = isFuture || c.isAttendanceNA ? 'N/A' : `${Math.round((c.attendanceRate / c.attendanceTarget) * 1000) / 10}%`;
      const passComp = isFuture || c.isPassNA ? 'N/A' : `${Math.round((c.passRate / c.passTarget) * 1000) / 10}%`;
      const submitComp = isFuture || c.isSubmitNA ? 'N/A' : `${Math.round((c.submitRate / c.submitTarget) * 1000) / 10}%`;
      
      let compSum = 0;
      let compCount = 0;
      if (!isFuture && !c.isAttendanceNA) { compSum += (c.attendanceRate / c.attendanceTarget) * 100; compCount++; }
      if (!isFuture && !c.isPassNA) { compSum += (c.passRate / c.passTarget) * 100; compCount++; }
      if (!isFuture && !c.isSubmitNA) { compSum += (c.submitRate / c.submitTarget) * 100; compCount++; }
      const avgComp = isFuture || compCount === 0 ? 'N/A' : `${Math.round((compSum / compCount) * 10) / 10}%`;

      return [
        program?.shortName,
        c.displayCohort,
        c.semester,
        c.name,
        c.numLecturers,
        c.numStudents,
        c.isAttendanceNA ? 'N/A' : `${Math.round(c.attendanceTarget * 1000) / 10}%`,
        c.isPassNA ? 'N/A' : `${Math.round(c.passTarget * 1000) / 10}%`,
        c.isSubmitNA ? 'N/A' : `${Math.round(c.submitTarget * 1000) / 10}%`,
        c.isAttendanceNA ? 'N/A' : `${Math.round(c.attendanceRate * 1000) / 10}%`,
        c.isPassNA ? 'N/A' : `${Math.round(c.passRate * 1000) / 10}%`,
        c.isSubmitNA ? 'N/A' : `${Math.round(c.submitRate * 1000) / 10}%`,
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
      {/* 1. Ultra-Clean Top Bar: Title + Context Info & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>Bảng KPI Môn học</h1>
          {coordinator && (
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', background: 'var(--gray-100)', padding: '3px 8px', borderRadius: 4 }}>
              {coordinator.name} {program ? `(${program.shortName || program.name})` : ''}
            </span>
          )}
          <span style={{ 
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, 
            background: assessmentStatus === 'approved' ? '#ECFDF5' : assessmentStatus === 'submitted' ? '#FFFBEB' : '#F8FAFC',
            color: assessmentStatus === 'approved' ? '#059669' : assessmentStatus === 'submitted' ? '#D97706' : '#64748B',
            border: `1px solid ${assessmentStatus === 'approved' ? '#A7F3D0' : assessmentStatus === 'submitted' ? '#FDE68A' : '#E2E8F0'}`
          }}>
            {assessmentStatus === 'approved' ? 'Đã duyệt' : assessmentStatus === 'submitted' ? 'Chờ duyệt' : 'Chưa nộp'}
          </span>
        </div>

        {/* Filters & Export Button */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedHe}
            onChange={e => {
              const newHe = e.target.value;
              setSelectedHe(newHe);
              const progsInHe = programs.filter(p => p.status === 'active' && (newHe === 'all' || p.type === newHe));
              if (progsInHe.length > 0 && !progsInHe.some(p => p.id === selectedProgram)) {
                setSelectedProgram(progsInHe[0].id);
              }
            }}
            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 13, fontWeight: 500, background: 'white', color: 'var(--gray-800)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">Tất cả hệ</option>
            <option value="degree">Cử nhân Chính quy</option>
            <option value="topup">Chuyển tiếp (Top-up)</option>
            <option value="certificate">Cao đẳng Quốc tế (BTEC)</option>
          </select>

          <select
            value={coordinator?.id || ''}
            onChange={e => {
              const coord = coordinatorList.find(c => c.id === e.target.value);
              if (coord) {
                setSelectedProgram(coord.programId);
                if (coord.he) setSelectedHe(coord.he);
              }
            }}
            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 13, fontWeight: 500, background: 'white', color: 'var(--gray-800)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">Cán bộ phụ trách...</option>
            {filteredCoordinators.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.programName})
              </option>
            ))}
          </select>

          <select 
            value={selectedProgram} 
            onChange={e => {
              const newProgId = e.target.value;
              setSelectedProgram(newProgId);
              const prog = programs.find(p => p.id === newProgId);
              if (prog?.type && selectedHe !== 'all' && prog.type !== selectedHe) {
                setSelectedHe(prog.type);
              }
            }}
            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 13, fontWeight: 600, background: 'white', color: 'var(--gray-900)', cursor: 'pointer', outline: 'none' }}
          >
            {filteredPrograms.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            value={selectedCohort} 
            onChange={e => setSelectedCohort(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 13, fontWeight: 500, background: 'white', color: 'var(--gray-800)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">Tất cả lớp</option>
            {uniqueCohorts.map(coh => (
              <option key={coh} value={coh}>{coh}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={exportToExcel} style={{ fontSize: 13, padding: '6px 12px', height: 32, gap: 5 }}>
            <Download size={13} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* 2. Flat Tabs & Stats Strip (NO enclosing card, NO bulky pills) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
        {/* Segmented Control Tabs */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'var(--gray-200)', padding: 2, borderRadius: 6 }}>
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
              onClick={() => setFilterSemester(tab.id as any)}
              style={{
                padding: '4px 10px',
                borderRadius: 5,
                border: 'none',
                fontSize: 13,
                fontWeight: filterSemester === tab.id ? 600 : 500,
                cursor: 'pointer',
                background: filterSemester === tab.id ? 'white' : 'transparent',
                color: filterSemester === tab.id ? 'var(--gray-900)' : 'var(--gray-600)',
                boxShadow: filterSemester === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Clean Inline Stats (Text metrics) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--gray-600)' }}>
          <div>
            <span>TB Bảng: </span>
            <strong style={{ color: 'var(--gray-900)', fontWeight: 700 }}>
              {isNaN(totalAvgScore) ? 0 : totalAvgScore}%
            </strong>
          </div>
          {cohortAverages.filter(c => !c.isUnstarted).map(cohAvg => (
            <div key={cohAvg.cohort} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--gray-300)' }}>•</span>
              <span>{cohAvg.cohort}: </span>
              <strong style={{ color: '#2563EB', fontWeight: 700 }}>
                {isNaN(cohAvg.avg) ? 0 : cohAvg.avg}%
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* Course Edit Approval Panel */}
      <CourseApprovalPanel isManager={isManager} userId={currentUserId} selectedProgramId={selectedProgram} />

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: 'auto', borderRadius: 8, border: '1px solid var(--gray-200)', boxShadow: 'none' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 1400 }}>
          <thead>
            <tr style={{ background: '#1E293B', color: 'white' }}>
              <th rowSpan={2} style={thStyle}>Lớp</th>
              <th rowSpan={2} style={thStyle}>Kỳ</th>
              <th rowSpan={2} style={{ ...thStyle, minWidth: 220, textAlign: 'left' }}>Môn học</th>
              <th rowSpan={2} style={thStyle}>Số GV</th>
              <th rowSpan={2} style={thStyle}>Số SV</th>
              <th colSpan={3} style={{ ...thStyle, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>Mục tiêu đầu kỳ (%)</th>
              <th colSpan={3} style={{ ...thStyle, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>Kết quả thực tế (%)</th>
              <th colSpan={3} style={{ ...thStyle, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>Mức độ hoàn thành (%)</th>
              <th rowSpan={2} style={{ ...thStyle, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>Hoàn thành chung</th>
            </tr>
            <tr style={{ background: '#243247', color: 'rgba(255,255,255,0.9)' }}>
              <th style={subThStyle}>Chuyên cần</th>
              <th style={subThStyle}>Pass lần 1</th>
              <th style={subThStyle}>Nộp đúng hạn</th>
              
              <th style={{ ...subThStyle, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Chuyên cần</th>
              <th style={subThStyle}>Pass lần 1</th>
              <th style={subThStyle}>Nộp đúng hạn</th>
              
              <th style={{ ...subThStyle, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Chuyên cần</th>
              <th style={subThStyle}>Pass lần 1</th>
              <th style={subThStyle}>Nộp đúng hạn</th>
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
                const isFuture = c.isFuture;
                const isCurrent = c.isCurrent;

                const attendComp = isFuture || c.isAttendanceNA ? null : Math.round((c.attendanceRate / c.attendanceTarget) * 1000) / 10;
                const passComp = isFuture || c.isPassNA ? null : Math.round((c.passRate / c.passTarget) * 1000) / 10;
                const submitComp = isFuture || c.isSubmitNA ? null : Math.round((c.submitRate / c.submitTarget) * 1000) / 10;

                let compSum = 0;
                let compCount = 0;
                if (attendComp !== null) { compSum += attendComp; compCount++; }
                if (passComp !== null) { compSum += passComp; compCount++; }
                if (submitComp !== null) { compSum += submitComp; compCount++; }
                const avgComp = isFuture || compCount === 0 ? null : Math.round((compSum / compCount) * 10) / 10;

                return (
                  <tr key={c.id + '_' + ci} style={{ background: isCurrent ? 'rgba(59,130,246,0.02)' : ci % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--gray-700)' }}>
                      {c.displayCohort || c.cohort}
                      {isCurrent && <span style={{ display: 'block', fontSize: 11, color: '#2563EB', background: '#DBEAFE', padding: '1px 4px', borderRadius: 4, marginTop: 2, fontWeight: 600 }}>Kỳ này</span>}
                      {isFuture && <span style={{ display: 'block', fontSize: 11, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '1px 4px', borderRadius: 4, marginTop: 2, fontWeight: 500 }}>Chưa học</span>}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--gray-600)', fontWeight: 500 }}>{formatSemester(c.semester)}</td>
                    <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500, paddingLeft: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: isFuture ? 'var(--gray-400)' : 'var(--gray-800)', fontSize: 13, fontWeight: isCurrent ? 700 : 500 }}>{c.name}</span>
                        {c.code && <span style={{ color: 'var(--gray-400)', fontSize: 11 }}>Mã: {c.code} · Năm {c.year}</span>}
                      </div>
                    </td>
                    
                    {/* Số GV - Editable */}
                    <EditableCell 
                      course={c} 
                      field="numLecturers" 
                      fieldLabel="Số giảng viên" 
                      value={c.numLecturers} 
                      displayVal={isFuture ? '-' : String(c.numLecturers)} 
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />

                    {/* Số SV - Editable */}
                    <EditableCell 
                      course={c} 
                      field="numStudents" 
                      fieldLabel="Số sinh viên" 
                      value={c.numStudents} 
                      displayVal={isFuture ? '-' : String(c.numStudents)} 
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />
                    
                    {/* Targets */}
                    <td style={{ ...tdStyle, background: '#F8FAFC' }}>{isFuture ? '-' : formatRate(c.attendanceTarget, c.isAttendanceNA)}</td>
                    <td style={{ ...tdStyle, background: '#F8FAFC' }}>{isFuture ? '-' : formatRate(c.passTarget, c.isPassNA)}</td>
                    <td style={{ ...tdStyle, background: '#F8FAFC' }}>{isFuture ? '-' : formatRate(c.submitTarget, c.isSubmitNA)}</td>
                    
                    {/* Actuals - Editable */}
                    <EditableCell 
                      course={c} 
                      field="attendanceRate" 
                      fieldLabel="Tỉ lệ đi học đầy đủ" 
                      value={Math.round(c.attendanceRate * 1000) / 10} 
                      displayVal={isFuture ? '-' : formatRate(c.attendanceRate, c.isAttendanceNA)} 
                      isNA={c.isAttendanceNA}
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />
                    <EditableCell 
                      course={c} 
                      field="passRate" 
                      fieldLabel="Tỉ lệ pass lần 1" 
                      value={Math.round(c.passRate * 1000) / 10} 
                      displayVal={isFuture ? '-' : formatRate(c.passRate, c.isPassNA)} 
                      isNA={c.isPassNA}
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />
                    <EditableCell 
                      course={c} 
                      field="submitRate" 
                      fieldLabel="Tỉ lệ nộp bài/thi đúng hạn" 
                      value={Math.round(c.submitRate * 1000) / 10} 
                      displayVal={isFuture ? '-' : formatRate(c.submitRate, c.isSubmitNA)} 
                      isNA={c.isSubmitNA}
                      isStaff={isStaff && isCurrent} 
                      userId={currentUserId} 
                      isDirectEdit={isDirectEdit} 
                      onEdit={handleEdit} 
                    />
                    
                    {/* Completion Rates */}
                    <td style={{ ...tdStyle, color: isFuture ? 'var(--gray-300)' : c.isAttendanceNA ? '#64748B' : getScoreColor(attendComp!), fontWeight: 700, background: isFuture ? 'transparent' : c.isAttendanceNA ? '#F8FAFC' : getBgColor(attendComp!) }}>
                      {isFuture ? '-' : c.isAttendanceNA ? 'N/A' : `${attendComp}%`}
                    </td>
                    <td style={{ ...tdStyle, color: isFuture ? 'var(--gray-300)' : c.isPassNA ? '#64748B' : getScoreColor(passComp!), fontWeight: 700, background: isFuture ? 'transparent' : c.isPassNA ? '#F8FAFC' : getBgColor(passComp!) }}>
                      {isFuture ? '-' : c.isPassNA ? 'N/A' : `${passComp}%`}
                    </td>
                    <td style={{ ...tdStyle, color: isFuture ? 'var(--gray-300)' : c.isSubmitNA ? '#64748B' : getScoreColor(submitComp!), fontWeight: 700, background: isFuture ? 'transparent' : c.isSubmitNA ? '#F8FAFC' : getBgColor(submitComp!) }}>
                      {isFuture ? '-' : c.isSubmitNA ? 'N/A' : `${submitComp}%`}
                    </td>
                    
                    {/* Course Avg Completion */}
                    <td style={{ ...tdStyle, background: isFuture ? 'transparent' : '#F1F5F9', color: isFuture ? 'var(--gray-300)' : avgComp === null ? '#64748B' : getScoreColor(avgComp!), fontWeight: 700, fontSize: 13 }}>
                      {isFuture ? (
                        <span style={{ fontSize: 11, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>Chưa bắt đầu</span>
                      ) : avgComp === null ? (
                        <span style={{ fontSize: 11, color: '#64748B', background: '#E2E8F0', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>N/A</span>
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

      {/* Minimal Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 10, fontSize: 11, color: 'var(--gray-500)', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
            Đạt (≥100%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />
            Gần đạt (90 - 99%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
            Chưa đạt (&lt;90%)
          </span>
        </div>
        <span style={{ color: 'var(--gray-400)' }}>
          * Nhấp biểu tượng bút để chỉnh sửa chỉ tiêu hoặc số liệu môn học
        </span>
      </div>

      {/* Edit Dialog */}
      {editTarget && (
        <EditCellDialog
          course={editTarget.course}
          field={editTarget.field}
          fieldLabel={editTarget.fieldLabel}
          currentValue={editTarget.value}
          isNA={editTarget.isNA}
          userId={currentUserId}
          isDirectEdit={isDirectEdit}
          onDone={() => { setEditTarget(null); forceUpdate((n: number) => n + 1); }}
        />
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
  border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: 60,
  letterSpacing: '0.01em',
};

const subThStyle: React.CSSProperties = {
  padding: '6px 8px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
  border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: 'rgba(255,255,255,0.85)',
};

const tdStyle: React.CSSProperties = {
  padding: '7px 10px', fontSize: 13, textAlign: 'center',
  borderBottom: '1px solid var(--gray-100)', whiteSpace: 'nowrap',
};
