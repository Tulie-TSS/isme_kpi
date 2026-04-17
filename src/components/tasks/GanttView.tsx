'use client';
import { getProgramById, getUserById } from '@/lib/mock-data';
import type { Task } from '@/lib/types';
import { useMemo } from 'react';

function getStatusColor(s: string) {
  return s === 'TODO' ? '#9CA3AF' : s === 'IN_PROGRESS' ? '#3B82F6' : s === 'DONE' ? '#10B981' : '#EF4444';
}
function getStatusLabel(s: string) {
  return s === 'TODO' ? 'Cần làm' : s === 'IN_PROGRESS' ? 'Đang làm' : s === 'DONE' ? 'Hoàn thành' : 'Bị chặn';
}

interface Props {
  tasks: Task[];
  isManager: boolean;
  onTaskClick: (t: Task) => void;
}

export default function GanttView({ tasks, isManager, onTaskClick }: Props) {
  const { sortedTasks, dateRange, dayWidth, totalDays, dayLabels } = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    // Calculate date range: 30 days before earliest to 15 days after latest
    const now = new Date();
    let minDate = new Date(now);
    minDate.setDate(minDate.getDate() - 20);
    let maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 20);

    sorted.forEach(t => {
      const created = new Date(t.createdAt);
      const due = new Date(t.dueDate);
      if (created < minDate) minDate = new Date(created);
      if (due > maxDate) maxDate = new Date(due);
    });

    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 5);

    const total = Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000);
    const dw = Math.max(28, Math.min(40, 1200 / total));

    // Generate day labels
    const labels: { date: Date; label: string; isToday: boolean; isWeekend: boolean; isMonthStart: boolean }[] = [];
    for (let i = 0; i <= total; i++) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + i);
      const today = now.toDateString() === d.toDateString();
      labels.push({
        date: d,
        label: d.getDate().toString(),
        isToday: today,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        isMonthStart: d.getDate() === 1,
      });
    }

    return { sortedTasks: sorted, dateRange: { min: minDate, max: maxDate }, dayWidth: dw, totalDays: total, dayLabels: labels };
  }, [tasks]);

  const getBarPosition = (task: Task) => {
    const createdDate = new Date(task.createdAt);
    const dueDate = new Date(task.dueDate);
    const startOffset = Math.max(0, (createdDate.getTime() - dateRange.min.getTime()) / 86400000);
    const duration = Math.max(1, (dueDate.getTime() - createdDate.getTime()) / 86400000);
    return { left: startOffset * dayWidth, width: duration * dayWidth };
  };

  const getTodayOffset = () => {
    const now = new Date();
    return ((now.getTime() - dateRange.min.getTime()) / 86400000) * dayWidth;
  };

  // Group day labels by month
  const monthHeaders: { label: string; startIdx: number; span: number }[] = [];
  let currentMonth = '';
  dayLabels.forEach((dl, i) => {
    const m = dl.date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
    if (m !== currentMonth) {
      currentMonth = m;
      monthHeaders.push({ label: m, startIdx: i, span: 1 });
    } else {
      monthHeaders[monthHeaders.length - 1].span++;
    }
  });

  const labelAreaWidth = 260;
  const todayOffset = getTodayOffset();

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', minWidth: labelAreaWidth + totalDays * dayWidth + 20 }}>
          {/* Left: Task Labels */}
          <div style={{ width: labelAreaWidth, flexShrink: 0, borderRight: '1px solid var(--gray-200)', zIndex: 2, background: 'white' }}>
            {/* Month header placeholder */}
            <div style={{ height: 28, borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' }} />
            {/* Day header placeholder */}
            <div style={{ height: 32, borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>Task</span>
            </div>
            {/* Task rows */}
            {sortedTasks.map(task => {
              const program = getProgramById(task.programId);
              const owner = getUserById(task.ownerId);
              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  style={{
                    height: 44, borderBottom: '1px solid var(--gray-50)', padding: '0 12px',
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    fontSize: 12,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: getStatusColor(task.status),
                  }} />
                  <span style={{
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    fontWeight: 500, fontSize: 12,
                  }}>
                    {task.title}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--isme-red)', fontWeight: 600, flexShrink: 0 }}>
                    {program?.shortName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Gantt Chart */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Month headers */}
            <div style={{ display: 'flex', height: 28, borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}>
              {monthHeaders.map((m, i) => (
                <div key={i} style={{
                  width: m.span * dayWidth, flexShrink: 0,
                  fontSize: 11, fontWeight: 600, color: 'var(--gray-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRight: '1px solid var(--gray-200)',
                }}>
                  {m.label}
                </div>
              ))}
            </div>

            {/* Day headers */}
            <div style={{ display: 'flex', height: 32, borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
              {dayLabels.map((dl, i) => (
                <div key={i} style={{
                  width: dayWidth, flexShrink: 0,
                  fontSize: 10, fontWeight: dl.isToday ? 700 : 400,
                  color: dl.isToday ? 'white' : dl.isWeekend ? 'var(--gray-300)' : 'var(--gray-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: dl.isToday ? 'var(--isme-red)' : 'transparent',
                  borderRadius: dl.isToday ? 4 : 0,
                }}>
                  {dl.label}
                </div>
              ))}
            </div>

            {/* Task bars */}
            <div style={{ position: 'relative' }}>
              {/* Today line */}
              <div style={{
                position: 'absolute', left: todayOffset, top: 0, bottom: 0,
                width: 2, background: 'var(--isme-red)', zIndex: 1, opacity: 0.5,
              }} />

              {/* Weekend columns */}
              {dayLabels.map((dl, i) => dl.isWeekend ? (
                <div key={`wk-${i}`} style={{
                  position: 'absolute', left: i * dayWidth, top: 0, bottom: 0,
                  width: dayWidth, background: 'rgba(0,0,0,0.015)',
                }} />
              ) : null)}

              {sortedTasks.map(task => {
                const { left, width } = getBarPosition(task);
                const days = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000);
                const isOverdue = task.status !== 'DONE' && days < 0;
                const barColor = isOverdue ? '#EF4444' : getStatusColor(task.status);

                return (
                  <div
                    key={task.id}
                    style={{ height: 44, borderBottom: '1px solid var(--gray-50)', position: 'relative' }}
                  >
                    <div
                      onClick={() => onTaskClick(task)}
                      style={{
                        position: 'absolute', top: 10, left: left + 2, width: Math.max(width - 4, 12),
                        height: 24, borderRadius: 6, cursor: 'pointer',
                        background: barColor + '18', border: `1.5px solid ${barColor}`,
                        display: 'flex', alignItems: 'center', overflow: 'hidden',
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scaleY(1.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                    >
                      {/* Progress fill */}
                      <div style={{
                        height: '100%', width: `${task.progress}%`,
                        background: barColor + '40', borderRadius: '4px 0 0 4px',
                        transition: 'width 0.3s',
                      }} />
                      {width > 60 && (
                        <span style={{
                          position: 'absolute', left: 6, fontSize: 10, fontWeight: 600,
                          color: barColor, whiteSpace: 'nowrap',
                        }}>
                          {task.progress}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Cần làm', color: '#9CA3AF' },
          { label: 'Đang làm', color: '#3B82F6' },
          { label: 'Hoàn thành', color: '#10B981' },
          { label: 'Bị chặn / Quá hạn', color: '#EF4444' },
          { label: 'Hôm nay', color: '#9B1B30' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--gray-500)' }}>
            <span style={{ width: 14, height: 6, borderRadius: 3, background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
