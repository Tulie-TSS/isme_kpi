'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { 
  kpiGroups, 
  getKPISnapshotsByUser, 
  kpiDefinitions, 
  getUserById, 
  calculateOverallKPI, 
  getPendingEditForSnapshot, 
  subscribeEditRequests, 
  getUserRoleLabel,
  courses,
  otherActivityRecords,
  laborDisciplineRecords
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

function getScoreColor(s: number) { return s >= 85 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444'; }
function getScoreLabel(s: number) { return s >= 95 ? 'Xuất sắc' : s >= 85 ? 'Tốt' : s >= 60 ? 'Cần cải thiện' : 'Cảnh báo'; }

export default function KPIPage() {
  const { currentUserId } = useApp();
  const user = getUserById(currentUserId);
  const period = 'Kỳ 2 2024-2025';
  const snapshots = getKPISnapshotsByUser(currentUserId, period);
  const overall = calculateOverallKPI(currentUserId, period);
  const [editingSnapshot, setEditingSnapshot] = useState<KPISnapshot | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = subscribeEditRequests(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  const otherRec = otherActivityRecords.find(r => r.userId === currentUserId && r.period === period);
  const laborRec = laborDisciplineRecords.find(r => r.userId === currentUserId && r.period === period);
  const userCourses = courses; // Filter in real app

  const isStaff = user?.role === 'staff';

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
                  <KPIRow key={snap.id} snap={snap} def={def} idx={i + 1} isStaff={isStaff} onEdit={() => setEditingSnapshot(snap)} />
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
            {snapshots
              .filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'academic_support')
              .map((snap, i) => {
                const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId)!;
                return (
                  <KPIRow key={snap.id} snap={snap} def={def} idx={i + 1} isStaff={isStaff} onEdit={() => setEditingSnapshot(snap)} />
                );
              })
            }

            {/* 3. STUDENT RESULTS (10%) */}
            <tr style={{ background: '#F1F5F9' }}>
              <td colSpan={8} style={{ padding: '10px 16px', fontWeight: 800, fontSize: 13, color: '#1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AwardIcon size={16} color="var(--isme-red)" />
                  III. KẾT QUẢ HỌC TẬP & KỶ LUẬT CỦA SINH VIÊN (Trọng số 10%)
                </div>
              </td>
            </tr>
            {userCourses.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', fontSize: 12 }}>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{c.cohort}</div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12 }}>
                  Duy trì tỷ lệ chuyên cần ≥{(c.attendanceTarget * 100).toFixed(0)}% và tỷ lệ Pass ≥{(c.passTarget * 100).toFixed(0)}%
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>Lớp</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, color: 'var(--gray-400)' }}>
                  CC: {c.attendanceTarget * 100}% <br/> Pass: {c.passTarget * 100}%
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11 }}>
                  CC: {(c.attendanceRate * 100).toFixed(1)}% <br/> Pass: {(c.passRate * 100).toFixed(1)}%
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 800 }}>
                  {Math.round(((c.attendanceRate / c.attendanceTarget + c.passRate / c.passTarget) / 2) * 100)}%
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {c.attendanceRate >= c.attendanceTarget && c.passRate >= c.passTarget ? (
                    <CheckIcon size={16} color="#10B981" style={{ margin: '0 auto' }} />
                  ) : (
                    <AlertIcon size={16} color="#EF4444" style={{ margin: '0 auto' }} />
                  )}
                </td>
              </tr>
            ))}

            {/* 4. OTHER ACTIVITIES (10%) */}
            <tr style={{ background: '#F1F5F9' }}>
              <td colSpan={8} style={{ padding: '10px 16px', fontWeight: 800, fontSize: 13, color: '#1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookIcon size={16} color="var(--isme-red)" />
                  IV. CÁC HOẠT ĐỘNG KHÁC (Trọng số 10%)
                </div>
              </td>
            </tr>
            {[
              { id: 'oa1', name: 'Tuyển sinh', active: otherRec?.admission },
              { id: 'oa2', name: 'Hỗ trợ du học', active: otherRec?.studyAbroad },
              { id: 'oa3', name: 'Hỗ trợ exchange', active: otherRec?.exchange },
              { id: 'oa4', name: 'Các hoạt động khác của Viện', active: otherRec?.otherInstitute },
            ].map((oa, i) => (
              <tr key={oa.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>{oa.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-500)' }}>Tham gia các hoạt động theo phân công của Viện</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>Mục</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>1</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{oa.active ? '1' : '0'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 800 }}>{oa.active ? '100%' : '0%'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {oa.active ? <CheckIcon size={16} color="#10B981" style={{ margin: '0 auto' }} /> : <ClockIcon size={16} color="var(--gray-300)" style={{ margin: '0 auto' }} />}
                </td>
              </tr>
            ))}

            {/* 5. LABOR DISCIPLINE (10%) */}
            <tr style={{ background: '#F1F5F9' }}>
              <td colSpan={8} style={{ padding: '10px 16px', fontWeight: 800, fontSize: 13, color: '#1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldIcon size={16} color="var(--isme-red)" />
                  V. KỶ LUẬT LAO ĐỘNG (Trọng số 10%)
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>1</td>
              <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700 }}>Tuân thủ nội quy & giờ giấc</td>
              <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-500)' }}>{laborRec?.note || 'Không có vi phạm, đi làm đúng giờ'}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>Điểm</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>100</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{laborRec?.score || 0}</td>
              <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 800 }}>{laborRec?.score || 0}%</td>
              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(laborRec?.score || 0) }}>
                  {getScoreLabel(laborRec?.score || 0)}
                </span>
              </td>
            </tr>

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

function KPIRow({ snap, def, idx, isStaff, onEdit }: { snap: KPISnapshot; def: KPIDefinition; idx: number; isStaff: boolean; onEdit: () => void }) {
  const pendingEdit = getPendingEditForSnapshot(snap.id);
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
            <button onClick={onEdit} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', display: 'flex' }}>
              <EditIcon size={11} />
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
