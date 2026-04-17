'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, GraduationCap, X, Grid3X3, CheckSquare, Table2, Calendar } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole, hasAnyRole, sidebarOpen, setSidebarOpen } = useApp();

  // Build links based on multi-role permissions
  const links: NavLink[] = [
    { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/tasks', label: 'Task', icon: ClipboardList },
    { href: '/tasks/matrix', label: 'Ma trận Task', icon: Grid3X3 },
    { href: '/tasks/checklist', label: 'Checklist CV', icon: CheckSquare },
    { href: '/kpi', label: 'KPI Công việc', icon: BarChart3 },
    { href: '/kpi/courses', label: 'KPI Môn học', icon: Table2 },
  ];

  // Manager/Leader/Coordinator_Director can see heatmap
  if (hasAnyRole('manager', 'institute_leader', 'coordinator_director') || currentRole === 'manager' || currentRole === 'admin') {
    links.push({ href: '/kpi/heatmap', label: 'KPI Heatmap', icon: BarChart3 });
  }

  links.push({ href: '/review', label: 'Đánh giá', icon: FileText });
  links.push({ href: '/schedule', label: 'Lịch làm việc', icon: Calendar });

  // Admin settings
  if (currentRole === 'admin' || hasAnyRole('manager', 'institute_leader')) {
    links.push({ href: '/settings', label: 'Cài đặt', icon: Settings });
  }

  return (
    <>
      {sidebarOpen && (
        <div className="overlay md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, padding: '0 8px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--isme-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={22} color="white" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>ISME Ops</div>
            <div style={{ color: 'var(--gray-500)', fontSize: 11, fontWeight: 500 }}>Operations & KPI</div>
          </div>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="var(--gray-400)" />
          </button>
        </div>

        <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, padding: '0 16px', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Menu
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>Viện Đào tạo Quốc tế</div>
          <div style={{ fontSize: 11, color: 'var(--gray-600)' }}>ISME — NEU</div>
        </div>
      </nav>
    </>
  );
}
