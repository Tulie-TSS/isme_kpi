'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, X, Grid3X3, CheckSquare, Table2, Calendar, ShieldCheck } from 'lucide-react';

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
  ];

  // Show "KPI Công việc" only for staff who have individual KPI targets
  if (currentRole === 'staff') {
    links.push({ href: '/kpi', label: 'KPI Công việc', icon: BarChart3 });
  }

  links.push({ href: '/kpi/courses', label: 'KPI Môn học', icon: Table2 });

  // Manager/Leader/Coordinator_Director can see heatmap
  const isLeader = hasAnyRole('institute_leader');
  
  let filteredLinks = [...links];

  if (hasAnyRole('manager', 'institute_leader', 'admin') || currentRole === 'manager' || currentRole === 'admin') {
    filteredLinks.push({ href: '/kpi/heatmap', label: 'KPI Heatmap', icon: BarChart3 });
  }

  if (currentRole === 'manager' || currentRole === 'admin' || hasAnyRole('manager', 'admin')) {
    filteredLinks.push({ href: '/logs', label: 'Nhật ký hệ thống', icon: ClipboardList });
  }

  filteredLinks.push({ href: '/review', label: 'Đánh giá', icon: FileText });
  filteredLinks.push({ href: '/schedule', label: 'Lịch làm việc', icon: Calendar });

  // Admin settings - Hide for institute_leader
  if ((currentRole === 'admin' || hasAnyRole('manager')) && !isLeader) {
    filteredLinks.push({ href: '/settings', label: 'Cài đặt', icon: Settings });
  }

  // Root Admin Portal
  if (currentRole === 'admin' || hasAnyRole('admin')) {
    filteredLinks.push({ href: '/admin', label: 'Admin Gốc', icon: ShieldCheck });
  }

  return (
    <>
      {sidebarOpen && (
        <div className="overlay md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 4px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: '100%' }}>
            <img 
              src="/isme-logo.png" 
              alt="Viện Đào tạo Quốc tế ISME - NEU" 
              style={{ width: '100%', maxWidth: 215, height: 'auto', maxHeight: 68, objectFit: 'contain', display: 'block' }} 
            />
          </Link>
          <button
            className="mobile-menu-btn md:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            aria-label="Đóng menu"
          >
            <X size={20} color="var(--gray-400)" />
          </button>
        </div>

        <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, padding: '0 16px', marginBottom: 8 }}>
          Menu
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredLinks.map((link) => {
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
