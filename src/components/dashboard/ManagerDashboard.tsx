'use client';
import { useState, useEffect } from 'react';
import { 
  users, 
  kpiSnapshots, 
  kpiDefinitions, 
  programs, 
  calculateOverallKPI, 
  getKPISnapshotsByUser,
  getQuestionsByManager, 
  createManagerQuestion, 
  replyToAnswer, 
  subscribeQuestions, 
  getUserById,
  kpiGroups,
  otherActivityRecords,
  laborDisciplineRecords,
  courses
} from '@/lib/mock-data';
import { ManagerQuestion } from '@/lib/types';
import { 
  AlertTriangle, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  MessageCircleQuestion, 
  Send, 
  X, 
  BarChart3, 
  Filter,
  Medal, 
  ArrowUpDown, 
  ShieldAlert,
  Target,
  Users as UsersIcon,
  Award,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/context';

function getScoreColor(s: number) { return s >= 85 ? '#047857' : s >= 60 ? '#D97706' : '#DC2626'; }
function getScoreBg(s: number) { return s >= 85 ? '#D1FAE5' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }

// ── Ask Question Dialog ──
function AskQuestionDialog({ toUserId, context, managerId, onClose }: {
  toUserId: string; context: string; managerId: string; onClose: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const user = getUserById(toUserId);
  const submit = () => {
    if (!subject.trim() || !question.trim()) return;
    createManagerQuestion({ 
      fromUserId: managerId, 
      toUserId, 
      subject: subject.trim(), 
      question: question.trim(), 
      context, 
      contextType: 'kpi', 
      contextId: 'overall' 
    });
    onClose();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #0F172A, #1E293B)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageCircleQuestion size={18} color="white" />
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Yêu cầu giải trình / Trao đổi</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><X size={16} color="white" /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--gray-600)' }}>
            Gửi cho: <b>{user?.name}</b> · Đối tượng: <b>{context}</b>
          </div>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Tiêu đề..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 14, fontWeight: 600, outline: 'none', marginBottom: 12 }} />
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Nội dung chi tiết..." rows={4}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '2px solid var(--gray-200)', fontSize: 13, outline: 'none', resize: 'none' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Huỷ</button>
            <button onClick={submit} disabled={!subject.trim() || !question.trim()} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'var(--isme-red)', color: 'white', display: 'flex', alignItems: 'center', gap: 4,
            }}><Send size={12} /> Gửi yêu cầu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const { currentUserId, selectedProgramId } = useApp();
  const period = 'Kỳ 2 2024-2025';

  const staffUsers = users.filter(u => u.role === 'staff');
  
  const [questionDialog, setQuestionDialog] = useState<{ toUserId: string; context: string } | null>(null);
  const [questions, setQuestions] = useState<ManagerQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [rankSort, setRankSort] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setQuestions(getQuestionsByManager(currentUserId));
    const unsub = subscribeQuestions(() => setQuestions(getQuestionsByManager(currentUserId)));
    return unsub;
  }, [currentUserId]);

  const getGroupScore = (userId: string, groupId: string) => {
    if (groupId === 'operations' || groupId === 'academic_support') {
      const groupDefs = kpiDefinitions.filter(d => d.groupId === groupId);
      const groupSnaps = kpiSnapshots.filter(s => s.userId === userId && s.period === period && groupDefs.some(d => d.id === s.kpiDefinitionId));
      if (groupSnaps.length === 0) return 0;
      return Math.round(groupSnaps.reduce((acc, s) => acc + s.score, 0) / groupSnaps.length);
    }
    if (groupId === 'student_results') {
      const userCourses = courses; // Mock filter
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

  const rankingData = staffUsers.map(u => {
    const overall = calculateOverallKPI(u.id, period);
    const scores = kpiGroups.reduce((acc, g) => ({ ...acc, [g.id]: getGroupScore(u.id, g.id) }), {} as Record<string, number>);
    return { user: u, overall, scores };
  });

  const sortedRanking = [...rankingData].sort((a, b) => rankSort === 'desc' ? b.overall - a.overall : a.overall - b.overall);
  const riskUsers = rankingData.filter(r => r.overall < 85);
  const avgTeamKPI = rankingData.length > 0 ? Math.round(rankingData.reduce((sum, r) => sum + r.overall, 0) / rankingData.length) : 0;
  const openQs = questions.filter(q => q.status === 'open').length;

  return (
    <div className="animate-fade-in">
      {/* ── Summary Cards ── */}
      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="#64748B" /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Nhân sự team</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{staffUsers.length}</div>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: getScoreBg(avgTeamKPI), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart3 size={20} color={getScoreColor(avgTeamKPI)} /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>KPI Trung bình Team</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(avgTeamKPI) }}>{avgTeamKPI}%</div>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: riskUsers.length > 0 ? '#FEE2E2' : '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldAlert size={20} color={riskUsers.length > 0 ? '#DC2626' : '#059669'} /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Dưới mức yêu cầu</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: riskUsers.length > 0 ? '#DC2626' : '#059669' }}>{riskUsers.length}</div>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircleQuestion size={20} color="#7C3AED" /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Phản hồi chờ xử lý</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED' }}>{openQs}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Risk Alert ── */}
      {riskUsers.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <AlertTriangle size={24} color="#DC2626" />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#991B1B' }}>Cảnh báo hiệu suất: </span>
            <span style={{ fontSize: 14, color: '#B91C1C' }}>{riskUsers.length} nhân sự chưa đạt KPI 85%. Vui lòng kiểm tra các chỉ tiêu Operations và Kỷ luật lao động.</span>
          </div>
        </div>
      )}

      {/* ── Main Excel-style Ranking Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Medal size={18} color="#F59E0B" />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Bảng Xếp hạng & Theo dõi Tổng hợp Team</span>
          </div>
          <button onClick={() => setRankSort(s => s === 'desc' ? 'asc' : 'desc')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <ArrowUpDown size={14} /> {rankSort === 'desc' ? 'Cao → Thấp' : 'Thấp → Cao'}
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F1F5F9' }}>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', width: 50 }}>#</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', minWidth: 200 }}>NHÂN VIÊN</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>OPERATIONS (50%)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>HỖ TRỢ HT (20%)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>KẾT QUẢ SV (10%)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>HĐ KHÁC (10%)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>KỶ LUẬT (10%)</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 12, fontWeight: 800, background: '#E2E8F0' }}>TỔNG HỢP</th>
                <th style={{ padding: '12px 20px', width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {sortedRanking.map((row, i) => (
                <tr key={row.user.id} style={{ borderBottom: '1px solid var(--gray-50)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, color: i < 3 && rankSort === 'desc' ? '#F59E0B' : 'var(--gray-300)' }}>
                    {i < 3 && rankSort === 'desc' ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700 }}>{row.user.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{row.user.position}</div>
                  </td>
                  {kpiGroups.map(g => (
                    <td key={g.id} style={{ padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                        color: getScoreColor(row.scores[g.id]), background: getScoreBg(row.scores[g.id]), minWidth: 40
                      }}>{row.scores[g.id]}</div>
                    </td>
                  ))}
                  <td style={{ padding: '14px 20px', textAlign: 'center', background: '#F8FAFC' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: getScoreColor(row.overall) }}>{row.overall}%</div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button onClick={() => setQuestionDialog({ toUserId: row.user.id, context: `${row.user.name} — Kỳ KPI ${period}` })}
                      style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--gray-600)' }}>
                      <MessageCircleQuestion size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Questions & Feedback ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageCircleQuestion size={18} color="#7C3AED" />
          <span style={{ fontSize: 16, fontWeight: 700 }}>Phản hồi & Trao đổi ({openQs})</span>
        </div>
        {questions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Chưa có nội dung trao đổi nào.</div>
        ) : questions.map((q, i) => {
          const toUser = getUserById(q.toUserId);
          const isOpen = expandedQ === q.id;
          return (
            <div key={q.id} style={{ borderBottom: i < questions.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
              <div onClick={() => setExpandedQ(isOpen ? null : q.id)} style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                {isOpen ? <ChevronDown size={14} color="var(--gray-400)" /> : <ChevronRight size={14} color="var(--gray-400)" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{q.subject}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Đến: {toUser?.name} · {q.createdAt}</div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, 
                  color: q.status === 'open' ? '#F59E0B' : '#10B981', background: q.status === 'open' ? '#FEF3C7' : '#D1FAE5' }}>
                  {q.status === 'open' ? 'Chờ phản hồi' : 'Đã phản hồi'}
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 20px 48px', background: '#F8FAFC' }}>
                  <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--gray-200)', padding: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 12 }}>{q.question}</div>
                    {q.answer && (
                      <div style={{ padding: 12, background: '#F0FDF4', borderRadius: 6, fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: '#059669', marginBottom: 4 }}>Phản hồi từ {toUser?.name}:</div>
                        {q.answer}
                      </div>
                    )}
                    {q.status === 'answered' && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <textarea placeholder="Gửi phản hồi bổ sung..." value={replyText[q.id] || ''} onChange={e => setReplyText(p => ({ ...p, [q.id]: e.target.value }))} rows={2}
                          style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid var(--gray-200)', fontSize: 12, outline: 'none' }} />
                        <button onClick={() => { if (replyText[q.id]?.trim()) { replyToAnswer(q.id, replyText[q.id].trim()); setReplyText(p => ({ ...p, [q.id]: '' })); } }}
                          style={{ padding: '0 16px', borderRadius: 6, background: '#7C3AED', color: 'white', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                          Gửi & Đóng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {questionDialog && (
        <AskQuestionDialog
          toUserId={questionDialog.toUserId} context={questionDialog.context}
          managerId={currentUserId} onClose={() => setQuestionDialog(null)}
        />
      )}
    </div>
  );
}
