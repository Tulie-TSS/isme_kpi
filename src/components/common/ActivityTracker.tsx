'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { addAuditLog } from '@/lib/mock-data';

const PATH_NAMES: Record<string, string> = {
  '/': 'Tổng quan KPI',
  '/kpi': 'Chi tiết chỉ số KPI',
  '/kpi/courses': 'Quản lý KPI Môn học & Đào tạo',
  '/kpi/heatmap': 'Ma trận & Heatmap KPI',
  '/logs': 'Nhật ký hệ thống',
  '/review': 'Đánh giá & Phê duyệt KPI',
  '/schedule': 'Lịch làm việc',
  '/settings': 'Cài đặt hệ thống',
  '/admin': 'Quản trị hệ thống',
  '/login': 'Đăng nhập',
};

export default function ActivityTracker() {
  const pathname = usePathname();
  const { currentUserId } = useApp();
  const lastPathRef = useRef<string>('');
  const lastInteractionRef = useRef<number>(0);

  // 1. Page view / navigation tracking
  useEffect(() => {
    if (!pathname || pathname === lastPathRef.current) return;
    const pageName = PATH_NAMES[pathname] || pathname;
    lastPathRef.current = pathname;

    // Small delay to ensure user context is loaded
    const timer = setTimeout(() => {
      addAuditLog(
        currentUserId || 'u0',
        'Truy cập trang',
        `Truy cập trang ${pageName} (${pathname})`
      );
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, currentUserId]);

  // 2. Global click / interaction tracking (for all buttons, tabs, links, controls)
  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find the closest interactive element
      const btn = target.closest('button');
      const link = target.closest('a');
      const select = target.closest('select');
      const checkbox = target.closest('input[type="checkbox"], input[type="radio"]');
      const tab = target.closest('[role="tab"], .tab, [data-tab]');
      const interactive = btn || link || select || checkbox || tab;

      if (!interactive) return;

      // Extract a clean descriptive label
      let label = (
        interactive.getAttribute('data-action') ||
        interactive.getAttribute('aria-label') ||
        interactive.getAttribute('title') ||
        interactive.textContent ||
        ''
      ).replace(/\s+/g, ' ').trim();

      // Clean up long labels
      if (label.length > 80) {
        label = label.substring(0, 77) + '...';
      }

      if (!label && interactive.tagName.toLowerCase() === 'button') {
        label = 'Nút thao tác biểu tượng';
      }

      if (!label) return;

      // Skip clicks on menu links if page view tracking already captures them
      if (link && link.getAttribute('href')?.startsWith('/')) {
        // Just let page view handler log it
        return;
      }

      const now = Date.now();
      // Debounce rapid duplicate clicks
      if (now - lastInteractionRef.current < 400) return;
      lastInteractionRef.current = now;

      const pageName = PATH_NAMES[pathname] || pathname;
      let actionCategory = 'Thao tác giao diện';
      if (tab) actionCategory = 'Chuyển tab';
      else if (btn?.classList.contains('btn-primary') || label.toLowerCase().includes('lưu') || label.toLowerCase().includes('duyệt')) {
        actionCategory = 'Hành động người dùng';
      }

      addAuditLog(
        currentUserId || 'u0',
        actionCategory,
        `Bấm "${label}" trên trang ${pageName}`
      );
    }

    // 3. Global change tracking for inputs and selects
    function handleGlobalChange(e: Event) {
      const target = e.target as HTMLSelectElement | HTMLInputElement | null;
      if (!target) return;

      const pageName = PATH_NAMES[pathname] || pathname;
      if (target.tagName.toLowerCase() === 'select') {
        const sel = target as HTMLSelectElement;
        const selectedText = sel.options[sel.selectedIndex]?.text || sel.value;
        addAuditLog(
          currentUserId || 'u0',
          'Thay đổi bộ lọc',
          `Chọn tùy chọn "${selectedText}" trên trang ${pageName}`
        );
      } else if (target.type === 'checkbox' || target.type === 'radio') {
        const input = target as HTMLInputElement;
        const label = input.closest('label')?.textContent?.trim() || input.name || input.id;
        addAuditLog(
          currentUserId || 'u0',
          'Thay đổi tùy chọn',
          `${input.checked ? 'Bật' : 'Tắt'} tùy chọn "${label}" trên trang ${pageName}`
        );
      }
    }

    document.addEventListener('click', handleGlobalClick, { capture: true });
    document.addEventListener('change', handleGlobalChange, { capture: true });

    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      document.removeEventListener('change', handleGlobalChange, { capture: true });
    };
  }, [pathname, currentUserId]);

  return null;
}
