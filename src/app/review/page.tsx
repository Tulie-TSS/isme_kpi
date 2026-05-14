'use client';
import { useApp } from '@/lib/context';
import { reviewCycles, reviews, users, kpiDefinitions, getKPISnapshotsByUser, calculateOverallKPI, calculateOperationsKPI, getKPIDetailsBySnapshot, getTasksByUser, getOverdueTasksByUser, getProgramById, getCoordinatorStats, getUserRoleLabel, kpiGroups, courses, otherActivityRecords, laborDisciplineRecords } from '@/lib/mock-data';
import { tasks } from '@/lib/mock-tasks';
import { FileText, CheckCircle, Clock, Send, X, ExternalLink, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, Award, ChevronDown, ChevronRight, Minus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { KPIDetailItem } from '@/lib/types';
import Link from 'next/link';

function getScoreColor(s: number) { return s >= 85 ? '#047857' : s >= 60 ? '#D97706' : '#DC2626'; }
function getScoreBg(s: number) { return s >= 85 ? '#D1FAE5' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }
function getRank(score: number) { return score >= 95 ? 'Xuất sắc' : score >= 85 ? 'Tốt' : score >= 70 ? 'Khá' : score >= 60 ? 'TB' : 'Yếu'; }
function getRankColor(score: number) { return score >= 95 ? '#059669' : score >= 85 ? '#047857' : score >= 70 ? '#D97706' : score >= 60 ? '#F59E0B' : '#DC2626'; }

export default function ReviewPage() {
  const { currentRole, currentUserId } = useApp();
  const router = useRouter();
  const { hasAnyRole } = useApp();
  const isManager = currentRole === 'manager' || currentRole === 'admin' || hasAnyRole('manager', 'institute_leader');
  const [selectedCycle, setSelectedCycle] = useState(reviewCycles[1]);
  const [selfNote, setSelfNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [drilldown, setDrilldown] = useState<{ snapshotId: string; kpiName: string; items: KPIDetailItem[]; num: number; den: number } | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const period = 'Kỳ 2 2024-2025';

  const staffUsers = users.filter(u => u.role === 'staff');
  const userReviews = reviews.filter(r => r.cycleId === selectedCycle?.id);

  const handleScoreClick = (snapshotId: string, kpiName: string, num: number, den: number) => {
    if (den === 0) return;
    const items = getKPIDetailsBySnapshot(snapshotId);
    if (items.length > 0) {
      setDrilldown({ snapshotId, kpiName, items, num, den });
    }
  };

  // Compute all data for manager view
  const allUserData = staffUsers.map(u => {
    const overall = calculateOverallKPI(u.id, period);
    const snaps = getKPISnapshotsByUser(u.id, period);
    const uTasks = tasks.filter(t => t.ownerId === u.id);
    const uOverdue = getOverdueTasksByUser(u.id);
    const uDone = uTasks.filter(t => t.status === 'DONE');
    const uBlocked = uTasks.filter(t => t.status === 'BLOCKED');
    const completionRate = uTasks.length > 0 ? Math.round(uDone.length / uTasks.length * 100) : 0;
    const review = userReviews.find(r => r.userId === u.id);
    const lowKpis = snaps.filter(s => s.score < 85);
    return { user: u, overall, snaps, uTasks, uOverdue, uDone, uBlocked, completionRate, review, lowKpis };
  }).sort((a, b) => b.overall - a.overall);

  const avgKPI = allUserData.length > 0 ? Math.round(allUserData.reduce((s, d) => s + d.overall, 0) / allUserData.length) : 0;
  const topUser = allUserData[0];
  const bottomUser = allUserData[allUserData.length - 1];
  const totalOverdue = allUserData.reduce((s, d) => s + d.uOverdue.length, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Đánh giá</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Hệ thống đánh giá theo kỳ</p>
      </div>

      {/* Cycle selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {reviewCycles.map(rc => (
          <button key={rc.id} onClick={() => setSelectedCycle(rc)} className="card card-compact"
            style={{ cursor: 'pointer', border: selectedCycle?.id === rc.id ? '2px solid var(--isme-red)' : '1px solid var(--gray-200)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: rc.status === 'open' ? 'var(--success-light)' : 'var(--gray-100)' }}>
              {rc.status === 'open' ? <Clock size={18} color="var(--success)" /> : <CheckCircle size={18} color="var(--gray-400)" />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{rc.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{rc.status === 'open' ? 'Đang mở' : 'Đã đóng'} · Hạn: {new Date(rc.reviewDeadline).toLocaleDateString('vi-VN')}</div>
            </div>
          </button>
        ))}
      </div>

      {isManager ? (
        <>
          {/* ── Summary Stats ── */}
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="summary-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 18 }}>📊</span></div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>KPI Trung bình</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(avgKPI) }}>{avgKPI}<span style={{ fontSize: 14, fontWeight: 500 }}>/100</span></div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{getRank(avgKPI)}</div>
            </div>
            <div className="summary-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 18 }}>🏆</span></div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Cao nhất</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{topUser?.overall}</div>
              <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>{topUser?.user.name}</div>
            </div>
            <div className="summary-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 18 }}>⚠️</span></div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Thấp nhất</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#DC2626' }}>{bottomUser?.overall}</div>
              <div style={{ fontSize: 11, color: '#DC2626', marginTop: 2 }}>{bottomUser?.user.name}</div>
            </div>
            <div className="summary-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #FEF2F2, #FFE4E6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 18 }}>🔥</span></div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Task quá hạn</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: totalOverdue > 0 ? '#DC2626' : '#10B981' }}>{totalOverdue}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>toàn team</div>
            </div>
            <div className="summary-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 18 }}>📋</span></div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Chờ duyệt</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B' }}>{userReviews.filter(r => r.submittedAt && !r.reviewedAt).length}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>/{staffUsers.length} nhân viên</div>
            </div>
          </div>

          {/* ── Main Table with expandable rows ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Đánh giá nhân viên — {selectedCycle?.name}</h3>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{staffUsers.length} nhân viên · KPI TB: <strong style={{ color: getScoreColor(avgKPI) }}>{avgKPI}</strong></div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36, textAlign: 'center' }}>#</th>
                    <th>Nhân viên</th>
                    <th style={{ textAlign: 'center' }}>KPI Tổng</th>
                    <th style={{ textAlign: 'center', minWidth: 80 }}>Xếp loại</th>
                    {kpiDefinitions.map(k => (
                      <th key={k.id} style={{ textAlign: 'center', fontSize: 10, minWidth: 55 }}>{k.shortName}</th>
                    ))}
                    <th style={{ textAlign: 'center' }}>Task</th>
                    <th style={{ textAlign: 'center' }}>Quá hạn</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {allUserData.map((d, rank) => {
                    const isExpanded = expandedUser === d.user.id;
                    return (
                      <>
                        <tr key={d.user.id} onClick={() => setExpandedUser(isExpanded ? null : d.user.id)}
                          style={{ cursor: 'pointer', background: isExpanded ? 'var(--gray-50)' : 'transparent', transition: 'background 0.15s' }}
                          onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(0,0,0,0.015)'; }}
                          onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}>
                          <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: rank < 3 ? '#F59E0B' : 'var(--gray-400)' }}>
                            {rank < 3 ? ['🥇', '🥈', '🥉'][rank] : rank + 1}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isExpanded ? <ChevronDown size={12} color="var(--gray-400)" /> : <ChevronRight size={12} color="var(--gray-400)" />}
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.user.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.user.position}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(d.overall) }}>{d.overall}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: getRankColor(d.overall), background: getScoreBg(d.overall), whiteSpace: 'nowrap', display: 'inline-block' }}>
                              {getRank(d.overall)}
                            </span>
                          </td>
                          {kpiDefinitions.map(k => {
                            const snap = d.snaps.find(s => s.kpiDefinitionId === k.id);
                            const score = snap ? Math.min(snap.score, 100) : 0;
                            const hasDetails = snap ? getKPIDetailsBySnapshot(snap.id).length > 0 : false;
                            return (
                              <td key={k.id} style={{ textAlign: 'center' }}>
                                <span onClick={e => { e.stopPropagation(); if (snap && hasDetails) handleScoreClick(snap.id, k.name, snap.rawNumerator, snap.rawDenominator); }}
                                  style={{ fontSize: 12, fontWeight: 600, color: getScoreColor(score), cursor: hasDetails ? 'pointer' : 'default', textDecoration: hasDetails && score < 100 ? 'underline dotted' : 'none' }}>
                                  {score}
                                </span>
                              </td>
                            );
                          })}
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{d.uDone.length}/{d.uTasks.length}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: d.uOverdue.length > 0 ? '#DC2626' : '#10B981' }}>{d.uOverdue.length}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                              ...(d.review?.reviewedAt ? { color: '#047857', background: '#D1FAE5' } : d.review?.submittedAt ? { color: '#D97706', background: '#FEF3C7' } : { color: 'var(--gray-500)', background: 'var(--gray-100)' }) }}>
                              {d.review?.reviewedAt ? 'Đã duyệt' : d.review?.submittedAt ? 'Chờ duyệt' : 'Chưa nộp'}
                            </span>
                          </td>
                        </tr>
                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr key={`${d.user.id}-detail`}>
                            <td colSpan={4 + kpiDefinitions.length + 3} style={{ padding: 0, background: 'var(--gray-50)' }}>
                              <div style={{ padding: '16px 24px 20px 60px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
                                  <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Operations</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(calculateOperationsKPI(d.user.id, period)) }}>{calculateOperationsKPI(d.user.id, period)}</div>
                                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Trung bình cộng</div>
                                  </div>
                                  <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Tiến độ task</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(d.completionRate) }}>{d.completionRate}%</div>
                                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{d.uDone.length} done / {d.uTasks.length} total</div>
                                    <div className="progress-bar" style={{ marginTop: 6 }}><div className="progress-bar-fill" style={{ width: `${d.completionRate}%`, background: getScoreColor(d.completionRate) }} /></div>
                                  </div>
                                  <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Vấn đề</div>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                      <div><div style={{ fontSize: 20, fontWeight: 800, color: d.uOverdue.length > 0 ? '#DC2626' : '#10B981' }}>{d.uOverdue.length}</div><div style={{ fontSize: 10, color: 'var(--gray-400)' }}>quá hạn</div></div>
                                      <div><div style={{ fontSize: 20, fontWeight: 800, color: d.uBlocked.length > 0 ? '#F59E0B' : '#10B981' }}>{d.uBlocked.length}</div><div style={{ fontSize: 10, color: 'var(--gray-400)' }}>bị chặn</div></div>
                                    </div>
                                  </div>
                                  <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>KPI yếu</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: d.lowKpis.length > 0 ? '#DC2626' : '#10B981' }}>{d.lowKpis.length}</div>
                                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                                      {d.lowKpis.length > 0 ? d.lowKpis.map(s => kpiDefinitions.find(k => k.id === s.kpiDefinitionId)?.shortName).filter(Boolean).join(', ') : 'Tất cả đạt'}
                                    </div>
                                  </div>
                                  <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Xếp hạng</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: getRankColor(d.overall) }}>#{rank + 1}</div>
                                    <div style={{ fontSize: 11, color: getRankColor(d.overall), fontWeight: 600 }}>{getRank(d.overall)}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                      {d.user.roles?.map(r => (
                                        <span key={r} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'var(--gray-100)', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{getUserRoleLabel(r)}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Programme Stats: Tỷ lệ sv Pass & sv đi học */}
                                {(() => {
                                  const stats = getCoordinatorStats(d.user.id);
                                  if (!stats) return null;
                                  const passActual = Math.round(stats.passRateActual * 100);
                                  const passTarget = Math.round(stats.passRateTarget * 100);
                                  const attActual = Math.round(stats.attendanceRateActual * 100);
                                  const attTarget = Math.round(stats.attendanceRateTarget * 100);
                                  const passMet = passActual >= passTarget;
                                  const attMet = attActual >= attTarget;
                                  return (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                                      <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--gray-100)' }}>
                                        <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Chương trình</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{stats.programme}</div>
                                        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{stats.totalStudents} SV · {stats.totalClasses} lớp · {stats.totalLecturers} GV</div>
                                      </div>
                                      <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: `1px solid ${passMet ? '#D1FAE5' : '#FEE2E2'}` }}>
                                        <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Tỷ lệ sv Pass cuối kỳ</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                          <div style={{ fontSize: 20, fontWeight: 800, color: passMet ? '#10B981' : '#DC2626' }}>{passActual}%</div>
                                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>/ Mục tiêu {passTarget}%</div>
                                        </div>
                                        <div className="progress-bar" style={{ marginTop: 6 }}><div className="progress-bar-fill" style={{ width: `${passActual}%`, background: passMet ? '#10B981' : '#DC2626' }} /></div>
                                      </div>
                                      <div style={{ background: 'white', borderRadius: 10, padding: '12px 16px', border: `1px solid ${attMet ? '#D1FAE5' : '#FEE2E2'}` }}>
                                        <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Tỷ lệ sv đi học</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                          <div style={{ fontSize: 20, fontWeight: 800, color: attMet ? '#10B981' : '#DC2626' }}>{attActual}%</div>
                                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>/ Mục tiêu {attTarget}%</div>
                                        </div>
                                        <div className="progress-bar" style={{ marginTop: 6 }}><div className="progress-bar-fill" style={{ width: `${attActual}%`, background: attMet ? '#10B981' : '#DC2626' }} /></div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* KPI breakdown bars */}
                                <div style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--gray-100)', marginBottom: 12 }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 10, textTransform: 'uppercase' }}>Chi tiết KPI</div>
                                  {d.snaps.map(snap => {
                                    const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId);
                                    if (!def) return null;
                                    const score = Math.min(snap.score, 100);
                                    return (
                                      <div key={snap.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <div style={{ width: 100, fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{def.shortName}</div>
                                        <div style={{ flex: 1, height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                                          <div style={{ width: `${score}%`, height: '100%', background: getScoreColor(score), borderRadius: 4, transition: 'width 0.3s' }} />
                                        </div>
                                        <div style={{ width: 60, fontSize: 12, fontWeight: 700, color: getScoreColor(score), textAlign: 'right' }}>{snap.rawNumerator}/{snap.rawDenominator}</div>
                                        <div style={{ width: 35, fontSize: 12, fontWeight: 800, color: getScoreColor(score), textAlign: 'right' }}>{score}</div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Overdue tasks if any */}
                                {d.uOverdue.length > 0 && (
                                  <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '12px 16px', border: '1px solid #FECACA' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', marginBottom: 8, textTransform: 'uppercase' }}>Task quá hạn</div>
                                    {d.uOverdue.map(t => {
                                      const days = Math.ceil((new Date().getTime() - new Date(t.dueDate).getTime()) / 86400000);
                                      const prog = getProgramById(t.programId);
                                      return (
                                        <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12, borderBottom: '1px solid rgba(220,38,38,0.1)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#DC2626'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
                                            <AlertTriangle size={12} color="#DC2626" />
                                            <span style={{ flex: 1, fontWeight: 500 }}>{t.title}</span>
                                            <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{prog?.shortName}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626' }}>-{days}d</span>
                                          </div>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Tự đánh giá — {selectedCycle?.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>KPI được tự động tính. Bấm vào điểm chưa full để xem chi tiết.</p>
          </div>

          {/* KPI Groups Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 32 }}>
            {kpiGroups.map((group, groupIdx) => {
              const roman = ['I', 'II', 'III', 'IV', 'V'][groupIdx];
              
              if (group.id === 'operations' || group.id === 'academic_support') {
                const groupSnaps = getKPISnapshotsByUser(currentUserId, period).filter(s => {
                  const def = kpiDefinitions.find(k => k.id === s.kpiDefinitionId);
                  return def?.groupId === group.id;
                });

                return (
                  <div key={group.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--gray-100)' }}>
                      <div style={{ background: 'var(--isme-red)', color: 'white', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{roman}</div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{group.name} (Trọng số {group.weight}%)</h4>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>STT</th>
                          <th>Chỉ tiêu / Nội dung</th>
                          <th>Tiêu chí đánh giá</th>
                          <th style={{ textAlign: 'center', width: 60 }}>Đơn vị</th>
                          <th style={{ textAlign: 'center', width: 80 }}>Kế hoạch</th>
                          <th style={{ textAlign: 'center', width: 80 }}>Thực hiện</th>
                          <th style={{ textAlign: 'center', width: 80 }}>Tỉ lệ (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupSnaps.map((snap) => {
                          const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId);
                          if (!def) return null;
                          const hasDetails = getKPIDetailsBySnapshot(snap.id).length > 0;
                          return (
                            <tr key={snap.id}>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--gray-400)' }}>{def.stt}</td>
                              <td>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)' }}>{def.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{def.description}</div>
                              </td>
                              <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{def.criteria}</td>
                              <td style={{ textAlign: 'center', fontSize: 12 }}>{def.unit}</td>
                              <td style={{ textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{snap.targetValue}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span onClick={() => hasDetails ? handleScoreClick(snap.id, def.name, snap.rawNumerator, snap.rawDenominator) : null}
                                  style={{ fontSize: 13, fontWeight: 700, color: snap.score < 100 ? 'var(--warning)' : 'var(--success)', cursor: hasDetails ? 'pointer' : 'default', textDecoration: hasDetails && snap.score < 100 ? 'underline' : 'none' }}>
                                  {snap.actualValue}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: getScoreColor(snap.score) }}>{snap.score}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (group.id === 'student_results') {
                return (
                  <div key={group.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--gray-100)' }}>
                      <div style={{ background: 'var(--isme-red)', color: 'white', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{roman}</div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{group.name} (Trọng số {group.weight}%)</h4>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Lớp / Môn học</th>
                          <th style={{ textAlign: 'center' }}>Chuyên cần (đạt/MT)</th>
                          <th style={{ textAlign: 'center' }}>Tỷ lệ Pass (đạt/MT)</th>
                          <th style={{ textAlign: 'center' }}>Tỉ lệ hoàn thành (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((c) => {
                          const disciplineScore = Math.min((c.attendanceRate / c.attendanceTarget) * 100, 100);
                          const academicScore = Math.min((c.passRate / c.passTarget) * 100, 100);
                          const avgScore = Math.round((disciplineScore + academicScore) / 2);
                          return (
                            <tr key={c.id}>
                              <td>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{c.cohort}</div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: c.attendanceRate >= c.attendanceTarget ? 'var(--success)' : 'var(--danger)' }}>
                                  {(c.attendanceRate * 100).toFixed(1)}% / {(c.attendanceTarget * 100)}%
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: c.passRate >= c.passTarget ? 'var(--success)' : 'var(--danger)' }}>
                                  {(c.passRate * 100).toFixed(1)}% / {(c.passTarget * 100)}%
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: getScoreColor(avgScore) }}>{avgScore}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (group.id === 'other_activities') {
                const otherRec = otherActivityRecords.find(r => r.userId === currentUserId && r.period === period);
                const activities = [
                  { label: '1) Tuyển sinh', active: otherRec?.admission },
                  { label: '2) Hỗ trợ du học', active: otherRec?.studyAbroad },
                  { label: '3) Hỗ trợ exchange', active: otherRec?.exchange },
                  { label: '4) Các hđ khác của Viện', active: otherRec?.otherInstitute },
                ];
                const score = activities.filter(a => a.active).length * 25;

                return (
                  <div key={group.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--gray-100)' }}>
                      <div style={{ background: 'var(--isme-red)', color: 'white', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{roman}</div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{group.name} (Trọng số {group.weight}%)</h4>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Hoạt động</th>
                          <th>Tiêu chí đánh giá</th>
                          <th style={{ textAlign: 'center', width: 80 }}>Đơn vị</th>
                          <th style={{ textAlign: 'center', width: 80 }}>Kế hoạch</th>
                          <th style={{ textAlign: 'center', width: 80 }}>Thực hiện</th>
                          <th style={{ textAlign: 'center', width: 80 }}>Tỉ lệ (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((act, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 700, fontSize: 13 }}>{act.label}</td>
                            <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>Tham gia các hoạt động theo phân công của Viện</td>
                            <td style={{ textAlign: 'center', fontSize: 12 }}>Mục</td>
                            <td style={{ textAlign: 'center', fontSize: 13, fontWeight: 600 }}>1</td>
                            <td style={{ textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{act.active ? 1 : 0}</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 14, color: act.active ? 'var(--success)' : 'var(--gray-300)' }}>{act.active ? 100 : 0}%</td>
                          </tr>
                        ))}
                        <tr style={{ background: 'var(--gray-50)' }}>
                          <td colSpan={5} style={{ fontWeight: 700, textAlign: 'right' }}>ĐIỂM CHUYỂN ĐỔI (Trung bình cộng):</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 16, color: getScoreColor(score) }}>{score}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (group.id === 'labor_discipline') {
                const laborRec = laborDisciplineRecords.find(r => r.userId === currentUserId && r.period === period);
                const score = laborRec?.score || 0;
                return (
                  <div key={group.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--gray-100)' }}>
                      <div style={{ background: 'var(--isme-red)', color: 'white', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{roman}</div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{group.name} (Trọng số {group.weight}%)</h4>
                    </div>
                    <div style={{ padding: '24px', background: 'var(--gray-50)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)' }}>Điểm đánh giá kỷ luật lao động</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Dựa trên việc tuân thủ nội quy, giờ giấc và tác phong làm việc.</div>
                        {laborRec?.note && <div style={{ marginTop: 12, padding: '8px 12px', background: 'white', borderRadius: 8, borderLeft: '4px solid var(--isme-red)', fontSize: 13, fontStyle: 'italic' }}>"{laborRec.note}"</div>}
                      </div>
                      <div style={{ textAlign: 'center', minWidth: 120 }}>
                        <div style={{ fontSize: 48, fontWeight: 900, color: getScoreColor(score), lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', marginTop: 8, textTransform: 'uppercase' }}>Điểm thực hiện</div>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Overall Summary Row */}
            <div style={{ 
              marginTop: 16, padding: '24px 32px', borderRadius: 16, 
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)'
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Tổng kết kết quả</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>ĐIỂM KPI TỔNG HỢP</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Xếp loại</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: getRankColor(calculateOverallKPI(currentUserId, period)) }}>{getRank(calculateOverallKPI(currentUserId, period))}</div>
                </div>
                <div style={{ width: 2, height: 40, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: getScoreColor(calculateOverallKPI(currentUserId, period)), lineHeight: 1 }}>{calculateOverallKPI(currentUserId, period)}<span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/100</span></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>Ghi chú / Giải thích thêm</label>
            <textarea value={selfNote} onChange={e => setSelfNote(e.target.value)} placeholder="Chia sẻ thêm về kết quả KPI..." rows={4}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--gray-200)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          {submitted ? (
            <div style={{ padding: '16px 20px', background: 'var(--success-light)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, color: '#047857', fontWeight: 600 }}>
              <CheckCircle size={20} /> Đã gửi đánh giá thành công!
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setSubmitted(true)}><Send size={16} /> Gửi đánh giá</button>
          )}
        </div>
      )}

      {/* KPI Drill-down Modal */}
      {drilldown && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
          padding: 20,
        }} onClick={() => setDrilldown(null)}>
          <div className="animate-scale-in" onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 580,
            maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--gray-100)',
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px', borderBottom: '1px solid var(--gray-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ 
                  width: 44, height: 44, borderRadius: 12, 
                  background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BarChart3 size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>Chi tiết kết quả KPI</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{drilldown.kpiName}</div>
                </div>
              </div>
              <button onClick={() => setDrilldown(null)} style={{
                background: 'var(--gray-50)', border: 'none', borderRadius: 12,
                width: 36, height: 36, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                color: 'var(--gray-400)',
              }}
              onMouseOver={e => { (e.currentTarget as any).style.background = 'var(--gray-100)'; (e.currentTarget as any).style.color = 'var(--gray-600)'; }}
              onMouseOut={e => { (e.currentTarget as any).style.background = 'var(--gray-50)'; (e.currentTarget as any).style.color = 'var(--gray-400)'; }}
              ><X size={20} /></button>
            </div>

            {/* Content */}
            <div style={{ padding: '32px', overflowY: 'auto' }}>
              <div style={{
                background: 'var(--gray-50)', borderRadius: 20, padding: '20px 24px',
                border: '1px solid var(--gray-100)', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Tổng số đạt được</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: drilldown.num < drilldown.den ? 'var(--warning)' : 'var(--success)' }}>{drilldown.num}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-300)' }}>/ {drilldown.den}</div>
                  </div>
                </div>
                {drilldown.num < drilldown.den && (
                  <div style={{
                    padding: '8px 16px', borderRadius: 12, background: '#FEE2E2', color: '#991B1B',
                    fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <AlertTriangle size={16} /> Thiếu {drilldown.den - drilldown.num} mục
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {drilldown.items.map((item, i) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px',
                    borderRadius: 16, border: '1px solid var(--gray-100)',
                    background: item.achieved ? 'white' : 'rgba(239, 68, 68, 0.02)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                      background: item.achieved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: item.achieved ? '#10B981' : '#EF4444',
                    }}>
                      {item.achieved ? <CheckCircle size={18} /> : <X size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: item.achieved ? 'var(--gray-800)' : '#B91C1C' }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: '1.5' }}>{item.note}</div>
                    </div>
                    {item.relatedTaskId && !item.achieved && (
                      <button onClick={() => { setDrilldown(null); router.push(`/tasks/${item.relatedTaskId}`); }}
                        style={{ fontSize: 12, color: 'white', background: 'var(--isme-red)', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Xử lý <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
