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
  courses,
  calculateCoursesKPI,
  getSubmissionStatus,
  setSubmissionStatus,
  addAuditLog,
  subscribeEditRequests,
  subscribeCourseEditRequests,
  updateSnapshotValue
} from '@/lib/mock-data';
import { ManagerQuestion, User } from '@/lib/types';
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
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/lib/context';

function getScoreColor(s: number) { return s >= 90 ? '#047857' : s >= 75 ? '#D97706' : '#DC2626'; }
function getScoreBg(s: number) { return s >= 90 ? '#D1FAE5' : s >= 75 ? '#FEF3C7' : '#FEE2E2'; }

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
  const { currentUserId } = useApp();
  const period = 'Kỳ 2 2025-2026';

  const staffUsers = users.filter(u => u.role === 'staff');
  
  const [questionDialog, setQuestionDialog] = useState<{ toUserId: string; context: string } | null>(null);
  const [questions, setQuestions] = useState<ManagerQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [rankSort, setRankSort] = useState<'asc' | 'desc'>('desc');
  const [submits, setSubmits] = useState<Record<string, 'open' | 'submitted' | 'approved'>>({});
  const [, forceUpdate] = useState(0);

  // Detail staff review state
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [tempScores, setTempScores] = useState<Record<string, number>>({});
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setQuestions(getQuestionsByManager(currentUserId));
    
    // Read submit status for all staff
    const statuses: Record<string, 'open' | 'submitted' | 'approved'> = {};
    staffUsers.forEach(u => {
      statuses[u.id] = getSubmissionStatus(u.id, period);
    });
    setSubmits(statuses);

    const unsub1 = subscribeQuestions(() => setQuestions(getQuestionsByManager(currentUserId)));
    const unsub2 = subscribeEditRequests(() => forceUpdate(n => n + 1));
    const unsub3 = subscribeCourseEditRequests(() => forceUpdate(n => n + 1));
    
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [currentUserId, selectedStaffId]);

  const getGroupScore = (userId: string, groupId: string) => {
    if (groupId === 'operations') {
      const opDefs = kpiDefinitions.filter(d => d.groupId === 'operations');
      const opSnaps = kpiSnapshots.filter(s => s.userId === userId && s.period === period && opDefs.some(d => d.id === s.kpiDefinitionId));
      if (opSnaps.length === 0) return 0;
      return Math.round(opSnaps.reduce((acc, s) => acc + s.score, 0) / opSnaps.length);
    }
    if (groupId === 'academic_support') {
      const op5AsSnap = kpiSnapshots.find(s => s.userId === userId && s.period === period && s.kpiDefinitionId === 'op5_as');
      return op5AsSnap ? Math.round(op5AsSnap.score) : 0;
    }
    if (groupId === 'student_results') {
      const userProg = programs.find(p => p.managerId === userId);
      if (!userProg) return 100;
      return calculateCoursesKPI(userProg.id, 'current');
    }
    if (groupId === 'other_activities') {
      const otherDefs = kpiDefinitions.filter(d => d.groupId === 'other_activities');
      const otherSnaps = kpiSnapshots.filter(s => s.userId === userId && s.period === period && otherDefs.some(d => d.id === s.kpiDefinitionId));
      if (otherSnaps.length === 0) return 0;
      return Math.round(otherSnaps.reduce((acc, s) => acc + s.score, 0) / otherSnaps.length);
    }
    return 0;
  };

  const handleOpenReviewDetail = (staffId: string) => {
    const snaps = kpiSnapshots.filter(s => s.userId === staffId && s.period === period);
    const scoreMap: Record<string, number> = {};
    const noteMap: Record<string, string> = {};
    snaps.forEach(s => {
      scoreMap[s.kpiDefinitionId] = s.leaderScore !== undefined ? s.leaderScore : s.score;
      noteMap[s.kpiDefinitionId] = s.leaderNote || '';
    });
    setTempScores(scoreMap);
    setTempNotes(noteMap);
    setSelectedStaffId(staffId);
  };

  const handleSaveAndApprove = (staffId: string) => {
    const snaps = kpiSnapshots.filter(s => s.userId === staffId && s.period === period);
    
    // Save to snapshots
    snaps.forEach(s => {
      const lScore = tempScores[s.kpiDefinitionId];
      const lNote = tempNotes[s.kpiDefinitionId];
      updateSnapshotValue(s.id, {
        leaderScore: lScore !== undefined ? lScore : s.score,
        leaderNote: lNote || ''
      });
    });

    setSubmissionStatus(staffId, period, 'approved');
    setSubmits(prev => ({ ...prev, [staffId]: 'approved' }));
    
    const staffName = getUserById(staffId)?.name;
    addAuditLog(currentUserId, 'Phê duyệt & Đánh giá chi tiết', `Đã đánh giá chi tiết và phê duyệt KPI kì ${period} của nhân sự ${staffName}.`);
    
    alert(`Đã lưu đánh giá và phê duyệt thành công KPI của ${staffName}!`);
    setSelectedStaffId(null);
    forceUpdate(n => n + 1);
  };

  const handleApproveSubmission = (staffId: string) => {
    const staff = getUserById(staffId);
    if (confirm(`Bạn có chắc muốn phê duyệt bản tự đánh giá KPI kì này của ${staff?.name}?`)) {
      setSubmissionStatus(staffId, period, 'approved');
      setSubmits(prev => ({ ...prev, [staffId]: 'approved' }));
      addAuditLog(currentUserId, 'Phê duyệt tự đánh giá', `Đã phê duyệt bản tự đánh giá KPI kì ${period} của nhân sự ${staff?.name}. Trạng thái chuyển sang Đã phê duyệt.`);
      forceUpdate(n => n + 1);
    }
  };

  const rankingData = staffUsers.map(u => {
    const overall = calculateOverallKPI(u.id, period);
    const scores = kpiGroups.reduce((acc, g) => ({ ...acc, [g.id]: getGroupScore(u.id, g.id) }), {} as Record<string, number>);
    const status = submits[u.id] || getSubmissionStatus(u.id, period);
    return { user: u, overall, scores, status };
  });

  const sortedRanking = [...rankingData].sort((a, b) => rankSort === 'desc' ? b.overall - a.overall : a.overall - b.overall);
  const riskUsers = rankingData.filter(r => r.overall < 85);
  const avgTeamKPI = rankingData.length > 0 ? Math.round(rankingData.reduce((sum, r) => sum + r.overall, 0) / rankingData.length) : 0;
  const openQs = questions.filter(q => q.status === 'open').length;

  // Find users with pending submissions
  const pendingSubmissions = rankingData.filter(r => r.status === 'submitted');

  const countWords = (str: string): number => {
    if (!str.trim()) return 0;
    return str.trim().split(/\s+/).length;
  };

  // Quick review templates
  const templates = {
    excellent: "Nhân sự đã thể hiện tinh thần trách nhiệm cao độ trong việc triển khai công việc này. Mọi đầu mục hồ sơ và quy trình vận hành liên quan đều được hoàn thành một cách chỉn chu, đúng tiến độ và không xảy ra bất kỳ sai sót nào. Các hoạt động ngoại khóa mang lại giá trị học thuật vô cùng to lớn cho tập thể sinh viên, ghi nhận mức độ tương tác và phản hồi rất tích cực. Đề nghị tiếp tục duy trì và phát huy hiệu quả xuất sắc này trong các kỳ học tiếp theo.",
    good: "Nhân sự hoàn thành tốt các chỉ tiêu công việc được giao theo đúng kế hoạch chung của Viện. Các hồ sơ và quy trình vận hành lớp học được cập nhật tương đối đầy đủ và chính xác. Khâu tương tác và phối hợp với giảng viên, sinh viên được xử lý kịp thời, đảm bảo không có phản hồi tiêu cực vượt cấp. Một số lỗi nhỏ đã được khắc phục kịp thời và không ảnh hưởng đến chất lượng chung của chương trình học kỳ này.",
    improve: "Tiến độ và kết quả thực hiện công việc của nhân sự trong kỳ này còn một số hạn chế nhất định. Việc cập nhật số liệu và quản lý điểm số còn chậm trễ so với mốc kế hoạch, gây ảnh hưởng đến tiến trình chung. Các hoạt động hỗ trợ học tập chưa đạt được tính chủ động và chiều sâu như kỳ vọng. Nhân sự cần nghiêm túc rút kinh nghiệm, xây dựng kế hoạch cải tiến cụ thể và phối hợp chặt chẽ hơn với quản lý để nâng cao hiệu suất trong kỳ tới."
  };

  const getWordCountColor = (count: number) => {
    if (count === 0) return 'var(--gray-400)';
    if (count >= 100 && count <= 200) return '#10B981'; // Green
    if (count > 200) return '#F59E0B'; // Orange
    return '#DC2626'; // Red
  };

  if (selectedStaffId) {
    const staff = getUserById(selectedStaffId)!;
    const snaps = kpiSnapshots.filter(s => s.userId === selectedStaffId && s.period === period);
    const staffStatus = submits[selectedStaffId] || getSubmissionStatus(selectedStaffId, period);

    return (
      <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
        {/* Detail Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => setSelectedStaffId(null)} 
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
                border: '1px solid var(--gray-200)', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              ← Quay lại
            </button>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Đánh giá & Phê duyệt KPI chi tiết</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--isme-red)' }}>{staff.name}</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>|</span>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{staff.position}</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>|</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, 
                  background: staffStatus === 'approved' ? '#D1FAE5' : staffStatus === 'submitted' ? '#FEF3C7' : '#F3F4F6',
                  color: staffStatus === 'approved' ? '#065F46' : staffStatus === 'submitted' ? '#B45309' : '#374151'
                }}>
                  {staffStatus === 'approved' ? 'Đã duyệt' : staffStatus === 'submitted' ? 'Chờ phê duyệt' : 'Bản nháp'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <button 
              className="btn btn-primary" 
              onClick={() => handleSaveAndApprove(selectedStaffId)}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none',
                padding: '10px 24px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              ✓ Lưu đánh giá & Phê duyệt
            </button>
          </div>
        </div>

        {/* Detailed KPI Table */}
        <div className="card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--gray-200)', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--gray-200)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, width: 50 }}>STT</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, width: 220 }}>Chỉ tiêu</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700 }}>Tiêu chí đo lường</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, width: 80 }}>Đơn vị</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, width: 90 }}>Tự chấm (%)</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, fontWeight: 700, width: 100 }}>Trưởng ban chấm (0-100)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, width: 420 }}>Đánh giá của Trưởng ban (Note 100-200 từ)</th>
              </tr>
            </thead>
            <tbody>
              {/* Operations Group */}
              <tr style={{ background: '#F1F5F9' }}>
                <td colSpan={7} style={{ padding: '8px 16px', fontWeight: 700, fontSize: 12, color: '#1E293B' }}>I. Chỉ tiêu Vận hành (Operations - 50%)</td>
              </tr>
              {snaps
                .filter(s => kpiDefinitions.find(k => k.id === s.kpiDefinitionId)?.groupId === 'operations')
                .map((snap, idx) => {
                  const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId)!;
                  const wordCount = countWords(tempNotes[snap.kpiDefinitionId] || '');
                  return (
                    <tr key={snap.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-400)' }}>{def.stt}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{def.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{def.shortName}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--gray-600)', lineHeight: 1.4 }}>
                        {def.criteria}
                        <div style={{ color: 'var(--gray-400)', fontSize: 10, marginTop: 4 }}>Thực tế: <b>{snap.actualValue}</b> / <b>{snap.targetValue}</b></div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, color: 'var(--gray-500)' }}>{def.unit}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: getScoreColor(snap.score) }}>{snap.score}%</td>
                      
                      {/* Leader Score Input */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="number" min="0" max="100"
                          value={tempScores[snap.kpiDefinitionId] !== undefined ? tempScores[snap.kpiDefinitionId] : snap.score}
                          onChange={e => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setTempScores(prev => ({ ...prev, [snap.kpiDefinitionId]: val }));
                          }}
                          style={{
                            width: 65, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gray-200)',
                            fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Leader Note Textarea & Word Counter */}
                      <td style={{ padding: '12px 16px' }}>
                        <textarea 
                          value={tempNotes[snap.kpiDefinitionId] || ''}
                          onChange={e => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: e.target.value }))}
                          placeholder="Nhập nhận xét đánh giá chi tiết chỉ tiêu này..."
                          rows={3}
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--gray-200)',
                            fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.4
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: getWordCountColor(wordCount) }}>
                            Số từ: {wordCount} (Yêu cầu: 100-200 từ) {wordCount > 0 && wordCount < 100 && '⚠️ Quá ngắn'} {wordCount > 200 && '⚠️ Quá dài'}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.excellent }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#059669', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu xuất sắc
                            </button>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.good }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#1E3A8A', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu tốt
                            </button>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.improve }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#B45309', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu cải thiện
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {/* Academic Support Group */}
              <tr style={{ background: '#F1F5F9' }}>
                <td colSpan={7} style={{ padding: '8px 16px', fontWeight: 700, fontSize: 12, color: '#1E293B' }}>II. Hoạt động Hỗ trợ học tập (Academic Support - 20%)</td>
              </tr>
              {snaps
                .filter(s => kpiDefinitions.find(k => k.id === s.kpiDefinitionId)?.groupId === 'academic_support')
                .map((snap, idx) => {
                  const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId)!;
                  const wordCount = countWords(tempNotes[snap.kpiDefinitionId] || '');
                  return (
                    <tr key={snap.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-400)' }}>{def.stt}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{def.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{def.shortName}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--gray-600)', lineHeight: 1.4 }}>
                        {def.criteria}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, color: 'var(--gray-500)' }}>{def.unit}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: getScoreColor(snap.score) }}>{snap.score}%</td>
                      
                      {/* Leader Score Input */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="number" min="0" max="100"
                          value={tempScores[snap.kpiDefinitionId] !== undefined ? tempScores[snap.kpiDefinitionId] : snap.score}
                          onChange={e => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setTempScores(prev => ({ ...prev, [snap.kpiDefinitionId]: val }));
                          }}
                          style={{
                            width: 65, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gray-200)',
                            fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Leader Note Textarea & Word Counter */}
                      <td style={{ padding: '12px 16px' }}>
                        <textarea 
                          value={tempNotes[snap.kpiDefinitionId] || ''}
                          onChange={e => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: e.target.value }))}
                          placeholder="Nhập nhận xét đánh giá chi tiết chỉ tiêu này..."
                          rows={3}
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--gray-200)',
                            fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.4
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: getWordCountColor(wordCount) }}>
                            Số từ: {wordCount} (Yêu cầu: 100-200 từ) {wordCount > 0 && wordCount < 100 && '⚠️ Quá ngắn'} {wordCount > 200 && '⚠️ Quá dài'}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.excellent }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#059669', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu xuất sắc
                            </button>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.good }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#1E3A8A', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu tốt
                            </button>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.improve }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#B45309', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu cải thiện
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {/* Other Activities Group */}
              <tr style={{ background: '#F1F5F9' }}>
                <td colSpan={7} style={{ padding: '8px 16px', fontWeight: 700, fontSize: 12, color: '#1E293B' }}>III. Các hoạt động khác (Other Activities - 10%)</td>
              </tr>
              {snaps
                .filter(s => kpiDefinitions.find(k => k.id === s.kpiDefinitionId)?.groupId === 'other_activities')
                .map((snap, idx) => {
                  const def = kpiDefinitions.find(k => k.id === snap.kpiDefinitionId)!;
                  const wordCount = countWords(tempNotes[snap.kpiDefinitionId] || '');
                  return (
                    <tr key={snap.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--gray-400)' }}>{def.stt}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{def.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>{def.shortName}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--gray-600)', lineHeight: 1.4 }}>
                        {def.criteria}
                        <div style={{ color: 'var(--gray-400)', fontSize: 10, marginTop: 4 }}>Thực tế: <b>{snap.actualValue}</b> / <b>{snap.targetValue}</b></div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 11, color: 'var(--gray-500)' }}>{def.unit}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: getScoreColor(snap.score) }}>{snap.score}%</td>
                      
                      {/* Leader Score Input */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="number" min="0" max="100"
                          value={tempScores[snap.kpiDefinitionId] !== undefined ? tempScores[snap.kpiDefinitionId] : snap.score}
                          onChange={e => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setTempScores(prev => ({ ...prev, [snap.kpiDefinitionId]: val }));
                          }}
                          style={{
                            width: 65, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gray-200)',
                            fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none'
                          }}
                        />
                      </td>

                      {/* Leader Note Textarea & Word Counter */}
                      <td style={{ padding: '12px 16px' }}>
                        <textarea 
                          value={tempNotes[snap.kpiDefinitionId] || ''}
                          onChange={e => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: e.target.value }))}
                          placeholder="Nhập nhận xét đánh giá chi tiết chỉ tiêu này..."
                          rows={3}
                          style={{
                            width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--gray-200)',
                            fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.4
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: getWordCountColor(wordCount) }}>
                            Số từ: {wordCount} (Yêu cầu: 100-200 từ) {wordCount > 0 && wordCount < 100 && '⚠️ Quá ngắn'} {wordCount > 200 && '⚠️ Quá dài'}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.excellent }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#059669', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu xuất sắc
                            </button>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.good }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#1E3A8A', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu tốt
                            </button>
                            <button 
                              onClick={() => setTempNotes(prev => ({ ...prev, [snap.kpiDefinitionId]: templates.improve }))}
                              style={{ background: 'none', border: 'none', fontSize: 9, color: '#B45309', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                            >
                              + Mẫu cải thiện
                            </button>
                          </div>
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

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* ── Summary Cards ── */}
      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="#64748B" /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Nhân sự trực thuộc</div>
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
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Dưới mức yêu cầu (&lt;85%)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: riskUsers.length > 0 ? '#DC2626' : '#059669' }}>{riskUsers.length}</div>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircleQuestion size={20} color="#7C3AED" /></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>Phản hồi giải trình</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7C3AED' }}>{openQs}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pending Submissions Panel (NEW) ── */}
      {pendingSubmissions.length > 0 && (
        <div className="card text-white" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: 'white', padding: '20px 24px', marginBottom: 24, border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <CheckSquare size={20} color="#F59E0B" />
            <span style={{ fontSize: 15, fontWeight: 800 }}>Yêu cầu phê duyệt tự đánh giá KPI ({pendingSubmissions.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingSubmissions.map(sub => (
              <div key={sub.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '10px 16px', borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{sub.user.name}</strong>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginLeft: 8 }}>({sub.user.position})</span>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Tự chấm tổng hợp: <b>{sub.overall}%</b> · Kỳ: {period}</div>
                </div>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => handleOpenReviewDetail(sub.user.id)}
                  style={{ background: '#10B981', color: 'white', border: 'none' }}
                >
                  Đánh giá chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Risk Alert ── */}
      {riskUsers.length > 0 && pendingSubmissions.length === 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <AlertTriangle size={24} color="#DC2626" />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#991B1B' }}>Cảnh báo hiệu suất: </span>
            <span style={{ fontSize: 14, color: '#B91C1C' }}>{riskUsers.length} nhân sự chưa đạt chỉ tiêu trung bình tối thiểu (85%). Vui lòng thảo luận yêu cầu cải tiến.</span>
          </div>
        </div>
      )}

      {/* ── Main Xếp hạng Table ── */}
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
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', minWidth: 180 }}>Nhân viên</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>Trạng thái tự đánh giá</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>Operations (50%)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>Hỗ trợ học tập (20%)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>Kết quả sinh viên (20%)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>Hoạt động khác (10%)</th>
                <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: 11, fontWeight: 700, background: '#E2E8F0' }}>Tổng hợp</th>
                <th style={{ padding: '12px 20px', width: 220 }}></th>
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
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: row.status === 'approved' ? '#D1FAE5' : row.status === 'submitted' ? '#FEF3C7' : '#F3F4F6',
                      color: row.status === 'approved' ? '#065F46' : row.status === 'submitted' ? '#B45309' : '#374151',
                    }}>
                      {row.status === 'approved' ? 'Đã duyệt' : row.status === 'submitted' ? 'Chờ duyệt' : 'Bản nháp'}
                    </span>
                  </td>
                  {kpiGroups.map(g => (
                    <td key={g.id} style={{ padding: '14px 10px', textAlign: 'center' }}>
                      <div style={{ 
                        display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                        color: getScoreColor(row.scores[g.id]), background: getScoreBg(row.scores[g.id]), minWidth: 40
                      }}>{row.scores[g.id]}%</div>
                    </td>
                  ))}
                  <td style={{ padding: '14px 20px', textAlign: 'center', background: '#F8FAFC' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: getScoreColor(row.overall) }}>{row.overall}%</div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenReviewDetail(row.user.id)}
                      style={{ background: 'var(--isme-red)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      Đánh giá chi tiết
                    </button>
                    <button onClick={() => setQuestionDialog({ toUserId: row.user.id, context: `${row.user.name} — Kỳ KPI ${period}` })}
                      style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--gray-600)' }}>
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
                        <button onClick={() => { if (replyText[q.id]?.trim()) { replyToAnswer(q.id, replyText[q.id].trim()); addAuditLog(currentUserId, 'Phản hồi trao đổi', `Đã trả lời/đóng phản hồi của ${toUser?.name} về "${q.subject}": "${replyText[q.id].trim()}"`); setReplyText(p => ({ ...p, [q.id]: '' })); } }}
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
