'use client';
import React, { useState } from 'react';
import { KPISnapshot, KPIDefinition, KPIEditRequest } from '@/lib/types';
import { createKPIEditRequest, getPendingEditForSnapshot } from '@/lib/mock-data';
import { X, Edit3, AlertTriangle } from 'lucide-react';

interface Props {
  snapshot: KPISnapshot;
  definition: KPIDefinition;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function KPIEditDialog({ snapshot, definition, onClose, onSubmitted }: Props) {
  const [newNumerator, setNewNumerator] = useState(snapshot.rawNumerator);
  const [newDenominator, setNewDenominator] = useState(snapshot.rawDenominator);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const pendingEdit = getPendingEditForSnapshot(snapshot.id);

  const newScore = newDenominator > 0 ? Math.round((newNumerator / newDenominator) * 100) : 0;
  const hasChanged = newNumerator !== snapshot.rawNumerator || newDenominator !== snapshot.rawDenominator;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do chỉnh sửa');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Lý do cần ít nhất 10 ký tự');
      return;
    }
    if (!hasChanged) {
      setError('Chưa có thay đổi nào');
      return;
    }

    createKPIEditRequest({
      snapshotId: snapshot.id,
      userId: snapshot.userId,
      kpiDefinitionId: snapshot.kpiDefinitionId,
      period: snapshot.period,
      oldScore: snapshot.score,
      oldActualValue: snapshot.actualValue,
      oldNumerator: snapshot.rawNumerator,
      oldDenominator: snapshot.rawDenominator,
      newScore,
      newActualValue: newNumerator, // Assuming actualValue is the numerator
      newNumerator,
      newDenominator,
      reason: reason.trim(),
    });

    onSubmitted();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 24, width: '100%', maxWidth: 580,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden', border: '1px solid var(--gray-100)',
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
              <Edit3 size={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>Yêu cầu chỉnh sửa KPI</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{definition.shortName} — {definition.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--gray-50)', border: 'none', borderRadius: 12,
            width: 36, height: 36, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            color: 'var(--gray-400)',
          }}
          onMouseOver={e => { (e.currentTarget as any).style.background = 'var(--gray-100)'; (e.currentTarget as any).style.color = 'var(--gray-600)'; }}
          onMouseOut={e => { (e.currentTarget as any).style.background = 'var(--gray-50)'; (e.currentTarget as any).style.color = 'var(--gray-400)'; }}
          ><X size={20} /></button>
        </div>

        {pendingEdit ? (
          /* Already has pending edit */
          <div style={{ padding: 24 }}>
            <div style={{
              background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12,
              padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <AlertTriangle size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 4 }}>
                  Đã có yêu cầu đang chờ duyệt
                </div>
                <div style={{ fontSize: 13, color: '#92400E' }}>
                  Bạn đã gửi yêu cầu thay đổi từ <b>{pendingEdit.oldNumerator}/{pendingEdit.oldDenominator}</b> → <b>{pendingEdit.newNumerator}/{pendingEdit.newDenominator}</b> vào ngày {pendingEdit.requestedAt}.
                </div>
                <div style={{ fontSize: 12, color: '#B45309', marginTop: 8, fontStyle: 'italic' }}>
                  Lý do: "{pendingEdit.reason}"
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit form */
          <div style={{ padding: '32px' }}>
            {/* Value Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              <div style={{
                background: 'var(--gray-50)', borderRadius: 20, padding: '20px 24px',
                border: '1px solid var(--gray-100)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Hiện tại</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-800)' }}>{snapshot.score}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-400)' }}>%</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4, fontWeight: 600 }}>{snapshot.rawNumerator}/{snapshot.rawDenominator} hoàn thành</div>
              </div>

              <div style={{
                background: hasChanged ? (newScore >= snapshot.score ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)') : 'var(--gray-50)',
                borderRadius: 20, padding: '20px 24px',
                border: hasChanged ? (newScore >= snapshot.score ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)') : '1px solid var(--gray-100)',
                transition: 'all 0.3s ease',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Dự kiến</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: hasChanged ? (newScore >= snapshot.score ? '#10B981' : '#EF4444') : 'var(--gray-400)' }}>{newScore}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: hasChanged ? (newScore >= snapshot.score ? '#10B981' : '#EF4444') : 'var(--gray-300)' }}>%</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4, fontWeight: 600 }}>{newNumerator}/{newDenominator} hoàn thành</div>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ 
              background: 'var(--gray-50)', borderRadius: 20, padding: 24, marginBottom: 32,
              border: '1px solid var(--gray-100)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 10 }}>Số lượng hoàn thành</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number" min={0} max={newDenominator} value={newNumerator}
                      onChange={e => setNewNumerator(Math.max(0, parseInt(e.target.value) || 0))}
                      style={{
                        width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid white',
                        fontSize: 16, fontWeight: 800, outline: 'none', transition: 'all 0.2s',
                        background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'white'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 10 }}>Tổng số lượng (Target)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number" min={1} value={newDenominator}
                      onChange={e => setNewDenominator(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid white',
                        fontSize: 16, fontWeight: 800, outline: 'none', transition: 'all 0.2s',
                        background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'white'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 10 }}>
                Lý do chỉnh sửa <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={reason} onChange={e => { setReason(e.target.value); setError(''); }}
                placeholder="Nêu rõ lý do cần thay đổi số liệu KPI (vd: đã hoàn thành thêm hoạt động, cập nhật số liệu mới từ GV...)"
                rows={4}
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: 16, border: '2px solid var(--gray-50)',
                  fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  transition: 'all 0.2s', background: 'var(--gray-50)',
                  lineHeight: '1.6', color: 'var(--gray-800)',
                }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.05)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--gray-50)'; e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Yêu cầu sẽ được gửi cho quản lý duyệt</span>
                <span>{reason.length}/200</span>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2', color: '#991B1B', padding: '12px 18px',
                borderRadius: 14, fontSize: 13, marginBottom: 24, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #FCA5A5',
              }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{
                padding: '12px 24px', borderRadius: 14, border: '1px solid var(--gray-200)',
                background: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                color: 'var(--gray-600)', transition: 'all 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseOut={e => e.currentTarget.style.background = 'white'}
              >Huỷ</button>
              <button onClick={handleSubmit} disabled={!hasChanged || !reason.trim()} style={{
                padding: '12px 32px', borderRadius: 14, border: 'none',
                background: hasChanged && reason.trim() ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--gray-200)',
                color: hasChanged && reason.trim() ? 'white' : 'var(--gray-400)',
                fontSize: 14, fontWeight: 800, cursor: hasChanged && reason.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                boxShadow: hasChanged && reason.trim() ? '0 10px 20px -5px rgba(59, 130, 246, 0.4)' : 'none',
              }}
              onMouseOver={e => { if (hasChanged && reason.trim()) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >Gửi yêu cầu chỉnh sửa</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
