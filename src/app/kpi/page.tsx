'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { 
  kpiGroups, 
  getKPISnapshotsByUser, 
  kpiDefinitions, 
  getUserById, 
  calculateOverallKPI, 
  calculateCoursesKPI,
  calculateCoursePerformance,
  subscribeCourses,
  getPendingEditForSnapshot, 
  subscribeEditRequests, 
  getUserRoleLabel,
  courses,
  getSubmissionStatus,
  programs,
  users,
  formatSemester
} from '@/lib/mock-data';
import { KPISnapshot, KPIDefinition, Course } from '@/lib/types';
import Link from 'next/link';
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, Edit3, Clock, Target, Users, Award, BookOpen, ShieldCheck, ExternalLink } from 'lucide-react';
import KPIEditDialog from '@/components/kpi/KPIEditDialog';
import KPIApprovalPanel from '@/components/kpi/KPIApprovalPanel';

// Re-importing icons correctly from lucide-react
import { 
  CheckCircle2 as CheckIcon, 
  AlertTriangle as AlertIcon, 
  Edit3 as EditIcon, 
  Clock as ClockIcon, 
  Target as TargetIcon, 
  Users as UsersIcon, 
  Award as AwardIcon, 
  BookOpen as BookIcon, 
  ShieldCheck as ShieldIcon 
} from 'lucide-react';

function getScoreColor(s: number) { return s >= 90 ? '#10B981' : s >= 75 ? '#F59E0B' : '#EF4444'; }
function getScoreLabel(s: number) { return s >= 100 ? 'Xuất sắc' : s >= 90 ? 'Tốt' : s >= 75 ? 'Khá' : 'Cần cải thiện'; }

