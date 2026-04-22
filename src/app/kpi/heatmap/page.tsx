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
  const [selectedCell, setSelectedCell] = useState<{ userId: string; kpiId: string } | null>(null);

  // We show all Operations KPIs + Overall scores for other 4 groups
  const opsDefs = kpiDefinitions.filter(d => d.groupId === 'operations');
  
  const getGroupScore = (userId: string, groupId: string) => {
    if (groupId === 'academic_support') {
      const defs = kpiDefinitions.filter(d => d.groupId === groupId);
      const snaps = kpiSnapshots.filter(s => s.userId === userId && s.period === period && defs.some(d => d.id === s.kpiDefinitionId));
      if (snaps.length === 0) return 0;
      return Math.round(snaps.reduce((acc, s) => acc + s.score, 0) / snaps.length);
    }
    if (groupId === 'student_results') {
      const userCourses = courses; 
      if (userCourses.length === 0) return 100;
      return Math.round(userCourses.reduce((acc, c) => acc + ((c.attendanceRate / c.attendanceTarget + c.passRate / c.passTarget) / 2), 0) / userCourses.length * 100);
    }
    if (groupId === 'other_activities') {
      const rec = otherActivityRecords.find(r => r.userId === userId && r.period === period);
      return rec ? [rec.admission, rec.studyAbroad, rec.exchange, rec.otherInstitute].filter(Boolean).length * 25 : 0;
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
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>KPI Heatmap</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>{period} · Click vào ô để xem chi tiết</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#D1FAE5' }} /> ≥85 Tốt</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEF3C7' }} /> 60–84 Cần cải thiện</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEE2E2' }} /> &lt;60 Cảnh báo</div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 20, border: '1px solid var(--gray-200)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px 8px', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0 12px', fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, width: 220, position: 'sticky', left: 0, background: 'white', zIndex: 10 }}>
                Nhân viên
              </th>
              {opsDefs.map(d => (
                <th key={d.id} style={{ textAlign: 'center', verticalAlign: 'bottom', padding: '0 4px', fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, width: 85 }}>
                  <div style={{ marginBottom: 4, lineHeight: 1.2 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>{d.weight}%</div>
                </th>
              ))}
              {/* Summary columns for other categories */}
              <th style={{ textAlign: 'center', verticalAlign: 'bottom', padding: '0 4px', fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, width: 85 }}>
                <div style={{ marginBottom: 4 }}>Hỗ trợ HT</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>20%</div>
              </th>
              <th style={{ textAlign: 'center', verticalAlign: 'bottom', padding: '0 4px', fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, width: 85 }}>
                <div style={{ marginBottom: 4 }}>Kết quả SV</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>10%</div>
              </th>
              <th style={{ textAlign: 'center', verticalAlign: 'bottom', padding: '0 4px', fontSize: 11, color: 'var(--gray-800)', fontWeight: 800, width: 85 }}>
                Tổng
              </th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map(u => {
              const overall = calculateOverallKPI(u.id, period);
              return (
                <tr key={u.id}>
                  <td style={{ padding: '8px 12px', position: 'sticky', left: 0, background: 'white', zIndex: 5 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.position}</div>
                  </td>
                  {opsDefs.map(d => {
                    const snap = kpiSnapshots.find(s => s.userId === u.id && s.kpiDefinitionId === d.id && s.period === period);
                    const score = snap ? snap.score : 0;
                    return (
                      <td key={d.id} style={{ padding: 0 }}>
                        <div
                          style={{
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 700,
                            background: getScoreBg(score),
                            color: getScoreColor(score),
                            cursor: 'pointer',
                            margin: '0 auto',
                            width: '100%',
                            maxWidth: 76
                          }}
                        >
                          {score}
                        </div>
                      </td>
                    );
                  })}
                  {/* Category scores */}
                  <td style={{ padding: 0 }}>
                    <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 14, fontWeight: 700, background: getScoreBg(getGroupScore(u.id, 'academic_support')), color: getScoreColor(getGroupScore(u.id, 'academic_support')), width: '100%', maxWidth: 76, margin: '0 auto' }}>
                      {getGroupScore(u.id, 'academic_support')}
                    </div>
                  </td>
                  <td style={{ padding: 0 }}>
                    <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 14, fontWeight: 700, background: getScoreBg(getGroupScore(u.id, 'student_results')), color: getScoreColor(getGroupScore(u.id, 'student_results')), width: '100%', maxWidth: 76, margin: '0 auto' }}>
                      {getGroupScore(u.id, 'student_results')}
                    </div>
                  </td>
                  <td style={{ padding: 0 }}>
                    <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 16, fontWeight: 900, background: getScoreBg(overall), color: getScoreColor(overall), border: '1px solid currentColor', width: '100%', maxWidth: 76, margin: '0 auto' }}>
                      {overall}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
