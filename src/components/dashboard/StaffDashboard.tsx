'use client';
import { useApp } from '@/lib/context';
import { getTasksByUser, getOverdueTasksByUser, getKPISnapshotsByUser, kpiDefinitions, getProgramById, getUserById, calculateOverallKPI, getNotificationsByUser, getQuestionsForUser, answerQuestion, subscribeQuestions } from '@/lib/mock-data';
import { ManagerQuestion } from '@/lib/types';
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, ChevronRight, Flame, CalendarDays, Target, Bell, Zap, ArrowRight, Flag, CircleAlert, MessageCircleQuestion, Send, ChevronDown } from 'lucide-react';
import Link from 'next/link';

function CircularProgress({ value, size = 72, strokeWidth = 6, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
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
      <div style={{ position: 'absolute', fontSize: size * 0.22, fontWeight: 700, color: 'var(--gray-800)' }}>{value}</div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function getDaysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'TODO': return 'Cần làm';
    case 'IN_PROGRESS': return 'Đang làm';
    case 'DONE': return 'Hoàn thành';
    case 'BLOCKED': return 'Bị chặn';
    default: return status;
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'TODO': return 'status-todo';
    case 'IN_PROGRESS': return 'status-in-progress';
    case 'DONE': return 'status-done';
    case 'BLOCKED': return 'status-blocked';
    default: return 'status-todo';
  }
}