export default function KPIPage() {
  const { currentUserId, currentRole } = useApp();
  const period = 'Kỳ 2 2025-2026';
  const isManagerOrAdmin = currentRole === 'manager' || currentRole === 'admin';
  const staffUsers = users.filter(u => u.role === 'staff' && u.active);

  const [selectedStaffId, setSelectedStaffId] = useState<string>(isManagerOrAdmin ? 'u11' : currentUserId);
  const [selectedHe, setSelectedHe] = useState<string>('all'); // 'all' | 'degree' | 'topup' | 'certificate'
  const [editingSnapshot, setEditingSnapshot] = useState<KPISnapshot | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsubEdit = subscribeEditRequests(() => forceUpdate(n => n + 1));
    const unsubCourses = subscribeCourses(() => forceUpdate(n => n + 1));
    return () => {
      unsubEdit();
      unsubCourses();
    };
  }, []);

  // Filter staff list by selected Hệ / Ngành
  const filteredStaffList = staffUsers.filter(s => {
    if (selectedHe === 'all') return true;
    const prog = programs.find(p => p.managerId === s.id || p.secondaryManagerId === s.id);
    return prog?.type === selectedHe;
  });

  // Determine active viewing user
  const viewingUserId = isManagerOrAdmin ? selectedStaffId : currentUserId;
  const viewingUser = getUserById(viewingUserId);
  const isStaff = viewingUser?.role === 'staff';
  const snapshots = getKPISnapshotsByUser(viewingUserId, period);
  const overall = calculateOverallKPI(viewingUserId, period);

  // Find program managed by coordinator
  const managedProgram = programs.find(p => p.managerId === viewingUserId || p.secondaryManagerId === viewingUserId);
  
  const isCurrentActiveCourse = (c: Course): boolean => {
    if (c.cohort.includes('dự kiến') || c.cohort === 'I22 MT' || c.cohort === 'I23 MX' || c.cohort === 'I19 MT' || c.cohort === 'I20 MX' || c.cohort === 'I20 MT') return false;
    if (c.programId === 'p_nam1') {
      return (c.semester === 'SEM SPRING' || c.semester === 'SEM FALL & SPRING' || c.semester === 'SEM 2');
    }
    if (c.programId === 'p_cu') {
      return c.cohort === 'I19 MX' && c.semester === 'SEM 2';
    }
    if (c.programId === 'p_nhtc') {
      return (c.cohort === 'BScBF I19' || c.cohort === 'BScBF I18') && c.semester === 'SEM 2';
    }
    if (c.programId === 'p_uwe') {
      return (c.cohort === 'I18 MT - IBM' && c.semester === 'SEM 2') || (c.cohort === 'I19 MX - IBM' && c.semester === 'SEM 1');
    }
    return c.semester === 'SEM 2' && c.year <= 2;
  };

  const activeCourses = courses.filter(c => {
    const isOwner = c.coordinatorId === viewingUserId || (managedProgram && c.programId === managedProgram.id);
    return isOwner && isCurrentActiveCourse(c);
  });

  const studentResultsScore = managedProgram ? calculateCoursesKPI(managedProgram.id, 'current') : 100;

  // Check coordinator submission status
  const assessmentStatus = getSubmissionStatus(viewingUserId, period);


  // Auto-sync viewing user when currentUserId changes (support instant test view from Admin)
  useEffect(() => {
    if (currentUserId && currentUserId !== 'u0') {
      setSelectedStaffId(currentUserId);
      const prog = programs.find(p => p.managerId === currentUserId || p.secondaryManagerId === currentUserId);
      if (prog?.type) setSelectedHe(prog.type);
    }
  }, [currentUserId]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* Leadership / Admin Filter Bar: Chọn Hệ/Ngành & Người phụ trách */}
      {isManagerOrAdmin && (
        <div style={{ padding: '8px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'white', border: '1px solid var(--gray-200)', borderRadius: 6 }}>
          {/* Lọc theo Hệ / Ngành */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)' }}>Hệ / Ngành:</span>
            <div style={{ display: 'inline-flex', background: 'var(--gray-100)', padding: 2, borderRadius: 6, gap: 2 }}>
              {[
                { id: 'all', label: 'Tất cả các hệ' },
                { id: 'degree', label: 'Cử nhân Chính quy' },
                { id: 'topup', label: 'Chuyển tiếp (Top-up)' },
                { id: 'certificate', label: 'Cao đẳng (BTEC)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedHe(tab.id);
                    const staffInHe = staffUsers.filter(s => {
                      if (tab.id === 'all') return true;
                      const prog = programs.find(p => p.managerId === s.id || p.secondaryManagerId === s.id);
                      return prog?.type === tab.id;
                    });
                    if (staffInHe.length > 0 && !staffInHe.some(s => s.id === selectedStaffId)) {
                      setSelectedStaffId(staffInHe[0].id);
                    }
                  }}
                  style={{
                    padding: '4px 10px', borderRadius: 5, border: 'none', fontSize: 13, fontWeight: selectedHe === tab.id ? 600 : 500, cursor: 'pointer',
                    background: selectedHe === tab.id ? 'white' : 'transparent',
                    color: selectedHe === tab.id ? 'var(--gray-900)' : 'var(--gray-600)',
                    boxShadow: selectedHe === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn Người phụ trách */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)' }}>Cán bộ phụ trách:</span>
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              style={{
                padding: '5px 10px', borderRadius: 6, border: '1px solid var(--gray-200)',
                fontSize: 13, fontWeight: 500, color: 'var(--gray-900)', background: 'white', cursor: 'pointer', outline: 'none'
              }}
            >
              {filteredStaffList.map(s => {
                const prog = programs.find(p => p.managerId === s.id || p.secondaryManagerId === s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} — {prog ? prog.name : s.position}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Bảng Theo dõi Kết quả KPI</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--isme-red)' }}>{viewingUser?.name}</span>
            <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>|</span>
            <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{viewingUser?.position}</span>
            <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>|</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{period}</span>
            <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>|</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, 
              background: assessmentStatus === 'approved' ? '#D1FAE5' : assessmentStatus === 'submitted' ? '#FEF3C7' : '#F3F4F6',
              color: assessmentStatus === 'approved' ? '#065F46' : assessmentStatus === 'submitted' ? '#B45309' : '#374151'
            }}>
              Trạng thái: {assessmentStatus === 'approved' ? 'Đã duyệt' : assessmentStatus === 'submitted' ? 'Đang chờ duyệt' : 'Chưa nộp'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4 }}>Điểm KPI Tổng hợp</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: getScoreColor(overall), lineHeight: 1 }}>
            {overall}<span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-300)' }}>/100</span>
          </div>
        </div>
      </div>

      <KPIApprovalPanel />

      {/* Main Excel-style Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--gray-200)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
          <thead>
            <tr style={{ background: 'white', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', width: 50 }}>STT</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', width: 280 }}>Chỉ tiêu / Nội dung</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' }}>Tiêu chí đánh giá</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', width: 70 }}>Đơn vị</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', width: 80 }}>Kế hoạch</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', width: 80 }}>Thực hiện</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', width: 80 }}>Tỉ lệ (%)</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', width: 110 }}>Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            
            {/* 1. OPERATIONS (50%) */}
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--gray-200)' }}>
              <td colSpan={8} style={{ padding: '9px 16px', fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TargetIcon size={15} color="var(--isme-red)" />
                  <span>I. Chỉ tiêu Vận hành (Operations - Trọng số 50%)</span>
                </div>
              </td>
            </tr>
            {snapshots
              .filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'operations')
              .map((snap, i) => {
                const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId)!;
                return (
                  <KPIRow key={snap.id} snap={snap} def={def} idx={i + 1} isStaff={isStaff} assessmentStatus={assessmentStatus} onEdit={() => setEditingSnapshot(snap)} />
                );
              })
            }

            {/* 2. ACADEMIC SUPPORT (20%) */}
            <tr style={{ background: '#F8FAFC', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
              <td colSpan={8} style={{ padding: '9px 16px', fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UsersIcon size={15} color="var(--isme-red)" />
                  <span>II. Hoạt động Hỗ trợ học tập (Trọng số 20%)</span>
                </div>
              </td>
            </tr>
            {(() => {
              const snap = snapshots.find(s => s.kpiDefinitionId === 'op1');
              const def = kpiDefinitions.find(k => k.id === 'op1');
              if (!snap || !def) return null;
              return (
                <tr style={{ borderBottom: '1px solid var(--gray-100)', background: 'white' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>1</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{def.name} (Hỗ trợ học tập)</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{def.shortName}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.4 }}>
                    {def.criteria} <br/> <span style={{ color: '#1E40AF', fontSize: 11 }}>(Lấy điểm trực tiếp từ Chỉ tiêu Vận hành STT 1)</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>{def.unit}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{snap.targetValue}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{snap.actualValue}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: getScoreColor(snap.score) }}>
                    {snap.score}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(snap.score) }}>{getScoreLabel(snap.score)}</span>
                  </td>
                </tr>
              );
            })()}

            {/* 3. STUDENT RESULTS (20%) */}
            <tr style={{ background: '#F8FAFC', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
              <td colSpan={8} style={{ padding: '9px 16px', fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AwardIcon size={15} color="var(--isme-red)" />
                    <span>III. Kết quả học tập & kỷ luật sinh viên (Trọng số 20%)</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 400 }}>· {activeCourses.length} môn học kỳ này</span>
                  </div>
                  <Link 
                    href={`/kpi/courses?program=${managedProgram?.id || 'all'}`}
                    style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, 
                      color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: 4, 
                      textDecoration: 'none', border: '1px solid #BFDBFE' 
                    }}
                  >
                    <ExternalLink size={12} />
                    Bảng điền dữ liệu môn học
                  </Link>
                </div>
              </td>
            </tr>
            {activeCourses.map((c, i) => {
              const perf = calculateCoursePerformance(c);
              const avgComp = perf.avgComp;

              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--gray-100)', background: 'white' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Lớp: {c.cohort} · {formatSemester(c.semester)}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, lineHeight: 1.4 }}>
                    Đảm bảo chỉ tiêu chuyên cần & học tập môn học đầu kỳ.
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>Môn</td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>
                    <div>Đi học MT: {c.isAttendanceNA ? 'N/A' : `${Math.round(c.attendanceTarget * 1000) / 10}%`}</div>
                    <div>Pass 1st MT: {c.isPassNA ? 'N/A' : `${Math.round(c.passTarget * 1000) / 10}%`}</div>
                    <div>Nộp bài MT: {c.isSubmitNA ? 'N/A' : `${Math.round(c.submitTarget * 1000) / 10}%`}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, whiteSpace: 'nowrap' }}>
                    <div>Đi học KQ: {c.isAttendanceNA ? 'N/A' : `${Math.round(c.attendanceRate * 1000) / 10}%`} ({perf.attendComp}%)</div>
                    <div>Pass 1st: {c.isPassNA ? 'N/A' : `${Math.round(c.passRate * 1000) / 10}%`} {c.passResitRate !== undefined ? `| Resit: ${(c.passResitRate * 100).toFixed(1)}%` : ''} → Bù Resit: <strong>{perf.passComp}%</strong></div>
                    <div>Nộp bài KQ: {c.isSubmitNA ? 'N/A' : `${Math.round(c.submitRate * 1000) / 10}%`} ({perf.submitComp}%)</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: avgComp === null ? '#64748B' : getScoreColor(avgComp) }}>
                    {avgComp === null ? <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: 4 }}>N/A</span> : `${avgComp}%`}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: avgComp === null ? '#64748B' : getScoreColor(avgComp) }}>
                      {avgComp === null ? 'Không áp dụng' : getScoreLabel(avgComp)}
                    </span>
                  </td>
                </tr>
              );
            })}
            
            {/* 3.1 Course Aggregate Row */}
            <tr style={{ background: '#F8FAFC', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
              <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--gray-400)' }}>—</td>
              <td style={{ padding: '10px 16px', fontWeight: 700, fontSize: 13 }} colSpan={2}>Mức hoàn thành trung bình Nhóm Kết quả học sinh</td>
              <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13 }}>%</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--gray-500)' }}>Mục tiêu: 100%</td>
              <td style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--gray-500)' }}>TB {activeCourses.length} môn học kỳ này</td>
              <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: getScoreColor(studentResultsScore) }}>{studentResultsScore}%</td>
              <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(studentResultsScore) }}>{getScoreLabel(studentResultsScore)}</span>
              </td>
            </tr>

            {/* 4. OTHER ACTIVITIES (10%) */}
            <tr style={{ background: '#F8FAFC', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
              <td colSpan={8} style={{ padding: '9px 16px', fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookIcon size={15} color="var(--isme-red)" />
                  <span>IV. Các hoạt động khác (Trọng số 10%)</span>
                </div>
              </td>
            </tr>
            {snapshots
              .filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'other_activities')
              .map((snap, i) => {
                const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId)!;
                return (
                  <KPIRow key={snap.id} snap={snap} def={def} idx={i + 1} isStaff={isStaff} assessmentStatus={assessmentStatus} onEdit={() => setEditingSnapshot(snap)} />
                );
              })
            }

          </tbody>
        </table>
      </div>

      {/* KPI Edit Dialog */}
      {editingSnapshot && (
        <KPIEditDialog
          snapshot={editingSnapshot}
          definition={kpiDefinitions.find(k => k.id === editingSnapshot.kpiDefinitionId)!}
          onClose={() => setEditingSnapshot(null)}
          onSubmitted={() => forceUpdate(n => n + 1)}
        />
      )}
    </div>
  );
}

