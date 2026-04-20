'use client';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { getUserById, getNotificationsByUser, users, programs } from '@/lib/mock-data';
import { Bell, Menu, ChevronDown, AlertTriangle, CheckCircle, Info, ArrowUpRight, Clock, X, Filter, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Role, Notification } from '@/lib/types';

const roleLabels: Record<Role, string> = { staff: 'Nhân viên', manager: 'Quản lý', admin: 'Admin' };
const roleColors: Record<Role, string> = { staff: '#3B82F6', manager: '#8B5CF6', admin: '#EF4444' };

const priorityConfig = {
  urgent: { bg: '#FEF2F2', border: '#FECACA', icon: '🔴', label: 'Khẩn cấp' },
  high: { bg: '#FFF7ED', border: '#FED7AA', icon: '🟠', label: 'Quan trọng' },
  medium: { bg: '#EFF6FF', border: '#BFDBFE', icon: '🔵', label: 'Thông thường' },
  low: { bg: '#F0FDF4', border: '#BBF7D0', icon: '🟢', label: 'Tham khảo' },
};

const categoryFilter = [
  { key: 'all', label: 'Tất cả' },
  { key: 'task', label: 'Công việc' },
  { key: 'kpi', label: 'KPI' },
  { key: 'review', label: 'Đánh giá' },
  { key: 'system', label: 'Hệ thống' },
];

