'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { tasks as allTasksData, getProgramById, getUserById, users, programs } from '@/lib/mock-data';
import { Search, X, Upload, Flag, Save, List, Columns3, GanttChart, Calendar, ExternalLink, User as UserIcon, AlignLeft, CheckSquare, MessageSquare, Tag, AlertCircle, Calendar as CalendarIcon, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Task, TaskStatus } from '@/lib/types';
import KanbanView from '@/components/tasks/KanbanView';
import GanttView from '@/components/tasks/GanttView';
import CalendarView from '@/components/tasks/CalendarView';
import ExcelTools from '@/components/tasks/ExcelTools';

type ViewMode = 'list' | 'kanban' | 'gantt' | 'calendar';

const statusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'TODO', label: 'Cần làm' },
  { key: 'IN_PROGRESS', label: 'Đang làm' },
  { key: 'overdue', label: 'Quá hạn' },
  { key: 'DONE', label: 'Hoàn thành' },
  { key: 'BLOCKED', label: 'Bị chặn' },
];

const viewModes: { key: ViewMode; label: string; icon: React.ElementType }[] = [
  { key: 'list', label: 'Danh sách', icon: List },
  { key: 'kanban', label: 'Kanban', icon: Columns3 },
  { key: 'gantt', label: 'Gantt', icon: GanttChart },
  { key: 'calendar', label: 'Lịch', icon: Calendar },
];

function getStatusClass(s: string) {
  return s === 'TODO' ? 'status-todo' : s === 'IN_PROGRESS' ? 'status-in-progress' : s === 'DONE' ? 'status-done' : 'status-blocked';
}
function getStatusLabel(s: string) {
  return s === 'TODO' ? 'Cần làm' : s === 'IN_PROGRESS' ? 'Đang làm' : s === 'DONE' ? 'Hoàn thành' : 'Bị chặn';
}
function getDaysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / 86400000);
}

