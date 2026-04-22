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
  courses
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
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', textAlign: 'center' }}>
        <div style={{ background: 'var(--isme-red-50)', padding: 32, borderRadius: 24, maxWidth: 480 }}>
          <ShieldAlert size={64} color="var(--isme-red)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Truy cập bị hạn chế</h2>
          <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.6 }}>
            Báo cáo tổng hợp KPI (Heatmap) chứa dữ liệu bảo mật giữa các nhân sự. 
            Chỉ **Quản lý** hoặc **Lãnh đạo Viện** mới có quyền xem bảng tổng hợp này.
          </p>
        </div>
      </div>
    );
  }
  
  const staffUsers = users.filter(u => u.role === 'staff');
  const [selectedCell, setSelectedCell] = useState<{ userId: string; groupId: string } | null>(null);

  const getGroupScore = (userId: string, groupId: string) => {
    const group = kpiGroups.find(g => g.id === groupId);
    if (!group) return 0;

    if (groupId === 'operations' || groupId === 'academic_support') {
      const groupDefs = kpiDefinitions.filter(d => d.groupId === groupId);
      const groupSnaps = kpiSnapshots.filter(s => s.userId === userId && s.period === period && groupDefs.some(d => d.id === s.kpiDefinitionId));
      if (groupSnaps.length === 0) return 0;
      const avg = groupSnaps.reduce((acc, s) => acc + s.score, 0) / groupSnaps.length;
      return Math.round(avg);
    }

    if (groupId === 'student_results') {
      // Mock calculation for heatmap
      const userCourses = courses; // In real app filter by user
      if (userCourses.length === 0) return 100;
      const avg = userCourses.reduce((acc, c) => acc + ((c.attendanceRate / c.attendanceTarget + c.passRate / c.passTarget) / 2), 0) / userCourses.length;
      return Math.round(avg * 100);
    }

    if (groupId === 'other_activities') {
      const rec = otherActivityRecords.find(r => r.userId === userId && r.period === period);
      if (!rec) return 0;
      return [rec.admission, rec.studyAbroad, rec.exchange, rec.otherInstitute].filter(Boolean).length * 25;
    }

    if (groupId === 'labor_discipline') {
      const rec = laborDisciplineRecords.find(r => r.userId === userId && r.period === period);
      return rec?.score || 0;
    }

    return 0;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Bảng Tổng hợp KPI Nhân sự</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>{period} · So sánh hiệu suất giữa các phòng ban/cá nhân</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#D1FAE5' }} /> ≥85 Tốt</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEF3C7' }} /> 60–84 Cần cải thiện</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEE2E2' }} /> &lt;60 Cảnh báo</div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0, border: '1px solid var(--gray-200)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--gray-200)' }}>
              <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, minWidth: 200, position: 'sticky', left: 0, background: '#F8FAFC', zIndex: 10 }}>
                NHÂN VIÊN
              </th>
              {kpiGroups.map(g => (
                <th key={g.id} style={{ textAlign: 'center', padding: '12px', fontSize: 11, fontWeight: 700, borderLeft: '1px solid var(--gray-100)' }}>
                  <div style={{ color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{g.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--isme-red)' }}>{g.weight}%</div>
                </th>
              ))}
              <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, fontWeight: 800, background: '#F1F5F9', borderLeft: '2px solid var(--gray-200)' }}>
                KPI TỔNG
              </th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map(u => {
              const overall = calculateOverallKPI(u.id, period);
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '12px 20px', position: 'sticky', left: 0, background: 'white', zIndex: 5, borderRight: '1px solid var(--gray-100)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.position}</div>
                  </td>
                  {kpiGroups.map(g => {
                    const score = getGroupScore(u.id, g.id);
                    return (
                      <td key={g.id} style={{ padding: 4 }}>
                        <div
                          style={{
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 700,
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
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      fontSize: 16,
                      fontWeight: 900,
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>
                Chi tiết: {kpiGroups.find(g => g.id === selectedCell.groupId)?.name}
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>
                Nhân sự: {users.find(u => u.id === selectedCell.userId)?.name}
              </div>
            </div>
            <button 
              onClick={() => setSelectedCell(null)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--gray-300)', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            > Đóng </button>
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
            {selectedCell.groupId === 'operations' || selectedCell.groupId === 'academic_support' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F8FAFC' }}>
                  <tr>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12 }}>Chỉ tiêu</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12 }}>Kế hoạch</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12 }}>Thực hiện</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12 }}>Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiSnapshots
                    .filter(s => s.userId === selectedCell.userId && s.period === period && kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === selectedCell.groupId)
                    .map(snap => {
                      const def = kpiDefinitions.find(d => d.id === snap.kpiDefinitionId);
                      return (
                        <tr key={snap.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                          <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600 }}>{def?.name}</td>
                          <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: 13 }}>{snap.targetValue}</td>
                          <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: 13 }}>{snap.actualValue}</td>
                          <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: getScoreColor(snap.score) }}>{snap.score}</td>
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
