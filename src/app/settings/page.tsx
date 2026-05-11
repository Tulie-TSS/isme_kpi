'use client';
import { users, programs, kpiDefinitions, courses, kpiGroups } from '@/lib/mock-data';
import { useState } from 'react';
import { Users, GraduationCap, Target, BookOpen, Settings } from 'lucide-react';

type Tab = 'users' | 'programs' | 'kpis' | 'courses' | 'system';
const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'users', label: 'Người dùng', icon: Users },
  { key: 'programs', label: 'Chương trình', icon: GraduationCap },
  { key: 'kpis', label: 'Cấu hình KPI', icon: Target },
  { key: 'courses', label: 'Lớp/Môn học', icon: BookOpen },
  { key: 'system', label: 'Hệ thống', icon: Settings },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Cài đặt hệ thống</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Quản lý dữ liệu nền tảng KPI</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexShrink: 0 }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'users' && (
          <table className="data-table">
            <thead>
              <tr><th>Tên</th><th>Email</th><th>Chức vụ</th><th>Vai trò</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>{u.email}</td>
                  <td style={{ fontSize: 13 }}>{u.position}</td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      color: u.role === 'admin' ? '#B91C1C' : u.role === 'manager' ? '#7C3AED' : '#1D4ED8',
                      background: u.role === 'admin' ? '#FEE2E2' : u.role === 'manager' ? '#EDE9FE' : '#DBEAFE',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td><span style={{ color: u.active ? 'var(--success)' : 'var(--gray-400)', fontSize: 13 }}>{u.active ? 'Hoạt động' : 'Vô hiệu'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'programs' && (
          <table className="data-table">
            <thead>
              <tr><th>Tên CT</th><th>Viết tắt</th><th>Loại</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontSize: 13 }}>{p.shortName}</td>
                  <td style={{ fontSize: 13, textTransform: 'capitalize' }}>{p.type.replace('_', ' ')}</td>
                  <td><span style={{ color: p.status === 'active' ? 'var(--success)' : 'var(--gray-400)', fontSize: 13, fontWeight: 600 }}>{p.status === 'active' ? 'Đang hoạt động' : 'Lưu trữ'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'kpis' && (
          <table className="data-table">
            <thead>
              <tr><th>STT</th><th>Tên KPI / Nhóm</th><th>Tiêu chí</th><th style={{textAlign:'center'}}>Trọng số</th><th>Đơn vị</th></tr>
            </thead>
            <tbody>
              {kpiDefinitions.map((k, i) => {
                const group = kpiGroups.find(g => g.id === k.groupId);
                return (
                  <tr key={k.id}>
                    <td style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 12 }}>{k.stt}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{k.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--isme-red)', fontWeight: 600 }}>{group?.name}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-600)', maxWidth: 400 }}>{k.criteria}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--gray-800)' }}>{k.weight}%</td>
                    <td style={{ fontSize: 12, textAlign: 'center' }}>{k.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'courses' && (
          <table className="data-table">
            <thead>
              <tr><th>Lớp / Môn học</th><th>Khoá</th><th style={{textAlign:'center'}}>GV</th><th style={{textAlign:'center'}}>Target CC</th><th style={{textAlign:'center'}}>Target Pass</th></tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</td>
                  <td style={{ fontSize: 13 }}>{c.cohort}</td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{c.numLecturers}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{(c.attendanceTarget * 100).toFixed(0)}%</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{(c.passTarget * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'system' && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Settings size={48} color="var(--gray-200)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)' }}>Cấu hình tham số hệ thống</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', maxWidth: 400, margin: '8px auto 24px' }}>
              Thiết lập các tham số về trọng số tổng quát, chu kỳ đánh giá (Tháng/Quý/Kỳ) và các quy tắc tự động hóa.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Chu kỳ mặc định</div>
                <div style={{ fontWeight: 700 }}>Học kỳ (Kỳ 1, Kỳ 2)</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Tự động chốt dữ liệu</div>
                <div style={{ fontWeight: 700 }}>Ngày 30 cuối kỳ</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