export default function TasksPage() {
  const { currentRole, currentUserId } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskData, setTaskData] = useState<Record<string, Task>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const isManager = currentRole === 'manager' || currentRole === 'admin';
  const base = isManager ? allTasksData : allTasksData.filter(t => t.ownerId === currentUserId);

  const now = new Date().toISOString().split('T')[0];
  const filtered = base.filter(t => {
    const merged = taskData[t.id] || t;
    if (activeTab === 'overdue') return merged.status !== 'DONE' && merged.dueDate < now;
    if (activeTab !== 'all' && merged.status !== activeTab) return false;
    if (search && !merged.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getTask = (t: Task) => taskData[t.id] || t;

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTaskData(prev => {
      const current = prev[id] || allTasksData.find(t => t.id === id)!;
      return { ...prev, [id]: { ...current, ...updates } };
    });
  };

  const overdueCount = base.filter(t => (taskData[t.id] || t).status !== 'DONE' && t.dueDate < now).length;

  const handleTaskClick = (task: Task) => setSelectedTask(task);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Task {isManager ? 'Team' : 'của tôi'}</h1>
        {/* View Mode Switcher */}
        <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 10, padding: 3 }}>
          {viewModes.map(vm => {
            const Icon = vm.icon;
            const isActive = viewMode === vm.key;
            return (
              <button
                key={vm.key}
                onClick={() => setViewMode(vm.key)}
                title={vm.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? 'var(--isme-red)' : 'var(--gray-400)',
                  fontWeight: isActive ? 600 : 400, fontSize: 13,
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{vm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Excel Import/Export */}
      <ExcelTools userId={currentUserId} isManager={isManager} />

      {/* Tabs + Search (show for all views) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="tab-bar">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key === 'overdue' && overdueCount > 0 && (
                <span style={{ marginLeft: 4, background: 'var(--danger)', color: 'white', borderRadius: 8, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200, position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text" placeholder="Tìm task..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none', background: 'white' }}
          />
        </div>
      </div>

      {/* VIEW: List */}
      {viewMode === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>Không có task nào</div>
          ) : filtered.map((t, idx) => {
            const task = getTask(t);
            const days = getDaysUntil(task.dueDate);
            const program = getProgramById(task.programId);
            const owner = getUserById(task.ownerId);
            const isOverdue = task.status !== 'DONE' && days < 0;
            const dotColor = task.status === 'DONE' ? '#10B981' : task.status === 'BLOCKED' ? '#EF4444' : task.status === 'IN_PROGRESS' ? '#3B82F6' : '#D1D5DB';
            const glowColor = task.status === 'DONE' ? 'rgba(16,185,129,0.06)' : task.status === 'BLOCKED' ? 'rgba(239,68,68,0.05)' : task.status === 'IN_PROGRESS' ? 'rgba(59,130,246,0.04)' : 'transparent';
            return (
              <div key={task.id} onClick={() => handleTaskClick(task)}
                style={{
                  padding: '16px 20px 16px 16px', borderBottom: '1px solid var(--gray-100)',
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                  background: isOverdue ? 'rgba(239,68,68,0.02)' : 'white',
                  transition: 'all 0.2s ease',
                  animation: `fadeIn 0.3s ease-out ${idx * 30}ms both`,
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isOverdue ? 'rgba(239,68,68,0.04)' : '#F8FAFC'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isOverdue ? 'rgba(239,68,68,0.02)' : 'white'; }}
              >
                {/* Status dot indicator */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: dotColor,
                  boxShadow: `0 0 0 3px ${glowColor}, 0 0 8px ${glowColor}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className={`status-chip ${getStatusClass(task.status)}`} style={{ fontSize: 11 }}>{getStatusLabel(task.status)}</span>
                    <span style={{ fontSize: 11, color: 'var(--isme-red)', fontWeight: 600, background: 'var(--isme-red-50)', padding: '2px 8px', borderRadius: 6 }}>{program?.shortName}</span>
                    {task.issueFlag && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>⚠ Vấn đề</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {isManager && <span>👤 {owner?.name}</span>}
                    <span>📅 {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                    {task.requiresEvidence && <span>{task.evidenceUrl ? '✅ Evidence' : '📎 Cần evidence'}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {task.status !== 'DONE' && (
                    <div style={{ width: 80 }}>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4, textAlign: 'right' }}>{task.progress}%</div>
                      <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${task.progress}%`, background: isOverdue ? 'var(--danger)' : 'var(--info)' }} /></div>
                    </div>
                  )}
                  <div style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', color: task.status === 'DONE' ? 'var(--success)' : isOverdue ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'var(--gray-500)', background: task.status === 'DONE' ? 'var(--success-light)' : isOverdue ? 'var(--danger-light)' : days <= 3 ? 'var(--warning-light)' : 'var(--gray-100)' }}>
                    {task.status === 'DONE' ? '✓ Done' : isOverdue ? `−${Math.abs(days)}d` : `${days}d`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: Kanban */}
      {viewMode === 'kanban' && <KanbanView tasks={filtered} isManager={isManager} onTaskClick={handleTaskClick} />}

      {/* VIEW: Gantt */}
      {viewMode === 'gantt' && <GanttView tasks={filtered} isManager={isManager} onTaskClick={handleTaskClick} />}

      {/* VIEW: Calendar */}
      {viewMode === 'calendar' && <CalendarView tasks={filtered} isManager={isManager} onTaskClick={handleTaskClick} />}

      {/* Quick Update Slide-over */}
      {selectedTask && (() => {
        const task = getTask(selectedTask);
        const owner = getUserById(task.ownerId);
        const program = getProgramById(task.programId);
        return (
          <>
            <div className="overlay" onClick={() => setSelectedTask(null)} />
            <div className="slide-over">
              {/* HEADER */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Cập nhật task</h3>
                <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} color="var(--gray-400)" /></button>
              </div>

              {/* BODY */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#FAFAFA' }}>
                {/* Title & Core Meta (Property List Layout) */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', marginBottom: 24, overflow: 'hidden' }}>
                  <div style={{ padding: '24px 24px 16px' }}>
                    <input type="text" value={task.title} onChange={e => { updateTask(task.id, { title: e.target.value }); setSelectedTask({ ...task, title: e.target.value }); }} style={{ width: '100%', fontSize: 20, fontWeight: 800, border: 'none', outline: 'none', background: 'transparent', marginBottom: 24, color: 'var(--gray-900)' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Người phụ trách */}
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
                        <div style={{ width: 140, fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><UserIcon size={14} /> Người phụ trách</div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                          <div className="avatar" style={{ width: 24, height: 24, fontSize: 11, background: 'var(--isme-red)' }}>{owner?.name.charAt(0)}</div>
                          {owner?.name}
                        </div>
                      </div>
                      
                      {/* Hạn chót */}
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
                        <div style={{ width: 140, fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><CalendarIcon size={14} /> Hạn chót</div>
                        <div style={{ flex: 1 }}>
                          <input type="date" value={task.dueDate} onChange={e => { updateTask(task.id, { dueDate: e.target.value }); setSelectedTask({ ...task, dueDate: e.target.value }); }} disabled={!isManager} style={{ fontSize: 13, padding: '4px 8px', marginLeft: -8, borderRadius: 6, border: '1px solid transparent', outline: 'none', background: 'transparent', fontWeight: 600, color: 'var(--gray-900)', transition: 'background 0.15s', cursor: isManager ? 'pointer' : 'default' }} onFocus={e => e.target.style.background = 'var(--gray-50)'} onBlur={e => e.target.style.background = 'transparent'} />
                        </div>
                      </div>

                      {/* Chương trình */}
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
                        <div style={{ width: 140, fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><Tag size={14} /> Chương trình</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--isme-red)', background: 'var(--isme-red-50)', padding: '4px 10px', borderRadius: 6 }}>{program?.shortName}</span>
                        </div>
                      </div>

                      {/* Độ ưu tiên */}
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
                        <div style={{ width: 140, fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><AlertCircle size={14} /> Độ ưu tiên</div>
                        <div style={{ flex: 1 }}>
                          <select value={task.priority || 'medium'} onChange={e => { updateTask(task.id, { priority: e.target.value as any }); setSelectedTask({ ...task, priority: e.target.value as any }); }} disabled={!isManager} style={{ fontSize: 13, padding: '4px 8px', marginLeft: -8, borderRadius: 6, border: '1px solid transparent', outline: 'none', background: 'transparent', fontWeight: 600, color: task.priority === 'high' ? '#DC2626' : task.priority === 'low' ? '#10B981' : '#F59E0B', cursor: isManager ? 'pointer' : 'default' }}>
                            <option value="high" style={{ color: '#DC2626' }}>🔥 Cao</option>
                            <option value="medium" style={{ color: '#F59E0B' }}>⚡ Trung bình</option>
                            <option value="low" style={{ color: '#10B981' }}>☕ Thấp</option>
                          </select>
                        </div>
                      </div>

                      {/* Trạng thái */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 32 }}>
                        <div style={{ width: 140, fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, marginTop: 4 }}><Columns3 size={14} /> Trạng thái</div>
                        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'] as TaskStatus[]).map(s => (
                            <button key={s}
                              onClick={() => {
                                if (s === 'DONE' && task.requiresEvidence && !task.evidenceUrl) { alert('Cần có link minh chứng trước khi đánh dấu Hoàn thành!'); return; }
                                updateTask(task.id, { status: s, ...(s === 'DONE' ? { progress: 100, completedAt: new Date().toISOString().split('T')[0] } : {}) });
                                setSelectedTask({ ...task, status: s });
                              }}
                              className={`status-chip ${getStatusClass(s)}`}
                              style={{ cursor: 'pointer', border: 'none', outline: task.status === s ? '2px solid var(--gray-800)' : 'none', outlineOffset: 2, padding: '6px 12px', fontSize: 12, textTransform: 'none' }}
                            >{getStatusLabel(s)}</button>
                          ))}
                        </div>
                      </div>

                      {/* Tiến độ */}
                      <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
                        <div style={{ width: 140, fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><GanttChart size={14} /> Tiến độ</div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ flex: 1, maxWidth: 220, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="progress-bar" style={{ flex: 1, height: 6, borderRadius: 3 }}>
                              <div className="progress-bar-fill" style={{ width: `${task.progress}%`, background: 'var(--info)' }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--info)', minWidth: 36 }}>{task.progress}%</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {[10, 25, 50].map(inc => (
                              <button key={inc} onClick={() => { const v = Math.min(100, task.progress + inc); updateTask(task.id, { progress: v }); setSelectedTask({ ...task, progress: v }); }} className="btn btn-sm" style={{ background: 'var(--info-light)', color: '#1D4ED8', padding: '4px 8px', fontSize: 11, height: 26 }}>+{inc}%</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ padding: '20px 24px', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><AlignLeft size={16} color="var(--gray-500)" /> Mô tả chi tiết</div>
                  <textarea value={task.description || ''} onChange={e => { updateTask(task.id, { description: e.target.value }); setSelectedTask({ ...task, description: e.target.value }); }} placeholder="Thêm mô tả chi tiết công việc..." style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 8, border: '1px solid var(--gray-200)', background: 'var(--gray-50)', outline: 'none', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
                </div>

                {/* Subtasks / Checklist */}
                <div style={{ padding: '20px 24px', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><CheckSquare size={16} color="var(--gray-500)" /> Checklist ({task.subtasks?.filter(s => s.completed).length || 0}/{task.subtasks?.length || 0})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {(task.subtasks || []).map(st => (
                      <label key={st.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <input type="checkbox" checked={st.completed} onChange={e => {
                          const newSt = task.subtasks!.map(x => x.id === st.id ? { ...x, completed: e.target.checked } : x);
                          updateTask(task.id, { subtasks: newSt });
                          setSelectedTask({ ...task, subtasks: newSt });
                        }} style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--success)', cursor: 'pointer' }} />
                        <span style={{ flex: 1, textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--gray-400)' : 'var(--gray-800)', lineHeight: 1.5 }}>{st.title}</span>
                        <button onClick={e => {
                          e.preventDefault();
                          const newSt = task.subtasks!.filter(x => x.id !== st.id);
                          updateTask(task.id, { subtasks: newSt });
                          setSelectedTask({ ...task, subtasks: newSt });
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }} title="Xóa"><X size={14} /></button>
                      </label>
                    ))}
                  </div>
                  <input type="text" placeholder="+ Thêm mục checklist (nhấn Enter để lưu)..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px dashed var(--gray-300)', outline: 'none', fontSize: 13, background: 'transparent' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--gray-500)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--gray-300)'} onKeyDown={e => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newSt = [...(task.subtasks || []), { id: `st_${Date.now()}`, title: e.currentTarget.value.trim(), completed: false }];
                      updateTask(task.id, { subtasks: newSt });
                      setSelectedTask({ ...task, subtasks: newSt });
                      e.currentTarget.value = '';
                    }
                  }} />
                </div>

                {/* Evidence & Issue Grid */}
                <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                  <div style={{ flex: 1, padding: '20px 24px', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Minh chứng</div>
                    {!task.requiresEvidence ? (
                      <div style={{ fontSize: 13, color: 'var(--gray-500)', fontStyle: 'italic' }}>Không yêu cầu minh chứng.</div>
                    ) : task.evidenceUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--success-light)', borderRadius: 8 }}>
                        <a href={task.evidenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#047857', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ExternalLink size={14} /> Xem minh chứng
                        </a>
                        <button onClick={() => { updateTask(task.id, { evidenceUrl: null }); setSelectedTask({ ...task, evidenceUrl: null }); }} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: 4 }} title="Xóa minh chứng"><X size={14}/></button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13, background: 'var(--gray-50)', padding: '10px' }} onClick={() => { 
                        const url = window.prompt('Nhập link minh chứng (Google Drive, Docs...):');
                        if (url) {
                          updateTask(task.id, { evidenceUrl: url }); setSelectedTask({ ...task, evidenceUrl: url });
                        }
                      }}>
                        <Upload size={14} /> Tải file / Gắn link
                      </button>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: '20px 24px', background: 'white', borderRadius: 12, border: '1px solid var(--danger-light)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--danger)' }}>Báo cáo vấn đề</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600, color: task.issueFlag ? 'var(--danger)' : 'var(--gray-600)' }}>
                      <input type="checkbox" checked={task.issueFlag} onChange={e => { updateTask(task.id, { issueFlag: e.target.checked }); setSelectedTask({ ...task, issueFlag: e.target.checked }); }} style={{ width: 16, height: 16, accentColor: 'var(--danger)', cursor: 'pointer' }} />
                      <Flag size={14} color={task.issueFlag ? 'var(--danger)' : 'var(--gray-400)'} /> Đánh dấu Blocked
                    </label>
                  </div>
                </div>

                {/* Comments */}
                <div style={{ padding: '20px 24px', background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><MessageSquare size={16} color="var(--gray-500)" /> Thảo luận ({task.comments?.length || 0})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
                    {(task.comments || []).map(c => {
                      const u = getUserById(c.userId);
                      return (
                        <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'var(--gray-200)', color: 'var(--gray-700)' }}>{u?.name.charAt(0) || '?'}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{u?.name || 'Unknown'}</span>
                              <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(c.createdAt).toLocaleDateString('vi-VN')} {new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, background: 'var(--gray-50)', padding: '12px 16px', borderRadius: '0 12px 12px 12px', border: '1px solid var(--gray-100)' }}>{c.content}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'var(--isme-red)', color: 'white' }}>T</div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <textarea id="new-comment" placeholder="Viết bình luận, cập nhật tiến độ..." rows={2} style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: 8, border: '1px solid var(--gray-200)', outline: 'none', fontSize: 13, resize: 'none', fontFamily: 'inherit', background: 'var(--gray-50)' }} onFocus={e => { e.currentTarget.style.borderColor = 'var(--gray-400)'; e.currentTarget.style.background = 'white'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'var(--gray-50)'; }} onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                          e.preventDefault();
                          const newCom = [...(task.comments || []), { id: `c_${Date.now()}`, userId: currentUserId, content: e.currentTarget.value.trim(), createdAt: new Date().toISOString() }];
                          updateTask(task.id, { comments: newCom });
                          setSelectedTask({ ...task, comments: newCom });
                          e.currentTarget.value = '';
                        }
                      }} />
                      <button style={{ position: 'absolute', right: 10, bottom: 12, background: 'var(--isme-red)', border: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'transform 0.15s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'} onClick={() => {
                        const input = document.getElementById('new-comment') as HTMLTextAreaElement;
                        if (input && input.value.trim()) {
                          const newCom = [...(task.comments || []), { id: `c_${Date.now()}`, userId: currentUserId, content: input.value.trim(), createdAt: new Date().toISOString() }];
                          updateTask(task.id, { comments: newCom });
                          setSelectedTask({ ...task, comments: newCom });
                          input.value = '';
                        }
                      }}><Send size={14} style={{ marginLeft: -2 }} /></button>
                    </div>
                  </div>
                </div>

              </div>

              {/* FOOTER */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-200)', background: 'white', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => setSelectedTask(null)} style={{ background: 'var(--gray-100)' }}>Đóng</button>
                <button className="btn btn-primary" onClick={() => setSelectedTask(null)}><Save size={16} /> Lưu thay đổi</button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
