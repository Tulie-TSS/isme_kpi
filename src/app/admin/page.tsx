'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { 
  Users, Layers, BookOpen, Settings, Plus, Edit3, Trash2, X, 
  Search, ShieldAlert, CheckCircle2, RefreshCw, AlertTriangle, 
  UserPlus, FolderPlus, Grid, ChevronRight, Check, Play, Info, LogIn
} from 'lucide-react';
import { User, Program, Course, KPIDefinition, KPIGroup, Role, UserRole, ProgramType } from '@/lib/types';

// Toast structure
interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function AdminPortal() {
  const { currentRole } = useApp();
  const { user: authUser, impersonate } = useAuth();
  
  // States
  const [users, setUsers] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [kpiDefinitions, setKpiDefinitions] = useState<KPIDefinition[]>([]);
  const [kpiGroups, setKpiGroups] = useState<KPIGroup[]>([]);
  const [kpiSnapshots, setKpiSnapshots] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'programs' | 'courses' | 'classifications'>('overview');
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  // Modals / Dialogs States
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userModalTab, setUserModalTab] = useState<'info' | 'assignments' | 'kpis'>('info');
  
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<KPIGroup | null>(null);

  const [defModalOpen, setDefModalOpen] = useState(false);
  const [editingDef, setEditingDef] = useState<KPIDefinition | null>(null);
  
  // Form values
  const [userForm, setUserForm] = useState({
    id: '', name: '', email: '', role: 'staff' as Role, 
    roles: [] as UserRole[], managerId: '', avatarUrl: '', 
    active: true, position: '',
    assignedPrograms: [] as string[],
    assignedCourses: [] as string[],
    kpiTargets: {} as Record<string, number>
  });
  
  const [programForm, setProgramForm] = useState({
    id: '', name: '', type: 'degree' as ProgramType, 
    status: 'active' as 'active' | 'archived', shortName: '', 
    managerId: '', secondaryManagerId: ''
  });
  
  const [courseForm, setCourseForm] = useState({
    id: '', programId: '', name: '', cohort: '', 
    numLecturers: 1, numStudents: 0, attendanceRate: 1.0, 
    attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0, 
    passTarget: 0.95
  });

  const [groupForm, setGroupForm] = useState({
    id: '', name: '', weight: 10
  });

  const [defForm, setDefForm] = useState({
    id: '', groupId: 'operations', stt: 1, name: '', 
    shortName: '', description: '', criteria: '', 
    unit: '%', weight: 5
  });

  // Toasts / Notifications
  const [toast, setToast] = useState<Toast | null>(null);

  // Fetch data from database
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users || []);
        setPrograms(data.programs || []);
        setCourses(data.courses || []);
        setKpiDefinitions(data.kpiDefinitions || []);
        setKpiGroups(data.kpiGroups || []);
        setKpiSnapshots(data.kpiSnapshots || []);
      } else {
        showToast('error', 'Không thể tải dữ liệu: ' + data.error);
      }
    } catch (err: any) {
      showToast('error', 'Có lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Perform API CRUD Action
  const handleAction = async (action: string, data: any) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });
      const result = await res.json();
      if (result.success) {
        showToast('success', result.message || 'Thực hiện thành công!');
        fetchData();
        return true;
      } else {
        showToast('error', result.error || 'Có lỗi xảy ra!');
        return false;
      }
    } catch (err: any) {
      showToast('error', 'Lỗi kết nối API: ' + err.message);
      return false;
    }
  };

  // Guard access - Only allow admin role
  if (currentRole !== 'admin') {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24, background: '#FEE2E2', 
          color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={40} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Quyền truy cập bị hạn chế
        </h1>
        <p style={{ color: 'var(--gray-500)', maxWidth: 450, fontSize: 15, lineHeight: 1.6 }}>
          Khu vực này chỉ dành cho tài khoản <b>Admin gốc (Root Admin)</b> của hệ thống ISME Ops OS. Bạn không có quyền truy cập trang này.
        </p>
      </div>
    );
  }

  // ==================== USER HANDLERS ====================
  const openAddUser = () => {
    setEditingUser(null);
    setUserModalTab('info');
    setUserForm({
      id: 'u' + (Math.max(...users.map(u => parseInt(u.id.replace('u', '')) || 0)) + 1),
      name: '', email: '', role: 'staff', roles: ['operation'],
      managerId: '', avatarUrl: '', active: true, position: '',
      assignedPrograms: [],
      assignedCourses: [],
      kpiTargets: {}
    });
    setUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserModalTab('info');
    
    // Find programs where this user is manager
    const userPrograms = programs.filter(p => p.managerId === user.id).map(p => p.id);
    
    // Find courses where this user is lecturer
    const userCourses = courses.filter((c: any) => c.lecturerId === user.id).map(c => c.id);
    
    // Find KPI targets for this user in 2026-Q1
    const targets: Record<string, number> = {};
    kpiSnapshots.filter(s => s.userId === user.id && s.period === '2026-Q1').forEach(s => {
      targets[s.kpiDefinitionId] = Number(s.targetValue) || 0;
    });

    setUserForm({
      id: user.id, name: user.name, email: user.email, role: user.role,
      roles: user.roles || [], managerId: user.managerId || '', 
      avatarUrl: user.avatarUrl || '', active: user.active !== false,
      position: user.position || '',
      assignedPrograms: userPrograms,
      assignedCourses: userCourses,
      kpiTargets: targets
    });
    setUserModalOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      showToast('error', 'Vui lòng điền tên và email');
      return;
    }
    const success = await handleAction(editingUser ? 'updateUser' : 'createUser', userForm);
    if (success) setUserModalOpen(false);
  };

  const deleteUser = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}"? Hành động này sẽ xóa toàn bộ KPI và các dữ liệu liên quan!`)) {
      await handleAction('deleteUser', { id });
    }
  };

  // ==================== PROGRAM HANDLERS ====================
  const openAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      id: 'p' + (Math.max(...programs.map(p => parseInt(p.id.replace('p', '')) || 0)) + 1),
      name: '', type: 'degree', status: 'active', shortName: '',
      managerId: users[0]?.id || '', secondaryManagerId: ''
    });
    setProgramModalOpen(true);
  };

  const openEditProgram = (p: Program) => {
    setEditingProgram(p);
    setProgramForm({
      id: p.id, name: p.name, type: p.type, status: p.status || 'active',
      shortName: p.shortName, managerId: p.managerId, 
      secondaryManagerId: p.secondaryManagerId || ''
    });
    setProgramModalOpen(true);
  };

  const saveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.name.trim() || !programForm.shortName.trim()) {
      showToast('error', 'Vui lòng điền tên chương trình và tên viết tắt');
      return;
    }
    const success = await handleAction(editingProgram ? 'updateProgram' : 'createProgram', programForm);
    if (success) setProgramModalOpen(false);
  };

  const deleteProgram = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chương trình "${name}"? Hành động này cũng sẽ xóa toàn bộ các môn học thuộc chương trình này!`)) {
      await handleAction('deleteProgram', { id });
    }
  };

  // ==================== COURSE HANDLERS ====================
  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      id: 'c' + (Math.max(...courses.map(c => parseInt(c.id.replace('c', '')) || 0)) + 1),
      programId: programs[0]?.id || '', name: '', cohort: '',
      numLecturers: 1, numStudents: 0, attendanceRate: 1.0,
      attendanceTarget: 0.95, passRate: 1.0, submitRate: 1.0,
      passTarget: 0.95
    });
    setCourseModalOpen(true);
  };

  const openEditCourse = (c: Course) => {
    setEditingCourse(c);
    setCourseForm({
      id: c.id, programId: c.programId, name: c.name, cohort: c.cohort,
      numLecturers: c.numLecturers, numStudents: c.numStudents, 
      attendanceRate: Number(c.attendanceRate), attendanceTarget: Number(c.attendanceTarget), 
      passRate: Number(c.passRate), submitRate: Number(c.submitRate), 
      passTarget: Number(c.passTarget)
    });
    setCourseModalOpen(true);
  };

  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name.trim() || !courseForm.cohort.trim()) {
      showToast('error', 'Vui lòng điền tên môn học và lớp/cohort');
      return;
    }
    const success = await handleAction(editingCourse ? 'updateCourse' : 'createCourse', courseForm);
    if (success) setCourseModalOpen(false);
  };

  const deleteCourse = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa môn học "${name}"?`)) {
      await handleAction('deleteCourse', { id });
    }
  };

  // ==================== CLASSIFICATION HANDLERS ====================
  const openEditGroup = (g: KPIGroup) => {
    setEditingGroup(g);
    setGroupForm({ id: g.id, name: g.name, weight: g.weight });
    setGroupModalOpen(true);
  };

  const saveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim()) {
      showToast('error', 'Vui lòng nhập tên phân loại');
      return;
    }
    const success = await handleAction('updateKPIGroup', groupForm);
    if (success) setGroupModalOpen(false);
  };

  const openAddDef = () => {
    setEditingDef(null);
    setDefForm({
      id: 'op' + Date.now().toString().slice(-4),
      groupId: kpiGroups[0]?.id || 'operations',
      stt: kpiDefinitions.filter(d => d.groupId === (kpiGroups[0]?.id || 'operations')).length + 1,
      name: '', shortName: '', description: '', criteria: '',
      unit: '%', weight: 5
    });
    setDefModalOpen(true);
  };

  const openEditDef = (d: KPIDefinition) => {
    setEditingDef(d);
    setDefForm({
      id: d.id, groupId: d.groupId, stt: d.stt, name: d.name,
      shortName: d.shortName, description: d.description || '',
      criteria: d.criteria || '', unit: d.unit, weight: d.weight
    });
    setDefModalOpen(true);
  };

  const saveDef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defForm.name.trim() || !defForm.shortName.trim()) {
      showToast('error', 'Vui lòng điền tên tiêu chí và tên viết tắt');
      return;
    }
    const success = await handleAction(editingDef ? 'updateKPIDefinition' : 'createKPIDefinition', defForm);
    if (success) setDefModalOpen(false);
  };

  const deleteDef = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tiêu chí KPI "${name}"? Điều này có thể làm thay đổi các bảng điểm KPI snapshots đang hoạt động!`)) {
      await handleAction('deleteKPIDefinition', { id });
    }
  };

  // Helper selectors
  const getManagerName = (managerId: string | null) => {
    if (!managerId) return 'Không có';
    const found = users.find(u => u.id === managerId);
    return found ? found.name : managerId;
  };

  const getProgramName = (programId: string) => {
    const found = programs.find(p => p.id === programId);
    return found ? `${found.shortName} (${found.name})` : programId;
  };

  const getGroupLabel = (groupId: string) => {
    const found = kpiGroups.find(g => g.id === groupId);
    return found ? found.name : groupId;
  };

  // Filtered lists for view
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole || u.roles.includes(filterRole as UserRole);
    return matchesSearch && matchesRole;
  });

  const filteredPrograms = programs.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.shortName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.cohort.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = filterProgram === 'all' || c.programId === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const filteredDefs = kpiDefinitions.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = filterGroup === 'all' || d.groupId === filterGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--gray-50)', color: 'var(--gray-800)' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 32, zIndex: 9999,
          background: toast.type === 'success' ? '#10B981' : '#EF4444',
          color: 'white', padding: '16px 24px', borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700,
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontSize: 14,
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        marginBottom: 32, flexWrap: 'wrap', gap: 16 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--isme-red)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--isme-red)' }} />
            Root Admin Space
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em', marginTop: 4 }}>
            Quản trị Hệ thống
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>
            Kết nối trực tiếp Supabase Database. Xem, thêm, sửa, xóa toàn bộ thực thể vận hành.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            className="btn-refresh"
            style={{
              padding: '12px 18px', borderRadius: 12, border: '1px solid var(--gray-200)',
              background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 14, fontWeight: 600, color: 'var(--gray-600)', transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Đồng bộ DB
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 1 }}>
        {[
          { id: 'overview', label: 'Tổng quan', icon: Grid },
          { id: 'users', label: 'Thành viên (Users)', icon: Users },
          { id: 'programs', label: 'Chương trình', icon: Layers },
          { id: 'courses', label: 'Môn học (Courses)', icon: BookOpen },
          { id: 'classifications', label: 'KPI & Phân loại', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                border: 'none', borderBottom: isActive ? '3px solid var(--isme-red)' : '3px solid transparent',
                background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: isActive ? 800 : 500,
                color: isActive ? 'var(--gray-900)' : 'var(--gray-500)', transition: 'all 0.15s ease',
                whiteSpace: 'nowrap', position: 'relative', top: 1
              }}
            >
              <Icon size={18} color={isActive ? 'var(--isme-red)' : 'var(--gray-400)'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 12 }}>
          <div className="login-spinner" />
          <div style={{ color: 'var(--gray-500)', fontSize: 14, fontWeight: 500 }}>Đang kết nối database Supabase...</div>
        </div>
      ) : (
        <div style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          {/* ======================================================== */}
          {/* 1. OVERVIEW PANEL                                        */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
                {[
                  { title: 'Tổng số Users', value: users.length, color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', desc: 'Nhân viên & Quản lý đào tạo', icon: Users },
                  { title: 'Chương trình', value: programs.length, color: 'linear-gradient(135deg, #10B981, #047857)', desc: 'Ngành & Chương trình liên kết', icon: Layers },
                  { title: 'Tổng số Môn học', value: courses.length, color: 'linear-gradient(135deg, #EC4899, #BE185D)', desc: 'Môn học đang triển khai', icon: BookOpen },
                  { title: 'Nhóm KPI & Tiêu chí', value: `${kpiGroups.length} / ${kpiDefinitions.length}`, color: 'linear-gradient(135deg, #F59E0B, #D97706)', desc: 'Phân loại trọng số & Chỉ số', icon: Settings }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div 
                      key={i} 
                      style={{
                        background: 'white', borderRadius: 20, padding: 24,
                        border: '1px solid var(--gray-100)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', cursor: 'pointer'
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.06)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.title}</span>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <Icon size={20} />
                        </div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>{card.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, fontWeight: 500 }}>{card.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions & DB Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, flexWrap: 'wrap' }}>
                {/* System DB info */}
                <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--gray-100)' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.01em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={18} color="var(--isme-red)" />
                    Thông tin Cơ sở Dữ liệu Supabase
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 16, border: '1px solid var(--gray-100)' }}>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Database Connection</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--gray-700)', wordBreak: 'break-all' }}>
                        aws-1-ap-southeast-1.pooler.supabase.com:6543
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>Trạng thái: Hoạt động (Connected via Connection Pooler)</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ border: '1px solid var(--gray-100)', padding: 16, borderRadius: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600 }}>Region</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginTop: 2 }}>AWS ap-southeast-1 (Singapore)</div>
                      </div>
                      <div style={{ border: '1px solid var(--gray-100)', padding: 16, borderRadius: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600 }}>SSL Mode</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginTop: 2 }}>Enabled (rejectUnauthorized: false)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Add Panel */}
                <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', justifyItems: 'space-between' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.01em', marginBottom: 16 }}>Thao tác Nhanh</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center' }}>
                    <button onClick={openAddUser} style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', 
                      borderRadius: 16, border: 'none', background: 'rgba(59, 130, 246, 0.08)', color: '#2563EB',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'}
                    >
                      <UserPlus size={18} />
                      Thêm thành viên mới (User)
                    </button>

                    <button onClick={openAddProgram} style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', 
                      borderRadius: 16, border: 'none', background: 'rgba(16, 185, 129, 0.08)', color: '#059669',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'}
                    >
                      <FolderPlus size={18} />
                      Tạo chương trình đào tạo
                    </button>

                    <button onClick={openAddCourse} style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '16px 20px', 
                      borderRadius: 16, border: 'none', background: 'rgba(236, 72, 153, 0.08)', color: '#DB2777',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.08)'}
                    >
                      <BookOpen size={18} />
                      Thêm môn học mới (Course)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. USERS PANEL                                           */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--gray-100)' }}>
              {/* Table Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 500 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="Tìm theo tên, email, chức vụ..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px 12px 48px', borderRadius: 14, border: '1px solid var(--gray-200)',
                        fontSize: 14, outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--isme-red)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                    />
                  </div>
                  <select 
                    value={filterRole} 
                    onChange={e => setFilterRole(e.target.value)}
                    style={{
                      padding: '0 16px', borderRadius: 14, border: '1px solid var(--gray-200)',
                      fontSize: 14, background: 'white', outline: 'none', minWidth: 150
                    }}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Quản trị viên (admin)</option>
                    <option value="manager">Quản lý (manager)</option>
                    <option value="staff">Nhân viên (staff)</option>
                    <option value="operation">Vai trò: Điều phối</option>
                    <option value="coordinator_director">Vai trò: Chủ nhiệm CT</option>
                    <option value="institute_leader">Vai trò: Lãnh đạo viện</option>
                  </select>
                </div>

                <button 
                  onClick={openAddUser}
                  style={{
                    padding: '12px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)',
                    color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Plus size={18} />
                  Thêm Thành viên
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>ID</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Họ và Tên</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Chức vụ (Position)</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hệ thống Role</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Kiêm nhiệm Roles</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quản lý trực tiếp</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trạng thái</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)', fontSize: 14 }}>Không tìm thấy thành viên nào.</td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'all 0.2s' }} className="table-row-hover">
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--gray-400)' }}>{u.id}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>{u.name}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-500)' }}>{u.email}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: 'var(--gray-600)' }}>{u.position || '—'}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14 }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                              background: u.role === 'admin' ? '#FEE2E2' : u.role === 'manager' ? '#FEF3C7' : '#DBEAFE',
                              color: u.role === 'admin' ? '#991B1B' : u.role === 'manager' ? '#92400E' : '#1E40AF'
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--gray-600)', maxWidth: 200, wordBreak: 'break-word' }}>
                            {u.roles?.join(', ') || '—'}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-600)' }}>
                            {getManagerName(u.managerId)}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 14 }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                              background: u.active !== false ? '#D1FAE5' : '#F3F4F6',
                              color: u.active !== false ? '#065F46' : '#374151'
                            }}>
                              {u.active !== false ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              {u.id !== authUser?.id && (
                                <button onClick={() => {
                                  if (window.confirm(`Bạn có chắc chắn muốn đăng nhập giả lập dưới danh nghĩa "${u.name}"?`)) {
                                    impersonate(u.id);
                                    showToast('success', `Đang chuyển hướng sang tài khoản ${u.name}...`);
                                    setTimeout(() => { window.location.href = '/'; }, 1000);
                                  }
                                }} 
                                type="button"
                                title="Đăng nhập giả lập"
                                style={{
                                  padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#D1FAE5'; e.currentTarget.style.color = '#065F46'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                                ><LogIn size={16} /></button>
                              )}

                              <button onClick={() => openEditUser(u)} 
                              type="button"
                              style={{
                                padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.color = '#1E40AF'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                              ><Edit3 size={16} /></button>
                              
                              <button onClick={() => deleteUser(u.id, u.name)} 
                              type="button"
                              style={{
                                padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                              ><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. PROGRAMS PANEL                                        */}
          {/* ======================================================== */}
          {activeTab === 'programs' && (
            <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--gray-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                  <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên chương trình..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px 12px 48px', borderRadius: 14, border: '1px solid var(--gray-200)',
                      fontSize: 14, outline: 'none', transition: 'all 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--isme-red)'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                </div>

                <button 
                  onClick={openAddProgram}
                  style={{
                    padding: '12px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)',
                    color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Plus size={18} />
                  Tạo Chương trình
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>ID</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên chương trình</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên viết tắt</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Loại (Type)</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Manager phụ trách</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Manager phụ (BTEC)</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trạng thái</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrograms.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)', fontSize: 14 }}>Không tìm thấy chương trình nào.</td>
                      </tr>
                    ) : (
                      filteredPrograms.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'all 0.2s' }}>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--gray-400)' }}>{p.id}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>{p.name}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--isme-red)' }}>{p.shortName}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14 }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                              background: '#F3F4F6', color: '#1F2937'
                            }}>
                              {p.type}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-800)', fontWeight: 600 }}>{getManagerName(p.managerId)}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-500)' }}>{getManagerName(p.secondaryManagerId || null)}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14 }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                              background: p.status === 'active' ? '#D1FAE5' : '#F3F4F6',
                              color: p.status === 'active' ? '#065F46' : '#374151'
                            }}>
                              {p.status === 'active' ? 'Active' : 'Archived'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button onClick={() => openEditProgram(p)} style={{
                                padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.color = '#1E40AF'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                              ><Edit3 size={16} /></button>
                              
                              <button onClick={() => deleteProgram(p.id, p.name)} style={{
                                padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                              ><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. COURSES PANEL                                         */}
          {/* ======================================================== */}
          {activeTab === 'courses' && (
            <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--gray-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 500 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder="Tìm theo tên môn học, lớp/cohort..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px 12px 48px', borderRadius: 14, border: '1px solid var(--gray-200)',
                        fontSize: 14, outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--isme-red)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                    />
                  </div>
                  
                  <select 
                    value={filterProgram} 
                    onChange={e => setFilterProgram(e.target.value)}
                    style={{
                      padding: '0 16px', borderRadius: 14, border: '1px solid var(--gray-200)',
                      fontSize: 14, background: 'white', outline: 'none', minWidth: 150
                    }}
                  >
                    <option value="all">Tất cả chương trình</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.shortName}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={openAddCourse}
                  style={{
                    padding: '12px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)',
                    color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Plus size={18} />
                  Thêm Môn học
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>ID</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên môn học</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Thuộc chương trình</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Khóa/Cohort</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Số GV</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Số SV</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Đi học (Target)</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Pass (Target)</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Nộp bài đúng hạn</th>
                      <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)', fontSize: 14 }}>Không tìm thấy môn học nào.</td>
                      </tr>
                    ) : (
                      filteredCourses.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'all 0.2s' }}>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--gray-400)' }}>{c.id}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>{c.name}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-800)', fontWeight: 600 }}>{getProgramName(c.programId)}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-600)', fontWeight: 500 }}>{c.cohort}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, textAlign: 'center', color: 'var(--gray-700)' }}>{c.numLecturers}</td>
                          <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, textAlign: 'center', color: 'var(--gray-700)' }}>{c.numStudents}</td>
                          <td style={{ padding: '16px 20px', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
                            <span style={{ color: '#047857' }}>{Math.round(c.attendanceRate * 100)}%</span>
                            <span style={{ color: 'var(--gray-400)', fontSize: 11, marginLeft: 2 }}>({Math.round(c.attendanceTarget * 100)}%)</span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
                            <span style={{ color: '#1E40AF' }}>{Math.round(c.passRate * 100)}%</span>
                            <span style={{ color: 'var(--gray-400)', fontSize: 11, marginLeft: 2 }}>({Math.round(c.passTarget * 100)}%)</span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: 13, textAlign: 'center', fontWeight: 600, color: 'var(--gray-700)' }}>
                            {Math.round(c.submitRate * 100)}%
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button onClick={() => openEditCourse(c)} style={{
                                padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.color = '#1E40AF'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                              ><Edit3 size={16} /></button>
                              
                              <button onClick={() => deleteCourse(c.id, c.name)} style={{
                                padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                              ><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. CLASSIFICATIONS PANEL                                 */}
          {/* ======================================================== */}
          {activeTab === 'classifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Part A: KPI Groups (Phân loại chính) */}
              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>Nhóm Phân loại KPI</h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Chỉnh sửa tên và tổng trọng số của từng nhóm KPI lớn.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  {kpiGroups.map(g => (
                    <div 
                      key={g.id}
                      style={{
                        background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 20, padding: 24,
                        display: 'flex', flexDirection: 'column', justifyItems: 'space-between', transition: 'all 0.2s'
                      }}
                      className="group-card-hover"
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--isme-red)'
                          }}>{g.id}</span>
                          <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--gray-800)' }}>{g.weight}%</span>
                        </div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', marginTop: 12, minHeight: 40 }}>{g.name}</h4>
                      </div>

                      <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => openEditGroup(g)}
                          style={{
                            padding: '8px 16px', borderRadius: 10, border: '1px solid var(--gray-200)',
                            background: 'white', color: 'var(--gray-600)', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                          }}
                          onMouseOver={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.borderColor = 'var(--gray-300)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
                        >
                          <Edit3 size={14} /> Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part B: KPI Definitions under groups */}
              <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>Chi tiết các Tiêu chí KPI</h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Thêm, sửa, hoặc xóa các tiêu chí đánh giá cho từng nhóm phân loại.</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12 }}>
                    <select 
                      value={filterGroup} 
                      onChange={e => setFilterGroup(e.target.value)}
                      style={{
                        padding: '0 16px', borderRadius: 14, border: '1px solid var(--gray-200)',
                        fontSize: 14, background: 'white', outline: 'none', minWidth: 200
                      }}
                    >
                      <option value="all">Tất cả các nhóm KPI</option>
                      {kpiGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>

                    <button 
                      onClick={openAddDef}
                      style={{
                        padding: '12px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)',
                        color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Plus size={18} />
                      Thêm Tiêu chí KPI
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nhóm KPI</th>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>STT</th>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên viết tắt</th>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tiêu chí / Tên đầy đủ</th>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Đơn vị</th>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Trọng số</th>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tiêu chí Đánh giá</th>
                        <th style={{ padding: '16px 20px', color: 'var(--gray-400)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDefs.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)', fontSize: 14 }}>Không có tiêu chí KPI nào.</td>
                        </tr>
                      ) : (
                        filteredDefs.map(d => (
                          <tr key={d.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'all 0.2s' }}>
                            <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: 'var(--isme-red)' }}>{d.groupId}</td>
                            <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>{d.stt}</td>
                            <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>{d.shortName}</td>
                            <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-700)', maxWidth: 220, wordBreak: 'break-word' }}>
                              <b>{d.name}</b>
                              {d.description && <div style={{ fontSize: 12, color: 'var(--gray-450)', marginTop: 4 }}>{d.description}</div>}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--gray-600)' }}>{d.unit}</td>
                            <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 800, textAlign: 'center', color: '#047857' }}>{d.weight}%</td>
                            <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--gray-500)', maxWidth: 280, wordBreak: 'break-word' }}>{d.criteria}</td>
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button onClick={() => openEditDef(d)} style={{
                                  padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.color = '#1E40AF'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                                ><Edit3 size={16} /></button>
                                
                                <button onClick={() => deleteDef(d.id, d.name)} style={{
                                  padding: 8, borderRadius: 8, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-500)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#991B1B'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
                                ><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG MODALS                                            */}
      {/* ======================================================== */}

      {/* A. User Modal */}
      {userModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', 
          justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
          overflowY: 'auto', padding: '40px 16px'
        }} onClick={() => setUserModalOpen(false)}>
          <div className="modal-content" style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 640, padding: 32,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease',
            border: '1px solid var(--gray-100)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--gray-900)' }}>
                {editingUser ? 'Chỉnh sửa Thành viên' : 'Thêm Thành viên Mới'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} style={{ background: 'var(--gray-50)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                <X size={18} color="var(--gray-500)" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--gray-100)', marginBottom: 20, paddingBottom: 1 }}>
              {[
                { id: 'info', label: 'Thông tin cơ bản' },
                { id: 'assignments', label: 'Phân công Nhiệm vụ' },
                { id: 'kpis', label: 'Chỉ tiêu KPI' }
              ].map(t => (
                <button
                  key={t.id} type="button" onClick={() => setUserModalTab(t.id as any)}
                  style={{
                    padding: '8px 16px', border: 'none', borderBottom: userModalTab === t.id ? '2.5px solid var(--isme-red)' : '2.5px solid transparent',
                    background: 'none', fontSize: 13, fontWeight: userModalTab === t.id ? 800 : 500,
                    color: userModalTab === t.id ? 'var(--gray-900)' : 'var(--gray-400)', cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={saveUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* TAB 1: BASIC INFO */}
              {userModalTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>ID Thành viên</label>
                      <input 
                        type="text" value={userForm.id} disabled={!!editingUser}
                        onChange={e => setUserForm({ ...userForm, id: e.target.value })}
                        style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Họ và Tên</label>
                      <input 
                        type="text" value={userForm.name} required
                        onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                        style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Email</label>
                    <input 
                      type="email" value={userForm.email} required
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Chức danh (Position)</label>
                      <input 
                        type="text" value={userForm.position} placeholder="Ví dụ: Điều phối viên"
                        onChange={e => setUserForm({ ...userForm, position: e.target.value })}
                        style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Hệ thống Role</label>
                      <select 
                        value={userForm.role}
                        onChange={e => setUserForm({ ...userForm, role: e.target.value as Role })}
                        style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                      >
                        <option value="staff">Staff (Nhân viên)</option>
                        <option value="manager">Manager (Quản lý)</option>
                        <option value="admin">Admin (Quản trị)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Kiêm nhiệm Roles (Multi-Role)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--gray-50)', padding: 16, borderRadius: 12 }}>
                      {[
                        { key: 'operation', label: 'Điều phối viên' },
                        { key: 'coordinator_director', label: 'Chủ nhiệm CT' },
                        { key: 'manager', label: 'Quản lý Đào tạo' },
                        { key: 'institute_leader', label: 'Lãnh đạo Viện' }
                      ].map(r => {
                        const checked = userForm.roles.includes(r.key as UserRole);
                        return (
                          <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                            <input 
                              type="checkbox" checked={checked}
                              onChange={() => {
                                let newRoles = [...userForm.roles];
                                if (checked) newRoles = newRoles.filter(x => x !== r.key);
                                else newRoles.push(r.key as UserRole);
                                setUserForm({ ...userForm, roles: newRoles });
                              }}
                            />
                            {r.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Quản lý Trực tiếp</label>
                      <select 
                        value={userForm.managerId}
                        onChange={e => setUserForm({ ...userForm, managerId: e.target.value })}
                        style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                      >
                        <option value="">Không có</option>
                        {users.filter(u => u.id !== userForm.id && u.role !== 'staff').map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 20 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" checked={userForm.active}
                          onChange={e => setUserForm({ ...userForm, active: e.target.checked })}
                        />
                        Tài khoản Active
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ASSIGNMENTS (PROGRAMS & COURSES) */}
              {userModalTab === 'assignments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                      Chương trình Phụ trách (Program Manager)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--gray-50)', padding: 16, borderRadius: 14, maxHeight: 160, overflowY: 'auto', border: '1px solid var(--gray-100)' }}>
                      {programs.length === 0 ? (
                        <div style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 8 }}>Không có chương trình nào</div>
                      ) : (
                        programs.map(p => {
                          const checked = userForm.assignedPrograms.includes(p.id);
                          return (
                            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              <input 
                                type="checkbox" checked={checked}
                                onChange={() => {
                                  let newProgs = [...userForm.assignedPrograms];
                                  if (checked) newProgs = newProgs.filter(id => id !== p.id);
                                  else newProgs.push(p.id);
                                  setUserForm({ ...userForm, assignedPrograms: newProgs });
                                }}
                              />
                              <span style={{ color: 'var(--isme-red)', fontWeight: 800 }}>{p.shortName}</span> - {p.name}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                      Môn học & Lớp phụ trách (Lecturer)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--gray-50)', padding: 16, borderRadius: 14, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--gray-100)' }}>
                      {courses.length === 0 ? (
                        <div style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 8 }}>Không có môn học nào</div>
                      ) : (
                        courses.map(c => {
                          const checked = userForm.assignedCourses.includes(c.id);
                          const prog = programs.find(p => p.id === c.programId);
                          return (
                            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              <input 
                                type="checkbox" checked={checked}
                                onChange={() => {
                                  let newCourses = [...userForm.assignedCourses];
                                  if (checked) newCourses = newCourses.filter(id => id !== c.id);
                                  else newCourses.push(c.id);
                                  setUserForm({ ...userForm, assignedCourses: newCourses });
                                }}
                              />
                              <span style={{ background: 'var(--gray-200)', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, color: 'var(--gray-700)' }}>
                                {prog?.shortName || c.programId}
                              </span>
                              <span>{c.name} ({c.cohort})</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: KPI TARGETS */}
              {userModalTab === 'kpis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', display: 'block' }}>
                    Thiết lập Chỉ tiêu KPI (Học kỳ: 2026-Q1)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                    {kpiDefinitions.length === 0 ? (
                      <div style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: 8 }}>Không có tiêu chí KPI nào</div>
                    ) : (
                      kpiDefinitions.map(def => {
                        const val = userForm.kpiTargets[def.id] !== undefined ? userForm.kpiTargets[def.id] : 0;
                        return (
                          <div key={def.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--gray-800)' }}>
                                {def.stt}. {def.name} ({def.shortName})
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                                Nhóm: {getGroupLabel(def.groupId)} | Trọng số: {def.weight}%
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120 }}>
                              <input 
                                type="number" step="any" min="0" max="100000"
                                value={val}
                                onChange={e => {
                                  const newTargets = { ...userForm.kpiTargets };
                                  newTargets[def.id] = Number(e.target.value) || 0;
                                  setUserForm({ ...userForm, kpiTargets: newTargets });
                                }}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 13, fontWeight: 700, textAlign: 'right', outline: 'none' }}
                              />
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', width: 24 }}>{def.unit}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setUserModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '12px 30px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Program Modal */}
      {programModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', 
          justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
          overflowY: 'auto', padding: '40px 16px'
        }} onClick={() => setProgramModalOpen(false)}>
          <div style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 520, padding: 32,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease',
            border: '1px solid var(--gray-100)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--gray-900)' }}>
                {editingProgram ? 'Chỉnh sửa Chương trình' : 'Tạo Chương trình Mới'}
              </h3>
              <button onClick={() => setProgramModalOpen(false)} style={{ background: 'var(--gray-50)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                <X size={18} color="var(--gray-500)" />
              </button>
            </div>

            <form onSubmit={saveProgram} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Mã Chương trình (ID)</label>
                  <input 
                    type="text" value={programForm.id} disabled={!!editingProgram}
                    onChange={e => setProgramForm({ ...programForm, id: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Tên viết tắt</label>
                  <input 
                    type="text" value={programForm.shortName} required placeholder="Ví dụ: BTEC"
                    onChange={e => setProgramForm({ ...programForm, shortName: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Tên chương trình đào tạo</label>
                <input 
                  type="text" value={programForm.name} required placeholder="Ví dụ: BTEC HND"
                  onChange={e => setProgramForm({ ...programForm, name: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Phân loại (Type)</label>
                  <select 
                    value={programForm.type}
                    onChange={e => setProgramForm({ ...programForm, type: e.target.value as ProgramType })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                  >
                    <option value="degree">Degree (Chính quy)</option>
                    <option value="certificate">Certificate (Chứng chỉ)</option>
                    <option value="short_course">Short course (Khóa ngắn hạn)</option>
                    <option value="event">Event (Sự kiện)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Trạng thái vận hành</label>
                  <select 
                    value={programForm.status}
                    onChange={e => setProgramForm({ ...programForm, status: e.target.value as any })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                  >
                    <option value="active">Active (Hoạt động)</option>
                    <option value="archived">Archived (Lưu trữ)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Manager phụ trách chính</label>
                  <select 
                    value={programForm.managerId}
                    onChange={e => setProgramForm({ ...programForm, managerId: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Manager phụ (Tùy chọn)</label>
                  <select 
                    value={programForm.secondaryManagerId}
                    onChange={e => setProgramForm({ ...programForm, secondaryManagerId: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                  >
                    <option value="">Không có</option>
                    {users.filter(u => u.id !== programForm.managerId).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setProgramModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '12px 30px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Lưu chương trình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Course Modal */}
      {courseModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', 
          justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
          overflowY: 'auto', padding: '40px 16px'
        }} onClick={() => setCourseModalOpen(false)}>
          <div style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 580, padding: 32,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease',
            border: '1px solid var(--gray-100)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--gray-900)' }}>
                {editingCourse ? 'Chỉnh sửa Môn học' : 'Thêm Môn học Mới'}
              </h3>
              <button onClick={() => setCourseModalOpen(false)} style={{ background: 'var(--gray-50)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                <X size={18} color="var(--gray-500)" />
              </button>
            </div>

            <form onSubmit={saveCourse} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Mã môn học (ID)</label>
                  <input 
                    type="text" value={courseForm.id} disabled={!!editingCourse}
                    onChange={e => setCourseForm({ ...courseForm, id: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Chương trình đào tạo</label>
                  <select 
                    value={courseForm.programId}
                    onChange={e => setCourseForm({ ...courseForm, programId: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.shortName})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Tên môn học</label>
                  <input 
                    type="text" value={courseForm.name} required placeholder="Ví dụ: Business Intelligence"
                    onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Khóa/Cohort</label>
                  <input 
                    type="text" value={courseForm.cohort} required placeholder="Ví dụ: BBAE K64"
                    onChange={e => setCourseForm({ ...courseForm, cohort: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Số lượng Giảng viên</label>
                  <input 
                    type="number" min={1} value={courseForm.numLecturers}
                    onChange={e => setCourseForm({ ...courseForm, numLecturers: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Số lượng Sinh viên</label>
                  <input 
                    type="number" min={0} value={courseForm.numStudents}
                    onChange={e => setCourseForm({ ...courseForm, numStudents: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Thiết lập KPI mục tiêu của môn học</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>Đi học thực tế (0.0 - 1.0)</label>
                    <input 
                      type="number" step="0.01" min="0" max="1" value={courseForm.attendanceRate}
                      onChange={e => setCourseForm({ ...courseForm, attendanceRate: parseFloat(e.target.value) || 0.0 })}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)', marginTop: 4, background: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>Target Đi học (0.0 - 1.0)</label>
                    <input 
                      type="number" step="0.01" min="0" max="1" value={courseForm.attendanceTarget}
                      onChange={e => setCourseForm({ ...courseForm, attendanceTarget: parseFloat(e.target.value) || 0.0 })}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)', marginTop: 4, background: 'white' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>Pass Rate (0-1)</label>
                    <input 
                      type="number" step="0.01" min="0" max="1" value={courseForm.passRate}
                      onChange={e => setCourseForm({ ...courseForm, passRate: parseFloat(e.target.value) || 0.0 })}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)', marginTop: 4, background: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>Target Pass (0-1)</label>
                    <input 
                      type="number" step="0.01" min="0" max="1" value={courseForm.passTarget}
                      onChange={e => setCourseForm({ ...courseForm, passTarget: parseFloat(e.target.value) || 0.0 })}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)', marginTop: 4, background: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>Nộp đúng hạn (0-1)</label>
                    <input 
                      type="number" step="0.01" min="0" max="1" value={courseForm.submitRate}
                      onChange={e => setCourseForm({ ...courseForm, submitRate: parseFloat(e.target.value) || 0.0 })}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--gray-200)', marginTop: 4, background: 'white' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setCourseModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '12px 30px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Lưu môn học</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. KPI Group Modal */}
      {groupModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', 
          justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
          overflowY: 'auto', padding: '40px 16px'
        }} onClick={() => setGroupModalOpen(false)}>
          <div style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 450, padding: 32,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease',
            border: '1px solid var(--gray-100)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--gray-900)' }}>Chỉnh sửa Phân loại KPI</h3>
              <button onClick={() => setGroupModalOpen(false)} style={{ background: 'var(--gray-50)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                <X size={18} color="var(--gray-500)" />
              </button>
            </div>

            <form onSubmit={saveGroup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Mã phân loại (ID)</label>
                <input 
                  type="text" value={groupForm.id} disabled
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'var(--gray-100)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Tên phân loại chính</label>
                <input 
                  type="text" value={groupForm.name} required
                  onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Trọng số nhóm (%)</label>
                <input 
                  type="number" min={0} max={100} value={groupForm.weight} required
                  onChange={e => setGroupForm({ ...groupForm, weight: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setGroupModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '12px 30px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E. KPI Definition Modal */}
      {defModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', 
          justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)',
          overflowY: 'auto', padding: '40px 16px'
        }} onClick={() => setDefModalOpen(false)}>
          <div style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 580, padding: 32,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease',
            border: '1px solid var(--gray-100)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--gray-900)' }}>
                {editingDef ? 'Chỉnh sửa Tiêu chí KPI' : 'Thêm Tiêu chí KPI Mới'}
              </h3>
              <button onClick={() => setDefModalOpen(false)} style={{ background: 'var(--gray-50)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                <X size={18} color="var(--gray-500)" />
              </button>
            </div>

            <form onSubmit={saveDef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Mã tiêu chí (ID)</label>
                  <input 
                    type="text" value={defForm.id} disabled={!!editingDef}
                    onChange={e => setDefForm({ ...defForm, id: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Nhóm KPI phân loại</label>
                  <select 
                    value={defForm.groupId}
                    onChange={e => setDefForm({ ...defForm, groupId: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', background: 'white' }}
                  >
                    {kpiGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Tên viết tắt</label>
                  <input 
                    type="text" value={defForm.shortName} required placeholder="Ví dụ: Turnitin"
                    onChange={e => setDefForm({ ...defForm, shortName: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Thứ tự (STT)</label>
                  <input 
                    type="number" min={1} value={defForm.stt} required
                    onChange={e => setDefForm({ ...defForm, stt: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Trọng số (%)</label>
                  <input 
                    type="number" min={0} value={defForm.weight} required
                    onChange={e => setDefForm({ ...defForm, weight: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Tên đầy đủ tiêu chí</label>
                <input 
                  type="text" value={defForm.name} required placeholder="Ví dụ: Giám sát liêm chính học thuật"
                  onChange={e => setDefForm({ ...defForm, name: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Mô tả ngắn công việc</label>
                  <input 
                    type="text" value={defForm.description} placeholder="Ví dụ: Báo cáo Turnitin"
                    onChange={e => setDefForm({ ...defForm, description: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Đơn vị tính</label>
                  <input 
                    type="text" value={defForm.unit} required placeholder="Ví dụ: % hoặc ngày"
                    onChange={e => setDefForm({ ...defForm, unit: e.target.value })}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Công thức & Tiêu chí Đánh giá</label>
                <textarea 
                  value={defForm.criteria} rows={3} placeholder="Ví dụ: Tỷ lệ các môn học có báo cáo kết quả rà soát Turnitin đúng hạn"
                  onChange={e => setDefForm({ ...defForm, criteria: e.target.value })}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--gray-200)', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setDefModalOpen(false)} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '12px 30px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--isme-red), #991B1B)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Lưu tiêu chí</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
