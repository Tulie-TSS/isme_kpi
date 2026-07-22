'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { getAuditLogs, subscribeEditRequests, subscribeCourseEditRequests } from '@/lib/mock-data';
import { AuditLog } from '@/lib/types';
import { Search, RotateCw, ShieldAlert, FileSpreadsheet, Calendar, User, Terminal } from 'lucide-react';

export default function AuditLogsPage() {
  const { currentRole } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [, forceUpdate] = useState(0);

  // Sync logs and support updates from other pages
  useEffect(() => {
    setLogs(getAuditLogs());
    
    // Refresh list when any edit request changes
    const unsub1 = subscribeEditRequests(() => setLogs(getAuditLogs()));
    const unsub2 = subscribeCourseEditRequests(() => setLogs(getAuditLogs()));
    
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLogs(getAuditLogs());
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
    forceUpdate(n => n + 1);
  };

  // Authorization check
  const isAuthorized = currentRole === 'manager' || currentRole === 'admin';
  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <ShieldAlert size={32} color="#DC2626" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>Từ chối quyền truy cập</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, maxWidth: 360 }}>Bạn không có quyền truy cập để xem Nhật ký Hệ thống. Tính năng này chỉ khả dụng đối với Quản lý hoặc Quản trị viên.</p>
      </div>
    );
  }

  // Categories list
  const uniqueActions = ['all', ...Array.from(new Set(logs.map(l => l.action)))];

  // Filtering logs
  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeStyle = (action: string) => {
    if (action.includes('Duyệt')) return { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' };
    if (action.includes('Từ chối')) return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
    if (action.includes('Yêu cầu') || action.includes('Gửi')) return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' };
    if (action.includes('Đăng nhập') || action.includes('Vai trò')) return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-900)' }}>
            <Terminal size={22} color="var(--isme-red)" /> Nhật ký hệ thống (Audit Logs)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
            Bản ghi lịch sử chi tiết thời gian, địa chỉ IP và hành động của nhân sự trên hệ thống.
          </p>
        </div>
        <button className="btn-solid-outline" onClick={handleRefresh} disabled={refreshing} style={{ fontSize: 12, padding: '7px 14px' }}>
          <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="summary-grid" style={{ marginBottom: 20 }}>
        <div className="summary-card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 4 }}>Tổng số bản ghi</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--isme-red)' }}>{logs.length}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>Toàn thời gian hệ thống hoạt động</div>
        </div>
        <div className="summary-card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 4 }}>Hành động phê duyệt</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#10B981' }}>
            {logs.filter(l => l.action.includes('Duyệt')).length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>Thay đổi số liệu được chấp thuận</div>
        </div>
        <div className="summary-card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 4 }}>Yêu cầu sửa đổi điểm</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#3B82F6' }}>
            {logs.filter(l => l.action.includes('Yêu cầu') || l.action.includes('sửa')).length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>Đang chờ xử lý hoặc đã duyệt</div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} color="var(--gray-400)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo nhân viên, nội dung..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 8,
                border: '1px solid var(--gray-200)',
                fontSize: 13,
                outline: 'none',
                background: '#FFF'
              }}
            />
          </div>

          {/* Action Filter */}
          <div style={{ width: 220 }}>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--gray-200)',
                fontSize: 13,
                outline: 'none',
                background: '#FFF',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="all">Tất cả hành động</option>
              {uniqueActions.filter(a => a !== 'all').map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Thời gian</th>
                <th style={{ width: 180 }}>Người thực hiện</th>
                <th style={{ width: 180 }}>Hành động</th>
                <th style={{ width: 120 }}>Địa chỉ IP</th>
                <th style={{ minWidth: 320 }}>Chi tiết bản ghi</th>
                <th style={{ width: 180 }}>Thiết bị/Trình duyệt</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--gray-400)' }}>
                    Không tìm thấy nhật ký kiểm toán phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => {
                  const badge = getActionBadgeStyle(l.action);
                  // Simplify user agent for display
                  let clientName = 'Chrome (Mac)';
                  if (l.userAgent.includes('Safari') && !l.userAgent.includes('Chrome')) clientName = 'Safari (Mac)';
                  if (l.userAgent.includes('Firefox')) clientName = 'Firefox (Mac)';
                  if (l.userAgent === 'Server Environment') clientName = 'Server API';

                  return (
                    <tr key={l.id}>
                      {/* Timestamp */}
                      <td style={{ color: 'var(--gray-600)', fontSize: 13, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={12} color="var(--gray-400)" />
                          <span>{l.timestamp}</span>
                        </div>
                      </td>

                      {/* User Info */}
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)' }}>{l.userName}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>ID: {l.userId}</div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`
                        }}>
                          {l.action}
                        </span>
                      </td>

                      {/* IP Address */}
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-600)' }}>
                        {l.ipAddress}
                      </td>

                      {/* Details text */}
                      <td style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5, whiteSpace: 'normal' }}>
                        {l.details}
                      </td>

                      {/* Device User Agent */}
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }} title={l.userAgent}>
                        {clientName}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
