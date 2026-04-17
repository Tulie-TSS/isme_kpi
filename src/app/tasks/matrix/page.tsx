'use client';
import { useApp } from '@/lib/context';
import { tasks, getTaskChildren, getProgramById, getUserById, kpiDefinitions } from '@/lib/mock-data';
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '@/lib/types';

function getStatusColor(s: string) {
  return s === 'TODO' ? '#9CA3AF' : s === 'IN_PROGRESS' ? '#3B82F6' : s === 'DONE' ? '#10B981' : '#EF4444';
}
function getStatusLabel(s: string) {
  return s === 'TODO' ? 'Cần làm' : s === 'IN_PROGRESS' ? 'Đang làm' : s === 'DONE' ? 'Hoàn thành' : 'Bị chặn';
}
function getStatusClass(s: string) {
  return s === 'TODO' ? 'status-todo' : s === 'IN_PROGRESS' ? 'status-in-progress' : s === 'DONE' ? 'status-done' : 'status-blocked';
}

export default function MatrixPage() {
  const { currentRole, currentUserId } = useApp();
  const router = useRouter();
  const isManager = currentRole === 'manager' || currentRole === 'admin';
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filterCat, setFilterCat] = useState<'all' | 'kpi' | 'adhoc'>('all');

  // Get top-level tasks
  const topLevel = tasks.filter(t => {
    if (t.parentId) return false;
    if (!isManager && t.ownerId !== currentUserId) return false;
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    return true;
  });

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const renderRow = (task: Task, level: number) => {
    const children = getTaskChildren(task.id);
    const isExp = expanded[task.id];
    const program = getProgramById(task.programId);
    const owner = getUserById(task.ownerId);
    const kpi = task.kpiDefinitionId ? kpiDefinitions.find(k => k.id === task.kpiDefinitionId) : null;
    const days = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000);
    const isOverdue = task.status !== 'DONE' && days < 0;

    return (
      <div key={task.id}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px 110px 60px',
          alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--gray-50)',
          background: level === 0 ? 'var(--gray-50)' : level === 1 ? 'white' : 'white',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,27,48,0.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = level === 0 ? 'var(--gray-50)' : 'white'; }}
        >
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: level * 24 }}>
            {children.length > 0 ? (
              <button onClick={() => toggle(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--gray-400)', transition: 'transform 0.2s ease', transform: isExp ? 'rotate(0deg)' : 'rotate(0deg)', borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {isExp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : <div style={{ width: 20 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: level === 0 ? 14 : 13, fontWeight: level === 0 ? 700 : level === 1 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => router.push(`/tasks/${task.id}`)}>
                {task.title}
              </div>
              {level === 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: task.category === 'kpi' ? 'var(--isme-red-50)' : 'var(--gray-100)', color: task.category === 'kpi' ? 'var(--isme-red)' : 'var(--gray-500)', fontWeight: 600 }}>
                    {task.category === 'kpi' ? 'KPI' : 'Phát sinh'}
                  </span>
                  {kpi && <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>→ {kpi.shortName}</span>}
                  {children.length > 0 && <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{children.length} nhóm con</span>}
                </div>
              )}
            </div>
          </div>

          {/* Program */}
          <div style={{ fontSize: 11 }}>
            <span style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--isme-red-50)', color: 'var(--isme-red)', fontWeight: 600 }}>{program?.shortName}</span>
          </div>

          {/* Status */}
          <div><span className={`status-chip ${getStatusClass(task.status)}`} style={{ fontSize: 10 }}>{getStatusLabel(task.status)}</span></div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="progress-bar" style={{ flex: 1, height: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${task.progress}%`, background: isOverdue ? 'var(--danger)' : getStatusColor(task.status) }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}>{task.progress}%</span>
          </div>

          {/* Deadline */}
          <div style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'var(--gray-500)', fontWeight: isOverdue ? 700 : 400 }}>
            {new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            {task.status !== 'DONE' && <span style={{ marginLeft: 4 }}>({isOverdue ? `-${Math.abs(days)}d` : `${days}d`})</span>}
          </div>

          {/* Detail link */}
          <div>
            <button onClick={() => router.push(`/tasks/${task.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--gray-400)' }}>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExp && children.map(child => renderRow(child, level + 1))}
      </div>
    );
  };

  const kpiTasks = topLevel.filter(t => t.category === 'kpi');
  const adhocTasks = topLevel.filter(t => t.category === 'adhoc');
  const totalProgress = topLevel.length > 0 ? Math.round(topLevel.reduce((s, t) => s + t.progress, 0) / topLevel.length) : 0;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Ma trận công việc</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>Truy xuất 2 chiều: Nhiệm vụ lớn → Cụm → Nhiệm vụ con</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 10, padding: 3 }}>
          {[{ key: 'all' as const, label: 'Tất cả' }, { key: 'kpi' as const, label: 'KPI' }, { key: 'adhoc' as const, label: 'Phát sinh' }].map(f => (
            <button key={f.key} onClick={() => setFilterCat(f.key)}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: filterCat === f.key ? 'white' : 'transparent', color: filterCat === f.key ? 'var(--gray-800)' : 'var(--gray-500)', boxShadow: filterCat === f.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Tổng nhiệm vụ lớn', value: topLevel.length, color: 'var(--gray-700)' },
          { label: 'Nhiệm vụ KPI', value: kpiTasks.length, color: 'var(--isme-red)' },
          { label: 'Phát sinh / Kiêm nhiệm', value: adhocTasks.length, color: '#D97706' },
          { label: 'Tiến độ chung', value: `${totalProgress}%`, color: totalProgress >= 70 ? 'var(--success)' : 'var(--warning)' },
        ].map((card, i) => (
          <div key={i} className="card card-compact" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4, textAlign: 'center' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px 110px 60px', padding: '10px 16px', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>NHIỆM VỤ</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>CT</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>TRẠNG THÁI</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>TIẾN ĐỘ</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>DEADLINE</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}></span>
        </div>
        {topLevel.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Không có task nào</div>
        ) : (
          topLevel.map(task => renderRow(task, 0))
        )}
      </div>
    </div>
  );
}
