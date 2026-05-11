'use client';
import { useApp } from '@/lib/context';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';

export default function HomePage() {
  const { currentRole } = useApp();

  if (currentRole === 'manager' || currentRole === 'admin') {
    return <ManagerDashboard />;
  }
  return <StaffDashboard />;
}
