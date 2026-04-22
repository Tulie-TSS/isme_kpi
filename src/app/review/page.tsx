'use client';
import { useApp } from '@/lib/context';
import { 
  reviewCycles, 
  reviews, 
  users, 
  kpiDefinitions, 
  getKPISnapshotsByUser, 
  calculateOverallKPI, 
  programs, 
  getUserById,
  kpiGroups,
  otherActivityRecords,
  laborDisciplineRecords,
  courses
} from '@/lib/mock-data';
import { FileText, CheckCircle, Clock, Send, X, ExternalLink, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, Award, ChevronDown, ChevronRight, Minus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function getScoreColor(s: number) { return s >= 85 ? '#047857' : s >= 60 ? '#D97706' : '#DC2626'; }
function getScoreBg(s: number) { return s >= 85 ? '#D1FAE5' : s >= 60 ? '#FEF3C7' : '#FEE2E2'; }
function getRank(score: number) { return score >= 95 ? 'Xuất sắc' : score >= 85 ? 'Tốt' : score >= 70 ? 'Khá' : score >= 60 ? 'TB' : 'Yếu'; }
function getRankColor(score: number) { return score >= 95 ? '#059669' : score >= 85 ? '#047857' : score >= 70 ? '#D97706' : score >= 60 ? '#F59E0B' : '#DC2626'; }

export default function ReviewPage() {
  const { currentRole, currentUserId, hasAnyRole } = useApp();
  const router = useRouter();
  const isManager = currentRole === 'manager' || currentRole === 'admin' || hasAnyRole('manager', 'institute_leader');
  const [selectedCycle, setSelectedCycle] = useState(reviewCycles[1]);
  const [selfNote, setSelfNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const period = 'Kỳ 2 2024-2025';

  const staffUsers = users.filter(u => u.role === 'staff');
  const userReviews = reviews.filter((r: any) => r.cycleId === selectedCycle?.id);

  const allUserData = staffUsers.map(u => {
    const overall = calculateOverallKPI(u.id, period);
    const snaps = getKPISnapshotsByUser(u.id, period);
    const review = userReviews.find((r: any) => r.userId === u.id);
    const lowKpis = snaps.filter(s => s.score < 85);
    return { user: u, overall, snaps, review, lowKpis };
  }).sort((a, b) => b.overall - a.overall);

  const avgKPI = allUserData.length > 0 ? Math.round(allUserData.reduce((s, d) => s + d.overall, 0) / allUserData.length) : 0;
  const topUser = allUserData[0];
  const bottomUser = allUserData[allUserData.length - 1];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Đánh giá & Tổng kết KPI</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Hệ thống đánh giá định kỳ dựa trên kết quả đạt được</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {reviewCycles.map((rc: any) => (
          <button key={rc.id} onClick={() => setSelectedCycle(rc)} className="card card-compact"
            style={{ cursor: 'pointer', border: selectedCycle?.id === rc.id ? '2px solid var(--isme-red)' : '1px solid var(--gray-200)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: rc.status === 'open' ? 'var(--success-light)' : 'var(--gray-100)' }}>
              {rc.status === 'open' ? <Clock size={18} color="var(--success)" /> : <CheckCircle size={18} color="var(--gray-400)" />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{rc.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{rc.status === 'open' ? 'Đang mở' : 'Đã đóng'}</div>
            </div>
          </button>
        ))}
      </div>

      {isManager ? (
        <>
          <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="summary-card">
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>KPI Trung bình Team</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(avgKPI) }}>{avgKPI}%</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{getRank(avgKPI)}</div>
            </div>
            <div className="summary-card">
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Cao nhất</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{topUser?.overall}%</div>
              <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>{topUser?.user.name}</div>
            </div>
            <div className="summary-card">
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Thấp nhất</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#DC2626' }}>{bottomUser?.overall}%</div>
              <div style={{ fontSize: 11, color: '#DC2626', marginTop: 2 }}>{bottomUser?.user.name}</div>
            </div>
            <div className="summary-card">
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>Chờ duyệt</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B' }}>{userReviews.filter((r: any) => r.submittedAt && !r.reviewedAt).length}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>/{staffUsers.length} nhân viên</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36, textAlign: 'center' }}>#</th>
                    <th>Nhân viên</th>
                    <th style={{ textAlign: 'center' }}>KPI Tổng</th>
                    <th style={{ textAlign: 'center' }}>Xếp loại</th>
                    {kpiGroups.map(g => (
                      <th key={g.id} style={{ textAlign: 'center', fontSize: 10 }}>{g.name}</th>
                    ))}
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {allUserData.map((d, rank) => {
                    const isExpanded = expandedUser === d.user.id;
                    return (
                      <tr key={d.user.id} onClick={() => setExpandedUser(isExpanded ? null : d.user.id)} style={{ cursor: 'pointer' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{rank + 1}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{d.user.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.user.position}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: 16, fontWeight: 800, color: getScoreColor(d.overall) }}>{d.overall}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: getRankColor(d.overall), background: getScoreBg(d.overall) }}>{getRank(d.overall)}</span>
                        </td>
                        {kpiGroups.map(g => {
                          // Simple mock group score for display
                          return <td key={g.id} style={{ textAlign: 'center', fontSize: 12 }}>-</td>;
                        })}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: d.review?.reviewedAt ? '#D1FAE5' : '#F3F4F6' }}>
                            {d.review?.reviewedAt ? 'Đã duyệt' : 'Chờ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 40 }}>
            <BarChart3 size={48} color="var(--gray-300)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)' }}>Bản tự đánh giá KPI</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Kết quả của bạn đã được hệ thống tự động tổng hợp dựa trên dữ liệu các nhóm KPI.</p>
            <div style={{ marginTop: 24, padding: 24, background: 'var(--gray-50)', borderRadius: 12 }}>
              <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>KPI Tổng hợp hiện tại</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: getScoreColor(calculateOverallKPI(currentUserId, period)) }}>{calculateOverallKPI(currentUserId, period)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
