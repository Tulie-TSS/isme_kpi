// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { KPIEditRequest } from '@/lib/types';
import { getKPIEditRequests, getUserById, kpiDefinitions, approveKPIEditRequest, rejectKPIEditRequest, subscribeEditRequests } from '@/lib/mock-data';
import { useApp } from '@/lib/context';
import { CheckCircle, XCircle, Clock, FileText, ChevronDown, ChevronRight, User } from 'lucide-react';

function getStatusStyle(status: KPIEditRequest['status']) {
  switch (status) {
    case 'pending': return { bg: '#FEF3C7', color: '#92400E', label: 'Chờ duyệt', icon: Clock };
    case 'approved': return { bg: '#D1FAE5', color: '#065F46', label: 'Đã duyệt', icon: CheckCircle };
    case 'rejected': return { bg: '#FEE2E2', color: '#991B1B', label: 'Từ chối', icon: XCircle };
  }
}

export default function KPIApprovalPanel() {
  const { currentUserId, currentRole } = useApp();
  const [requests, setRequests] = useState<KPIEditRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    setRequests(getKPIEditRequests());
    const unsub = subscribeEditRequests(() => {
      setRequests(getKPIEditRequests());
      forceUpdate(n => n + 1);
    });
    return unsub;
  }, []);

  const isManager = currentRole === 'manager' || currentRole === 'admin';

  // Filter: manager sees all, staff sees own
  const filteredRequests = isManager
    ? requests
    : requests.filter(r => r.userId === currentUserId);

  const pendingCount = filteredRequests.filter(r => r.status === 'pending').length;

  if (filteredRequests.length === 0) return null;

  const handleApprove = (reqId: string) => {
    approveKPIEditRequest(reqId, currentUserId, reviewNote[reqId] || 'Đồng ý cập nhật.');
    setReviewNote(prev => ({ ...prev, [reqId]: '' }));
  };

  const handleReject = (reqId: string) => {
    const note = reviewNote[reqId]?.trim();
    if (!note) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    rejectKPIEditRequest(reqId, currentUserId, note);
    setReviewNote(prev => ({ ...prev, [reqId]: '' }));
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--gray-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #F59E0B10 0%, #EF444410 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={18} color="#F59E0B" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {isManager ? 'Yêu cầu chỉnh sửa KPI' : 'Yêu cầu chỉnh sửa của tôi'}
            </div>
            {pendingCount > 0 && (
              <div style={{ fontSize: 12, color: '#F59E0B' }}>{pendingCount} yêu cầu chờ duyệt</div>
            )}
          </div>
        </div>
        {pendingCount > 0 && (
          <span style={{
            background: '#F59E0B', color: 'white', borderRadius: 20,
            padding: '3px 10px', fontSize: 12, fontWeight: 700,
          }}>{pendingCount}</span>
        )}
      </div>

      {/* Request list */}
      <div>
        {filteredRequests.map((req, idx) => {
          const st = getStatusStyle(req.status);
          const def = kpiDefinitions.find(k => k.id === req.kpiDefinitionId);
          const user = getUserById(req.userId);
          const reviewer = req.reviewedBy ? getUserById(req.reviewedBy) : null;
          const isExpanded = expandedId === req.id;

          return (
            <div key={req.id} style={{
              borderBottom: idx < filteredRequests.length - 1 ? '1px solid var(--gray-100)' : 'none',
            }}>
              {/* Summary row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                style={{
                  padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {isExpanded ? <ChevronDown size={14} color="var(--gray-400)" /> : <ChevronRight size={14} color="var(--gray-400)" />}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{def?.shortName || req.kpiDefinitionId}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>—</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{def?.name}</span>
                  </div>
                  {isManager && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gray-400)' }}>
                      <User size={11} /> {user?.name}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center', marginRight: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: 'var(--gray-400)' }}>{req.oldNumerator}/{req.oldDenominator}</span>
                    <span style={{ color: 'var(--gray-300)', margin: '0 6px' }}>→</span>
                    <span style={{ color: req.newScore > req.oldScore ? '#10B981' : '#EF4444' }}>{req.newNumerator}/{req.newDenominator}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    {req.oldScore}% → {req.newScore}%
                  </div>
                </div>

                <span style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: st.bg, color: st.color,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <st.icon size={12} /> {st.label}
                </span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  padding: '0 20px 16px 46px', background: 'var(--gray-50)',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{ padding: '12px 16px', background: 'white', borderRadius: 10, border: '1px solid var(--gray-100)' }}>
                    {/* Reason */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 4 }}>Lý do chỉnh sửa</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{req.reason}</div>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 12 }}>
                      Gửi lúc: {req.requestedAt}
                    </div>

                    {/* Review result */}
                    {req.status !== 'pending' && (
                      <div style={{
                        background: st.bg, borderRadius: 8, padding: 12, marginBottom: 8,
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: st.color, marginBottom: 4 }}>
                          {req.status === 'approved' ? '✓ Đã duyệt' : '✗ Đã từ chối'} bởi {reviewer?.name || 'N/A'} — {req.reviewedAt}
                        </div>
                        {req.reviewNote && (
                          <div style={{ fontSize: 12, color: st.color, fontStyle: 'italic' }}>"{req.reviewNote}"</div>
                        )}
                      </div>
                    )}

                    {/* Manager actions for pending */}
                    {req.status === 'pending' && isManager && (
                      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, marginTop: 8 }}>
                        <textarea
                          placeholder="Ghi chú của quản lý (bắt buộc khi từ chối)..."
                          value={reviewNote[req.id] || ''}
                          onChange={e => setReviewNote(prev => ({ ...prev, [req.id]: e.target.value }))}
                          rows={2}
                          style={{
                            width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)',
                            fontSize: 12, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 10,
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleReject(req.id)} style={{
                            padding: '8px 16px', borderRadius: 8, border: '1px solid #FCA5A5',
                            background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <XCircle size={13} /> Từ chối
                          </button>
                          <button onClick={() => handleApprove(req.id)} style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            color: 'white', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <CheckCircle size={13} /> Duyệt
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
    </div>
  );
}