export default function Header() {
  const { currentRole, setCurrentRole, currentUserId, setCurrentUserId, setSidebarOpen, selectedProgramId, setSelectedProgramId } = useApp();
  const { user: authUser, logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [notifCategory, setNotifCategory] = useState('all');
  const [readState, setReadState] = useState<Record<string, boolean>>({});
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = getUserById(currentUserId);
  const allNotifs = getNotificationsByUser(currentUserId);
  const notifs = allNotifs.map(n => ({ ...n, read: readState[n.id] ?? n.read }));
  const unreadCount = notifs.filter(n => !n.read).length;
  const filteredNotifs = notifCategory === 'all' ? notifs : notifs.filter(n => n.category === notifCategory);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) { setShowNotif(false); setSelectedNotif(null); }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRoleSwitch = (role: Role) => {
    setCurrentRole(role);
    if (role === 'manager') setCurrentUserId('u1');
    else if (role === 'admin') setCurrentUserId('u0');
    else setCurrentUserId(authUser?.id || 'u9');
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    router.replace('/login');
  };

  const markRead = (id: string) => setReadState(prev => ({ ...prev, [id]: true }));
  const markAllRead = () => { const update: Record<string, boolean> = {}; notifs.forEach(n => { update[n.id] = true; }); setReadState(prev => ({ ...prev, ...update })); };

  const selectedProgram = programs.find(p => p.id === selectedProgramId);
  const programManager = selectedProgram ? getUserById(selectedProgram.managerId) : null;
  const initials = user ? user.name.split(' ').slice(-2).map(w => w[0]).join('') : '??';
  const avatarColors = ['#9B1B30', '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#4F46E5', '#BE185D', '#65A30D', '#EA580C', '#6D28D9'];
  const colorIndex = currentUserId ? parseInt(currentUserId.replace('u', ''), 10) % avatarColors.length : 0;

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
  };

  return (
    <header className="header" style={{ height: 'auto', minHeight: 70, padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Menu size={22} color="var(--gray-600)" />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>
            {currentRole === 'staff' ? 'Việc của tôi' : currentRole === 'manager' ? 'Quản lý đội ngũ' : 'Quản trị hệ thống'}
          </h2>
          {/* Program Filter & Manager for Leadership */}
          {(currentRole === 'manager' || currentRole === 'admin') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} color="var(--isme-red)" />
                <select 
                  value={selectedProgramId} 
                  onChange={e => setSelectedProgramId(e.target.value)}
                  style={{ 
                    border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, 
                    color: 'var(--isme-red)', cursor: 'pointer', paddingRight: 20, outline: 'none',
                    appearance: 'none', WebkitAppearance: 'none'
                  }}
                >
                  <option value="all">Tất cả các hệ đào tạo</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} color="var(--isme-red)" style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
              </div>
              
              {selectedProgramId !== 'all' && programManager && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(5,150,105,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    <ShieldCheck size={12} color="#059669" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>Người phụ trách: {programManager.name}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Role indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 8,
          background: 'var(--gray-100)', fontSize: 12, fontWeight: 600,
          color: roleColors[currentRole]
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: roleColors[currentRole] }} />
          {roleLabels[currentRole]}
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotif(!showNotif); setSelectedNotif(null); }}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, transition: 'background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; const bell = e.currentTarget.querySelector('svg'); if (bell) bell.style.animation = 'bell-ring 0.6s ease-in-out'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; const bell = e.currentTarget.querySelector('svg'); if (bell) bell.style.animation = 'none'; }}
          >
            <Bell size={20} color="var(--gray-500)" style={{ transition: 'color 0.15s' }} />
            {unreadCount > 0 && (
              <span className="badge" style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, fontSize: 10, padding: '0 4px', animation: 'pulse-soft 2s ease-in-out infinite' }}>{unreadCount}</span>
            )}
          </button>
          {showNotif && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 440, maxHeight: 560, background: 'white', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', border: '1px solid var(--gray-100)', zIndex: 100, display: 'flex', flexDirection: 'column' }} className="animate-scale-in">
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Thông báo</span>
                  {unreadCount > 0 && <span style={{ fontSize: 11, background: 'var(--isme-red)', color: 'white', padding: '1px 8px', borderRadius: 8, fontWeight: 600 }}>{unreadCount} mới</span>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--isme-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Đọc tất cả
                  </button>
                )}
              </div>

              {/* Category Tabs */}
              <div style={{ display: 'flex', gap: 4, padding: '8px 16px', borderBottom: '1px solid var(--gray-100)', overflowX: 'auto' }}>
                {categoryFilter.map(cf => (
                  <button key={cf.key} onClick={() => setNotifCategory(cf.key)}
                    style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1.2, background: notifCategory === cf.key ? 'var(--isme-red)' : 'var(--gray-100)', color: notifCategory === cf.key ? 'white' : 'var(--gray-500)' }}>
                    {cf.label}
                  </button>
                ))}
              </div>

              {/* Detail View or List */}
              {selectedNotif ? (
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  <button onClick={() => setSelectedNotif(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12 }}>
                    ← Quay lại
                  </button>
                  <div style={{ padding: 16, borderRadius: 12, background: priorityConfig[selectedNotif.priority]?.bg || '#F3F4F6', border: `1px solid ${priorityConfig[selectedNotif.priority]?.border || '#E5E7EB'}`, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span>{priorityConfig[selectedNotif.priority]?.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)' }}>{priorityConfig[selectedNotif.priority]?.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 'auto' }}>{timeAgo(selectedNotif.createdAt)}</span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{selectedNotif.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, margin: 0 }}>{selectedNotif.message}</p>
                  </div>
                  {selectedNotif.actionUrl && (
                    <button onClick={() => { router.push(selectedNotif.actionUrl!); setShowNotif(false); }} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <ArrowUpRight size={16} /> {selectedNotif.actionLabel || 'Xem chi tiết'}
                    </button>
                  )}
                  {selectedNotif.taskId && (
                    <button onClick={() => { router.push(`/tasks/${selectedNotif.taskId}`); setShowNotif(false); }} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                      Mở task liên quan
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {filteredNotifs.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>Không có thông báo</div>
                  ) : (
                    filteredNotifs.map(n => (
                      <div key={n.id} onClick={() => { setSelectedNotif(n); markRead(n.id); }}
                        style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-50)', cursor: 'pointer', background: n.read ? 'white' : 'rgba(155,27,48,0.03)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'white' : 'rgba(155,27,48,0.03)'; }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 14, marginTop: 2 }}>{priorityConfig[n.priority]?.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                              <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700 }}>{n.title}</span>
                              {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--isme-red)', flexShrink: 0 }} />}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{timeAgo(n.createdAt)}</span>
                              {n.actionLabel && <span style={{ fontSize: 10, color: 'var(--isme-red)', fontWeight: 600 }}>{n.actionLabel} →</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu with Logout */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: 10,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="avatar" style={{ background: avatarColors[colorIndex] }}>{initials}</div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
              <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{user?.position}</span>
            </div>
            <ChevronDown size={14} color="var(--gray-400)" />
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 8,
              background: 'white', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid var(--gray-100)',
              overflow: 'hidden', minWidth: 240, zIndex: 100
            }} className="animate-scale-in">
              {/* User info */}
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ background: avatarColors[colorIndex], width: 40, height: 40, fontSize: 16 }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{user?.email}</div>
                  </div>
                </div>
              </div>

              {/* Role switch (admin only can switch roles for demo) */}
              {authUser?.role === 'admin' && (
                <>
                  <div style={{ padding: '8px 16px 4px', fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>Chuyển vai trò</div>
                  {(['staff', 'manager', 'admin'] as Role[]).map(role => (
                    <button key={role} onClick={() => handleRoleSwitch(role)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 16px', border: 'none',
                        background: currentRole === role ? 'var(--gray-50)' : 'white',
                        cursor: 'pointer', fontSize: 13, textAlign: 'left'
                      }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: roleColors[role] }} />
                      <span style={{ fontWeight: currentRole === role ? 600 : 400 }}>{roleLabels[role]}</span>
                    </button>
                  ))}
                </>
              )}

              {/* Logout */}
              <div style={{ borderTop: '1px solid var(--gray-100)' }}>
                <button onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '12px 16px', border: 'none', background: 'white',
                    cursor: 'pointer', fontSize: 13, color: '#DC2626', fontWeight: 600,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
