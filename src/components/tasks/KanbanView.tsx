'use client';
import { getProgramById, getUserById } from '@/lib/mock-data';
import type { Task } from '@/lib/types';

function getStatusClass(s: string) {
  return s === 'TODO' ? 'status-todo' : s === 'IN_PROGRESS' ? 'status-in-progress' : s === 'DONE' ? 'status-done' : 'status-blocked';
}
function getStatusLabel(s: string) {
  return s === 'TODO' ? 'Cần làm' : s === 'IN_PROGRESS' ? 'Đang làm' : s === 'DONE' ? 'Hoàn thành' : 'Bị chặn';
}
function getDaysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

const columnConfig = [
  { status: 'TODO', label: 'Cần làm', color: '#6B7280', bg: '#F3F4F6', accent: '#E5E7EB' },
  { status: 'IN_PROGRESS', label: 'Đang làm', color: '#2563EB', bg: '#EFF6FF', accent: '#BFDBFE' },
  { status: 'BLOCKED', label: 'Bị chặn', color: '#DC2626', bg: '#FEF2F2', accent: '#FECACA' },
  { status: 'DONE', label: 'Hoàn thành', color: '#059669', bg: '#ECFDF5', accent: '#A7F3D0' },
];

interface Props {
  tasks: Task[];
  isManager: boolean;
  onTaskClick: (t: Task) => void;
}

export default function KanbanView({ tasks, isManager, onTaskClick }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, minHeight: 500 }}>
      {columnConfig.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        return (
          <div key={col.status} style={{ background: col.bg, borderRadius: 16, padding: 12, minHeight: 400 }}>
            {/* Column Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: col.color }}>{col.label}</span>
              </div>
              <span style={{
                background: col.accent, color: col.color, padding: '2px 10px',
                borderRadius: 10, fontSize: 12, fontWeight: 700,
              }}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {colTasks.map(task => {
                const days = getDaysUntil(task.dueDate);
                const isOverdue = task.status !== 'DONE' && days < 0;
                const program = getProgramById(task.programId);
                const owner = getUserById(task.ownerId);
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    style={{
                      background: 'white', borderRadius: 12, padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--isme-red)', fontWeight: 600, background: 'var(--isme-red-50)', padding: '1px 7px', borderRadius: 5 }}>
                        {program?.shortName}
                      </span>
                      {task.issueFlag && <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>⚠</span>}
                      {isOverdue && (
                        <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 600, background: '#FEE2E2', padding: '1px 6px', borderRadius: 4 }}>
                          {Math.abs(days)}d quá hạn
                        </span>
                      )}
                    </div>
                    {/* Progress */}
                    {task.status !== 'DONE' && task.progress > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div className="progress-bar" style={{ height: 4 }}>
                          <div className="progress-bar-fill" style={{ width: `${task.progress}%`, background: col.color }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)', textAlign: 'right', marginTop: 2 }}>{task.progress}%</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        {new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </span>
                      {isManager && owner && (
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--isme-red)', color: 'white',
                        }}>
                          {owner.name.split(' ').slice(-1)[0][0]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-300)', fontSize: 13 }}>
                  Trống
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
