'use client';
import { useApp } from '@/lib/context';
import { 
  getKPISnapshotsByUser, 
  kpiDefinitions, 
  getUserById, 
  calculateOverallKPI, 
  calculateOperationsKPI,
  calculateCoursesKPI,
  getNotificationsByUser, 
  getQuestionsForUser, 
  answerQuestion, 
  subscribeQuestions, 
  kpiGroups,
  courses,
  programs,
  getSubmissionStatus,
  setSubmissionStatus,
  addAuditLog,
  subscribeEditRequests,
  subscribeCourseEditRequests,
  formatSemester
} from '@/lib/mock-data';
import { ManagerQuestion, Course } from '@/lib/types';
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
  Users,
  Send,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import Link from 'next/link';

function CircularProgress({ value, size = 72, strokeWidth = 6, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
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
  if (score >= 90) return '#10B981';
  if (score >= 75) return '#F59E0B';
  return '#EF4444';
}

export default function StaffDashboard() {
  const { currentUserId } = useApp();
  const user = getUserById(currentUserId);
  const notifications = getNotificationsByUser(currentUserId);
  const unreadNotifs = notifications.filter(n => !n.read);
  const period = 'Kỳ 2 2025-2026';

  const [myQuestions, setMyQuestions] = useState<ManagerQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'open' | 'submitted' | 'approved'>('open');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    setMyQuestions(getQuestionsForUser(currentUserId));
    setStatus(getSubmissionStatus(currentUserId, period));

    const unsub1 = subscribeQuestions(() => setMyQuestions(getQuestionsForUser(currentUserId)));
    const unsub2 = subscribeEditRequests(() => forceUpdate(n => n + 1));
    const unsub3 = subscribeCourseEditRequests(() => forceUpdate(n => n + 1));
    
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [currentUserId]);

  const openQuestions = myQuestions.filter(q => q.status === 'open');

  // Find program managed by coordinator
  const managedProgram = programs.find(p => p.managerId === currentUserId);
  const isCoordinator = !!managedProgram;

  // KPI Snapshots & Scores
  const snapshots = getKPISnapshotsByUser(currentUserId, period);
  const overall = calculateOverallKPI(currentUserId, period);
  
  // Groupings
  const opSnaps = snapshots.filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'operations');
  const otherSnaps = snapshots.filter(s => kpiDefinitions.find(d => d.id === s.kpiDefinitionId)?.groupId === 'other_activities');
  
  // Linked academic support KPI (STT 5 Hoạt động ngoại khóa)
  const op5AsSnap = snapshots.find(s => s.kpiDefinitionId === 'op5_as');
  const asScore = op5AsSnap ? op5AsSnap.score : 0;

  // Student Results & Discipline KPI Score (20% weight)
  const studentResultsScore = managedProgram ? calculateCoursesKPI(managedProgram.id, 'current') : 100;
  
  const isCurrentActiveCourse = (c: Course): boolean => {
    if (c.cohort.includes('dự kiến') || c.cohort === 'I22 MT' || c.cohort === 'I23 MX' || c.cohort === 'I19 MT' || c.cohort === 'I20 MX' || c.cohort === 'I20 MT') return false;
    if (c.programId === 'p_nam1') {
      return (c.semester === 'SEM SPRING' || c.semester === 'SEM FALL & SPRING' || c.semester === 'SEM 2');
    }
    if (c.programId === 'p_cu') {
      return c.cohort === 'I19 MX' && c.semester === 'SEM 2';
    }
    if (c.programId === 'p_nhtc') {
      return (c.cohort === 'BScBF I19' || c.cohort === 'BScBF I18') && c.semester === 'SEM 2';
    }
    if (c.programId === 'p_uwe') {
      return (c.cohort === 'I18 MT - IBM' && c.semester === 'SEM 2') || (c.cohort === 'I19 MX - IBM' && c.semester === 'SEM 1');
    }
    return c.semester === 'SEM 2' && c.year <= 2;
  };

  const activeCourses = courses.filter(c => {
    const isOwner = c.coordinatorId === currentUserId || (managedProgram && c.programId === managedProgram.id);
    return isOwner && isCurrentActiveCourse(c);
  });

  const lowKpis = snapshots.filter(s => s.score < 90).map(s => {
    const def = kpiDefinitions.find(k => k.id === s.kpiDefinitionId);
    return { ...s, name: def?.shortName || '', fullName: def?.name || '' };
  });

  const handleSubmitting = () => {
    if (confirm('Bạn có chắc chắn muốn nộp bản tự đánh giá KPI kỳ này lên quản lý phê duyệt? Thao tác này sẽ khoá các quyền sửa đổi trực tiếp.')) {
      setSubmissionStatus(currentUserId, period, 'submitted');
      setStatus('submitted');
      addAuditLog(currentUserId, 'Nộp tự đánh giá', `Đã nộp tự đánh giá KPI kì ${period} lên quản lý phê duyệt. Điểm tổng hợp tự đánh giá: ${overall}%.`);
      forceUpdate(n => n + 1);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';



  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* ── Clean Hero Summary Banner ── */}
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 16,
        border: '1px solid var(--gray-200)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 2 }}>{greeting},</div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>{user?.name}</h1>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{user?.position} · <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{period}</span></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'KPI Tổng hợp', value: `${overall}%`, color: getScoreColor(overall), icon: BarChart3 },
            { label: 'Chỉ tiêu cần cải thiện', value: lowKpis.length, color: lowKpis.length > 0 ? '#EF4444' : '#10B981', icon: AlertTriangle },
            { label: 'Câu hỏi của quản lý', value: openQuestions.length, color: openQuestions.length > 0 ? '#F59E0B' : 'var(--gray-700)', icon: MessageCircleQuestion },
            { label: 'Thông báo mới', value: unreadNotifs.length, color: unreadNotifs.length > 0 ? '#3B82F6' : 'var(--gray-700)', icon: Bell },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#F8FAFC',
              borderRadius: 6,
              padding: '10px 14px',
              border: '1px solid var(--gray-200)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <s.icon size={13} color="var(--gray-500)" />
                <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{s.label}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color as string }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submission workflow bar ── */}
      {isCoordinator && (
        <div style={{ padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8,
          background: status === 'approved' ? 'rgba(16,185,129,0.08)' : status === 'submitted' ? 'rgba(245,158,11,0.08)' : 'rgba(155,27,48,0.05)',
          border: `1px solid ${status === 'approved' ? 'rgba(16,185,129,0.2)' : status === 'submitted' ? 'rgba(245,158,11,0.2)' : 'rgba(155,27,48,0.2)'}`
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-800)' }}>
              Trạng thái tự đánh giá: {status === 'approved' ? 'Đã phê duyệt' : status === 'submitted' ? 'Đang chờ phê duyệt' : 'Chưa nộp (Bản nháp)'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
              {status === 'approved' && 'Bản KPI của bạn đã được quản lý phê duyệt chính thức. Để thay đổi số liệu môn học/vận hành, vui lòng gửi yêu cầu và nêu rõ lý do.'}
              {status === 'submitted' && 'Các số liệu của bạn đang được Hồ Hoàng Lan duyệt. Quyền sửa điểm trực tiếp đã tạm khoá.'}
              {status === 'open' && 'Vui lòng hoàn thành tự đánh giá toàn bộ KPI môn học và Vận hành bên dưới, sau đó bấm nút "Nộp phê duyệt" bên phải.'}
            </div>
          </div>
          {status === 'open' && (
            <button className="btn btn-primary" onClick={handleSubmitting} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 6, padding: '7px 14px' }}>
              <Send size={14} /> Nộp phê duyệt
            </button>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Left Column: KPI Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Group 1: Operations (50%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Target size={18} color="var(--isme-red)" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>1. Nhóm Vận hành - Operations (50%)</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)' }}>{opSnaps.length} chỉ tiêu · Trọng số 5%/mỗi KPI</span>
            </div>
            <div style={{ padding: 0 }}>
              {opSnaps.map((kpi, i) => {
                const def = kpiDefinitions.find(k => k.id === kpi.kpiDefinitionId);
                return (
                  <div key={kpi.id} style={{ padding: '16px 24px', borderBottom: i < opSnaps.length - 1 ? '1px solid var(--gray-50)' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <CircularProgress value={kpi.score} size={44} strokeWidth={4} color={getScoreColor(kpi.score)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
                        STT {def?.stt}: {def?.name}
                        {def?.id === 'op5_op' && <span style={{ marginLeft: 8, padding: '2px 6px', background: '#EFF6FF', color: '#1E40AF', borderRadius: 4, fontSize: 11 }}>Liên kết Hỗ trợ HT (20%)</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{def?.criteria}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: getScoreColor(kpi.score) }}>{kpi.actualValue}/{kpi.targetValue}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{def?.unit}</div>
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
                <span style={{ fontSize: 13, fontWeight: 700 }}>2. Hoạt động Hỗ trợ học tập (20%)</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--gray-400)', fontStyle: 'italic' }}>Liên kết với Chỉ tiêu Vận hành STT 5</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <CircularProgress value={asScore} size={44} strokeWidth={4} color={getScoreColor(asScore)} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>Tổ chức hoạt động ngoại khóa/Guest Speaker/Tọa đàm/Workshop...</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Số hoạt động ngoại khóa được tổ chức thành công.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: getScoreColor(asScore) }}>
                  {op5AsSnap ? `${op5AsSnap.actualValue}/${op5AsSnap.targetValue}` : '0/0'} hoạt động
                </div>
              </div>
            </div>
          </div>

          {/* Group 3: Student Results & Discipline (20%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={18} color="var(--isme-red)" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>3. Kết quả học tập và Kỷ luật học sinh (20%)</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: getScoreColor(studentResultsScore), background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>Chung: {studentResultsScore}%</span>
                <Link href="/kpi/courses" style={{ fontSize: 13, fontWeight: 700, color: 'var(--isme-red)', textDecoration: 'none' }}>Chi tiết →</Link>
              </div>
            </div>
            
            <div style={{ padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--gray-50)', color: 'var(--gray-500)', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '10px 16px', fontWeight: 600 }}>Tên lớp/môn</th>
                    <th style={{ padding: '10px 10px', fontWeight: 600, textAlign: 'center' }}>Chuyên cần</th>
                    <th style={{ padding: '10px 10px', fontWeight: 600, textAlign: 'center' }}>Pass 1st</th>
                    <th style={{ padding: '10px 10px', fontWeight: 600, textAlign: 'center' }}>Nộp bài đúng hạn</th>
                    <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>Mức đạt</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)' }}>Không có môn học đang hoạt động trong kỳ này</td>
                    </tr>
                  ) : activeCourses.map((c, i) => {
                    const attendComp = c.isAttendanceNA ? null : Math.round((c.attendanceRate / c.attendanceTarget) * 1000) / 10;
                    const passComp = c.isPassNA ? null : Math.round((c.passRate / c.passTarget) * 1000) / 10;
                    const submitComp = c.isSubmitNA ? null : Math.round((c.submitRate / c.submitTarget) * 1000) / 10;
                    
                    let compSum = 0;
                    let compCount = 0;
                    if (attendComp !== null) { compSum += attendComp; compCount++; }
                    if (passComp !== null) { compSum += passComp; compCount++; }
                    if (submitComp !== null) { compSum += submitComp; compCount++; }
                    const avgComp = compCount > 0 ? Math.round((compSum / compCount) * 10) / 10 : null;

                    return (
                      <tr key={c.id} style={{ borderBottom: i < activeCourses.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Khóa: {c.cohort} · {formatSemester(c.semester)}</div>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          {c.isAttendanceNA ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '1px 5px', borderRadius: 4 }}>N/A</span>
                          ) : (
                            <>
                              <div style={{ fontWeight: 600, color: c.attendanceRate >= c.attendanceTarget ? '#10B981' : '#EF4444' }}>
                                {Math.round(c.attendanceRate * 1000) / 10}%
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>MT: {Math.round(c.attendanceTarget * 1000) / 10}%</div>
                            </>
                          )}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          {c.isPassNA ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '1px 5px', borderRadius: 4 }}>N/A</span>
                          ) : (
                            <>
                              <div style={{ fontWeight: 600, color: c.passRate >= c.passTarget ? '#10B981' : '#EF4444' }}>
                                {Math.round(c.passRate * 1000) / 10}%
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>MT: {Math.round(c.passTarget * 1000) / 10}%</div>
                            </>
                          )}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          {c.isSubmitNA ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '1px 5px', borderRadius: 4 }}>N/A</span>
                          ) : (
                            <>
                              <div style={{ fontWeight: 600, color: c.submitRate >= c.submitTarget ? '#10B981' : '#EF4444' }}>
                                {Math.round(c.submitRate * 1000) / 10}%
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>MT: {Math.round(c.submitTarget * 1000) / 10}%</div>
                            </>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: avgComp === null ? '#64748B' : getScoreColor(avgComp) }}>
                          {avgComp === null ? <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#64748B', padding: '1px 5px', borderRadius: 4 }}>N/A</span> : `${avgComp}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Other, Interactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Group 4: Other Activities (10%) */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--gray-50)' }}>
              <BookOpen size={18} color="var(--isme-red)" />
              <span style={{ fontSize: 13, fontWeight: 700 }}>4. Các hoạt động khác (10%)</span>
            </div>
            <div style={{ padding: 0 }}>
              {otherSnaps.map((kpi, i) => {
                const def = kpiDefinitions.find(k => k.id === kpi.kpiDefinitionId);
                return (
                  <div key={kpi.id} style={{ padding: '14px 20px', borderBottom: i < otherSnaps.length - 1 ? '1px solid var(--gray-50)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CircularProgress value={kpi.score} size={36} strokeWidth={3} color={getScoreColor(kpi.score)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{def?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Thực tế: {kpi.actualValue} / {kpi.targetValue}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interaction: Questions */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: openQuestions.length > 0 ? '1px solid #DDD6FE' : undefined }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10, background: openQuestions.length > 0 ? 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' : undefined }}>
              <MessageCircleQuestion size={18} color="#7C3AED" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: openQuestions.length > 0 ? '#5B21B6' : 'var(--gray-700)' }}>Phản hồi quản lý</div>
              </div>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {myQuestions.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Không có phản hồi nào</div>
              ) : myQuestions.map((q, i) => (
                <div key={q.id} style={{ padding: '12px 16px', borderBottom: i < myQuestions.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{q.subject}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: q.status === 'open' ? '#FEE2E2' : '#D1FAE5', color: q.status === 'open' ? '#DC2626' : '#059669' }}>
                      {q.status === 'open' ? 'Chờ trả lời' : 'Đã trả lời'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.4, marginBottom: 8 }}>{q.question}</div>
                  {q.status === 'open' && (
                    <button onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)} style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Phản hồi ngay →
                    </button>
                  )}
                  {expandedQ === q.id && (
                    <div style={{ marginTop: 10 }}>
                      <textarea placeholder="Nhập câu trả lời..." value={answerText[q.id] || ''} onChange={e => setAnswerText(p => ({ ...p, [q.id]: e.target.value }))} rows={3}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #DDD6FE', fontSize: 13, resize: 'none', outline: 'none' }} />
                      <button onClick={() => { if (answerText[q.id]?.trim()) { answerQuestion(q.id, answerText[q.id].trim()); addAuditLog(currentUserId, 'Trả lời phản hồi', `Đã trả lời câu hỏi của quản lý về "${q.subject}": "${answerText[q.id].trim()}"`); setAnswerText(p => ({ ...p, [q.id]: '' })); setExpandedQ(null); } }}
                        style={{ marginTop: 6, width: '100%', padding: '6px', borderRadius: 6, border: 'none', background: '#7C3AED', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        Gửi câu trả lời
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
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={18} color="#F59E0B" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Thông báo hệ thống</span>
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
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>{n.message}</div>
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
