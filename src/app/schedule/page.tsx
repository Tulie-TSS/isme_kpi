'use client';
import React, { useState, useEffect } from 'react';
import PortalModal from '@/components/common/PortalModal';
import { useApp } from '@/lib/context';
import { getUserById } from '@/lib/mock-data';
import {
  getScheduleByUser, updateUserSchedule, getNextMondayDate, getWeekDatesForMonday,
  WORK_HOURS, WORK_HOUR_LABELS, getTeamAvailabilityHeatmap, findBestMeetingSlots,
  getScheduleUpdateStatus, subscribeSchedules, MeetingSlotInfo
} from '@/lib/mock-schedule';
import { DaySchedule } from '@/lib/schedule-types';
import { Calendar, Clock, Users, CheckCircle, AlertTriangle, Star, X, Sparkles, Filter, Check } from 'lucide-react';

export default function SchedulePage() {
  const { currentUserId, hasAnyRole, currentRole } = useApp();
  const user = getUserById(currentUserId);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('team');
  const [, forceUpdate] = useState(0);
  const nextMonday = getNextMondayDate();
  const weekDates = getWeekDatesForMonday(nextMonday);

  useEffect(() => {
    const unsub = subscribeSchedules(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  const canViewTeam = hasAnyRole('manager', 'institute_leader', 'coordinator_director') || currentRole === 'manager' || currentRole === 'admin';

  return (
    <div className="animate-fade-in">
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>Lịch làm việc & Giờ họp</h1>
          <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '2px 0 0 0' }}>
            Tuần bắt đầu {nextMonday} · Cập nhật bởi {user?.name || 'Admin'}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--gray-100)', padding: 4, borderRadius: 10 }}>
          <button
            onClick={() => setActiveTab('my')}
            style={{
              border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: activeTab === 'my' ? 'white' : 'transparent',
              color: activeTab === 'my' ? 'var(--gray-900)' : 'var(--gray-500)',
              boxShadow: activeTab === 'my' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
            }}
          >
            <Clock size={14} color={activeTab === 'my' ? 'var(--isme-red)' : 'var(--gray-400)'} />
            Lịch của tôi
          </button>

          {canViewTeam && (
            <button
              onClick={() => setActiveTab('team')}
              style={{
                border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeTab === 'team' ? 'white' : 'transparent',
                color: activeTab === 'team' ? 'var(--gray-900)' : 'var(--gray-500)',
                boxShadow: activeTab === 'team' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
              }}
            >
              <Users size={14} color={activeTab === 'team' ? 'var(--isme-red)' : 'var(--gray-400)'} />
              Tìm giờ họp (Heatmap)
            </button>
          )}
        </div>
      </div>

      {activeTab === 'my' ? (
        <MyScheduleTab userId={currentUserId} nextMonday={nextMonday} weekDates={weekDates} />
      ) : (
        <TeamScheduleTab nextMonday={nextMonday} weekDates={weekDates} />
      )}
    </div>
  );
}

