'use client';
import { useState, useEffect } from 'react';
import { users, tasks, kpiSnapshots, kpiDefinitions, programs, getOverdueTasks, calculateOverallKPI, getKPISnapshotsByUser,
  getQuestionsByManager, createManagerQuestion, replyToAnswer, subscribeQuestions, getUserById, getProgramById } from '@/lib/mock-data';
import { ManagerQuestion } from '@/lib/types';
import { AlertTriangle, Users, TrendingDown, ChevronRight, ChevronDown, MessageCircleQuestion, Send, X, Eye, BarChart3, Filter,
  Medal, ArrowUpDown, CircleAlert, Flame, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';

function getScoreColor(s: number) { return s >= 85 ? '#047857' : s >= 60 ? '#D97706' : '#DC2626'; }
function getScoreBg(s: number) { return s >= 85 ? '#D1FAE5' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }

// ── Ask Question Dialog ──
function AskQuestionDialog({ toUserId, context, contextType, contextId, managerId, onClose }: {
  toUserId: string; context: string; contextType: 'kpi' | 'task' | 'course' | 'general'; contextId: string;
  managerId: string; onClose: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const user = getUserById(toUserId);
  const submit = () => {
    if (!subject.trim() || !question.trim()) return;
    createManagerQuestion({ fromUserId: managerId, toUserId, subject: subject.trim(), question: question.trim(), context, contextType, contextId });
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageCircleQuestion size={18} color="white" />
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Đặt câu hỏi</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Gửi cho {user?.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><X size={16} color="white" /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ background: '#F5F3FF', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#5B21B6' }}>
            📌 Liên quan: <b>{context}</b>
          </div>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Tiêu đề câu hỏi..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 14, fontWeight: 600, outline: 'none', marginBottom: 12, fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#7C3AED'} onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} />
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Nội dung câu hỏi chi tiết..." rows={4}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none' }}
            onFocus={e => e.target.style.borderColor = '#7C3AED'} onBlur={e => e.target.style.borderColor = 'var(--gray-200)'} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Huỷ</button>
            <button onClick={submit} disabled={!subject.trim() || !question.trim()} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: subject.trim() && question.trim() ? 'pointer' : 'not-allowed',
              background: subject.trim() && question.trim() ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'var(--gray-200)', color: subject.trim() && question.trim() ? 'white' : 'var(--gray-400)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}><Send size={12} /> Gửi câu hỏi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const { hasAnyRole, currentUserId, selectedProgramId } = useApp();
  
  const filteredPrograms = selectedProgramId === 'all' 
    ? programs 
    : programs.filter(p => p.id === selectedProgramId);
    
  const filteredTasks = selectedProgramId === 'all' 
    ? tasks 
    : tasks.filter(t => t.programId === selectedProgramId);

  const staffUsers = selectedProgramId === 'all'
    ? users.filter(u => u.role === 'staff')
    : users.filter(u => {
        const isPIC = programs.some(p => p.id === selectedProgramId && (p.managerId === u.id || p.secondaryManagerId === u.id));
        const hasTasks = tasks.some(t => t.programId === selectedProgramId && t.ownerId === u.id);
        return isPIC || hasTasks;
      });

  const allTasks = filteredTasks;
  const doneTasks = allTasks.filter(t => t.status === 'DONE');
  const overdueTasks = getOverdueTasks().filter(t => selectedProgramId === 'all' || t.programId === selectedProgramId);
  const blockedTasks = allTasks.filter(t => t.status === 'BLOCKED');
  const isLeader = hasAnyRole('institute_leader');
  const period = 'Kỳ 2 2024-2025';

  const [questionDialog, setQuestionDialog] = useState<{ toUserId: string; context: string; contextType: 'kpi' | 'task' | 'course' | 'general'; contextId: string } | null>(null);
  const [questions, setQuestions] = useState<ManagerQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [rankFilter, setRankFilter] = useState<string>('overall');
  const [rankSort, setRankSort] = useState<'asc' | 'desc'>('desc');
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  const [expandedRiskUser, setExpandedRiskUser] = useState<string | null>(null);
  const [expandedRiskProg, setExpandedRiskProg] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(getQuestionsByManager(currentUserId));
    const unsub = subscribeQuestions(() => setQuestions(getQuestionsByManager(currentUserId)));
    return unsub;
  }, [currentUserId]);

  // User risk data
  const userRisk = staffUsers.map(u => {
    const uTasks = allTasks.filter(t => t.ownerId === u.id);
    const uOverdue = overdueTasks.filter(t => t.ownerId === u.id);
    return { user: u, total: uTasks.length, overdue: uOverdue.length, rate: uTasks.length > 0 ? uOverdue.length / uTasks.length : 0 };
  }).sort((a, b) => b.rate - a.rate);

  // Program risk
  const programRisk = filteredPrograms.map(p => {
    const pTasks = tasks.filter(t => t.programId === p.id);
    const pOverdue = overdueTasks.filter(t => t.programId === p.id);
    return { program: p, total: pTasks.length, overdue: pOverdue.length, rate: pTasks.length > 0 ? pOverdue.length / pTasks.length : 0 };
  }).filter(p => p.total > 0).sort((a, b) => b.rate - a.rate);

  // Ranking data
  const heatmapKpis = kpiDefinitions;
  const rankingData = staffUsers.map(u => {
    const snaps = getKPISnapshotsByUser(u.id, period);
    const overall = calculateOverallKPI(u.id, period);
    const kpiScores: Record<string, number> = {};
    snaps.forEach(s => { kpiScores[s.kpiDefinitionId] = s.score; });
    return { user: u, overall, kpiScores, snaps };
  });

  // Sort ranking data
  const sortedRanking = [...rankingData].sort((a, b) => {
    const av = rankFilter === 'overall' ? a.overall : (a.kpiScores[rankFilter] ?? 0);
    const bv = rankFilter === 'overall' ? b.overall : (b.kpiScores[rankFilter] ?? 0);
    return rankSort === 'desc' ? bv - av : av - bv;
  });

  const openQs = questions.filter(q => q.status === 'open').length;
  const answeredQs = questions.filter(q => q.status === 'answered').length;

  return (
    <div className="animate-fade-in">
      {/* ── Summary Cards ── */}
      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          <div className="summary-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20 }}>👥</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Tổng task team</div>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{allTasks.length}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{staffUsers.length} nhân viên · {Math.round(doneTasks.length / allTasks.length * 100)}% done</div>
          </div>
          <Link href="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="summary-card" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Hoàn thành</div>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#10B981' }}>{doneTasks.length}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#10B981' }}>{Math.round(doneTasks.length / allTasks.length * 100)}% tổng task</div>
            </div>
          </Link>
          <Link href="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="summary-card" style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 20 }}>🔥</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Quá hạn</div>
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#EF4444' }}>{overdueTasks.length}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#EF4444' }}>Cần xử lý ngay →</div>
            </div>
          </Link>
          <div className="summary-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20 }}>💬</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Câu hỏi</div>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#F59E0B' }}>{openQs + answeredQs}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{openQs} đang chờ · {answeredQs} đã trả lời</div>
          </div>
        </div>

      {/* ── Overdue Alert ── */}
      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: 20, borderRadius: 12, border: '1px solid #FECACA', overflow: 'hidden' }}>
          <div onClick={() => setOverdueExpanded(v => !v)} style={{
            background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', transition: 'background 0.15s',
          }}>
            <CircleAlert size={22} color="#DC2626" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#991B1B' }}>{overdueTasks.length} task quá hạn cần can thiệp</div>
              <div style={{ fontSize: 12, color: '#B91C1C' }}>Bấm để xem chi tiết</div>
            </div>
            {overdueExpanded ? <ChevronDown size={18} color="#DC2626" /> : <ChevronRight size={18} color="#DC2626" />}
          </div>
          {overdueExpanded && (
            <div style={{ background: 'white' }}>
              {overdueTasks.map((t, i) => {
                const owner = getUserById(t.ownerId);
                const program = getProgramById(t.programId);
                const days = Math.ceil((new Date().getTime() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#DC2626', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', gap: 8, marginTop: 2 }}>
                          <span>👤 {owner?.name}</span>
                          <span>📁 {program?.shortName}</span>
                          <span>📅 {new Date(t.dueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', whiteSpace: 'nowrap' }}>
                        Quá {days} ngày
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Risk Tables (clickable) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={16} color="#EF4444" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Nhân viên rủi ro</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Nhân viên</th><th style={{ textAlign: 'center' }}>Quá hạn</th><th style={{ textAlign: 'center' }}>Tổng</th><th style={{ textAlign: 'center' }}>Mức độ</th><th></th></tr></thead>
            <tbody>
              {userRisk.slice(0, 6).map(({ user: u, total, overdue, rate }) => {
                const isExpU = expandedRiskUser === u.id;
                const uOverdueTasks = overdueTasks.filter(t => t.ownerId === u.id);
                return (
                  <>
                    <tr key={u.id} style={{ cursor: 'pointer', background: isExpU ? 'var(--gray-50)' : 'transparent' }}
                      onClick={() => setExpandedRiskUser(isExpU ? null : u.id)}
                      onMouseEnter={e => { if (!isExpU) e.currentTarget.style.background = 'var(--gray-50)'; }}
                      onMouseLeave={e => { if (!isExpU) e.currentTarget.style.background = 'transparent'; }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isExpU ? <ChevronDown size={11} color="var(--gray-400)" /> : <ChevronRight size={11} color="var(--gray-400)" />}
                          <div><div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div><div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{u.position}</div></div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: overdue > 0 ? '#EF4444' : '#10B981' }}>{overdue}</td>
                      <td style={{ textAlign: 'center', color: 'var(--gray-500)' }}>{total}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          color: rate > 0.3 ? '#B91C1C' : rate > 0 ? '#92400E' : '#047857', background: rate > 0.3 ? '#FEE2E2' : rate > 0 ? '#FEF3C7' : '#D1FAE5' }}>
                          {rate > 0.3 ? 'Critical' : rate > 0 ? 'Warning' : 'OK'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {(overdue > 0 || rate > 0) && (
                          <button onClick={e => { e.stopPropagation(); setQuestionDialog({ toUserId: u.id, context: `${u.name} — ${overdue} task quá hạn / ${total} total`, contextType: 'general', contextId: u.id }); }}
                            title="Đặt câu hỏi" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 6, padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#7C3AED', fontWeight: 600 }}>
                            <MessageCircleQuestion size={11} /> Hỏi
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpU && uOverdueTasks.length > 0 && (
                      <tr key={`${u.id}-detail`}>
                        <td colSpan={5} style={{ padding: 0, background: '#FEF2F2' }}>
                          <div style={{ padding: '8px 16px 8px 32px' }}>
                            {uOverdueTasks.map(t => {
                              const days = Math.ceil((Date.now() - new Date(t.dueDate).getTime()) / 86400000);
                              const prog = getProgramById(t.programId);
                              return (
                                <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12, borderBottom: '1px solid rgba(220,38,38,0.08)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span style={{ fontSize: 10 }}>🔴</span>
                                    <span style={{ flex: 1, fontWeight: 500 }}>{t.title}</span>
                                    <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{prog?.shortName}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', padding: '1px 6px', background: '#FEE2E2', borderRadius: 4 }}>-{days}d</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                    {isExpU && uOverdueTasks.length === 0 && (
                      <tr key={`${u.id}-ok`}>
                        <td colSpan={5} style={{ background: '#F0FDF4', textAlign: 'center', padding: '8px 16px', fontSize: 12, color: '#059669' }}>✅ Không có task quá hạn</td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="#F59E0B" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Chương trình rủi ro</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Chương trình</th><th style={{ textAlign: 'center' }}>Quá hạn</th><th style={{ textAlign: 'center' }}>Tổng</th><th style={{ textAlign: 'center' }}>Mức độ</th></tr></thead>
            <tbody>
              {programRisk.map(({ program: p, total, overdue, rate }) => {
                const isExpP = expandedRiskProg === p.id;
                const pOverdueTasks = overdueTasks.filter(t => t.programId === p.id);
                return (
                  <>
                    <tr key={p.id} style={{ cursor: 'pointer', background: isExpP ? 'var(--gray-50)' : 'transparent' }}
                      onClick={() => setExpandedRiskProg(isExpP ? null : p.id)}
                      onMouseEnter={e => { if (!isExpP) e.currentTarget.style.background = 'var(--gray-50)'; }}
                      onMouseLeave={e => { if (!isExpP) e.currentTarget.style.background = 'transparent'; }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isExpP ? <ChevronDown size={11} color="var(--gray-400)" /> : <ChevronRight size={11} color="var(--gray-400)" />}
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{p.shortName} — {p.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: overdue > 0 ? '#EF4444' : '#10B981' }}>{overdue}</td>
                      <td style={{ textAlign: 'center', color: 'var(--gray-500)' }}>{total}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                          color: rate > 0.3 ? '#B91C1C' : rate > 0 ? '#92400E' : '#047857', background: rate > 0.3 ? '#FEE2E2' : rate > 0 ? '#FEF3C7' : '#D1FAE5' }}>
                          {rate > 0.3 ? 'Critical' : rate > 0 ? 'Warning' : 'OK'}
                        </span>
                      </td>
                    </tr>
                    {isExpP && pOverdueTasks.length > 0 && (
                      <tr key={`${p.id}-detail`}>
                        <td colSpan={4} style={{ padding: 0, background: '#FEF2F2' }}>
                          <div style={{ padding: '8px 16px 8px 32px' }}>
                            {pOverdueTasks.map(t => {
                              const days = Math.ceil((Date.now() - new Date(t.dueDate).getTime()) / 86400000);
                              const owner = getUserById(t.ownerId);
                              return (
                                <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12, borderBottom: '1px solid rgba(220,38,38,0.08)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span style={{ fontSize: 10 }}>🔴</span>
                                    <span style={{ flex: 1, fontWeight: 500 }}>{t.title}</span>
                                    <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>👤 {owner?.name}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', padding: '1px 6px', background: '#FEE2E2', borderRadius: 4 }}>-{days}d</span>
                                  </div>
                                </Link>
                              );
                            })}
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

      {/* ── Staff KPI Ranking ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Medal size={18} color="#F59E0B" />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Ranking KPI nhân viên</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={14} color="var(--gray-400)" />
            <select value={rankFilter} onChange={e => setRankFilter(e.target.value)}
              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'white' }}>
              <option value="overall">Tổng hợp</option>
              {heatmapKpis.map(k => <option key={k.id} value={k.id}>{k.shortName}</option>)}
            </select>
            <button onClick={() => setRankSort(s => s === 'desc' ? 'asc' : 'desc')} style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--gray-200)', background: 'white', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
              <ArrowUpDown size={12} /> {rankSort === 'desc' ? 'Cao → Thấp' : 'Thấp → Cao'}
            </button>
            <Link href="/kpi/heatmap" style={{ fontSize: 12, color: 'var(--isme-red)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
              Heatmap <ChevronRight size={12} />
            </Link>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', width: 40 }}>#</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', minWidth: 160 }}>Nhân viên</th>
                {heatmapKpis.map(k => (
                  <th key={k.id} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 10, fontWeight: 600, color: rankFilter === k.id ? '#7C3AED' : 'var(--gray-400)', cursor: 'pointer', transition: 'color 0.15s' }}
                    onClick={() => setRankFilter(k.id)}>{k.shortName}</th>
                ))}
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: rankFilter === 'overall' ? '#7C3AED' : 'var(--gray-800)', cursor: 'pointer' }}
                  onClick={() => setRankFilter('overall')}>TỔNG</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}></th>
              </tr>
            </thead>
            <tbody>
              {sortedRanking.map((row, i) => {
                const selectedVal = rankFilter === 'overall' ? row.overall : (row.kpiScores[rankFilter] ?? 0);
                const isTop = i === 0 && rankSort === 'desc';
                const isBottom = i === sortedRanking.length - 1 && rankSort === 'desc';
                return (
                  <tr key={row.user.id} style={{ borderBottom: '1px solid var(--gray-50)', background: isTop ? 'rgba(16,185,129,0.03)' : isBottom && selectedVal < 85 ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, fontSize: 14, color: i < 3 && rankSort === 'desc' ? '#F59E0B' : 'var(--gray-400)' }}>
                      {i < 3 && rankSort === 'desc' ? ['🥇', '🥈', '🥉'][i] : i + 1}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{row.user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{row.user.position}</div>
                    </td>
                    {heatmapKpis.map(k => {
                      const score = row.kpiScores[k.id] ?? 0;
                      return (
                        <td key={k.id} style={{ padding: '6px 4px', textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-block', minWidth: 36, padding: '4px 6px', borderRadius: 6,
                            fontSize: 12, fontWeight: 700, color: getScoreColor(score), background: getScoreBg(score),
                            border: rankFilter === k.id ? '2px solid #7C3AED' : '2px solid transparent',
                            cursor: score < 85 ? 'pointer' : 'default',
                          }} title={score < 85 ? 'Click để đặt câu hỏi' : ''}
                            onClick={() => { if (score < 85) { const def = kpiDefinitions.find(d => d.id === k.id); setQuestionDialog({ toUserId: row.user.id, context: `${def?.shortName} — ${def?.name} (${score}%)`, contextType: 'kpi', contextId: k.id }); } }}>
                            {score}
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ padding: '6px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-block', minWidth: 40, padding: '5px 8px', borderRadius: 8, fontSize: 13, fontWeight: 800,
                        color: getScoreColor(row.overall), background: getScoreBg(row.overall),
                        border: rankFilter === 'overall' ? '2px solid #7C3AED' : '2px solid transparent' }}>
                        {row.overall}
                      </div>
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                      <button onClick={() => setQuestionDialog({ toUserId: row.user.id, context: `${row.user.name} — KPI tổng ${row.overall}%`, contextType: 'general', contextId: row.user.id })}
                        style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#7C3AED', fontWeight: 600 }}>
                        <MessageCircleQuestion size={11} /> Hỏi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Questions Panel ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircleQuestion size={18} color="#7C3AED" />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Câu hỏi đã gửi</span>
            {openQs > 0 && <span style={{ background: '#7C3AED', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{openQs} chờ</span>}
          </div>
        </div>
        {questions.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
            Chưa có câu hỏi nào. Bấm "Hỏi" trên bảng ranking hoặc nhân viên rủi ro để bắt đầu.
          </div>
        ) : questions.map((q, i) => {
          const toUser = getUserById(q.toUserId);
          const isOpen = expandedQ === q.id;
          const stColor = q.status === 'open' ? '#F59E0B' : q.status === 'answered' ? '#3B82F6' : '#10B981';
          const stBg = q.status === 'open' ? '#FEF3C7' : q.status === 'answered' ? '#DBEAFE' : '#D1FAE5';
          const stLabel = q.status === 'open' ? 'Chờ trả lời' : q.status === 'answered' ? 'Đã trả lời' : 'Đã đóng';
          return (
            <div key={q.id} style={{ borderBottom: i < questions.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
              <div onClick={() => setExpandedQ(isOpen ? null : q.id)} style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {isOpen ? <ChevronDown size={13} color="var(--gray-400)" /> : <ChevronRight size={13} color="var(--gray-400)" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{q.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', gap: 8, marginTop: 2 }}>
                    <span>→ {toUser?.name}</span><span>📌 {q.context}</span><span>{q.createdAt}</span>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: stColor, background: stBg }}>{stLabel}</span>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px 44px', background: 'var(--gray-50)' }}>
                  <div style={{ background: 'white', borderRadius: 10, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                    {/* Question */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-50)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', marginBottom: 4 }}>Câu hỏi từ quản lý</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{q.question}</div>
                    </div>
                    {/* Answer */}
                    {q.answer && (
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-50)', background: '#F0FDF4' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>Phản hồi từ {toUser?.name} — {q.answeredAt}</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{q.answer}</div>
                      </div>
                    )}
                    {/* Manager reply */}
                    {q.managerReply && (
                      <div style={{ padding: '14px 16px', background: '#F5F3FF' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', marginBottom: 4 }}>Phản hồi quản lý — {q.repliedAt}</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{q.managerReply}</div>
                      </div>
                    )}
                    {/* Reply action */}
                    {q.status === 'answered' && (
                      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-100)' }}>
                        <textarea placeholder="Phản hồi lại..." value={replyText[q.id] || ''} onChange={e => setReplyText(p => ({ ...p, [q.id]: e.target.value }))} rows={2}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 12, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 8 }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button onClick={() => { if (replyText[q.id]?.trim()) { replyToAnswer(q.id, replyText[q.id].trim()); setReplyText(p => ({ ...p, [q.id]: '' })); } }}
                            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Send size={11} /> Phản hồi & Đóng
                          </button>
                        </div>
                      </div>
                    )}
                    {q.status === 'open' && (
                      <div style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: '#F59E0B', fontStyle: 'italic' }}>
                        ⏳ Đang chờ {toUser?.name} trả lời...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Question Dialog */}
      {questionDialog && (
        <AskQuestionDialog
          toUserId={questionDialog.toUserId} context={questionDialog.context}
          contextType={questionDialog.contextType} contextId={questionDialog.contextId}
          managerId={currentUserId} onClose={() => setQuestionDialog(null)}
        />
      )}
    </div>
  );
}
