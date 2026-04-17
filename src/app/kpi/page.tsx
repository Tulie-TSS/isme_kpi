'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { programs, getKPISnapshotsByUser, kpiDefinitions, getTasksByUser, getUserById, calculateOverallKPI, calculateOperationsKPI, getPendingEditForSnapshot, subscribeEditRequests, getUserRoleLabel } from '@/lib/mock-data';
import { KPISnapshot } from '@/lib/types';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Edit3, Clock } from 'lucide-react';
import Link from 'next/link';
import KPIEditDialog from '@/components/kpi/KPIEditDialog';
import KPIApprovalPanel from '@/components/kpi/KPIApprovalPanel';

function CircularProgress({ value, size = 88, strokeWidth = 7, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--gray-100)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', fontSize: size * 0.24, fontWeight: 800, color: 'var(--gray-800)' }}>{value}</div>
    </div>
  );
}

function getScoreColor(s: number) { return s >= 85 ? '#10B981' : s >= 60 ? '#F59E0B' : '#EF4444'; }
function getScoreLabel(s: number) { return s >= 95 ? 'Xuất sắc' : s >= 85 ? 'Tốt' : s >= 60 ? 'Cần cải thiện' : 'Cảnh báo'; }
function getScoreBg(s: number) { return s >= 85 ? '#D1FAE5' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }

