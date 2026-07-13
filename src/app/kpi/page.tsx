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
  getPendingEditForSnapshot, 
  subscribeEditRequests, 
  getUserRoleLabel,
  courses,
  getSubmissionStatus,
  programs
} from '@/lib/mock-data';
import { KPISnapshot, KPIDefinition } from '@/lib/types';
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, Edit3, Clock, Target, Users, Award, BookOpen, ShieldCheck } from 'lucide-react';
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
  const { currentUserId } = useApp();
  const user = getUserById(currentUserId);
  const period = 'Kỳ 2 2025-2026';
  const snapshots = getKPISnapshotsByUser(currentUserId, period);
  const overall = calculateOverallKPI(currentUserId, period);
  const [editingSnapshot, setEditingSnapshot] = useState<KPISnapshot | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = subscribeEditRequests(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  const isStaff = user?.role === 'staff';

  // Find program managed by coordinator
  const managedProgram = programs.find(p => p.managerId === currentUserId);
  const activeCourses = managedProgram 
    ? courses.filter(c => c.programId === managedProgram.id && c.semester === 'SEM 2') 
    : [];

  const studentResultsScore = managedProgram ? calculateCoursesKPI(managedProgram.id, 'current') : 100;

  // Check coordinator submission status
  const assessmentStatus = getSubmissionStatus(currentUserId, period);


  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>Bảng Theo dõi Kết quả KPI</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--isme-red)' }}>{user?.name}</span>
            <span style={{ fontSize: 14, color: 'var(--gray-400)' }}>|</span>
            <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>{user?.position}</span>
            <span style={{ fontSize: 14, color: 'var(--gray-400)' }}>|</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{period}</span>
            <span style={{ fontSize: 14, color: 'var(--gray-400)' }}>|</span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4, 
              background: assessmentStatus === 'approved' ? '#D1FAE5' : assessmentStatus === 'submitted' ? '#FEF3C7' : '#F3F4F6',
              color: assessmentStatus === 'approved' ? '#065F46' : assessmentStatus === 'submitted' ? '#B45309' : '#374151'
            }}>
              Trạng thái: {assessmentStatus === 'approved' ? 'Đã duyệt' : assessmentStatus === 'submitted' ? 'Đang chờ duyệt' : 'Chưa nộp'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Điểm KPI Tổng hợp</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: getScoreColor(overall), lineHeight: 1 }}>
            {overall}<span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-300)' }}>/100</span>
          </div>
        </div>
      </div>

      <KPIApprovalPanel />

      {/* Main Excel-style Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--gray-200)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--gray-200)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, width: 40 }}>STT</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, width: 300 }}>Chỉ tiêu / Nội dung</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Tiêu chí đánh giá</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, width: 80 }}>Đơn vị</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, width: 80 }}>Kế hoạch</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, width: 80 }}>Thực hiện</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, width: 80 }}>Tỉ lệ (%)</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, width: 120 }}>Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            
            {/* 1. OPERATIONS (50%) */}
            <tr style={{ background: '#F1F5F9' }}>
              <td colSpan={8} style={{ padding: '10px 16px', fontWeight: 800, fontSize: 13, color: '#1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TargetIcon size={16} color="var(--isme-red)" />
                  I. CHỈ TIÊU OPERATIONS (Trọng số 50%)
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
            <tr style={{ background: '#F1F5F9' }}>
              <td colSpan={8} style={{ padding: '10px 16px', fontWeight: 800, fontSize: 13, color: '#1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UsersIcon size={16} color="var(--isme-red)" />
                  II. CHỈ TIÊU HOẠT ĐỘNG HỖ TRỢ HỌC TẬP (Trọng số 20%)
                </div>
              </td>
            </tr>
            {(() => {
              const snap = snapshots.find(s => s.kpiDefinitionId === 'op1');
              const def = kpiDefinitions.find(k => k.id === 'op1');
              if (!snap || !def) return null;
              return (
                <tr style={{ borderBottom: '1px solid var(--gray-100)', background: 'rgba(59,130,246,0.02)' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--gray-400)' }}>1</td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>
                    <div style={{ fontWeight: 700 }}>{def.name} (Hỗ trợ học tập)</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{def.shortName}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.4 }}>
                    {def.criteria} <br/> <span style={{ color: '#1E40AF', fontSize: 11 }}>💡 Được lấy điểm trực tiếp từ Vận hành chỉ tiêu STT 1.</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{def.unit}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{snap.targetValue}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{snap.actualValue}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: getScoreColor(snap.score) }}>
                    {snap.score}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(snap.score) }}>{getScoreLabel(snap.score)}</span>
                  </td>
                </tr>
              );
            })()}

            {/* 3. STUDENT RESULTS (20%) */}
            <tr style={{ background: '#F1F5F9' }}>
              <td colSpan={8} style={{ padding: '10px 16px', fontWeight: 800, fontSize: 13, color: '#1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AwardIcon size={16} color="var(--isme-red)" />
                  III. KẾT QUẢ HỌC TẬP & KỶ LUẬT CỦA SINH VIÊN (Trọng số 20%)
                </div>
              </td>
            </tr>
            {activeCourses.map((c, i) => {
              const attendComp = Math.round((c.attendanceRate / c.attendanceTarget) * 100);
              const passComp = Math.round((c.passRate / c.passTarget) * 100);
              const submitComp = Math.round((c.submitRate / c.submitTarget) * 100);
              const avgComp = Math.round((attendComp + passComp + submitComp) / 3);

              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>Lớp: {c.cohort} · {c.semester}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, lineHeight: 1.4 }}>
                    Đảm bảo chỉ tiêu chuyên cần & học tập môn học đầu kỳ.
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>Môn</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                    CC Target: {c.attendanceTarget * 100}% <br/> Pass Target: {c.passTarget * 100}% <br/> Nộp bài Target: {c.submitTarget * 100}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, whiteSpace: 'nowrap' }}>
                    CC KQ: {Math.round(c.attendanceRate * 100)}% <br/> Pass KQ: {Math.round(c.passRate * 100)}% <br/> Nộp bài KQ: {Math.round(c.submitRate * 100)}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: getScoreColor(avgComp) }}>
                    {avgComp}%
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(avgComp) }}>{getScoreLabel(avgComp)}</span>
                  </td>
                </tr>
              );
            })}
            
            {/* 3.1 Course Aggregate Row */}
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--gray-200)' }}>
              <td style={{ padding: '10px 16px', textAlign: 'center' }}>★</td>
              <td style={{ padding: '10px 16px', fontWeight: 700, fontSize: 12 }} colSpan={2}>Mức hoàn thành trung bình Nhóm Kết quả học sinh</td>
              <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12 }}>%</td>
              <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12 }}>100%</td>
              <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12 }}>-</td>
              <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 14, fontWeight: 900, color: getScoreColor(studentResultsScore) }}>{studentResultsScore}%</td>
              <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(studentResultsScore) }}>{getScoreLabel(studentResultsScore)}</span>
              </td>
            </tr>

            {/* 4. OTHER ACTIVITIES (10%) */}
            <tr style={{ background: '#F1F5F9' }}>
              <td colSpan={8} style={{ padding: '10px 16px', fontWeight: 800, fontSize: 13, color: '#1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookIcon size={16} color="var(--isme-red)" />
                  IV. CÁC HOẠT ĐỘNG KHÁC (Trọng số 10%)
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
    <tr style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.15s' }}>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--gray-400)' }}>{idx}</td>
      <td style={{ padding: '12px 16px', fontSize: 12 }}>
        <div style={{ fontWeight: 700 }}>{def.name}</div>
        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{def.shortName}</div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.4 }}>{def.criteria}</td>
      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{def.unit}</td>
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
            <div style={{ fontSize: 9, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 2 }}>
              <ClockIcon size={10} /> Đang duyệt
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
