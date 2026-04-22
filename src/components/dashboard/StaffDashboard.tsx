'use client';
import { useApp } from '@/lib/context';
import { 
  getKPISnapshotsByUser, 
  kpiDefinitions, 
  getUserById, 
  calculateOverallKPI, 
  getNotificationsByUser, 
  getQuestionsForUser, 
  answerQuestion, 
  subscribeQuestions, 
  kpiGroups,
  otherActivityRecords,
  laborDisciplineRecords,
  courses
} from '@/lib/mock-data';
import { ManagerQuestion } from '@/lib/types';
import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Target, 
  Bell, 
  CircleAlert, 
  MessageCircleQuestion, 
  BarChart3, 
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Award,
  Users
} from 'lucide-react';
import Link from 'next/link';

function CircularProgress({ value, size = 72, strokeWidth = 6, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="circular-progress" style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
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

export default function StaffDashboard() {
  const { currentUserId } = useApp();
  const user = getUserById(currentUserId);
  const notifications = getNotificationsByUser(currentUserId);
  const unreadNotifs = notifications.filter(n => !n.read);
  const period = 'Kỳ 2 2024-2025';

  const [myQuestions, setMyQuestions] = useState<ManagerQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});

  useEffect(() => {
    setMyQuestions(getQuestionsForUser(currentUserId));
    const unsub = subscribeQuestions(() => setMyQuestions(getQuestionsForUser(currentUserId)));
    return unsub;
  }, [currentUserId]);

  const openQuestions = myQuestions.filter(q => q.status === 'open');

  // KPI Snapshots
  const snapshots = getKPISnapshotsByUser(currentUserId, period);
  const overall = calculateOverallKPI(currentUserId, period);
  
  // Groupings
  const opSnaps = snapshots.filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'operations');
  const asSnaps = snapshots.filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'academic_support');
  
  // Other Activity Record
  const otherRec = otherActivityRecords.find(r => r.userId === currentUserId && r.period === period);
  
  // Labor Discipline Record
  const laborRec = laborDisciplineRecords.find(r => r.userId === currentUserId && r.period === period);

  // Student Results (from Courses)
  const userCourses = courses; // In real app, filter by manager

  // Low KPI Alerts
  const lowKpis = snapshots.filter(s => s.score < 85).map(s => {
    const def = kpiDefinitions.find(k => k.id === s.kpiDefinitionId);
    return { ...s, name: def?.shortName || '', fullName: def?.name || '' };
  });

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* ── Hero Greeting ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #162036 40%, #1E293B 100%)',
        borderRadius: 20, padding: '32px 36px', marginBottom: 24, color: 'white',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(155, 27, 48, 0.12)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 120, width: 140, height: 140, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', filter: 'blur(50px)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.02em' }}>{greeting}! 👋</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{user?.position} · {period}</div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
          {[
            { label: 'KPI Tổng hợp', value: `${overall}%`, color: getScoreColor(overall), icon: BarChart3 },
            { label: 'Cảnh báo KPI', value: lowKpis.length, color: lowKpis.length > 0 ? '#EF4444' : '#10B981', icon: AlertTriangle },
            { label: 'Câu hỏi mới', value: openQuestions.length, color: openQuestions.length > 0 ? '#F59E0B' : 'white', icon: MessageCircleQuestion },
            { label: 'Thông báo', value: unreadNotifs.length, color: unreadNotifs.length > 0 ? '#F59E0B' : 'white', icon: Bell },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 20px',
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)',
              minWidth: 120,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <s.icon size={12} color="rgba(255,255,255,0.45)" />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color as string, letterSpacing: '-0.02em' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Column: KPI Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Group 1: Operations (50%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Target size={18} color="var(--isme-red)" />
                <span style={{ fontSize: 15, fontWeight: 700 }}>1. Nhóm Operations (50%)</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>{opSnaps.length} chỉ tiêu</span>
            </div>
            <div style={{ padding: 0 }}>
              {opSnaps.map((kpi, i) => {
                const def = kpiDefinitions.find(k => k.id === kpi.kpiDefinitionId);
                return (
                  <div key={kpi.id} style={{ padding: '16px 24px', borderBottom: i < opSnaps.length - 1 ? '1px solid var(--gray-50)' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <CircularProgress value={kpi.score} size={44} strokeWidth={4} color={getScoreColor(kpi.score)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{def?.stt}. {def?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{def?.criteria}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: getScoreColor(kpi.score) }}>{kpi.actualValue}/{kpi.targetValue}</div>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{def?.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 2: Academic Support (20%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={18} color="var(--isme-red)" />
                <span style={{ fontSize: 15, fontWeight: 700 }}>2. Hỗ trợ học tập (20%)</span>
              </div>
            </div>
            <div style={{ padding: 0 }}>
              {asSnaps.map((kpi, i) => {
                const def = kpiDefinitions.find(k => k.id === kpi.kpiDefinitionId);
                return (
                  <div key={kpi.id} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <CircularProgress value={kpi.score} size={44} strokeWidth={4} color={getScoreColor(kpi.score)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{def?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{def?.criteria}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: getScoreColor(kpi.score) }}>{kpi.actualValue} hoạt động</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 3: Student Results (10%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={18} color="var(--isme-red)" />
                <span style={{ fontSize: 15, fontWeight: 700 }}>3. Kết quả học tập & Kỷ luật SV (10%)</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>{userCourses.length} lớp/môn</span>
            </div>
            <div style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ background: 'var(--gray-50)', color: 'var(--gray-500)', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', fontWeight: 600 }}>Tên lớp/môn</th>
                    <th style={{ padding: '12px 12px', fontWeight: 600 }}>Chuyên cần</th>
                    <th style={{ padding: '12px 12px', fontWeight: 600 }}>Tỷ lệ Pass</th>
                    <th style={{ padding: '12px 24px', fontWeight: 600, textAlign: 'right' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {userCourses.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < userCourses.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                      <td style={{ padding: '12px 24px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{c.cohort}</div>
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ color: c.attendanceRate >= c.attendanceTarget ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                          {(c.attendanceRate * 100).toFixed(1)}%
                        </span>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>Target: {c.attendanceTarget * 100}%</div>
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ color: c.passRate >= c.passTarget ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                          {(c.passRate * 100).toFixed(1)}%
                        </span>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>Target: {c.passTarget * 100}%</div>
                      </td>
                      <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                        {c.attendanceRate >= c.attendanceTarget && c.passRate >= c.passTarget ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <AlertTriangle size={16} color="#F59E0B" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Other, Discipline & Interaction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Group 4: Other Activities (10%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--gray-50)' }}>
              <BookOpen size={18} color="var(--isme-red)" />
              <span style={{ fontSize: 14, fontWeight: 700 }}>4. Các hoạt động khác (10%)</span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Tuyển sinh', active: otherRec?.admission },
                  { label: 'Hỗ trợ du học', active: otherRec?.studyAbroad },
                  { label: 'Hỗ trợ exchange', active: otherRec?.exchange },
                  { label: 'HĐ khác của Viện', active: otherRec?.otherInstitute },
                ].map((item, i) => (
                  <div key={i} style={{ 
                    padding: '10px', borderRadius: 8, border: '1px solid var(--gray-100)',
                    background: item.active ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <div style={{ 
                      width: 16, height: 16, borderRadius: 4, border: '2px solid',
                      borderColor: item.active ? '#10B981' : 'var(--gray-300)',
                      background: item.active ? '#10B981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {item.active && <CheckCircle2 size={12} color="white" />}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: item.active ? '#065F46' : 'var(--gray-500)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6, textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>Điểm chuyển đổi: </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>
                  {otherRec ? [otherRec.admission, otherRec.studyAbroad, otherRec.exchange, otherRec.otherInstitute].filter(Boolean).length * 25 : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Group 5: Labor Discipline (10%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--gray-50)' }}>
              <ShieldCheck size={18} color="var(--isme-red)" />
              <span style={{ fontSize: 14, fontWeight: 700 }}>5. Kỷ luật lao động (10%)</span>
            </div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(laborRec?.score || 0) }}>
                {laborRec?.score || 0}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Điểm đánh giá từ Quản lý</div>
              {laborRec?.note && (
                <div style={{ marginTop: 12, padding: 10, background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, fontStyle: 'italic', color: 'var(--gray-600)' }}>
                  "{laborRec.note}"
                </div>
              )}
            </div>
          </div>

          {/* Interaction: Questions */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: openQuestions.length > 0 ? '1px solid #DDD6FE' : undefined }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10, background: openQuestions.length > 0 ? 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' : undefined }}>
              <MessageCircleQuestion size={18} color="#7C3AED" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: openQuestions.length > 0 ? '#5B21B6' : 'var(--gray-700)' }}>Phản hồi Quản lý</div>
              </div>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {myQuestions.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Không có câu hỏi nào</div>
              ) : myQuestions.map((q, i) => (
                <div key={q.id} style={{ padding: '12px 16px', borderBottom: i < myQuestions.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{q.subject}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: q.status === 'open' ? '#FEE2E2' : '#D1FAE5', color: q.status === 'open' ? '#DC2626' : '#059669' }}>
                      {q.status === 'open' ? 'Chờ' : 'Đã trả lời'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.4, marginBottom: 8 }}>{q.question}</div>
                  {q.status === 'open' && (
                    <button onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Trả lời ngay →
                    </button>
                  )}
                  {expandedQ === q.id && (
                    <div style={{ marginTop: 10 }}>
                      <textarea placeholder="Nhập phản hồi..." value={answerText[q.id] || ''} onChange={e => setAnswerText(p => ({ ...p, [q.id]: e.target.value }))} rows={3}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #DDD6FE', fontSize: 12, resize: 'none', outline: 'none' }} />
                      <button onClick={() => { if (answerText[q.id]?.trim()) { answerQuestion(q.id, answerText[q.id].trim()); setAnswerText(p => ({ ...p, [q.id]: '' })); setExpandedQ(null); } }}
                        style={{ marginTop: 6, width: '100%', padding: '6px', borderRadius: 6, border: 'none', background: '#7C3AED', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        Gửi phản hồi
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Notifications Footer ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 24 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} color="#F59E0B" />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Thông báo hệ thống</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {notifications.slice(0, 3).map((n, i) => {
            const iconColor = n.severity === 'critical' ? '#DC2626' : n.severity === 'warning' ? '#F59E0B' : '#3B82F6';
            return (
              <div key={n.id} style={{
                padding: '20px 24px', background: n.read ? 'white' : 'rgba(59,130,246,0.02)',
                borderRight: (i + 1) % 3 !== 0 ? '1px solid var(--gray-50)' : 'none',
              }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: iconColor, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5 }}>{n.message}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
  );
}