// ==================== MY SCHEDULE TAB ====================
function MyScheduleTab({ userId, nextMonday, weekDates }: { userId: string; nextMonday: string; weekDates: { date: string; dayLabel: string }[] }) {
  const schedule = getScheduleByUser(userId, nextMonday);
  const isUpdated = !!(schedule && schedule.lastUpdatedAt);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [localSlots, setLocalSlots] = useState<DaySchedule[]>(() => {
    return weekDates.map(wd => {
      const existing = schedule?.slots.find(s => s.date === wd.date);
      return existing || { date: wd.date, dayLabel: wd.dayLabel, busySlots: [] };
    });
  });

  const toggleSlot = (dateIdx: number, hour: string) => {
    setLocalSlots(prev => {
      const next = [...prev];
      const day = { ...next[dateIdx], busySlots: [...next[dateIdx].busySlots] };
      const existing = day.busySlots.findIndex(s => s.start === hour);
      if (existing >= 0) {
        day.busySlots.splice(existing, 1);
      } else {
        day.busySlots.push({ start: hour, end: `${String(parseInt(hour) + 1).padStart(2, '0')}:00`, label: 'Bận' });
      }
      next[dateIdx] = day;
      return next;
    });
  };

  const handleSave = () => {
    updateUserSchedule(userId, nextMonday, localSlots);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isBusy = (dateIdx: number, hour: string) => {
    return localSlots[dateIdx]?.busySlots.some(s => s.start === hour) || false;
  };

  return (
    <div>
      {/* Status Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderRadius: 12, marginBottom: 16,
        background: isUpdated || savedSuccess ? '#ECFDF5' : '#FFFBEB',
        border: isUpdated || savedSuccess ? '1px solid #A7F3D0' : '1px solid #FDE68A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isUpdated || savedSuccess ? (
            <CheckCircle size={18} color="#059669" />
          ) : (
            <AlertTriangle size={18} color="#D97706" />
          )}
          <span style={{ fontSize: 13, color: isUpdated || savedSuccess ? '#047857' : '#B45309', fontWeight: 600 }}>
            {savedSuccess ? 'Đã lưu thay đổi lịch cá nhân thành công!' : isUpdated ? 'Đã cập nhật lịch làm việc tuần tới' : 'Chưa cập nhật! Vui lòng đánh dấu lịch bận trước Thứ 7'}
          </span>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: '7px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--isme-red)',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
            boxShadow: '0 2px 4px rgba(155, 27, 48, 0.2)'
          }}
        >
          <Check size={14} /> Lưu lịch tuần tới
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>Bảng đánh dấu lịch rảnh / bận cá nhân</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEE2E2', border: '1px solid #FCA5A5' }} /> Bận
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ECFDF5', border: '1px solid #6EE7B7' }} /> Rảnh
            </span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '2px solid var(--gray-200)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', width: 90 }}>Giờ</th>
                {weekDates.map(wd => (
                  <th key={wd.date} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-700)' }}>
                    {wd.dayLabel} <span style={{ fontWeight: 500, fontSize: 10, color: 'var(--gray-400)' }}>({wd.date.slice(5)})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORK_HOURS.map(hour => (
                <tr key={hour} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textAlign: 'center', background: '#F8FAFC' }}>
                    {WORK_HOUR_LABELS[hour]}
                  </td>
                  {weekDates.map((wd, dateIdx) => {
                    const busy = isBusy(dateIdx, hour);
                    return (
                      <td
                        key={wd.date + hour}
                        onClick={() => toggleSlot(dateIdx, hour)}
                        style={{
                          padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
                          background: busy ? '#FEE2E2' : '#ECFDF5',
                          transition: 'all 0.15s', userSelect: 'none',
                          borderRight: '1px solid var(--gray-100)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        {busy ? (
                          <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.1)' }}>Bận</span>
                        ) : (
                          <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.1)' }}>Rảnh</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== TEAM SCHEDULE TAB ====================
function TeamScheduleTab({ nextMonday, weekDates }: { nextMonday: string; weekDates: { date: string; dayLabel: string }[] }) {
  const heatmap = getTeamAvailabilityHeatmap(nextMonday);
  const bestSlots = findBestMeetingSlots(nextMonday, 4);
  const updateStatus = getScheduleUpdateStatus();
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlotInfo | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'updated' | 'pending'>('all');

  const totalPeople = updateStatus.length;
  const updatedCount = updateStatus.filter(u => u.updated).length;
  const pendingCount = totalPeople - updatedCount;
  const percentUpdated = Math.round((updatedCount / totalPeople) * 100);

  const filteredUsers = updateStatus.filter(u => {
    if (filterType === 'updated') return u.updated;
    if (filterType === 'pending') return !u.updated;
    return true;
  });

  // Sleek Color Gradient Palette for Availability
  const getCellStyles = (busyCount: number, total: number) => {
    const freeCount = total - busyCount;
    const ratio = freeCount / total; // 1 = 100% free

    if (ratio === 1) {
      return { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857', badge: '#10B981', label: `${freeCount} rảnh` };
    }
    if (ratio >= 0.7) {
      return { bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', badge: '#0284C7', label: `${freeCount} rảnh` };
    }
    if (ratio >= 0.5) {
      return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', badge: '#F59E0B', label: `${freeCount} rảnh` };
    }
    return { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', badge: '#E11D48', label: `${freeCount} rảnh` };
  };

  return (
    <div>
      {/* Section 1: Executive Progress Bar & Status Filter */}
      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
              Tình trạng cập nhật lịch làm việc
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
              Đã có <strong>{updatedCount}/{totalPeople} nhân sự ({percentUpdated}%)</strong> hoàn tất cập nhật lịch tuần tới
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--gray-100)', padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: filterType === 'all' ? 'white' : 'transparent',
                color: filterType === 'all' ? 'var(--gray-900)' : 'var(--gray-500)',
                boxShadow: filterType === 'all' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Tất cả ({totalPeople})
            </button>
            <button
              onClick={() => setFilterType('updated')}
              style={{
                border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: filterType === 'updated' ? 'white' : 'transparent',
                color: filterType === 'updated' ? '#047857' : 'var(--gray-500)',
                boxShadow: filterType === 'updated' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Đã cập nhật ({updatedCount})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              style={{
                border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: filterType === 'pending' ? 'white' : 'transparent',
                color: filterType === 'pending' ? '#B45309' : 'var(--gray-500)',
                boxShadow: filterType === 'pending' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Chưa cập nhật ({pendingCount})
            </button>
          </div>
        </div>

        {/* Sleek Progress Bar */}
        <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--gray-100)', overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ width: `${percentUpdated}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #10B981, #059669)', transition: 'width 0.3s ease' }} />
        </div>

        {/* User Badges Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {filteredUsers.map(u => (
            <span
              key={u.userId}
              style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: u.updated ? '#ECFDF5' : '#FFFBEB',
                color: u.updated ? '#047857' : '#B45309',
                border: u.updated ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                display: 'inline-flex', alignItems: 'center', gap: 4
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.updated ? '#10B981' : '#F59E0B' }} />
              {u.name}
            </span>
          ))}
        </div>
      </div>

      {/* Section 2: Recommended Meeting Time Slots */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color="#F59E0B" />
          Gợi ý Top 4 khung giờ tối ưu nhất để đặt lịch họp
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {bestSlots.map((slot, i) => {
            const isOptimal = i === 0;
            return (
              <div
                key={i}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  background: isOptimal ? 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)' : 'white',
                  border: isOptimal ? '2px solid #10B981' : '1px solid var(--gray-200)',
                  borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: isOptimal ? '0 4px 12px rgba(16, 185, 129, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: isOptimal ? '#047857' : 'var(--gray-400)' }}>
                    #{i + 1} {isOptimal ? '★ Tối ưu nhất' : 'Khung giờ gợi ý'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '2px 6px', borderRadius: 4 }}>
                    {slot.freeCount}/{slot.totalPeople} rảnh
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
                  {slot.dayLabel}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>
                  <Clock size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                  {slot.hourLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: High-Density Interactive Heatmap Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>Ma trận Rảnh / Bận theo khung giờ (Heatmap)</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>Bấm vào ô để xem danh sách nhân sự bận / rảnh chi tiết</div>
          </div>

          {/* Color Legend */}
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--gray-600)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#ECFDF5', border: '1px solid #A7F3D0' }} /> 100% Rảnh
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#F0F9FF', border: '1px solid #BAE6FD' }} /> Rảnh cao
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#FFFBEB', border: '1px solid #FDE68A' }} /> Rảnh vừa
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#FFF1F2', border: '1px solid #FECDD3' }} /> Bận nhiều
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '2px solid var(--gray-200)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', width: 90 }}>Khung giờ</th>
                {weekDates.map(wd => (
                  <th key={wd.date} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--gray-800)' }}>
                    {wd.dayLabel} <span style={{ fontWeight: 500, fontSize: 10, color: 'var(--gray-400)' }}>({wd.date.slice(5)})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORK_HOURS.map(hour => (
                <tr key={hour} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', textAlign: 'center', background: '#F8FAFC' }}>
                    {WORK_HOUR_LABELS[hour]}
                  </td>
                  {weekDates.map(wd => {
                    const slot = heatmap.find(h => h.date === wd.date && h.hour === hour);
                    if (!slot) return <td key={wd.date + hour} />;

                    const style = getCellStyles(slot.busyCount, slot.totalPeople);
                    return (
                      <td
                        key={wd.date + hour}
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          padding: '10px 6px', textAlign: 'center', cursor: 'pointer',
                          background: style.bg, transition: 'all 0.15s',
                          borderRight: '1px solid var(--gray-100)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.filter = 'brightness(0.96)';
                          e.currentTarget.style.transform = 'scale(0.98)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.filter = 'none';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: style.text }}>
                          {style.label}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>
                          {slot.busyCount > 0 ? `${slot.busyCount} bận` : '0 bận'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSlot && (
        <PortalModal isOpen={Boolean(selectedSlot)} onClose={() => setSelectedSlot(null)} maxWidth={460}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--gray-100)', paddingBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>{selectedSlot.dayLabel} — {selectedSlot.hourLabel}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  Tổng <strong style={{ color: '#059669' }}>{selectedSlot.freeCount} rảnh</strong> · <strong style={{ color: '#DC2626' }}>{selectedSlot.busyCount} bận</strong> trong số {selectedSlot.totalPeople} nhân sự
                </div>
              </div>
              <button onClick={() => setSelectedSlot(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="var(--gray-400)" />
              </button>
            </div>

            {selectedSlot.freeUsers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={14} color="#059669" /> Nhân sự RẢNH ({selectedSlot.freeUsers.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {selectedSlot.freeUsers.map(name => (
                    <div key={name} style={{ padding: '6px 10px', borderRadius: 6, background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: 12, color: '#047857', fontWeight: 600 }}>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSlot.busyUsers.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={14} color="#DC2626" /> Nhân sự BẬN ({selectedSlot.busyUsers.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {selectedSlot.busyUsers.map(name => (
                    <div key={name} style={{ padding: '6px 10px', borderRadius: 6, background: '#FFF1F2', border: '1px solid #FECDD3', fontSize: 12, color: '#BE123C', fontWeight: 600 }}>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PortalModal>
      )}
    </div>
  );
}