function KPIRow({ snap, def, idx, isStaff, assessmentStatus, onEdit }: { snap: KPISnapshot; def: KPIDefinition; idx: number; isStaff: boolean; assessmentStatus: string; onEdit: () => void }) {
  const pendingEdit = getPendingEditForSnapshot(snap.id);
  const isDirectEdit = assessmentStatus === 'open';

  return (
    <tr style={{ borderBottom: '1px solid var(--gray-100)', background: 'white', transition: 'background 0.15s' }}>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>{idx}</td>
      <td style={{ padding: '12px 16px', fontSize: 13 }}>
        <div style={{ fontWeight: 700 }}>{def.name}</div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{def.shortName}</div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.4 }}>{def.criteria}</td>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>{def.unit}</td>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{snap.targetValue}</td>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{snap.actualValue}</td>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: getScoreColor(snap.score) }}>
        {snap.score}%
      </td>
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(snap.score) }}>{getScoreLabel(snap.score)}</span>
          {isStaff && (
            <button onClick={onEdit} title={isDirectEdit ? 'Sửa trực tiếp' : 'Gửi yêu cầu sửa'}
              style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', display: 'flex' }}>
              <EditIcon size={11} color="var(--isme-red)" />
            </button>
          )}
          {pendingEdit && (
            <div style={{ fontSize: 11, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <ClockIcon size={10} /> Đang duyệt
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
