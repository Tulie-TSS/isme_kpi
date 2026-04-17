'use client';
import { users, programs, kpiDefinitions, taskTemplates, courses } from '@/lib/mock-data';
import { useState } from 'react';
import { Users, GraduationCap, Target, ClipboardList, BookOpen } from 'lucide-react';

type Tab = 'users' | 'programs' | 'kpis' | 'templates' | 'courses';
const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'users', label: 'Người dùng', icon: Users },
  { key: 'programs', label: 'Chương trình', icon: GraduationCap },
  { key: 'kpis', label: 'KPI', icon: Target },
  { key: 'templates', label: 'Task Template', icon: ClipboardList },
  { key: 'courses', label: 'Môn BTEC', icon: BookOpen },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Cài đặt hệ thống</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Quản lý master data</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-secondary'}`}
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
              <tr><th>Tên KPI</th><th style={{textAlign:'center'}}>Trọng số</th><th style={{textAlign:'center'}}>Ngưỡng tốt</th><th style={{textAlign:'center'}}>Ngưỡng cảnh báo</th><th>Đơn vị</th></tr>
            </thead>
            <tbody>
              {kpiDefinitions.map(k => (
                <tr key={k.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{k.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{k.description}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--isme-red)' }}>{k.weight}%</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--success)' }}>≥{k.thresholds.good}%</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--warning)' }}>&lt;{k.thresholds.warning}%</td>
                  <td style={{ fontSize: 13 }}>{k.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'templates' && (
          <table className="data-table">
            <thead>
              <tr><th>Tên Template</th><th style={{textAlign:'center'}}>Phase</th><th style={{textAlign:'center'}}>Thời hạn</th><th style={{textAlign:'center'}}>Evidence</th></tr>
            </thead>
            <tbody>
              {taskTemplates.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                    {t.evidenceDescription && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t.evidenceDescription}</div>}
                  </td>
                  <td style={{ textAlign: 'center', textTransform: 'capitalize', fontSize: 13 }}>{t.phase}</td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{t.defaultDurationDays} ngày</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: t.requiresEvidence ? 'var(--success)' : 'var(--gray-400)', fontSize: 13 }}>
                      {t.requiresEvidence ? '✅ Bắt buộc' : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'courses' && (
          <table className="data-table">
            <thead>
              <tr><th>Môn học</th><th>Khoá</th><th style={{textAlign:'center'}}>GV</th><th style={{textAlign:'center'}}>SV</th><th style={{textAlign:'center'}}>Chuyên cần</th><th style={{textAlign:'center'}}>Tỷ lệ pass</th><th style={{textAlign:'center'}}>Nộp bài</th></tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</td>
                  <td style={{ fontSize: 13 }}>{c.cohort}</td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{c.numLecturers}</td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{c.numStudents}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: c.attendanceRate >= c.attendanceTarget ? 'var(--success)' : 'var(--danger)' }}>
                    {(c.attendanceRate * 100).toFixed(1)}%
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: c.passRate >= c.passTarget ? 'var(--success)' : c.passRate >= c.passTarget * 0.9 ? 'var(--warning)' : 'var(--danger)' }}>
                    {(c.passRate * 100).toFixed(1)}%
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 13 }}>{(c.submitRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