// KPI detail items per KPI — which programs are complete
// Each KPI has items corresponding to active programs (7 main + some extras)
const kpiDetailItems: Record<string, { programId: string; done: boolean; note: string }[]> = {
  kpi1: [
    { programId: 'p3', done: true, note: 'Đủ SoW, Assessment Plan, Assignment Brief' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: true, note: '' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi2: [
    { programId: 'p3', done: true, note: 'HĐ GV đã ký, thanh toán đúng hạn' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: true, note: '' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi3: [
    { programId: 'p3', done: true, note: 'Lớp Moodle, TKB, account GV — hoàn tất' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: true, note: '' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi4: [
    { programId: 'p3', done: true, note: 'Assessment plan chốt, điểm CW đầy đủ' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: false, note: 'GV môn TCFD chưa nộp điểm CW đợt 1' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi5: [
    { programId: 'p3', done: true, note: 'Guest speaker: Business Strategy, OBM' },
    { programId: 'p4', done: false, note: 'Chưa có kế hoạch ngoại khóa' },
    { programId: 'p5', done: false, note: 'Chưa có kế hoạch ngoại khóa' },
    { programId: 'p6', done: true, note: 'Field trip ngân hàng BIDV đã tổ chức' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: false, note: 'Chưa liên hệ được diễn giả' },
    { programId: 'p7', done: true, note: 'Guest speaker: Innovation workshop' },
  ],
  kpi6: [
    { programId: 'p3', done: true, note: 'File rà soát kết quả đầy đủ' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: true, note: '' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi7: [
    { programId: 'p3', done: true, note: 'Turnitin report CW1 — OK' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: true, note: '' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi8: [
    { programId: 'p3', done: true, note: 'Không có kiến nghị chưa xử lý' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: true, note: '' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi9: [
    { programId: 'p3', done: true, note: 'Module report + feedback SV hoàn thành' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: true, note: '' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: true, note: '' },
    { programId: 'p7', done: true, note: '' },
  ],
  kpi10: [
    { programId: 'p3', done: true, note: 'Hồ sơ cập nhật đúng hạn' },
    { programId: 'p4', done: true, note: '' },
    { programId: 'p5', done: false, note: 'Chưa cập nhật điểm kỷ luật SV K67' },
    { programId: 'p6', done: true, note: '' },
    { programId: 'p1', done: true, note: '' },
    { programId: 'p2', done: false, note: 'Hồ sơ 3 SV chưa cập nhật xong' },
    { programId: 'p7', done: true, note: '' },
  ],
};

export default function KPIPage() {
  const { currentUserId } = useApp();
  const user = getUserById(currentUserId);
  const period = 'Kỳ 2 2025-2026';
  const snapshots = getKPISnapshotsByUser(currentUserId, period);
  const overall = calculateOverallKPI(currentUserId, period);
  const userTasks = getTasksByUser(currentUserId);
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const [editingSnapshot, setEditingSnapshot] = useState<KPISnapshot | null>(null);
  const [, forceUpdate] = useState(0);

  // Subscribe to edit request changes to re-render
  useEffect(() => {
    const unsub = subscribeEditRequests(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  const activeProgramList = programs.filter(p => p.status === 'active');
  const isStaff = user?.role === 'staff';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>KPI Công việc</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>{user?.name} · {period}</span>
            {user?.roles?.map(r => (
              <span key={r} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
                {getUserRoleLabel(r)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Approval Panel */}
      <KPIApprovalPanel />

      {/* Score Cards: KPI Tổng hợp + Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* KPI Tổng hợp (có trọng số) */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <CircularProgress value={overall} size={100} strokeWidth={8} color={getScoreColor(overall)} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>KPI Tổng hợp</div>
            <div style={{ fontSize: 10, color: 'var(--gray-400)', marginBottom: 4 }}>Có trọng số</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-800)', marginBottom: 4 }}>{overall}<span style={{ fontSize: 16, fontWeight: 600 }}>/100</span></div>
            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: getScoreColor(overall), background: getScoreBg(overall) }}>
              {getScoreLabel(overall)}
            </span>
          </div>
        </div>

        {/* Operations (trung bình cộng) */}
        {(() => {
          const opsScore = calculateOperationsKPI(currentUserId, period);
          return (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <CircularProgress value={opsScore} size={100} strokeWidth={8} color={getScoreColor(opsScore)} />
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Operations</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', marginBottom: 4 }}>Trung bình cộng</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-800)', marginBottom: 4 }}>{opsScore}<span style={{ fontSize: 16, fontWeight: 600 }}>/100</span></div>
                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: getScoreColor(opsScore), background: getScoreBg(opsScore) }}>
                  {getScoreLabel(opsScore)}
                </span>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Tổng task</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{userTasks.length}</div>
                <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>{userTasks.filter(t => t.status === 'DONE').length} xong</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* KPI List View */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-800)', color: 'white' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700 }}>TT</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700 }}>Nhóm KPI</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, minWidth: 200 }}>Mô tả</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Trọng số</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Điểm</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, minWidth: 140 }}>Tiến độ</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Hoàn thành</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {snapshots.map((snap, si) => {
              const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId);
              if (!def) return null;
              const isExpanded = expandedKpi === snap.kpiDefinitionId;
              const items = kpiDetailItems[snap.kpiDefinitionId] || [];
              const doneCount = items.filter(i => i.done).length;

              return (
                <React.Fragment key={snap.id}>
                  <tr
                    onClick={() => setExpandedKpi(isExpanded ? null : snap.kpiDefinitionId)}
                    style={{ background: si % 2 === 1 ? 'var(--gray-50)' : 'white', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = si % 2 === 1 ? 'var(--gray-50)' : 'white')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--gray-400)', borderBottom: '1px solid var(--gray-100)' }}>{si + 1}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isExpanded ? <ChevronDown size={13} color="var(--gray-400)" /> : <ChevronRight size={13} color="var(--gray-400)" />}
                        {def.shortName}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-100)' }}>{def.description}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'center', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>{def.weight}%</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(snap.score) }}>{snap.score}</span>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-bar-fill" style={{ width: `${snap.score}%`, background: getScoreColor(snap.score) }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {snap.rawNumerator}/{snap.rawDenominator}
                        {isStaff && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingSnapshot(snap); }}
                            title="Yêu cầu chỉnh sửa"
                            style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', display: 'flex' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}
                          ><Edit3 size={11} /></button>
                        )}
                      </div>
                      {(() => { const pe = getPendingEditForSnapshot(snap.id); return pe ? (
                        <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <Clock size={9} /> Chờ duyệt
                        </div>
                      ) : null; })()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: getScoreColor(snap.score), background: getScoreBg(snap.score) }}>
                        {getScoreLabel(snap.score)}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && items.length > 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0, background: 'var(--gray-50)' }}>
                        <div style={{ padding: '12px 48px 16px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Chi tiết theo chương trình ({doneCount}/{items.length})
                          </div>
                          <div>
                            {items.map((item, idx) => {
                              const prog = activeProgramList.find(p => p.id === item.programId);
                              return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderBottom: idx < items.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                                  {item.done ? <CheckCircle size={14} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />}
                                  <div style={{ fontSize: 12, fontWeight: 500 }}>
                                    {prog?.shortName || item.programId}
                                    <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: 4 }}>{prog?.name}</span>
                                    {item.note && <span style={{ fontSize: 11, color: item.done ? 'var(--gray-400)' : '#DC2626', marginLeft: 8 }}>— {item.note}</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
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
