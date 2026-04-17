'use client';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { tasks, getTaskChildren, getTaskAncestors, getProgramById, getUserById, kpiDefinitions, kpiSnapshots } from '@/lib/mock-data';
import { ChevronRight, ArrowLeft, Clock, User, Calendar, Tag, Layers, Target, Upload, Flag, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Task, TaskStatus } from '@/lib/types';

function getStatusClass(s: string) {
  return s === 'TODO' ? 'status-todo' : s === 'IN_PROGRESS' ? 'status-in-progress' : s === 'DONE' ? 'status-done' : 'status-blocked';
}
function getStatusLabel(s: string) {
  return s === 'TODO' ? 'Cần làm' : s === 'IN_PROGRESS' ? 'Đang làm' : s === 'DONE' ? 'Hoàn thành' : 'Bị chặn';
}
function getDaysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }
function getFreqLabel(f: string) {
  return f === 'yearly' ? 'Cả năm' : f === 'quarterly' ? 'Theo quý' : f === 'monthly' ? 'Hàng tháng' : f === 'weekly' ? 'Hàng tuần' : 'Một lần';
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const task = tasks.find(t => t.id === taskId);
  const [taskData, setTaskData] = useState<Record<string, Partial<Task>>>({});

  if (!task) return (
    <div className="animate-fade-in" style={{ padding: 48, textAlign: 'center' }}>
      <h2>Task không tồn tại</h2>
      <button className="btn btn-secondary" onClick={() => router.push('/tasks')} style={{ marginTop: 16 }}>
        <ArrowLeft size={16} /> Quay lại
      </button>
    </div>
  );

  const merged = { ...task, ...taskData[task.id] } as Task;
  const ancestors = getTaskAncestors(taskId);
  const children = getTaskChildren(taskId);
  const program = getProgramById(task.programId);
  const owner = getUserById(task.ownerId);
  const days = getDaysUntil(merged.dueDate);
  const isOverdue = merged.status !== 'DONE' && days < 0;
  const kpiDef = task.kpiDefinitionId ? kpiDefinitions.find(k => k.id === task.kpiDefinitionId) : null;
  const kpiSnap = kpiDef ? kpiSnapshots.find(s => s.userId === task.ownerId && s.kpiDefinitionId === kpiDef.id) : null;

  const childrenProgress = children.length > 0
    ? Math.round(children.reduce((s, c) => s + c.progress, 0) / children.length)
    : merged.progress;

  const updateTask = (updates: Partial<Task>) => {
    setTaskData(prev => ({ ...prev, [task.id]: { ...prev[task.id], ...updates } }));
  };

  return (
    <div className="animate-fade-in">
      {/* Back + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={() => router.push('/tasks')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} color="var(--gray-500)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--gray-400)', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/tasks')}>Tasks</span>
          {ancestors.map(a => (
            <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronRight size={14} />
              <span style={{ cursor: 'pointer', color: 'var(--gray-500)' }} onClick={() => router.push(`/tasks/${a.id}`)}>{a.title.length > 30 ? a.title.slice(0, 30) + '...' : a.title}</span>
            </span>
          ))}
          <ChevronRight size={14} />
          <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{merged.title.length > 40 ? merged.title.slice(0, 40) + '...' : merged.title}</span>
        </div>
      </div>

      {/* Header */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className={`status-chip ${getStatusClass(merged.status)}`}>{getStatusLabel(merged.status)}</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: merged.category === 'kpi' ? 'var(--isme-red-50)' : 'var(--gray-100)', color: merged.category === 'kpi' ? 'var(--isme-red)' : 'var(--gray-500)', fontWeight: 600 }}>
                {merged.category === 'kpi' ? '📊 KPI' : '📌 Phát sinh'}
              </span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--gray-100)', color: 'var(--gray-500)' }}>
                {getFreqLabel(merged.frequency)}
              </span>
              {merged.issueFlag && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>⚠ Có vấn đề</span>}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{merged.title}</h1>
            {merged.description && <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.5, margin: 0 }}>{merged.description}</p>}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: isOverdue ? 'var(--danger)' : merged.status === 'DONE' ? 'var(--success)' : 'var(--gray-700)' }}>
              {merged.status === 'DONE' ? '✓' : isOverdue ? `${Math.abs(days)}d` : `${days}d`}
            </div>
            <div style={{ fontSize: 12, color: isOverdue ? 'var(--danger)' : 'var(--gray-400)' }}>
              {merged.status === 'DONE' ? 'Hoàn thành' : isOverdue ? 'quá hạn' : 'còn lại'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: children.length > 0 ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Left: Info */}
        <div>
          {/* Info Grid */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Thông tin</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: <User size={14} />, label: 'Người thực hiện', value: owner?.name },
                { icon: <Tag size={14} />, label: 'Chương trình', value: program?.name },
                { icon: <Calendar size={14} />, label: 'Deadline', value: new Date(merged.dueDate).toLocaleDateString('vi-VN') },
                { icon: <Clock size={14} />, label: 'Tạo lúc', value: new Date(merged.createdAt).toLocaleDateString('vi-VN') },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ color: 'var(--gray-400)', marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Tiến độ</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="progress-bar" style={{ flex: 1, height: 12, borderRadius: 6 }}>
                <div className="progress-bar-fill" style={{ width: `${childrenProgress}%`, background: isOverdue ? 'var(--danger)' : 'var(--isme-red)', borderRadius: 6, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, minWidth: 50 }}>{childrenProgress}%</span>
            </div>
            {children.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                Tổng hợp từ {children.length} nhiệm vụ con · {children.filter(c => c.status === 'DONE').length} hoàn thành
              </div>
            )}
            {children.length === 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {[10, 25, 50].map(inc => (
                  <button key={inc} className="btn btn-sm btn-secondary" onClick={() => updateTask({ progress: Math.min(100, merged.progress + inc) })}>
                    +{inc}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status buttons */}
          {children.length === 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Trạng thái</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'] as TaskStatus[]).map(s => (
                  <button key={s} className={`status-chip ${getStatusClass(s)}`}
                    onClick={() => updateTask({ status: s, ...(s === 'DONE' ? { progress: 100 } : {}) })}
                    style={{ cursor: 'pointer', border: 'none', outline: merged.status === s ? '2px solid var(--gray-800)' : 'none', outlineOffset: 2 }}>
                    {getStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* KPI Link */}
          {kpiDef && (
            <div className="card" style={{ marginBottom: 20, borderTop: '3px solid var(--isme-red)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Target size={16} color="var(--isme-red)" />
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Liên kết KPI</h3>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{kpiDef.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>{kpiDef.description}</div>
              {kpiSnap && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: kpiSnap.score >= 80 ? 'var(--success)' : kpiSnap.score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                    {kpiSnap.score}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{kpiSnap.rawNumerator}/{kpiSnap.rawDenominator} · Trọng số {kpiDef.weight}%</div>
                </div>
              )}
            </div>
          )}

          {/* Evidence */}
          {merged.requiresEvidence && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Minh chứng</h3>
              {merged.evidenceUrl ? (
                <div style={{ padding: '10px 14px', background: 'var(--success-light)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#047857', fontWeight: 500 }}>✅ Đã upload</span>
                  <a href={merged.evidenceUrl} target="_blank" style={{ fontSize: 12, color: 'var(--info)' }}><ExternalLink size={14} /></a>
                </div>
              ) : (
                <button className="btn btn-secondary" onClick={() => updateTask({ evidenceUrl: 'https://drive.google.com/mock' })}>
                  <Upload size={16} /> Upload file / Paste link
                </button>
              )}
            </div>
          )}

          {/* Issue */}
          {merged.issueFlag && merged.issueNote && (
            <div className="card" style={{ background: 'var(--danger-light)', borderColor: 'var(--danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Flag size={16} color="var(--danger)" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#B91C1C', margin: 0 }}>Vấn đề</h3>
              </div>
              <p style={{ fontSize: 13, color: '#B91C1C', margin: 0 }}>{merged.issueNote}</p>
            </div>
          )}
        </div>

        {/* Right: Children Table */}
        {children.length > 0 && (
          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                  <Layers size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Nhiệm vụ con ({children.length})
                </h3>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  {children.filter(c => c.status === 'DONE').length}/{children.length} hoàn thành
                </div>
              </div>
              {children.map(child => {
                const cd = getDaysUntil(child.dueDate);
                const co = child.status !== 'DONE' && cd < 0;
                const subChildren = getTaskChildren(child.id);
                return (
                  <div key={child.id} onClick={() => router.push(`/tasks/${child.id}`)}
                    style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-50)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className={`status-chip ${getStatusClass(child.status)}`} style={{ fontSize: 10 }}>{getStatusLabel(child.status)}</span>
                      {subChildren.length > 0 && <span style={{ fontSize: 10, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '1px 6px', borderRadius: 4 }}>{subChildren.length} con</span>}
                      {child.issueFlag && <span style={{ fontSize: 10, color: 'var(--danger)' }}>⚠</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{child.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="progress-bar" style={{ flex: 1, height: 4 }}>
                        <div className="progress-bar-fill" style={{ width: `${child.progress}%`, background: co ? 'var(--danger)' : 'var(--info)' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}>{child.progress}%</span>
                      <span style={{ fontSize: 11, color: co ? 'var(--danger)' : cd <= 3 ? 'var(--warning)' : 'var(--gray-400)', fontWeight: 600 }}>
                        {child.status === 'DONE' ? '✓' : co ? `−${Math.abs(cd)}d` : `${cd}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
