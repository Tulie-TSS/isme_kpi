'use client';
import { getProgramById, getUserById } from '@/lib/mock-data';
import type { Task } from '@/lib/types';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getStatusColor(s: string) {
  return s === 'TODO' ? '#9CA3AF' : s === 'IN_PROGRESS' ? '#3B82F6' : s === 'DONE' ? '#10B981' : '#EF4444';
}

interface Props {
  tasks: Task[];
  isManager: boolean;
  onTaskClick: (t: Task) => void;
}

type CalMode = 'month' | 'week';

export default function CalendarView({ tasks, isManager, onTaskClick }: Props) {
  const [calMode, setCalMode] = useState<CalMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Navigation
  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (calMode === 'month') d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  // Get days for month view
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    const days: { date: Date; inMonth: boolean }[] = [];
    // Prev month fill
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, inMonth: false });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), inMonth: true });
    }
    // Next month fill (fill to 42 = 6 rows)
    while (days.length < 42) {
      const d = new Date(year, month + 1, days.length - daysInMonth - startDow + 1);
      days.push({ date: d, inMonth: false });
    }
    return days;
  }, [currentDate, calMode]);

  // Get days for week view
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dow = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dow + 1); // Start from Monday
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const wd = new Date(startOfWeek);
      wd.setDate(startOfWeek.getDate() + i);
      days.push(wd);
    }
    return days;
  }, [currentDate, calMode]);

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayNamesFull = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const headerTitle = calMode === 'month'
    ? currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : `${weekDays[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} — ${weekDays[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  return (
    <div>
      {/* Calendar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-secondary" style={{ padding: 6 }}>
            <ChevronLeft size={18} />
          </button>
          <h3 style={{ fontSize: 16, fontWeight: 700, minWidth: 200, textAlign: 'center', textTransform: 'capitalize' }}>{headerTitle}</h3>
          <button onClick={() => navigate(1)} className="btn btn-sm btn-secondary" style={{ padding: 6 }}>
            <ChevronRight size={18} />
          </button>
          <button onClick={goToday} className="btn btn-sm btn-secondary">Hôm nay</button>
        </div>
        <div className="tab-bar" style={{ background: 'var(--gray-100)' }}>
          <button className={`tab-item ${calMode === 'month' ? 'active' : ''}`} onClick={() => setCalMode('month')}>Tháng</button>
          <button className={`tab-item ${calMode === 'week' ? 'active' : ''}`} onClick={() => setCalMode('week')}>Tuần</button>
        </div>
      </div>

      {/* Month View */}
      {calMode === 'month' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Day name headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--gray-200)' }}>
            {[1, 2, 3, 4, 5, 6, 0].map(i => (
              <div key={i} style={{
                padding: '10px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600,
                color: i === 0 || i === 6 ? 'var(--gray-400)' : 'var(--gray-600)',
                background: 'var(--gray-50)',
              }}>
                {dayNames[i]}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {monthDays.map((cell, idx) => {
              const dateStr = cell.date.toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              const dayTasks = getTasksForDate(cell.date);
              const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

              return (
                <div key={idx} style={{
                  minHeight: 90, padding: '4px 6px', borderBottom: '1px solid var(--gray-100)',
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--gray-100)' : 'none',
                  background: isToday ? 'var(--isme-red-50)' : isWeekend ? 'var(--gray-50)' : 'white',
                  opacity: cell.inMonth ? 1 : 0.4,
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: isToday ? 700 : 500, marginBottom: 4,
                    color: isToday ? 'white' : 'var(--gray-500)',
                    textAlign: 'center',
                    ...(isToday ? {
                      width: 24, height: 24, lineHeight: '24px',
                      borderRadius: '50%', background: 'var(--isme-red)',
                      margin: '0 auto 4px',
                    } : {}),
                  }}>
                    {cell.date.getDate()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayTasks.slice(0, 3).map(task => {
                      const isOverdue = task.status !== 'DONE';
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                          style={{
                            fontSize: 10, padding: '2px 5px', borderRadius: 4,
                            background: getStatusColor(task.status) + '18',
                            color: 'var(--gray-700)', cursor: 'pointer',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontWeight: 500,
                          }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <div style={{ fontSize: 10, color: 'var(--gray-400)', paddingLeft: 5 }}>
                        +{dayTasks.length - 3} thêm
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {calMode === 'week' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {weekDays.map((date, i) => {
              const dateStr = date.toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              const dayTasks = getTasksForDate(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div key={i} style={{
                  borderRight: i < 6 ? '1px solid var(--gray-200)' : 'none',
                  minHeight: 400,
                  background: isToday ? 'var(--isme-red-50)' : isWeekend ? 'var(--gray-50)' : 'white',
                }}>
                  {/* Day header */}
                  <div style={{
                    padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid var(--gray-200)',
                    background: isToday ? 'var(--isme-red)' : 'var(--gray-50)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isToday ? 'rgba(255,255,255,0.7)' : 'var(--gray-400)', marginBottom: 2 }}>
                      {dayNamesFull[date.getDay()]}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: isToday ? 'white' : 'var(--gray-700)' }}>
                      {date.getDate()}
                    </div>
                    <div style={{ fontSize: 10, color: isToday ? 'rgba(255,255,255,0.6)' : 'var(--gray-400)' }}>
                      Tháng {date.getMonth() + 1}
                    </div>
                  </div>
                  {/* Tasks */}
                  <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {dayTasks.map(task => {
                      const program = getProgramById(task.programId);
                      const owner = getUserById(task.ownerId);
                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          style={{
                            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                            background: 'white', border: '1px solid var(--gray-200)',
                            transition: 'box-shadow 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                            {task.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'var(--isme-red-50)', color: 'var(--isme-red)', fontWeight: 600 }}>
                              {program?.shortName}
                            </span>
                            {task.status !== 'DONE' && (
                              <div className="progress-bar" style={{ flex: 1, height: 3 }}>
                                <div className="progress-bar-fill" style={{ width: `${task.progress}%`, background: getStatusColor(task.status) }} />
                              </div>
                            )}
                          </div>
                          {isManager && owner && (
                            <div style={{ fontSize: 9, color: 'var(--gray-400)', marginTop: 4 }}>
                              {owner.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayTasks.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--gray-200)', fontSize: 11, paddingTop: 20 }}>—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
