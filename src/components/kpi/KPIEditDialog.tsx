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
      oldNumerator: snapshot.rawNumerator,
      oldDenominator: snapshot.rawDenominator,
      newScore,
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
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 520,
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Edit3 size={18} color="white" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Yêu cầu chỉnh sửa KPI</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{definition.shortName} — {definition.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
            padding: 6, cursor: 'pointer', display: 'flex',
          }}><X size={16} color="white" /></button>
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
          <div style={{ padding: 24 }}>
            {/* Current values */}
            <div style={{
              background: 'var(--gray-50)', borderRadius: 12, padding: 16, marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Giá trị hiện tại</div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Điểm</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-800)' }}>{snapshot.score}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Hoàn thành</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-800)' }}>{snapshot.rawNumerator}/{snapshot.rawDenominator}</div>
                </div>
              </div>
            </div>

            {/* New values */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--gray-700)' }}>Giá trị mới</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--gray-400)', display: 'block', marginBottom: 4 }}>Số hoàn thành</label>
                  <input
                    type="number" min={0} max={newDenominator} value={newNumerator}
                    onChange={e => setNewNumerator(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--gray-200)',
                      fontSize: 16, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3B82F6'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-300)', paddingTop: 20 }}>/</div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--gray-400)', display: 'block', marginBottom: 4 }}>Tổng số</label>
                  <input
                    type="number" min={1} value={newDenominator}
                    onChange={e => setNewDenominator(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--gray-200)',
                      fontSize: 16, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3B82F6'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                </div>
                <div style={{ paddingTop: 20 }}>
                  <div style={{
                    fontSize: 11, color: 'var(--gray-400)', marginBottom: 2,
                  }}>Điểm mới</div>
                  <div style={{
                    fontSize: 20, fontWeight: 800,
                    color: hasChanged ? (newScore > snapshot.score ? '#10B981' : '#EF4444') : 'var(--gray-400)',
                  }}>{newScore}%</div>
                </div>
              </div>
              {hasChanged && (
                <div style={{
                  marginTop: 8, fontSize: 12, padding: '6px 12px', borderRadius: 8,
                  background: newScore > snapshot.score ? '#D1FAE5' : '#FEE2E2',
                  color: newScore > snapshot.score ? '#065F46' : '#991B1B',
                  display: 'inline-block',
                }}>
                  {newScore > snapshot.score ? '↑' : '↓'} Thay đổi: {snapshot.score}% → {newScore}% ({newScore > snapshot.score ? '+' : ''}{newScore - snapshot.score}%)
                </div>
              )}
            </div>

            {/* Reason */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>
                Lý do chỉnh sửa <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={reason} onChange={e => { setReason(e.target.value); setError(''); }}
                placeholder="Nêu rõ lý do cần thay đổi số liệu KPI (vd: đã hoàn thành thêm hoạt động, cập nhật số liệu mới từ GV...)"
                rows={4}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, border: '2px solid var(--gray-200)',
                  fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              />
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                {reason.length}/200 ký tự · Yêu cầu sẽ được gửi cho quản lý để duyệt
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2', color: '#991B1B', padding: '10px 14px',
                borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 500,
              }}>{error}</div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{
                padding: '10px 20px', borderRadius: 10, border: '1px solid var(--gray-200)',
                background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                color: 'var(--gray-600)',
              }}>Huỷ</button>
              <button onClick={handleSubmit} disabled={!hasChanged || !reason.trim()} style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: hasChanged && reason.trim() ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--gray-200)',
                color: hasChanged && reason.trim() ? 'white' : 'var(--gray-400)',
                fontSize: 13, fontWeight: 700, cursor: hasChanged && reason.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}>Gửi yêu cầu chỉnh sửa</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