export default function StaffDashboard() {
  const { currentUserId } = useApp();
  const user = getUserById(currentUserId);
  const allTasks = getTasksByUser(currentUserId);
  const overdue = getOverdueTasksByUser(currentUserId);
  const notifications = getNotificationsByUser(currentUserId);
  const unreadNotifs = notifications.filter(n => !n.read);
  const period = 'Kỳ 2 2025-2026';

  const [myQuestions, setMyQuestions] = useState<ManagerQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});

  useEffect(() => {
    setMyQuestions(getQuestionsForUser(currentUserId));
    const unsub = subscribeQuestions(() => setMyQuestions(getQuestionsForUser(currentUserId)));
    return unsub;
  }, [currentUserId]);

  const openQuestions = myQuestions.filter(q => q.status === 'open');

  const todo = allTasks.filter(t => t.status === 'TODO');
  const inProgress = allTasks.filter(t => t.status === 'IN_PROGRESS');
  const done = allTasks.filter(t => t.status === 'DONE');
  const blocked = allTasks.filter(t => t.status === 'BLOCKED');

  // Today's tasks: overdue + due today
  const todayTasks = allTasks.filter(t => {
    if (t.status === 'DONE') return false;
    const days = getDaysUntil(t.dueDate);
    return days <= 0; // overdue or due today
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // This week: due in next 7 days (but not today/overdue)
  const weekTasks = allTasks.filter(t => {
    if (t.status === 'DONE') return false;
    const days = getDaysUntil(t.dueDate);
    return days > 0 && days <= 7;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // KPI
  const snapshots = getKPISnapshotsByUser(currentUserId, period);
  const overall = calculateOverallKPI(currentUserId, period);
  const lowKpis = snapshots.filter(s => s.score < 85).map(s => {
    const def = kpiDefinitions.find(k => k.id === s.kpiDefinitionId);
    return { ...s, name: def?.shortName || '', fullName: def?.name || '' };
  });

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const completionRate = allTasks.length > 0 ? Math.round(done.length / allTasks.length * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* ── Hero Greeting ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #162036 40%, #1E293B 100%)',
        borderRadius: 20, padding: '32px 36px', marginBottom: 24, color: 'white',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(155, 27, 48, 0.12)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 120, width: 140, height: 140, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: 20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.02em' }}>{greeting}! 👋</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{user?.position} · {period}</div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
          {[
            { label: 'KPI tổng', value: `${overall}%`, color: getScoreColor(overall) },
            { label: 'Hoàn thành', value: `${completionRate}%`, color: 'white' },
            { label: 'Quá hạn', value: overdue.length, color: overdue.length > 0 ? '#EF4444' : '#10B981' },
            { label: 'Thông báo', value: unreadNotifs.length, color: unreadNotifs.length > 0 ? '#F59E0B' : 'white' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 20px',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)',
              minWidth: 90,
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color as string, letterSpacing: '-0.02em' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Urgent: Overdue Alert ── */}
      {overdue.length > 0 && (
        <div style={{ marginBottom: 20, borderRadius: 12, border: '1px solid #FECACA', overflow: 'hidden' }}>
          <div onClick={() => setOverdueExpanded(v => !v)} style={{
            background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', transition: 'background 0.15s'
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CircleAlert size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#991B1B' }}>
                {overdue.length} task quá hạn cần xử lý ngay
              </div>
              <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 2 }}>
                Bấm để xem chi tiết
              </div>
            </div>
            {overdueExpanded ? <ChevronDown size={20} color="#DC2626" /> : <ChevronRight size={20} color="#DC2626" />}
          </div>
          {overdueExpanded && (
            <div style={{ background: 'white' }}>
              {overdue.map((t, i) => {
                const program = getProgramById(t.programId);
                const days = Math.ceil((new Date().getTime() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', gap: 8, marginTop: 2 }}>
                          <span>📁 {program?.shortName}</span>
                          <span>📅 {new Date(t.dueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: 'white', background: '#DC2626', whiteSpace: 'nowrap' }}>
                        Xử lý ngay
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Today Focus ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: todayTasks.length > 0 ? '1px solid #FBBF24' : undefined }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10, background: todayTasks.length > 0 ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : undefined }}>
            <Flame size={18} color={todayTasks.length > 0 ? '#F59E0B' : 'var(--gray-400)'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: todayTasks.length > 0 ? '#92400E' : 'var(--gray-700)' }}>Hôm nay cần tập trung</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
            {todayTasks.length > 0 && (
              <span style={{ background: '#F59E0B', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{todayTasks.length}</span>
            )}
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {todayTasks.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--gray-400)' }}>
                <CheckCircle2 size={32} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>Không có task đến hạn hôm nay 🎉</div>
              </div>
            ) : todayTasks.map(task => {
              const days = getDaysUntil(task.dueDate);
              const program = getProgramById(task.programId);
              return (
                <Link key={task.id} href={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    padding: '12px 20px', borderBottom: '1px solid var(--gray-50)', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s', cursor: 'pointer',
                  }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: days < 0 ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', gap: 8 }}>
                        <span>{program?.shortName}</span>
                        <span className={`status-chip ${getStatusStyle(task.status)}`} style={{ fontSize: 10, padding: '1px 6px' }}>{getStatusLabel(task.status)}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: days < 0 ? '#DC2626' : '#D97706', whiteSpace: 'nowrap' }}>
                      {days < 0 ? `Quá ${Math.abs(days)}d` : 'Hôm nay'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarDays size={18} color="#3B82F6" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Deadline trong tuần</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>7 ngày tới</div>
            </div>
            {weekTasks.length > 0 && (
              <span style={{ background: '#3B82F6', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{weekTasks.length}</span>
            )}
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {weekTasks.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--gray-400)' }}>
                <CalendarDays size={32} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>Không có deadline trong tuần này</div>
              </div>
            ) : weekTasks.map(task => {
              const days = getDaysUntil(task.dueDate);
              const program = getProgramById(task.programId);
              return (
                <Link key={task.id} href={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    padding: '12px 20px', borderBottom: '1px solid var(--gray-50)', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s', cursor: 'pointer',
                  }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: days <= 3 ? '#F59E0B' : '#3B82F6', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', gap: 8 }}>
                        <span>{program?.shortName}</span>
                        <span className={`status-chip ${getStatusStyle(task.status)}`} style={{ fontSize: 10, padding: '1px 6px' }}>{getStatusLabel(task.status)}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: days <= 3 ? '#D97706' : '#3B82F6', whiteSpace: 'nowrap' }}>
                      Còn {days} ngày
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>📋</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Tổng task</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: 'var(--gray-800)' }}>{allTasks.length}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{todo.length} cần làm · {inProgress.length} đang làm</div>
        </div>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>✅</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Hoàn thành</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#10B981' }}>{done.length}</div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 4 }}><div className="progress-bar-fill" style={{ width: `${completionRate}%`, background: '#10B981' }} /></div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{completionRate}% tổng task</div>
        </div>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Cần chú ý</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: '#EF4444' }}>{overdue.length + blocked.length}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{overdue.length} quá hạn · {blocked.length} bị chặn</div>
        </div>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FEF2F2, #FFE4E6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>📊</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>KPI trung bình</div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: getScoreColor(overall) }}>{overall}%</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{lowKpis.length > 0 ? `${lowKpis.length} KPI cần cải thiện` : 'Tất cả đạt mục tiêu'}</div>
        </div>
      </div>

      {/* ── Manager Questions for me ── */}
      {myQuestions.length > 0 && (
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20, border: openQuestions.length > 0 ? '1px solid #DDD6FE' : undefined }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10, background: openQuestions.length > 0 ? 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' : undefined }}>
          <MessageCircleQuestion size={18} color="#7C3AED" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: openQuestions.length > 0 ? '#5B21B6' : 'var(--gray-700)' }}>Câu hỏi từ quản lý</div>
            {openQuestions.length > 0 && <div style={{ fontSize: 11, color: '#7C3AED' }}>{openQuestions.length} câu hỏi cần trả lời</div>}
          </div>
          {openQuestions.length > 0 && <span style={{ background: '#7C3AED', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{openQuestions.length}</span>}
        </div>
        {myQuestions.map((q, i) => {
          const from = getUserById(q.fromUserId);
          const isOpen = expandedQ === q.id;
          const stColor = q.status === 'open' ? '#DC2626' : q.status === 'answered' ? '#3B82F6' : '#10B981';
          const stBg = q.status === 'open' ? '#FEE2E2' : q.status === 'answered' ? '#DBEAFE' : '#D1FAE5';
          const stLabel = q.status === 'open' ? '⚡ Cần trả lời' : q.status === 'answered' ? 'Đã trả lời' : 'Đã đóng';
          return (
            <div key={q.id} style={{ borderBottom: i < myQuestions.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
              <div onClick={() => setExpandedQ(isOpen ? null : q.id)} style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s', background: q.status === 'open' ? 'rgba(124,58,237,0.02)' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = q.status === 'open' ? 'rgba(124,58,237,0.02)' : 'transparent'}>
                {isOpen ? <ChevronDown size={13} color="var(--gray-400)" /> : <ChevronRight size={13} color="var(--gray-400)" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{q.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Từ {from?.name} · {q.createdAt} · 📌 {q.context}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: stColor, background: stBg }}>{stLabel}</span>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 14px 42px', background: 'var(--gray-50)' }}>
                  <div style={{ background: 'white', borderRadius: 10, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-50)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', marginBottom: 4 }}>Câu hỏi</div>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{q.question}</div>
                    </div>
                    {q.answer && (
                      <div style={{ padding: '12px 16px', background: '#F0FDF4', borderBottom: '1px solid var(--gray-50)' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>Câu trả lời của bạn — {q.answeredAt}</div>
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{q.answer}</div>
                      </div>
                    )}
                    {q.managerReply && (
                      <div style={{ padding: '12px 16px', background: '#F5F3FF' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', marginBottom: 4 }}>Phản hồi quản lý — {q.repliedAt}</div>
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{q.managerReply}</div>
                      </div>
                    )}
                    {q.status === 'open' && (
                      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-100)' }}>
                        <textarea placeholder="Nhập câu trả lời của bạn..." value={answerText[q.id] || ''} onChange={e => setAnswerText(p => ({ ...p, [q.id]: e.target.value }))} rows={3}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid #DDD6FE', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 8 }}
                          onFocus={e => e.target.style.borderColor = '#7C3AED'} onBlur={e => e.target.style.borderColor = '#DDD6FE'} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button onClick={() => { if (answerText[q.id]?.trim()) { answerQuestion(q.id, answerText[q.id].trim()); setAnswerText(p => ({ ...p, [q.id]: '' })); } }}
                            disabled={!answerText[q.id]?.trim()}
                            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: answerText[q.id]?.trim() ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'var(--gray-200)', color: answerText[q.id]?.trim() ? 'white' : 'var(--gray-400)', fontSize: 12, fontWeight: 700, cursor: answerText[q.id]?.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Send size={12} /> Gửi trả lời
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* ── Bottom: KPI + Notifications ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* KPI Cần cải thiện */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--isme-red)" />
              <span style={{ fontSize: 14, fontWeight: 700 }}>KPI Công việc</span>
            </div>
            <Link href="/kpi" style={{ fontSize: 12, color: 'var(--isme-red)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          {lowKpis.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>✓ Tất cả KPI đạt mục tiêu!</div>
            </div>
          ) : (
            <div>
              {lowKpis.map((kpi, i) => (
                <div key={kpi.id} style={{ padding: '12px 20px', borderBottom: i < lowKpis.length - 1 ? '1px solid var(--gray-50)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CircularProgress value={kpi.score} size={44} strokeWidth={4} color={getScoreColor(kpi.score)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{kpi.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{kpi.fullName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: getScoreColor(kpi.score) }}>{kpi.score}%</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{kpi.rawNumerator}/{kpi.rawDenominator}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reminders & Notifications */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="#F59E0B" />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Nhắc nhở & Thông báo</span>
            </div>
            {unreadNotifs.length > 0 && (
              <span style={{ background: '#F59E0B', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{unreadNotifs.length} mới</span>
            )}
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.slice(0, 6).map((n, i) => {
              const iconColor = n.severity === 'critical' ? '#DC2626' : n.severity === 'warning' ? '#F59E0B' : '#3B82F6';
              const Icon = n.severity === 'critical' ? AlertTriangle : n.severity === 'warning' ? Flag : Zap;
              return (
                <div key={n.id} style={{
                  padding: '12px 20px', borderBottom: i < 5 ? '1px solid var(--gray-50)' : 'none',
                  display: 'flex', gap: 10, background: n.read ? 'transparent' : 'rgba(59,130,246,0.03)',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={14} color={iconColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {n.title}
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{n.message}</div>
                    {n.actionUrl && n.actionLabel && (
                      <Link href={n.actionUrl} style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', fontWeight: 600, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        {n.actionLabel} <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
