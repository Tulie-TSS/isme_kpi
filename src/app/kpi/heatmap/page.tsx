'use client';
import { 
  users, 
  kpiSnapshots, 
  kpiDefinitions, 
  calculateOverallKPI, 
  programs, 
  getUserById, 
  kpiGroups,
  otherActivityRecords,
  laborDisciplineRecords,
  courses,
  calculateCoursesKPI
} from '@/lib/mock-data';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { ShieldCheck, ShieldAlert, Target, Users as UsersIcon, Award, BookOpen, ShieldCheck as LaborIcon } from 'lucide-react';

function getScoreColor(s: number) { return s >= 85 ? '#047857' : s >= 60 ? '#D97706' : '#DC2626'; }
function getScoreBg(s: number) { return s >= 85 ? '#D1FAE5' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }

export default function HeatmapPage() {
  const { selectedProgramId, hasAnyRole } = useApp();
  const period = 'Kỳ 2 2024-2025';

  const isAuthorized = hasAnyRole('manager', 'institute_leader', 'admin');

  if (!isAuthorized) {
    return (
      <div className="card text-center py-12">
        <ShieldAlert size={48} className="mx-auto mb-4 text-warning" />
        <h2 className="text-xl font-bold mb-2">Không có quyền truy cập</h2>
        <p className="text-muted">Trang Heatmap KPI chỉ dành cho Quản lý, Lãnh đạo Viện và Quản trị viên.</p>
      </div>
    );
  }
  
  const staffUsers = users.filter(u => u.role === 'staff');
  const [selectedCell, setSelectedCell] = useState<{ userId: string; groupId: string } | null>(null);

  const getGroupScore = (userId: string, groupId: string) => {
    const group = kpiGroups.find(g => g.id === groupId);
    if (!group) return 0;

    if (groupId === 'operations') {
      const groupDefs = kpiDefinitions.filter(d => d.groupId === groupId);
      const groupSnaps = kpiSnapshots.filter(s => s.userId === userId && s.period === period && groupDefs.some(d => d.id === s.kpiDefinitionId));
      if (groupSnaps.length === 0) return 0;
      return Math.round(groupSnaps.reduce((acc, s) => acc + (s.leaderScore !== undefined ? s.leaderScore : s.score), 0) / groupSnaps.length);
    }

    if (groupId === 'academic_support') {
      const op5AsSnap = kpiSnapshots.find(s => s.userId === userId && s.period === period && s.kpiDefinitionId === 'op5_as')
        || kpiSnapshots.find(s => s.userId === userId && s.period === period && s.kpiDefinitionId === 'op1');
      if (!op5AsSnap) return 100;
      return Math.round(op5AsSnap.leaderScore !== undefined ? op5AsSnap.leaderScore : op5AsSnap.score);
    }

    if (groupId === 'student_results') {
      const userProg = programs.find(p => p.managerId === userId);
      if (!userProg) return 100;
      return calculateCoursesKPI(userProg.id, 'current');
    }

    if (groupId === 'other_activities') {
      const otherDefs = kpiDefinitions.filter(d => d.groupId === 'other_activities');
      const otherSnaps = kpiSnapshots.filter(s => s.userId === userId && s.period === period && otherDefs.some(d => d.id === s.kpiDefinitionId));
      if (otherSnaps.length === 0) return 0;
      const totalWeight = otherDefs.reduce((sum, d) => sum + d.weight, 0);
      if (totalWeight > 0) {
        const weightedSum = otherSnaps.reduce((acc, s) => {
          const def = otherDefs.find(d => d.id === s.kpiDefinitionId);
          const score = s.leaderScore !== undefined ? s.leaderScore : s.score;
          return acc + score * (def?.weight || 1);
        }, 0);
        return Math.round(weightedSum / totalWeight);
      }
      return Math.round(otherSnaps.reduce((acc, s) => acc + (s.leaderScore !== undefined ? s.leaderScore : s.score), 0) / otherSnaps.length);
    }

    if (groupId === 'labor_discipline') {
      const rec = laborDisciplineRecords.find(r => r.userId === userId && r.period === period);
      return rec?.score || 0;
    }

    return 0;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', margin: 0, marginBottom: 4 }}>Bảng Tổng hợp KPI Nhân sự</h1>
          <p style={{ fontSize: 11, color: 'var(--gray-500)', margin: 0 }}>{period} · So sánh hiệu suất giữa các phòng ban/cá nhân</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--gray-600)', fontWeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#D1FAE5', border: '1px solid #A7F3D0' }} /> ≥85 Tốt</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#FEF3C7', border: '1px solid #FDE68A' }} /> 60–84 Cần cải thiện</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#FEE2E2', border: '1px solid #FECACA' }} /> &lt;60 Cảnh báo</div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0, border: '1px solid var(--gray-200)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', minWidth: 200, position: 'sticky', left: 0, background: '#F8FAFC', zIndex: 10 }}>
                Nhân viên
              </th>
              {kpiGroups.map(g => (
                <th key={g.id} style={{ textAlign: 'center', padding: '8px 12px', fontSize: 11, fontWeight: 600, borderLeft: '1px solid var(--gray-100)' }}>
                  <div style={{ color: 'var(--gray-600)', marginBottom: 2 }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--isme-red)', fontWeight: 600 }}>{g.weight}%</div>
                </th>
              ))}
              <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--gray-700)', background: '#F1F5F9', borderLeft: '2px solid var(--gray-200)' }}>
                KPI Tổng hợp
              </th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map(u => {
              const overall = calculateOverallKPI(u.id, period);
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '8px 16px', position: 'sticky', left: 0, background: 'white', zIndex: 5, borderRight: '1px solid var(--gray-100)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{u.position}</div>
                  </td>
                  {kpiGroups.map(g => {
                    const score = getGroupScore(u.id, g.id);
                    return (
                      <td key={g.id} style={{ padding: 4 }}>
                        <div
                          style={{
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            background: getScoreBg(score),
                            color: getScoreColor(score),
                            cursor: 'pointer',
                            transition: 'transform 0.1s'
                          }}
                          onClick={() => setSelectedCell({ userId: u.id, groupId: g.id })}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {score}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: 4, background: '#F8FAFC' }}>
                    <div style={{
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      background: getScoreBg(overall),
                      color: getScoreColor(overall),
                      border: '1px solid currentColor'
                    }}>
                      {overall}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Analysis Section */}
      {selectedCell && (
        <div className="card animate-fade-in" style={{ marginTop: 24, border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>
                Chi tiết: {kpiGroups.find(g => g.id === selectedCell.groupId)?.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>
                Nhân sự: {users.find(u => u.id === selectedCell.userId)?.name}
              </div>
            </div>
            <button 
              onClick={() => setSelectedCell(null)}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--gray-300)', background: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            > Đóng </button>
          </div>

          <div style={{ background: 'white', borderRadius: 10, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
            {selectedCell.groupId === 'operations' || selectedCell.groupId === 'academic_support' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                    <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>Chỉ tiêu</th>
                    <th style={{ padding: '8px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>Kế hoạch</th>
                    <th style={{ padding: '8px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>Thực hiện</th>
                    <th style={{ padding: '8px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiSnapshots
                    .filter(s => s.userId === selectedCell.userId && s.period === period && kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === selectedCell.groupId)
                    .map(snap => {
                      const def = kpiDefinitions.find(d => d.id === snap.kpiDefinitionId);
                      return (
                        <tr key={snap.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <td style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500 }}>{def?.name}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center', fontSize: 13 }}>{snap.targetValue}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center', fontSize: 13 }}>{snap.actualValue}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: getScoreColor(snap.score) }}>{snap.score}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
                Xem chi tiết tại bảng KPI cá nhân của nhân sự này.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
