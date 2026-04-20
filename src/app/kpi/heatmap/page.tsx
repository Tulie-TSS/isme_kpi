'use client';
import { users, kpiSnapshots, kpiDefinitions, calculateOverallKPI, programs, getUserById } from '@/lib/mock-data';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { ShieldCheck } from 'lucide-react';

function getScoreColor(s: number) { return s >= 85 ? '#047857' : s >= 60 ? '#D97706' : '#DC2626'; }
function getScoreBg(s: number) { return s >= 85 ? '#D1FAE5' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }

export default function HeatmapPage() {
  const { selectedProgramId } = useApp();
  const period = 'Kỳ 2 2025-2026';
  
  const staffUsers = selectedProgramId === 'all'
    ? users.filter(u => u.role === 'staff')
    : users.filter(u => {
        const isPIC = programs.some(p => p.id === selectedProgramId && (p.managerId === u.id || p.secondaryManagerId === u.id));
        const hasTasks = true; // In heatmap we might show PIC regardless of tasks
        return isPIC;
      });

  const selectedProgram = programs.find(p => p.id === selectedProgramId);
  const coordinator = selectedProgram ? getUserById(selectedProgram.managerId) : null;
  
  const [selectedCell, setSelectedCell] = useState<{ userId: string; kpiId: string } | null>(null);

  const selectedSnap = selectedCell
    ? kpiSnapshots.find(s => s.userId === selectedCell.userId && s.kpiDefinitionId === selectedCell.kpiId && s.period === period)
    : null;
  const selectedDef = selectedCell ? kpiDefinitions.find(k => k.id === selectedCell.kpiId) : null;
  const selectedUser = selectedCell ? users.find(u => u.id === selectedCell.userId) : null;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>KPI Heatmap</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>{period} · Click vào ô để xem chi tiết</p>
          {coordinator && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(5,150,105,0.1)', padding: '2px 10px', borderRadius: 6, border: '1px solid rgba(5,150,105,0.2)' }}>
              <ShieldCheck size={14} color="#059669" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Phụ trách hệ: {coordinator.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, borderRadius: 4, background: '#D1FAE5' }} /> ≥85 Tốt</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, borderRadius: 4, background: '#FEF3C7' }} /> 60–84 Cần cải thiện</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, borderRadius: 4, background: '#FEE2E2' }} /> &lt;60 Cảnh báo</div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 20 }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, minWidth: 180, position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                Nhân viên
              </th>
              {kpiDefinitions.map(k => (
                <th key={k.id} style={{ textAlign: 'center', padding: '6px 4px', fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, minWidth: 68 }}>
                  <div>{k.shortName}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400 }}>{k.weight}%</div>
                </th>
              ))}
              <th style={{ textAlign: 'center', padding: '8px', fontSize: 13, color: 'var(--gray-800)', fontWeight: 700, minWidth: 68 }}>
                Tổng
              </th>
            </tr>
          </thead>
          <tbody>
            {staffUsers.map(u => {
              const overall = calculateOverallKPI(u.id, period);
              return (
                <tr key={u.id}>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 500, position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.position}</div>
                  </td>
                  {kpiDefinitions.map(k => {
                    const snap = kpiSnapshots.find(s => s.userId === u.id && s.kpiDefinitionId === k.id && s.period === period);
                    const score = snap ? Math.min(snap.score, 100) : 0;
                    const isSelected = selectedCell?.userId === u.id && selectedCell?.kpiId === k.id;
                    return (
                      <td key={k.id} style={{ padding: 2 }}>
                        <div
                          className="heatmap-cell"
                          onClick={() => setSelectedCell({ userId: u.id, kpiId: k.id })}
                          style={{
                            background: getScoreBg(score),
                            color: getScoreColor(score),
                            outline: isSelected ? '2px solid var(--isme-red)' : 'none',
                            outlineOffset: 1,
                          }}
                        >
                          {score}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: 2 }}>
                    <div className="heatmap-cell" style={{ background: getScoreBg(overall), color: getScoreColor(overall), fontWeight: 800, width: 64 }}>
                      {overall}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedSnap && selectedDef && selectedUser && (
        <div className="card animate-fade-in" style={{ marginTop: 16, border: '2px solid var(--isme-red-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedUser.name}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{selectedDef.name}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(selectedSnap.score) }}>{selectedSnap.score}</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>{selectedDef.description}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Hoàn thành</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedSnap.rawNumerator}/{selectedSnap.rawDenominator}</div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Trọng số</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedDef.weight}%</div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Đơn vị</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedDef.unit}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
